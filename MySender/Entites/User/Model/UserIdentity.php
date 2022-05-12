<?php

namespace MySender\Entities\User\Model;

/**
 * Class UserIdentity
 * @package MySender\Entities\User\Model
 */
class UserIdentity
{
    /** @var int $id */
    private $id;
    /** @var string $login */
    private $login;
    /** @var string $jid */
    private $jid;

    /**
     * @param int $id
     * @return UserIdentity
     */
    public function setId(int $id): UserIdentity
    {
        $this->id = $id;
        return $this;
    }

    /**
     * @return int
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * @param string $login
     * @return UserIdentity
     */
    public function setLogin(string $login): UserIdentity
    {
        $this->login = $login;
        return $this;
    }

    /**
     * @return string
     */
    public function getLogin(): string
    {
        return $this->login;
    }

    /**
     * @param string $jid
     * @return UserIdentity
     */
    public function setJid(string $jid): UserIdentity
    {
        $this->jid = $jid;
        return $this;
    }

    /**
     * @return string
     */
    public function getJid(): string
    {
        return $this->jid;
    }


}
