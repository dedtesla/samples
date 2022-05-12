<?php

namespace MySender\Admin;

interface AdminApi
{
    public function getClientList(): array;
    public function getClient($login): array;
    public function getUntakenChatList($login, $limit = 100, $offset = 0): array;
    public function updateJid($login, $jid): array;
    public function updateAutoanswerTime($login, $startTs, $finishTs): array;
    public function updateAutoanswerText($login, $text): array;
    public function updateWorkMode($login, $mode): array;
    public function updateClientPassword($login, $pass): array;
    public function addClient($jid, $pass, $workMode, $autoAnswerStartTs, $autoAnswerFinishTs, $autoAnswerText): array ;

    public function getOperatorList($client): array;
    public function invalidateOperatorSession($client, $id): array;
    public function updateOperatorLogin($client, $id, $operatorLogin): array;
    public function updateOperatorName($client, $id, $operatorName): array;
    public function updateIsManager($client, $id, $isManager): array;
    public function updateOperatorPassword($client, $id, $password): array;
    public function addOperator($client, $login, $name, $isManager = false): array;
    public function disableOperator($client, $id): array;
    public function restoreOperator($client, $id): array;

    public function dropQueue($client): array;

    public function generatePassword(): string;

    public function getServiceStatus(): array;
    public function restartService(): void;

}
