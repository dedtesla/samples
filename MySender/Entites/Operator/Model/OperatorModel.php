<?php

namespace MySender\Entities\Operator\Model;

use MySender\App\Config;
use MySender\Entities\Operator\AuthException;
use MySender\Entities\Operator\Operator;
use MySender\Log\Log;

/**
 * Class OperatorModel
 * @package MySender\Entities\Operator\Model
 */
class OperatorModel extends \MySender\Common\Model\Model
{
    /**
     * OperatorModel constructor.
     */
    public function __construct()
    {
        $this->record = new DOperatorRecord();
    }

    /**
     * @param int $operatorId
     * @return Operator
     */
    public static function getOperator($operatorId): Operator
    {
        $row = OperatorDb::fetchById($operatorId);
        $model = new OperatorModel();
        $model->mapRecord($row);
        return (new Operator())->setModel($model);
    }

    /**
     * @param string $session
     * @param string $login
     * @return Operator
     * @throws AuthException
     */
    public static function getBySession(string $session, string $login): Operator
    {
        $row = OperatorDb::fetchBySession($session, Config::get()->ws->operatorsSessionLifetimeMs, $login);
        if (empty($row)) throw new AuthException('Session expired');
        $model = new OperatorModel();
        $model->mapRecord($row);

        OperatorDb::updateSessionActivity($session, $login);
        OperatorDb::updateLastActivity($row['id'], $login);

        $operator = (new Operator())->setModel($model);
        $operator->setUserLogin($login);

        return $operator;
    }

    /**
     * @return DOperatorRecord
     */
    public function record(): DOperatorRecord
    {
        return $this->record;
    }

}
