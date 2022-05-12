<?php

namespace MySender\Entities\User;

use MySender\App\Config;
use MySender\App\Mc;
use MySender\Common\Helper;
use MySender\Entities\Operator\Operator;
use MySender\Entities\User\Model\DUserRecord;
use MySender\Entities\User\Model\UserModel;
use MySender\Exchange\CrossProcessCom\MsWithWs;
use MySender\Exchange\Memcached\GlobalState;
use MySender\Log\Log;
use Workerman\Connection\TcpConnection;

/**
 * Class User
 *
 * @package MySender\Entities\User
 */
class User
{
    const WORK_MODE_DISABLED = -1; //not allowed to run
    const WORK_MODE_ECONOMY = 0; //default, run only when any operators is online
    const WORK_MODE_ALL_TIME = 1; //work all time
    const WORK_MODE_AUTO_ANSWER = 2; //work only between auto_answer_start and auto_answer_finish
    const WORK_MODE_AUTO_ANSWER_CHAT_BOT = 3; //auto answer chat bot

    /** @var UserModel $model */
    protected $model;
    /** @var Operator[] */
    private $operators;
    /** @var string $login */
    private $login;
    /** @var TcpConnection $tcpConn */
    private $tcpConn;

    /** @var $botOnlyTransport[] */
    private $botOnlyTransport = 'whatsapp';
    /** @var bool $botOverrideOperator */
    private $botOverrideOperators;
    /** @var bool $showFirstMessageToOperator */
    public $showFirstMessageToOperator = false;

    /**
     * User constructor.
     */
    public function __construct()
    {
        $this->model = new UserModel();
    }

    /**
     * @return DUserRecord
     */
    public function getRecord(): DUserRecord
    {
        return $this->model->record();
    }

    /**
     * @param UserModel $model
     */
    public function setModel(UserModel $model)
    {
        $this->model = $model;
    }

    /**
     * @param string $jid
     * @return User
     */
    public function load(string $jid): User
    {
        $this->model->getByJid($jid);
        $jidInfo = Helper::jidInfo($this->getRecord()->getJid());
        $this->login = $jidInfo['user'];
        $this->setBotOverrideOperators();
        $this->isShowFirstMessageToOperator();
        return $this;
    }

    /**
     * @return string
     */
    public function getJid(): string
    {
        return $this->model->record()->getJid();
    }

    /**
     * @param Operator $operator
     */
    public function attachOperator(Operator &$operator): void
    {
        $this->operators[$operator->getId()] = $operator;
    }

    /**
     * @param int $operatorId
     */
    public function detachOperator($operatorId): void
    {
        Log::debug('User->detachOperator');
        if (isset($this->operators[$operatorId])) {
            unset($this->operators[$operatorId]);
        }
    }

    /**
     * @return int|null
     */
    public function getId()
    {
        return $this->model->record()->getId();
    }

    /**
     * @return Operator[]
     * @throws \MySender\Common\Model\RecordException
     */
    public function &getOperators(): array
    {
        if (empty($this->operators)) {
            $this->operators = $this->model->getOperators();
        }
        return $this->operators;
    }

    /**
     * @param int $operatorId
     * @return Operator
     */
    public function &getOperator($operatorId): Operator
    {
        return $this->operators[$operatorId] ?? null;
    }

    /**
     * @param mixed $id
     * @return User
     */
    public function setId($id)
    {
        $this->id = $id;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getLogin()
    {
        if (!$this->login && $this->getJid()) {
            $jidInfo = Helper::jidInfo($this->getJid());
            $this->login = $jidInfo['user'];
        }
        return $this->login;
    }

    /**
     * @param int $userId
     * @return bool
     */
    public static function allowEconomyWorkMode($userId)
    {
        $waitActivity = Config::get()->ms->webActivityThresholdSec;

        $webLastActivity = GlobalState::getUserLastActivity($userId);
        return time() - $webLastActivity <= $waitActivity;
    }

    /**
     * @return TcpConnection
     */
    public function getTcpConn(): ?TcpConnection
    {
        return $this->tcpConn;
    }

    /**
     * @param TcpConnection $tcpConn
     */
    public function setTcpConn(?TcpConnection $tcpConn): void
    {
        $this->tcpConn = $tcpConn;
    }

    /**
     * ??
     */
    public function sendPendingTcp()
    {
        if (!$this->tcpConn) return;
    }

    /**
     * Транспорт(-ы), для которых реализуется сценарий поведения бота,
     * если пользователь отключил передачу чата операторам.
     *
     * @return string
     */
    public function getBotOnlyTransport()
    {
        return $this->botOnlyTransport;
    }

    /**
     * Фиксация статуса бота для обработки сценариев
     * передачи чата операторам.
     * FALSE - бот работает по стандартному сценарию.
     * TRUE  - бот замещает операторов при обработке сообщений,
     * поступивших с конкретными транспортами (см. @$this->botOnlyTransport).
     *
     * @param bool $value
     */
    public function setBotOverrideOperators()
    {
        $this->botOverrideOperators = $this->model->operatorsOff($this->model->record()->getId());
    }

    /**
     * @return bool
     */
    public function isBotOverrideOperator()
    {
        return ($this->botOverrideOperators  === null ? false : $this->botOverrideOperators);
    }

    /**
     * Флаг, определяющий вывод в чате рассылочных сообщений.
     * @todo разработать механизм управления опцией из веб-интерфейса.
     *
     */
    public function isShowFirstMessageToOperator()
    {
          $this->showFirstMessageToOperator = in_array($this->model->record()->getId(), [85, 147]);
    }

}
