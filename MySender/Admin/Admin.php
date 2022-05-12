<?php

namespace MySender\Admin;

use MySender\App\App;
use MySender\App\Config;
use MySender\Common\Helper;
use MySender\Entities\Operator\Chat\Model\ChatDb;
use MySender\Entities\Operator\Model\OperatorDb;
use MySender\Entities\User\Model\UserDb;
use MySender\Log\Log;

class Admin implements AdminApi
{
    private function remapClientFields($origRow)
    {
        $row = $origRow;
        $activityThreshold = Config::get()->ms->webActivityThresholdSec;

        $ts = strtotime($row['last_pinged']);
        $nowTs = time();

        $row['isActive'] = $row['work_mode'] != -1 && abs($nowTs - $ts) < $activityThreshold;
        if ($row['isActive']) {
            exec('ps aux | grep "'.$row['jid'].'"', $processOutput);
            $isWorkerAlive = count($processOutput) > 2;
            $row['isActive'] = $row['isActive'] && $isWorkerAlive;
        }

        // js date format
        $row['lastActivity'] = date('c', strtotime($row['last_pinged']));
        $row['auto_answer_start'] = date('c', strtotime($row['auto_answer_start']));
        $row['auto_answer_finish'] = date('c', strtotime($row['auto_answer_finish']));
        $row['created'] = date('c', strtotime($row['created']));

        return $row;
    }

    private function remapOperatorFields($origRow)
    {
        $row = $origRow;
        $activityThreshold = Config::get()->ms->webActivityThresholdSec;

        $ts = strtotime($row['web_last_activity']);
        $nowTs = time();
        $row['isActive'] = (
            $row['session']
            // Если оператора принудительно выкинули из сесси, токен будет иметь префикс INV_
            && substr($row['session'], 0, 4) != 'INV_'
            && abs($nowTs - $ts) < $activityThreshold
        );

        // js date format
        $row['lastActivity'] = date('c', strtotime($row['web_last_activity']));
        $row['lastLogin'] = date('c', strtotime($row['web_lastlogin']));
        $row['created'] = date('c', strtotime($row['created']));
        $row['is_manager'] = $row['is_manager'] == '1' ? true : false;
        $row['is_bot'] = $row['is_bot'] == '1' ? true : false;

        return $row;
    }

    public function getClientList($exclude = null): array
    {
        $list = UserDb::fetchAllUsers($exclude);
        foreach ($list as &$user) {
            $user = $this->remapClientFields($user);
        }

        return $list;
    }

    public function getUntakenChatList($login, $limit = 100, $offset = 0): array
    {
        $rows = ChatDb::fetchUntakenList($login, $limit, $offset);

        foreach ($rows as &$row) {
            $jidHash = Helper::jidInfo($row['jid']);
            $row['transport'] = $jidHash['transport'];
            $row['account'] = $jidHash['user'];

            unset($row['jid']);
        }

        return [
            'list' => $rows,
            'totalCount' => ChatDb::countQueueForNewDb($login)
        ];
    }

    public function updateAutoanswerTime($login, $startTs, $finishTs): array
    {
        UserDb::updateAutoanswerTime($login, $this->tsToPostgresDate($startTs), $this->tsToPostgresDate($finishTs));
        return $this->getClient($login);
    }

    public function getClient($login): array
    {
        return $this->remapClientFields(UserDb::fetchByLogin($login)[0]);
    }

    public function updateAutoanswerText($login, $text): array
    {
        UserDb::updateAutoanswerText($login, $text);
        return $this->getClient($login);
    }

    public function updateJid($login, $jid): array
    {
        UserDb::updateJid($login, $jid);
        return $this->getClient($login);
    }

    public function updateWorkMode($login, $workMode): array
    {
        UserDb::updateWorkMode($login, $workMode);
        return $this->getClient($login);
    }

    public function updateClientPassword($login, $pass): array
    {
        UserDb::updatePassword($login, $pass);
        return $this->getClient($login);
    }

    /**
     * @param $jid
     * @param $password
     * @param $workMode
     * @param $autoAnswerStartTs
     * @param $autoAnswerFinishTs
     * @param $autoAnswerText
     * @return array
     * @throws \Exception
     */
    public function addClient(
        $jid,
        $password,
        $workMode = 0,
        $autoAnswerStartTs = null,
        $autoAnswerFinishTs = null,
        $autoAnswerText = ''
    ): array
    {
        Log::disable();

        if (!$jid) throw new \Exception('jid is missing');
        if (!$password) throw new \Exception('password is missing');

        $isValidJid = preg_match('/^.*@[a-z]{1,}\.[a-z]{1,}\.[a-z]{1,}\/{0,1}[a-z0-9]{0,}$/i', $jid);

        if (!$isValidJid) throw new \Exception('jid is invalid');

        $jidInfo = Helper::jidInfo($jid);
        $login = $jidInfo['user'];

        if (UserDb::isUserExists($login)) throw new \Exception('client already exists');

        $row = UserDb::createClientDb(
            $login,
            $jid,
            $password,
            $workMode,
            $this->tsToPostgresDate($autoAnswerStartTs),
            $this->tsToPostgresDate($autoAnswerFinishTs),
            $autoAnswerText
        );

        if (empty($row)) throw new \Exception('failed to add user');

        // pg_bouncer fails to immediately reconnect to new db after it was created
        // so we fetch client list without just added client and mixin it to result
        $list = $this->getClientList($login);
        array_push($list, $this->remapClientFields($row));

        return $list;
    }


    private function tsToPostgresDate($ts)
    {
        if (!$ts) return '00:00:00';
        return date('H:i:s', $ts);
    }

    public function getOperatorList($client): array
    {
        $list = OperatorDb::fetchAll($client);
        foreach ($list as &$item) {
            $item = $this->remapOperatorFields($item);
        }
        return $list;
    }

    public function invalidateOperatorSession($client, $id): array
    {
        OperatorDb::invalidateSession($client, $id);
        return $this->getOperatorList($client);
    }

    public function updateOperatorLogin($client, $id, $operatorLogin): array
    {
        OperatorDb::updateOperatorLogin($client, $id, $operatorLogin);
        return $this->getOperatorList($client);
    }

    public function updateOperatorName($client, $id, $operatorName): array
    {
        OperatorDb::updateOperatorName($client, $id, $operatorName);
        return $this->getOperatorList($client);
    }

    public function updateIsManager($client, $id, $isManager): array
    {
        OperatorDb::updateIsManager($client, $id, $isManager);
        return $this->getOperatorList($client);
    }

    public function updateOperatorPassword($client, $id, $password): array
    {
        OperatorDb::updatePassword($client, $id, $password);
        return $this->getOperatorList($client);
    }

    /**
     * @param $client
     * @param $login
     * @param $name
     * @param bool $isManager
     * @return array
     * @throws \Exception
     */
    public function addOperator($client, $login, $name, $isManager = false): array
    {
        $password = Helper::randomString(8);
        if (!$name) $name = $login;

        $result = OperatorDb::addOperator($client, $login, $password, $name, $isManager);
        $result['password'] = $password;

        return [
            'operator' => $result,
            'list' => $this->getOperatorList($client)
        ];
    }

    public function disableOperator($client, $id): array
    {
        OperatorDb::disableOperator($client, $id);
        return $this->getOperatorList($client);
    }

    public function restoreOperator($client, $id): array
    {
        OperatorDb::restoreOperator($client, $id);
        return $this->getOperatorList($client);
    }

    public function dropQueue($login): array
    {
        ChatDb::dropQueue($login);
        return $this->getUntakenChatList($login);
    }

    /**
     * @return string
     * @throws \Exception
     */
    public function generatePassword(): string
    {
        return Helper::randomString(8);
    }

    public function restartService(): void
    {
        chdir(Config::projectRoot() . '/bin');
        exec('nohup ./restart.sh > /dev/null &');
        sleep(10);
    }

    public function getServiceStatus(): array
    {
        chdir(Config::projectRoot() . '/bin');
        exec('php mysender_ws.php status', $rows);

        $startRowIndex = 0;

        $isWsUp = true;
        foreach ($rows as $index => $row) {
            if (preg_match('/PROCESS STATUS/', $row)) {
                $startRowIndex = $index;
                break;
            }
        }
        if (!isset($rows[$startRowIndex+2])) $isWsUp = false;

        exec('ps aux | grep "php mysender\.php"', $supervisorOut);
        $isSupervisorUp = count($supervisorOut) > 0;

        exec('ps aux | grep "php mysender_daemon\.php"', $workersOut);
        $isWorkersUp = count($workersOut) > 0;

        return [
            'ws' => $isWsUp,
            'supervisor' => $isSupervisorUp,
            'workers' => $isWorkersUp
        ];
    }

}
