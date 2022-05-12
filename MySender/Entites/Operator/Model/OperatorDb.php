<?php

namespace MySender\Entities\Operator\Model;

use MySender\Common\Helper;
use MySender\Log\Log;
use MySender\Log\MsLog;

/**
 * Class OperatorDb
 * @package MySender\Entities\Operator\Model
 */
class OperatorDb extends \MySender\Common\Model\Model
{
    /**
     * @param string $userLogin
     * @return array
     */
    static function fetchAll($userLogin)
    {
        $db = self::db();
        $db->setDb('u_' . $userLogin);

        $sql = "
            SELECT
                t1.id,
                t1.login,
                t1.name,
                t1.created,
                t1.operatorinfo,
                t1.web_lastlogin,
                t1.web_last_activity,
                t1.is_deleted,
                t1.allowed_dialogslist AS is_manager,
                t1.is_bot,
                t1.created,
                t2.session
            FROM jabber_operators t1
            LEFT JOIN jabber_operator_sessions t2
              ON t1.id = t2.operator_id
              AND t2.id = (
                SELECT MAX(t22.id)
                FROM jabber_operator_sessions t22
                WHERE t22.operator_id = t1.id
              )
            ORDER BY t1.id ASC
		";
        $dbRes = $db->query($sql);

        return pg_num_rows($dbRes) > 0
            ? pg_fetch_all($dbRes)
            : [];
    }

    /**
     * @param string $session
     * @param string|null $login
     */
    static function updateSessionActivity($session, $login = null)
    {
        $db = self::db();
        if ($login) $db->setDb('u_'.$login);
        $sql = "
			UPDATE jabber_operator_sessions
			SET updated=NOW()
			WHERE session=$1
		";

        $db->query($sql, [$session]);
    }

    /**
     * @param int $operatorId
     * @param string $login
     */
    static function updateLastActivity($operatorId, $login)
    {
        if (!$operatorId) return;
        $db = self::db();
        $db->setDb('u_'.$login);
        $sql = "
			UPDATE jabber_operators
			SET web_last_activity=NOW()
			WHERE id=$1
		";

        $db->query($sql, [$operatorId]);
    }

    /**
     * @param $operatorsSessionLifetime
     */
    public static function clearOutdatedSessions($operatorsSessionLifetime)
    {
        $db = self::db();
        $sql = "
			DELETE FROM jabber_operator_sessions
			WHERE id IN (
				SELECT t1.id
				FROM jabber_operator_sessions t1
				INNER JOIN jabber_operators t2 ON (t1.operator_id = t2.id)
				WHERE (
					t2.session_timetolive <> 0
					AND t1.updated < NOW() - interval '1 second' * t2.session_timetolive
					OR t2.session_timetolive = 0
					AND t1.updated < NOW() - interval '1 second' * $1
				)
			)
		";

        $db->query($sql, [$operatorsSessionLifetime]);
    }

    /**
     * @param string $session
     * @param int $sessionTimeToLive
     * @param string $userLogin
     * @return array
     */
    static function fetchBySession($session, $sessionTimeToLive, $userLogin)
    {
        $db = self::db();
        $db->setDb('u_' . $userLogin);

        $sql = "
			SELECT
				t1.session,
				t1.id sid,
				t2.*
			FROM jabber_operator_sessions t1
			INNER JOIN jabber_operators t2 ON (t1.operator_id = t2.id)
			WHERE t1.session = $1
			AND (
				t2.session_timetolive <> 0
				AND t1.updated > NOW() - interval '1 second' * t2.session_timetolive
				OR t2.session_timetolive=0
				AND t1.updated > NOW() - interval '1 second' * $2
			)
		";

        $sql = preg_replace('!\s+!', ' ', preg_replace("/[\n\r]/","", $sql));
        $dbRes = $db->query(trim($sql), [$session, $sessionTimeToLive]);

        return pg_num_rows($dbRes) > 0
            ? pg_fetch_assoc($dbRes)
            : [];
    }

    /**
     * @param int $operatorId
     * @return array
     */
    public static function fetchById($operatorId)
    {
        $profiler = new LogTimer(self::PROFILER_FNAME);
        $profiler->start('UserModel::fetchOperators');

        $db = self::db();
        $sql = "
			SELECT *
			FROM jabber_operators
			WHERE id=$1
		";

        $dbRes = $db->query($sql, [$operatorId]);
        $profiler->stop();

        return pg_num_rows($dbRes) > 0
            ? pg_fetch_all($dbRes)
            : [];
    }

    /**
     * Get operator record, which marked as bot.
     *
     * @param int $userId
     * @return array
     */
    public static function fetchByBot($userId)
    {
        $db = self::db();
        $sql = "
			SELECT *
			FROM jabber_operators
			WHERE jabberuser_id=$1
            AND is_bot
		";

        $data = pg_fetch_all($db->query($sql, [$userId]));
        return ($data ? $data[0] : []);
    }

    /**
     * @param string $userLogin
     * @param int $operatorId
     * @return bool
     */
    static function invalidateSession($userLogin, $operatorId)
    {
        $db = self::db();
        $db->setDb('u_'.$userLogin);
        $sql = "
			SELECT id, session FROM jabber_operator_sessions
			WHERE operator_id=$1
			ORDER BY id DESC
			LIMIT 1
		";
        $dbRes = $db->query($sql, [$operatorId]);
        if (!pg_num_rows($dbRes)) return false;
        $row = pg_fetch_assoc($dbRes);

        $sql = "
			UPDATE jabber_operator_sessions
			SET session=$2
			WHERE id=$1
		";
        $invalidatedSession = 'INV_' . $row['session'];
        $dbRes = $db->query($sql, [$row['id'], $invalidatedSession]);

        return pg_affected_rows($dbRes) > 0;
    }

    /**
     * @param string $userLogin
     * @param int $operatorId
     * @param string $login
     */
    static function updateOperatorLogin($userLogin, $operatorId, $login)
    {
        $db = self::db();
        $db->setDb('u_'.$userLogin);
        $sql = "
			UPDATE jabber_operators
			SET login=$2
			WHERE id=$1
		";

        $db->query($sql, [$operatorId, $login]);
    }

    /**
     * @param string $userLogin
     * @param int $operatorId
     * @param string $name
     */
    static function updateOperatorName($userLogin, $operatorId, $name)
    {
        $db = self::db();
        $db->setDb('u_'.$userLogin);
        $sql = "
			UPDATE jabber_operators
			SET name=$2
			WHERE id=$1
		";

        $db->query($sql, [$operatorId, $name]);
    }

    /**
     * @param string $userLogin
     * @param int $operatorId
     * @param bool $isManager
     */
    static function updateIsManager($userLogin, $operatorId, $isManager)
    {
        $db = self::db();
        $db->setDb('u_'.$userLogin);
        $sql = "
			UPDATE jabber_operators
			SET allowed_dialogslist=$2
			WHERE id=$1
		";

        $db->query($sql, [$operatorId, $isManager ? "1" : "0"]);
    }

    /**
     * @param string $userLogin
     * @param int $operatorId
     * @param string $password
     */
    static function updatePassword($userLogin, $operatorId, $password)
    {
        $db = self::db();
        $db->setDb('u_'.$userLogin);
        $sql = "
			UPDATE jabber_operators
			SET pass=md5($2)
			WHERE id=$1
		";

        $db->query($sql, [$operatorId, $password]);
    }

    /**
     * @param string $userLogin
     * @param string $login
     * @param string $password
     * @param string $name
     * @param bool $isManager
     * @return array
     */
    static function addOperator($userLogin, $login, $password, $name, $isManager)
    {
        $db = self::db();
        $db->setDb('u_'.$userLogin);

        $sql = "SELECT id FROM jabber_users LIMIT 1";
        $dbRes = $db->query($sql);
        $userId = pg_fetch_row($dbRes)[0];

        $sql = "
			INSERT INTO jabber_operators
			(jabberuser_id, login, pass, name, allowed_dialogslist)
			VALUES ($1, $2, md5($3), $4, $5)
			RETURNING
                id,
                login,
                name,
                created,
                operatorinfo,
                web_lastlogin,
                web_last_activity,
                is_deleted,
                allowed_dialogslist AS is_manager,
                is_bot,
                created
		";

        $dbRes = $db->query($sql, [$userId, $login, $password, $name, $isManager ? "1" : "0"]);
        return pg_affected_rows($dbRes) > 0
            ? pg_fetch_assoc($dbRes)
            : [];
    }

    /**
     * @param string $userLogin
     * @param int $operatorId
     */
    static function disableOperator($userLogin, $operatorId)
    {
        $db = self::db();
        $db->setDb('u_'.$userLogin);
        $sql = "
			UPDATE jabber_operators
			SET is_deleted=1
			WHERE id=$1
		";

        $db->query($sql, [$operatorId]);
    }

    /**
     * @param string $userLogin
     * @param int $operatorId
     */
    static function restoreOperator($userLogin, $operatorId)
    {
        $db = self::db();
        $db->setDb('u_'.$userLogin);
        $sql = "
			UPDATE jabber_operators
			SET is_deleted=0
			WHERE id=$1
		";

        $db->query($sql, [$operatorId]);
    }
}
