<?php
namespace MySender\Exchange\MongoDb;

use MySender\App\Config;

/**
 * Class MongoDb
 * Обслуживание очередей сообщений с MongoDB.
 *
 * @package MySender\Exchange\MongoDb
 */
class MongoDb
{

    /** @var MongoDb */
    private static $instance = null;
    /** @var resource|null */
    private $connection = null;

    /**
     * @return MongoDb
     */
    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * MongoDb constructor.
     */
    private function __construct()
    {
        $mongo = new \MongoDB\Client(
            Config::get()->mongodb->host,
            [],
            ['typeMap' => ['root' => 'array', 'document' => 'array', 'array' => 'array']]
        );
        $this->connection = $mongo->selectDatabase(Config::get()->mongodb->dbname);
    }

    /**
     * @return resource|null
     */
    public function connection()
    {
        return $this->connection;
    }

}
