<?php

namespace MySender\Entities\Operator\Structures;

use MySender\Common\Structure;

/**
 * Class DOperatorRecord
 * @package MySender\Entities\Operator\Structures
 */
class DOperatorRecord extends Structure
{
    /** @var int $id */
    public $id;
    /** @var int $userId */
    public $userId;
    /** @var string $login */
    public $login;
    /** @var string $name */
    public $name;
    /** @var bool $isManager */
    public $isManager;
    /** @var int $lastActivity */
    public $lastActivity;
    /** @var string $session */
    public $session;
}
