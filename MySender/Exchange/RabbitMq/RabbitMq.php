<?php

namespace MySender\Exchange\RabbitMq;

use MySender\App\Config;
use MySender\Log\Log;
use PhpAmqpLib\Channel\AMQPChannel;
use PhpAmqpLib\Connection\AMQPStreamConnection;

/**
 * Class RabbitMq
 * Обслуживание очередей сообщений брокером очередей.
 *
 * @package MySender\Exchange\RabbitMq
 */
class RabbitMq
{

    /** @var RabbitMq */
    private static $instance = null;
    /** @var AMQPChannel[] */
    private static $channels = [];
    private static $queues = [];

    /** @var AMQPStreamConnection  */
    private $connection;

    /**
     * @param string $channelId
     * @param AMQPChannel $channel
     */
    public function setChannel(int $channelId, AMQPChannel &$channel)
    {
        self::$channels[$channelId] = $channel;
    }

    /**
     * @param string $channelId
     * @return AMQPChannel|null
     */
    public function getChannel($channelId): ?AMQPChannel
    {
        return self::$channels[$channelId] ?? null;
    }

    /**
     * @param string $channelId
     * @param mixed $queue
     */
    public function setToWsQueue($channelId, $queue)
    {
        if (!isset(self::$queues['tows'])) self::$queues['tows'] = [];
        self::$queues['tows'][$channelId] = $queue;
    }

    /**
     * @param string $channelId
     * @return array
     */
    public function getToWsQueue($channelId)
    {
        if (!isset(self::$queues['tows'])) self::$queues['tows'] = [];
        return self::$queues['tows'][$channelId] ?? [];
    }

    /**
     * @param string $channelId
     * @param array $queue
     * @return array
     */
    public function setToMsQueue($channelId, array $queue)
    {
        if (!isset(self::$queues['toms'])) self::$queues['toms'] = [];
        return self::$queues['toms'][$channelId] = $queue;
    }

    /**
     * @param string $channelId
     * @return array
     */
    public function getToMsQueue($channelId): array
    {
        if (!isset(self::$queues['toms'])) self::$queues['toms'] = [];
        return self::$queues['toms'][$channelId] ?? [];
    }

    /**
     * RabbitMq constructor.
     */
    private function __construct()
    {
        try {
            $this->connection = new AMQPStreamConnection(
                Config::get()->rabbitmq->host,
                Config::get()->rabbitmq->port,
                Config::get()->rabbitmq->user,
                Config::get()->rabbitmq->password,
                '/',
                false,
                'AMQPLAIN',
                null,
                'en_US',
                1.0,
                1.0,
                null,
                true,
                1
            );
        } catch (\Exception $e) {

        }
    }

    /**
     * @return RabbitMq
     */
    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * @return AMQPStreamConnection
     */
    public function connection(): AMQPStreamConnection
    {
        return $this->connection;
    }
}
