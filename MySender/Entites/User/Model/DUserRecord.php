<?php

namespace MySender\Entities\User\Model;

use MySender\Common\Model\Record;

/**
 * Class DUserRecord
 * @package MySender\Entities\User\Model
 */
class DUserRecord extends Record
{
    /** @var int $id */
    private $id;
    /** @var $int */
    private $user_id;
    /** @var string $jid */
    private $jid;
    /** @var string $pass */
    private $pass;
    /** @var string $created */
    private $created;
    /** @var string $session */
    private $session;
    /** @var string $web_lastlogin */
    private $web_lastlogin;
    /** @var string $web_last_activity */
    private $web_last_activity;
    /** @var string $userinfo */
    private $userinfo;
    /** @var string $last_pinged */
    private $last_pinged;
    /** @var int $is_fixed_session */
    private $is_fixed_session;
    /** @var int $chat_assignment */
    private $chat_assignment;
    /** @var string $work_mode */
    private $work_mode;
    /** @var string $chat_assignmentÍ */
    private $autotakeType;
    /** @var string $auto_answer_text */
    private $auto_answer_text;
    /** @var string $auto_answer_start */
    private $auto_answer_start;
    /** @var string $auto_answer_finish */
    private $auto_answer_finish;

    /**
     * @return int
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @param int $id
     * @return DUserRecord
     */
    public function setId(?int $id): DUserRecord
    {
        $this->id = $id;
        return $this;
    }

    /**
     * @return int
     */
    public function getUserId(): ?int
    {
        return $this->user_id;
    }

    /**
     * @param mixed $user_id
     * @return DUserRecord
     */
    public function setUserId(?int $user_id): DUserRecord
    {
        $this->user_id = $user_id;
        return $this;
    }

    /**
     * @return string
     */
    public function getJid(): ?string
    {
        return $this->jid;
    }

    /**
     * @param string $jid
     * @return DUserRecord
     */
    public function setJid(?string $jid): DUserRecord
    {
        $this->jid = $jid;
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
     * @return DUserRecord
     */
    public function setPass(?string $pass): DUserRecord
    {
        $this->pass = $pass;
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
     * @return DUserRecord
     */
    public function setCreated(?string $created): DUserRecord
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
     * @return DUserRecord
     */
    public function setSession(?string $session): DUserRecord
    {
        $this->session = $session;
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
     * @return DUserRecord
     */
    public function setWebLastlogin(?string $web_lastlogin): DUserRecord
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
     * @return DUserRecord
     */
    public function setWebLastActivity(?string $web_last_activity): DUserRecord
    {
        $this->web_last_activity = $web_last_activity;
        return $this;
    }

    /**
     * @return string
     */
    public function getUserinfo(): ?string
    {
        return $this->userinfo;
    }

    /**
     * @param string $userinfo
     * @return DUserRecord
     */
    public function setUserinfo(?string $userinfo): DUserRecord
    {
        $this->userinfo = $userinfo;
        return $this;
    }

    /**
     * @return string
     */
    public function getLastPinged(): ?string
    {
        return $this->last_pinged;
    }

    /**
     * @param string $last_pinged
     * @return DUserRecord
     */
    public function setLastPinged(?string $last_pinged): DUserRecord
    {
        $this->last_pinged = $last_pinged;
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
     * @return DUserRecord
     */
    public function setIsFixedSession(?int $is_fixed_session): DUserRecord
    {
        $this->is_fixed_session = $is_fixed_session;
        return $this;
    }

    /**
     * @return int
     */
    public function getChatAssignment(): ?int
    {
        return $this->chat_assignment;
    }

    /**
     * @param int $chat_assignment
     * @return DUserRecord
     */
    public function setChatAssignment(?string $chat_assignment): DUserRecord
    {
        $this->chat_assignment = (int)$chat_assignment;
        return $this;
    }

    /**
     * @return string
     */
    public function getWorkMode(): ?string
    {
        return $this->work_mode;
    }

    /**
     * @param string $work_mode
     * @return DUserRecord
     */
    public function setWorkMode(?string $work_mode): DUserRecord
    {
        $this->work_mode = $work_mode;
        return $this;
    }

    /**
     * @return string
     */
    public function getAutotakeType(): ?string
    {
        return $this->autotakeType;
    }

    /**
     * @param string $autotakeType
     * @return DUserRecord
     */
    public function setAutotakeType(?string $autotakeType): DUserRecord
    {
        $this->autotakeType = $autotakeType;
        return $this;
    }

    /**
     * @return string
     */
    public function getAutoAnswerText(): ?string
    {
        return $this->auto_answer_text;
    }

    /**
     * @param string $auto_answer_text
     * @return DUserRecord
     */
    public function setAutoAnswerText(?string $auto_answer_text): DUserRecord
    {
        $this->auto_answer_text = $auto_answer_text;
        return $this;
    }

    /**
     * @return string
     */
    public function getAutoAnswerStart(): ?string
    {
        return $this->auto_answer_start;
    }

    /**
     * @param string $auto_answer_start
     * @return DUserRecord
     */
    public function setAutoAnswerStart(?string $auto_answer_start): DUserRecord
    {
        $this->auto_answer_start = $auto_answer_start;
        return $this;
    }

    /**
     * @return string
     */
    public function getAutoAnswerFinish(): ?string
    {
        return $this->auto_answer_finish;
    }

    /**
     * @param string $auto_answer_finish
     * @return DUserRecord
     */
    public function setAutoAnswerFinish(?string $auto_answer_finish): DUserRecord
    {
        $this->auto_answer_finish = $auto_answer_finish;
        return $this;
    }
}
