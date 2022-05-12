<?php

namespace MySender\Entities\Operator\Model;

use MySender\Common\Model\Record;

/**
 * Class DOperatorRecord
 * @package MySender\Entities\Operator\Model
 */
class DOperatorRecord extends Record
{
    /** @var int $id */
    private $id;
    /** @var int $jabberuser_id */
    private $jabberuser_id;
    /** @var string $login */
    private $login;
    /** @var string $pass */
    private $pass;
    /** @var string $name */
    private $name;
    /** @var string $created */
    private $created;
    /** @var string $session */
    private $session;
    /** @var string $operatorinfo */
    private $operatorinfo;
    /** @var string $web_lastlogin */
    private $web_lastlogin;
    /** @var string $web_last_activity */
    private $web_last_activity;
    /** @var int $is_fixed_session */
    private $is_fixed_session;
    /** @var int $allowed_dialogslist */
    private $allowed_dialogslist;
    /** @var int $session_timetolive */
    private $session_timetolive;
    /** @var bool $is_bot */
    private $is_bot;

    /**
     * @return int
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @param int $id
     * @return DOperatorRecord
     */
    public function setId(?int $id): DOperatorRecord
    {
        $this->id = $id;
        return $this;
    }

    /**
     * @return int
     */
    public function getJabberuserId(): ?int
    {
        return $this->jabberuser_id;
    }

    /**
     * @param int $jabberuser_id
     * @return DOperatorRecord
     */
    public function setJabberuserId(?int $jabberuser_id): DOperatorRecord
    {
        $this->jabberuser_id = $jabberuser_id;
        return $this;
    }

    /**
     * @return string
     */
    public function getLogin(): ?string
    {
        return $this->login;
    }

    /**
     * @param string $login
     * @return DOperatorRecord
     */
    public function setLogin(?string $login): DOperatorRecord
    {
        $this->login = $login;
        return $this;
    }

    /**
     * @return string
     */
    public function getPass(): ?string
    {
        return $this->pass;
    }

    /**
     * @param string $pass
     * @return DOperatorRecord
     */
    public function setPass(?string $pass): DOperatorRecord
    {
        $this->pass = $pass;
        return $this;
    }

    /**
     * @return string
     */
    public function getName(): ?string
    {
        return $this->name;
    }

    /**
     * @param string $name
     * @return DOperatorRecord
     */
    public function setName(?string $name): DOperatorRecord
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return string
     */
    public function getCreated(): ?string
    {
        return $this->created;
    }

    /**
     * @param string $created
     * @return DOperatorRecord
     */
    public function setCreated(?string $created): DOperatorRecord
    {
        $this->created = $created;
        return $this;
    }

    /**
     * @return string
     */
    public function getSession(): ?string
    {
        return $this->session;
    }

    /**
     * @param string $session
     * @return DOperatorRecord
     */
    public function setSession(?string $session): DOperatorRecord
    {
        $this->session = $session;
        return $this;
    }

    /**
     * @return string
     */
    public function getOperatorinfo(): ?string
    {
        return $this->operatorinfo;
    }

    /**
     * @param string $operatorinfo
     * @return DOperatorRecord
     */
    public function setOperatorinfo(?string $operatorinfo): DOperatorRecord
    {
        $this->operatorinfo = $operatorinfo;
        return $this;
    }

    /**
     * @return string
     */
    public function getWebLastlogin(): ?string
    {
        return $this->web_lastlogin;
    }

    /**
     * @param string $web_lastlogin
     * @return DOperatorRecord
     */
    public function setWebLastlogin(?string $web_lastlogin): DOperatorRecord
    {
        $this->web_lastlogin = $web_lastlogin;
        return $this;
    }

    /**
     * @return string
     */
    public function getWebLastActivity(): ?string
    {
        return $this->web_last_activity;
    }

    /**
     * @param string $web_last_activity
     * @return DOperatorRecord
     */
    public function setWebLastActivity(?string $web_last_activity): DOperatorRecord
    {
        $this->web_last_activity = $web_last_activity;
        return $this;
    }

    /**
     * @return int
     */
    public function getisFixedSession(): ?int
    {
        return $this->is_fixed_session;
    }

    /**
     * @param int $is_fixed_session
     * @return DOperatorRecord
     */
    public function setIsFixedSession(?int $is_fixed_session): DOperatorRecord
    {
        $this->is_fixed_session = $is_fixed_session;
        return $this;
    }

    /**
     * @return int
     */
    public function getAllowedDialogslist(): ?int
    {
        return $this->allowed_dialogslist;
    }

    /**
     * @param int $allowed_dialogslist
     * @return DOperatorRecord
     */
    public function setAllowedDialogslist(?int $allowed_dialogslist): DOperatorRecord
    {
        $this->allowed_dialogslist = $allowed_dialogslist;
        return $this;
    }

    /**
     * @return int
     */
    public function getSessionTimetolive(): ?int
    {
        return $this->session_timetolive;
    }

    /**
     * @param int $session_timetolive
     * @return DOperatorRecord
     */
    public function setSessionTimetolive(?int $session_timetolive): DOperatorRecord
    {
        $this->session_timetolive = $session_timetolive;
        return $this;
    }

    /**
     * @return bool
     */
    public function getIsBot(): bool
    {
        return $this->is_bot === 't' ? true : false;
    }

    /**
     * @param bool $isBot
     * @return DOperatorRecord
     */
    public function setIsBot($isBot): DOperatorRecord
    {
        $this->is_bot = $isBot;
        return $this;
    }

}
