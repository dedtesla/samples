<?php
/**
 * WebSocket сервер.
 *
 * Основан на библиотеке Workerman
 * http://www.workerman.net/
 *
 * Слушает запросы и генерирует события для desktop-клиента и мобильного приложения.
 * Вебсокет перенаправляет запросы на бизнес-воркеры
 * (Класс MsBot, скрипт mysender_daemon.php),
 * асинхронно ждет от них ответа и возвращает ответ клиенту.
 *
 * Кросс-процессорный обмен данными между вебсокетом и воркерами
 * бизнес-клиентов происходит следующим образом.
 * Для каждого бизнес-воркера существует две системные очереди
 * - от вебсокета в воркеру и от воркера к вебсокету.
 * Вебсокет направляет запросы в очередь которая опрашивается бизнес-воркерами
 * раз в секунду (ограничение xmpp библиотеки).
 *
 * Воркер обрабатывает запрос и отправляет ответ обратно в системную очередь.
 * Вебсокет также слушает tcp соединение, к которому подключаются воркеры.
 * Они раз в секунду отправляют сообщение вида "[userId]" (без скобок) для поддержания
 * соединения.
 * Когда воркер добавил сообщение в очередь, он отправляет сообщение вида "[userId] 1".
 * Флаг 1 дает команду вебсокету опросить очередь от воркера.
 *
 * Очередь имеет ограничение 16кб по объему (возможно увеличение лимита через настройки
 * операционной системы, см. мануалы к msg_receive на php.net).
 * Некоторые ответы превышают этот объем (кроме того очередь может забиться
 * естественным образом).
 * В данном случае ответ записывается в memcached и по tcp отправляется сообщение
 * [userId] 2. Флаг 2 дает команду вебсокету опросить очередь, записанную в memcached.
 *
 * Для хранения информации о подкючениях с клиентами и бизнес-воркерами
 * используется реестр WsStorage.
 * Внутри WsStorage хранится отображение ConnectionId => OperatorId.
 * Время от времени соединение протухат и ConnectionId перестает быть валидным id.
 * Чтобы не забивать память, раз в 30 секунд происходит очистка таких мертвых записей.
 *
 * Id операторов, находящихся онлайн, хранятся также в memcached для нужнд
 * бизнес-воркеров и админки.
 *
 * С кросс-процессорной коммуникацией наблюдаются проблемы - некоторые пакеты
 * не доходят до бизнес-воркеров. Проблема до конца не отлажена и в качестве
 * альтернативного решения создан механизм перезапроса.
 * Desktop клиент не дождавшись ответа в течение 5 секунд направляет пакет вида
 * {
 *   "action": "req.repeat",
 *   "cid": 100500,
 *   "request": { ... }
 * }
 * где request - полное тело запроса, который послал клиент.
 * Запросы и ответы хранятся 1 час в таблице req_res_tmp, после чего таблица чистится
 * со сбросом primary key.
 *
 */

namespace MySender\Exchange\Ws;

use MySender\Entities\Operator\Authorize;
use MySender\Entities\Operator\Operator;
use MySender\Entities\QueueModel;
use MySender\Exchange\CrossProcessCom\MsWithWs;
use MySender\Exchange\Events\ExchangeActions;
use MySender\Exchange\Memcached\GlobalState;
use MySender\Exchange\Structures\DExchange;
use MySender\Exchange\Ws\Driver\Driver;
use MySender\Exchange\Ws\Queue\WsEvent;
use MySender\Exchange\Ws\Queue\WsResponse;
use MySender\Exchange\Ws\Structures\DRequest;
use MySender\Exhcange\MsBot\Controller\OperatorsApiException;
use MySender\Log\Log;
use MySender\Log\WsLog;
use Workerman\Connection\TcpConnection;
use Workerman\Lib\Timer;

/**
 * Class Ws
 * @package MySender\Exchange\Ws
 */
class Ws extends Driver
{
    /** @var WsResponse $response */
    private $response;
    /** @var WsEvent $event */
    private $event;
    /** @var WithMs $withMs */
    private $withMs;

    /**
     * Ws constructor.
     */
    public function __construct()
    {
        parent::__construct();
        WsStorage::getInstance()->loadUsers();
    }

    /**
     * @throws \ErrorException
     */
    protected function onStart(): void
    {
        $this->event = new WsEvent();
        $this->response = new WsResponse();
        $this->withMs = new WithMs($this->event, $this->response);

        GlobalState::clearOperatorsOnlineState();
        foreach (WsStorage::getInstance()->getUsers() as $userId => $user) {
            MsWithWs::clear($userId);
        }

        $this->registerTasks();
    }

    /**
     *
     */
    private function registerTasks(): void
    {
        Timer::add(1, function () {
            $this->listenMsQueue();
        });

        // Чистим отображение connectionId => operatorId от протухших соединений
        Timer::add(WsStorage::GARBAGE_COLLECT_INTERVAL_S, function () {
            WsStorage::getInstance()->removeDeadConnections();
        });

        // Очищаем таблицу с запросами/ответами req_res_tmp раз в час
        Timer::add(QueueModel::REQ_RES_TMP_TRUNCATE_INTERVAL_1H, function () {
            QueueModel::truncate();
        });
    }

    /**
     * @throws \ErrorException
     */
    private function listenMsQueue()
    {
        // Log::debug('Ws->listenMsQueue call');
        foreach (WsStorage::getInstance()->getUsers() as $userId => $user) {
            foreach (MsWithWs::fromMs($userId) as $package) {
                // Log::debug('Ws->listenMsQueue',['userId' => $userId, 'package'=> $package]);
                $this->withMs->onServiceMessage($package);
            };
        }
    }

    /**
     * Авторизация оператора по сессии.
     * Добавляем оператора в WsStorage. Оператора в хранилище можно найти
     * по operatorId или по connectionId.
     *
     * 2 случая авторизации:
     * - оператор авторизовался после ввода логина и пароля
     * 2 cases: operator just logged in, or this is reconnection after loosing connection.
     * Clear response and event queues if 1st case.
     * If queue not empty (and not cleared at login), send pending messages from queue.
     *
     * @param TcpConnection $connection
     */
    protected function onConnect(TcpConnection &$connection): void
    {
        //Log::info('Ws->onConnect', ['connectionId' => $connection->id]);
        try {
            /** @var Operator $operator */
            list($operator, $cid, $userLogin) = Authorize::httpAuth();
            $justLoggedIn = $cid == 0;

            //Log::debug('OPERATOR', [$operator]);

            WsStorage::getInstance()->onOperatorConnects($operator, $connection, $userLogin);

            if ($justLoggedIn) {
                $this->onLogin($operator->getId(), $connection);
            }
/*            $user = WsStorage::getInstance()->getUser(WsStorage::USER_BY_ID, $operator->getUserId());
            $userName = $user->getLogin();
            WsLog::info($userName, $operator->getLogin(), 'CONNECTED', ['cid' => $cid, 'conId' => $connection->id]);*/

            $this->response->sendPending($operator->getId());
        } catch (\Exception $e) {
            Log::error($e->getMessage(), [$e->getTrace()]);
        }
    }

    /**
     * Clear all queues to operator and send him base unique request id.
     *
     * @param $operatorId
     * @param $connection
     */
    private function onLogin(int $operatorId, TcpConnection $connection): void
    {
        Log::debug('Ws->onLogin', ['connectionId' => $connection->id]);
        $this->event->clear($operatorId);
        $this->response->clear($operatorId);
        $this->response->sendOnLogin($connection);
    }

    /**
     * @param TcpConnection $connection
     */
    protected function onClose(TcpConnection &$connection): void
    {
        WsStorage::getInstance()->onOperatorDisconnects($connection);
    }


    /**
     * Receive message from client and send it to operators daemon to proceed.
     *
     * @param TcpConnection $connection
     * @param string $data
     */
    protected function onMessage(TcpConnection &$connection, string $data): void
    {
        Log::info('Ws->onMessage', [$data]);
        try {
            Log::debug('Ws->onMessage findOperator');
            $operator = WsStorage::getInstance()->findOperator(WsStorage::OP_BY_CONN_ID, $connection);
            if (!$operator) {
                Log::warning('Ws->onMessage Operator not found by conId', [$connection->id]);
                return;
            }

            $dRequest = self::mapInMessage($data);

            $user = WsStorage::getInstance()->getUser(WsStorage::USER_BY_ID, $operator->getUserId());
            $userName = $user->getLogin();
            WsLog::info($userName, $operator->getLogin(), 'REQUEST '.$data, ['cid' => $dRequest->getUid(), 'conId' => $connection->id]);

            if (
                $dRequest->getAction() !== WsActions::PING_RECD
            ) {
                $this->awaitResponse($operator, $dRequest);
            }

            $package = (new DExchange())
                ->setOperatorId($operator->getId())
                ->setAction(ExchangeActions::WS_MESSAGE)
                ->setPayload($dRequest);

            MsWithWs::toMs($operator->getUserId(), $package);
        }
        catch (OperatorsApiException $e) {
            $this->response->reject($operator, $dRequest, WsResponse::E_REQ_ID_DUPLICATE);
        }
        catch (\Exception $e) {
            $this->handleException($e);
        }
    }

    /**
     * @param Operator $operator
     * @param DRequest $dRequest
     * @throws OperatorsApiException
     */
    private function awaitResponse(Operator $operator, DRequest $dRequest)
    {
        $operator->createDeferred($dRequest->getUid())->promise()->then(
            function (array $data) use ($operator, $dRequest) {
                /**
                 * @var int $uid
                 * @var mixed $responseData
                 */
                list ($uid, $responseData) = $data;
                if ($uid === $dRequest->getUid()) {
                    $this->response->send($operator, $dRequest, $responseData);
                } else {
                    $this->response->reject($operator, $dRequest, WsResponse::E_REQ_ID_MISMATCH);
                }
            },
            function (string $reason) use ($operator, $dRequest) {
                Log::info('Ws->onMessage reject promise', [$reason]);
                $this->response->reject($operator, $dRequest, $reason);
            }
        );
    }

    /**
     * @param string $json
     * @return DRequest
     * @throws WsException
     */
    public static function mapInMessage(string $json): DRequest
    {
        $data = json_decode($json, true);
        $jsonError = json_last_error();
        if ($jsonError !== JSON_ERROR_NONE) {
            throw new WsException("Ws->mapInMessage: wrong json with json_last_error: " . $jsonError);
        }

        $dRequest = (new DRequest())
            ->setUid($data['cid'] ?? null)
            ->setAction($data['action'] ?? null);

        if (!$dRequest->getAction()) {
            throw new WsException("Ws->mapInMessage: no action");
        }

        $payload = [];
        if (isset($data['payload'])) {
            $payload = $data['payload'];
        } else {
            foreach ($data as $key => $value) {
                if (in_array($key, ['action', 'cid', 'uid'])) {
                    continue;
                }
                $payload[$key] = $value;
            }
        }

        $dRequest->setPayload($payload);

        return $dRequest;
    }

    /**
     * @param \Exception $e
     */
    private function handleException(\Exception $e): void
    {
        Log::error('EXCEPTION', [$e]);
    }

    /**
     * @param int $negativeUserId
     * @return bool
     */
    private function dragToMs(int $negativeUserId): bool
    {
        Log::debug('Ws->DRAG TO MS');
        $userId = $negativeUserId * (-1);
        Log::debug('WS->dragToMs', ['userId' => $userId]);
        MsWithWs::notifyMs($userId);

        return false;
    }

}
