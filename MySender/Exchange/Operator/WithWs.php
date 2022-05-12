<?php

namespace MySender\Exchange\Operator;

use MySender\Exchange\Memcached\McQueue;

/**
 * Class WithWs
 * Реализация для вебсокета. 
 *
 * @package MySender\Exchange\Operator
 */
class WithWs
{
    private static $toWsPrefix = 'ms_op_ws_';
    private static $toOperatorsPrefix = 'ms_ws_op_';

    /**
     * @param int $userId
     * @param mixed $data
     */
    public static function toWs($userId, $data)
    {
        McQueue::enqueue(self::$toWsPrefix. $userId, $data);
    }

    /**
     * @param int $userId
     * @param mixed $data
     */
    public static function toOperators($userId, $data)
    {
        McQueue::enqueue(self::$toOperatorsPrefix . $userId, $data);
    }

    /**
     * @param int $userId
     * @return array
     */
    public static function fromOperator($userId): array
    {
        return McQueue::dequeue(self::$toWsPrefix . $userId);
    }

    /**
     * @param int $userId
     * @return array
     */
    public static function fromWs($userId): array
    {
        return McQueue::dequeue(self::$toOperatorsPrefix . $userId);
    }
}
