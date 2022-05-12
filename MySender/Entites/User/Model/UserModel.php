<?php

namespace MySender\Entities\User\Model;


use MySender\Common\Model\Validation;
use MySender\Entities\Operator\Operator;
use MySender\Entities\User\User;
use MySender\Log\Log;

/**
 * Class UserModel
 * Добавлен флаг, определяющий сценарий поведения бота (см. MySender/Entities/User/User->setBotOverrideOperator).
 *
 * @package MySender\Entities\User\Model
 */
class UserModel extends \MySender\Common\Model\Model
{
    const E_USER_MODEL_ID_REQUIRED = 'E_USER_MODEL_ID_REQUIRED';

    /**
     * UserModel constructor.
     */
    public function __construct()
    {
        $this->record = new DUserRecord();
    }

    /**
     * @return array
     */
    public function getAll()
    {
        $rows = UserDb::fetchInitialUsers();
        $users = [];

        foreach ($rows as $row) {
            $model = new UserModel();
            $model->mapRecord($row);
            $user = new User();
            $user->setModel($model);
            $users[$user->getId()] = $user;
        }

        return $users;
    }

    /**
     * @param string $jid
     * @return User
     */
    public function getByJid(string $jid): User
    {
        $this->mapRecord(UserDb::fetchByJid($jid));
        $user = new User();
        $user->setModel($this);
        return $user;
    }

    /**
     * @param int $id
     * @return User
     */
    public function getById(int $id): User
    {
        $this->mapRecord(UserDb::fetchById($id, $this->record->getJid()));
        $user = new User();
        $user->setModel($this);
        return $user;
    }

    /**
     * @throws \MySender\Common\Model\RecordException
     * @return Operator[]
     */
    public function getOperators()
    {
        $this->required([
            'id' => [
                Validation::NOT_EMPTY,
                'throws' => new UserModelException(self::E_USER_MODEL_ID_REQUIRED)
            ],
        ]);

        $rows = UserDb::fetchOperators($this->record->getId(), $this->record->getJid());

        $operators = [];
        foreach ($rows as $row) {
            $model = new \MySender\Entities\Operator\Model\OperatorModel();
            $model->mapRecord($row);
            $operator = (new Operator())->setModel($model);
            $operators[$operator->getId()] = $operator;
        }

        return $operators;
    }

    /**
     * @return DUserRecord
     */
    public function record(): DUserRecord
    {
        return $this->record;
    }

    /**
     * @param $id
     * @return bool
     */
    public function operatorsOff($id)
    {
        return UserDb::getOperatorToBotState($id);
    }

}
