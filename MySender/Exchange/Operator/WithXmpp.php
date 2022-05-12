<?php

namespace MySender\Exchange\Operator;

use MySender\Exchange\Memcached\McQueue;

/**
 * Class WithXmpp
 * Реализация для xmpp-протокола.
 *
 * @package MySender\Exchange\Operator
 */
class WithXmpp
{
    private static $toXmppPrefix = 'ms_op_xmpp_';
    private static $toOperatorPrefix = 'ms_xmpp_op_';

    /**
     * @param int $userId
     * @param mixed $data
     */
    public static function toXmpp($userId, $data)
    {
        McQueue::enqueue(self::$toXmppPrefix . $userId, $data);
    }

    /**
     * @param int $userId
     * @param mixed $data
     */
    public static function toOperators($userId, $data)
    {
        McQueue::enqueue(self::$toOperatorPrefix . $userId, $data);
    }
}
