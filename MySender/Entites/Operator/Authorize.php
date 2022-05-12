<?php

namespace MySender\Entities\Operator;

use MySender\App\Config;
use MySender\Entities\Operator\Model\OperatorDb;
use MySender\Entities\Operator\Model\OperatorModel;
use MySender\Log\Log;

/**
 * Class Authorize
 * @package MySender\Entities\Operator
 */
class Authorize
{
    /**
     * @return array
     * @throws AuthException
     * @throws \Exception
     */
    public static function httpAuth(): array
    {
        $session = $_GET['s'] ?? '';
        $cid = $_GET['cid'] ?? 0;
        $v = $_GET['v'] ?? 0;

        if (!$session && isset($_COOKIE['mychat_operator_session'])) {
            $session = $_COOKIE['mychat_operator_session'] ?? '';
        }

        $userLogin = $_COOKIE['mysender_login'];
        if (!$userLogin) {
            throw new AuthException('No user login stored');
        }

        if (!$session) {
            throw new AuthException('No session');
        }

        $operator = OperatorModel::getBySession($session, $userLogin);

        return [$operator, $cid, $userLogin, $v];
    }
}
