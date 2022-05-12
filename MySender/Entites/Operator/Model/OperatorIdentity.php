<?php

namespace MySender\Entities\Operator\Model;

/**
 * Class OperatorIdentity
 * @package MySender\Entities\Operator\Model
 */
class OperatorIdentity
{
    /** @var int $id */
    private $id;
    /** @var int $userId */
    private $userId;

    /**
     * @param mixed $userId
     * @return OperatorIdentity
     */
    public function setUserId($userId)
    {
        $this->userId = $userId;
        return $this;
    }

    /**
     * @param int|null $id
     * @return OperatorIdentity
     */
    public function setId($id)
    {
        $this->id = $id;
        return $this;
    }

    /**
     * @return int|null
     */
    public function getUserId()
    {
        return $this->userId;
    }

    /**
     * @return int|null
     */
    public function getId()
    {
        return $this->id;
    }

}
