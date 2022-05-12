<?php

namespace MySender\Entities\Operator;

use MySender\App\Config;
use MySender\Entities\Operator\Model\DOperatorRecord;
use MySender\Entities\Operator\Model\OperatorDb;
use MySender\Entities\Operator\Model\OperatorModel;
use MySender\Exchange\Memcached\GlobalState;
use MySender\Exchange\Ws\WsException;
use MySender\Exhcange\MsBot\Controller\OperatorsApiException;
use MySender\Log\Log;
use React\Promise\Deferred;
use Workerman\Connection\TcpConnection;

/**
 * Class Operator
 * @package MySender\Entities\Operator
 */
class Operator
{
    const NO_OPERATOR = 0;
    const ALL_OPERATORS = -1;

    /** @var int $id */
    private $id;
    /** @var OperatorModel $model */
    private $model;
    /** @var bool $isOnline */
    private $isOnline = false;
    /** @var TcpConnection $connection */
    private $connection = null;
    /** @var array $deferredQueue */
    private $deferredQueue = [];
    /** @var \SplQueue $wsResponseQueue */
    private $wsResponseQueue;
    /** @var int */
    private $lastActivity = 0;
    /** @var string $userLogin */
    private $userLogin;

    public function __construct()
    {
        $this->wsResponseQueue = new \SplQueue();
        $this->model = new OperatorModel();
    }

    /**
     * @return DOperatorRecord
     */
    public function getRecord(): DOperatorRecord
    {
        return $this->model->record();
    }

    /**
     * @param OperatorModel $model
     * @return Operator
     */
    public function setModel(OperatorModel $model): Operator
    {
        $this->model = $model;
        $this->id = $model->record()->getId();
        return $this;
    }

    /**
     * @return int
     */
    public function getId(): int
    {
        return $this->model->record()->getId();
    }

    /**
     * @return int
     */
    public function getUserId(): int
    {
        return $this->model->record()->getJabberuserId();
    }

    /**
     * @return TcpConnection
     * @throws WsException
     */
    public function &getConnection(): TcpConnection
    {
        if (!$this->connection) {
            throw new WsException('Operator connection expired');
        }
        return $this->connection;
    }

    /**
     * @param int $uid
     * @return null|Deferred
     * @throws OperatorsApiException
     */
    public function &createDeferred(int $uid): Deferred
    {
        Log::debug('Operator->createDeferred', ['uid' => $uid]);
        if (isset($this->deferredQueue[$uid])) {
            throw new OperatorsApiException('duplicate cid');
        }

        $this->deferredQueue[$uid] = new Deferred();
        Log::debug('Operator->createDeferred queue', [$this->deferredQueue]);
        return $this->deferredQueue[$uid];
    }

    /**
     * @param int $uid
     * @return Deferred
     */
    public function &getDeferred(int $uid): Deferred
    {
        Log::debug('Operator->getDeferred', ['deferredQueue' => $this->deferredQueue]);
        return $this->deferredQueue[$uid];
    }

    /**
     * @param int $uid
     * @param null $data
     */
    public function resolvePromise(int $uid, $data = null)
    {
        if (!isset($this->deferredQueue[$uid])) return;

        $deferred = $this->deferredQueue[$uid];
        $deferred->resolve([$uid, $data]);

        unset($this->deferredQueue[$uid]);
    }

    /**
     * @param string $response
     */
    public function enqueueResponse(string $response)
    {
        $this->wsResponseQueue->enqueue($response);
    }

    /**
     * @return string
     */
    public function dequeueResponse(): string
    {
        if ($this->wsResponseQueue->isEmpty()) return '';

        return $this->wsResponseQueue->dequeue();
    }

    /**
     * @return bool
     */
    public function checkActivity(): bool
    {
        //Log::debug('Operator->checkActivity');
        $activityLifetimeSec = Config::get()->ms->webActivityThresholdSec;
        //$lastActivity = $this->lastActivity;
        $lastActivity = GlobalState::getOperatorLastActivity($this->getUserId(), $this->getId());
        //Log::debug('Operator->checkActivity', ['lastActivity' => $lastActivity]);
        return (time() - $lastActivity) < $activityLifetimeSec;
    }

    /**
     * @return string|null
     */
    public function getName()
    {
        return $this->getRecord()->getName();
    }

    /**
     * @return string|null
     */
    public function getLogin()
    {
        return $this->getRecord()->getLogin();
    }

    /**
     * @param string|null $userLogin
     */
    public function updateActivity($userLogin = null)
    {
        $lastActivity = time();
        $this->lastActivity = $lastActivity;
        GlobalState::setOperatorOnline(
            $this->getUserId(),
            $this->getId(),
            $lastActivity
        );
        if ($userId = $this->getUserId()) {
            GlobalState::setUserLastActivity($this->getUserId(), time());
        }
        OperatorDb::updateSessionActivity($this->getRecord()->getSession(), $userLogin);
    }

    /**
     * @return bool
     */
    public function isOnline(): bool
    {
        return $this->isOnline;
    }

    /**
     * @param TcpConnection $connection
     * @param $userLogin
     */
    public function setOnline(TcpConnection $connection, $userLogin)
    {
        // Log::debug('Operator->setOnline');
        $this->connection = $connection;
        $this->isOnline = true;
        $this->updateActivity($userLogin);
    }

    /**
     * Установка статуса оператора в оффлайн.
     */
    public function setOffline()
    {
        //Log::debug('Operator->setOffline');
        $this->isOnline = false;
        $this->connection = null;
        GlobalState::setOperatorOffline(
            $this->getUserId(),
            $this->getId()
        );
    }

    /**
     * @return bool
     */
    public function isManager(): bool
    {
        return (bool)$this->getRecord()->getAllowedDialogslist();
    }

    /**
     * @return bool
     */
    public function isBot(): bool
    {
        return $this->getRecord()->getIsBot();
    }

    /**
     * @return string
     */
    public function getUserLogin(): string
    {
        return $this->userLogin;
    }

    /**
     * @param string $userLogin
     */
    public function setUserLogin(string $userLogin): void
    {
        $this->userLogin = $userLogin;
    }

}
