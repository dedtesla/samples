<?php

namespace MySender\Entities\User\Roster;

use MySender\Common\Helper;
use MySender\Entities\User\Roster\Model\RosterDb;
use MySender\Exchange\MsBot\Controller\ChainHandlers\ReceiveMessage\DDataHub;
use MySender\Log\Log;
use MySender\Log\MsLog;

/**
 * TODO Refactor this!
 * Class Roster
 * @package MySender\Entities\User\Roster
 */
class Roster
{
    /** @var int $userId */
    private $userId;
    /** @var DJid $userJid */
    private $userJid;
    /** @var array $jaxlRoster */
    private $jaxlRoster = [];
    /** @var array $jid2id */
    private $jid2id = [];
    /** @var array $jid2name */
    private $jid2name = [];
    /** @var array $rosterIqProps */
    private $rosterIqProps = [
        'subscription',
        'groups',
        'resources',
        'vcard',
        'name',
        'ask'
    ];
    /** @var DDataHub[] $pendingMessages */
    private $pendingMessages = [];

    public function enqueueMessage(DDataHub $dataHub)
    {
        array_push($this->pendingMessages, $dataHub);
    }

    public function dequeueMessage()
    {
        return array_shift($this->pendingMessages);
    }


    public function setJaxlRoster(array $jaxlRoster): void
    {
        $this->jaxlRoster = $jaxlRoster;
    }

    public function hasJid(string $jid)
    {
        return isset($this->jid2id[$jid]);
    }

    public function setJid(string $jid, string $name = '')
    {
        $this->jid2id[$jid] = true;
        $this->jid2name[$jid] = $name;
    }

    public function setUserId(int $userId)
    {
        $this->userId = $userId;
    }

    public function setUserJid(string $userJid)
    {
        $jidInfo = Helper::jidInfo($userJid);
        $dJid = (new DJid())
            ->setBare($jidInfo['clear'])
            ->setFull($userJid);
        $this->userJid = $dJid;
    }

    public function getName(string $jid): string
    {
        return isset($this->jaxlRoster[$jid])
            ? $this->jaxlRoster[$jid]['name']
            : '';
    }

    /**
     * JAXL lib updates roster by itself. We can be sure $this->jaxl->roster contains fresh records
     * with every in message from xmpp.
     *
     */
    public function updateFullRoster()
    {
        MsLog::info("DbMyChat->updateFullRoster call");

        $inverseSet = array_fill_keys($this->rosterIqProps, []);
        $this->saveNewRosterRecords($inverseSet);
        $this->mapRosterToJid();
    }

    public function refreshRoster()
    {
        MsLog::debug("Roster->updateRosterjid2id call");

        $this->saveNewRosterRecords();
        $this->mapRosterToJid();
    }

    public function mapRosterToJid()
    {
        $this->jid2id = [];
        $this->jid2name = [];
        $rows = RosterDb::fetch($this->userId);
        foreach ($rows as $row) {
            if (!isset($row['jid'])) continue;

            $this->jid2id[$row['jid']] = $row['id'] ?? null;
            $this->jid2name[$row['jid']] = $row['name'] ?? $row['jid'];
        }
    }

    /**
     * $inverseSet will be used to generate UPDATE statements and will have structure
     *
     * [
     *     subscription => [
     *         rosterId1 => [
     *             subscriptionValue1
     *         ],
     *         rosterId2 => [
     *             subscriptionValue2
     *         ],
     *         ...
     *     ],
     *     groups => [
     *         rosterId1 => [
     *             groupsValue1
     *         ],
     *         rosterId2 => [
     *             groupsValue2
     *         ]
     *     ],
     *     ...
     * ]
     *
     * @param $inverseSet
     */
    private function updateRosterRecords(&$inverseSet)
    {
        $iqItemProp2sqlData = [];
        foreach ($inverseSet as $iqItemProp => $rosterId2value) {
            if (!count($rosterId2value)) continue;

            $placeholderSet = $values = [];
            $placeholderIndex = 0;

            foreach ($rosterId2value as $rosterId => $value) {
                $placeholderSet[] = '($' . ++$placeholderIndex . '::bigint, $' . (++$placeholderIndex) . ')';
                array_push($values, $rosterId, $value);
            }

            $iqItemProp2sqlData[$iqItemProp] = [$placeholderSet, $values];
        }

        RosterDb::updateFullRoster($iqItemProp2sqlData);
    }

    /**
     * Generate INSERT statements for every new jid ($this->saveNewRosterRecords):
     *
     * @param null $inverseSet
     */
    private function saveNewRosterRecords(&$inverseSet = null)
    {
        MsLog::debug("Roster->saveNewRosterRecords call");

        foreach ($this->jaxlRoster as $jid => $iqItem) {
            if (empty($jid)) {
                return;
            }
            $fields = $values = $placeholders = [];

            $placeholderIndex = 0;
            foreach ($this->rosterIqProps as $iqItemProp) {
                if (isset($iqItem[$iqItemProp]) && $iqItem[$iqItemProp]) {
                    $placeholderIndex++;

                    $iqItemValue = !in_array($iqItemProp, ['groups', 'resources'])
                        ? $iqItem[$iqItemProp]
                        : json_encode($iqItem[$iqItemProp]);

                    $placeholders[] = '$' . $placeholderIndex;
                    $fields[] = $iqItemProp;
                    $values[] = $iqItemValue;

                    if (isset($this->rosterjid2id[$jid]) && $inverseSet !== null) {
                        $inverseSet[$iqItemProp][$this->jid2id[$jid]] = $iqItemValue;
                    }
                }
            }

            if (!isset($this->jid2id[$jid])) {
                array_push($fields, 'jabberuser_id', 'jid');
                array_push($placeholders, '$' . (count($placeholders) + 1), '$' . (count($placeholders) + 2));
                array_push($values, $this->userId, $jid);

                // RosterDb::addMany($fields, $placeholders, $values);
            }
        }
    }

    public static function clearJid(string $jid)
    {
        return preg_replace('/\/.*$/', '', $jid);
    }

    public function updatePresence($stanza)
    {
        $status = [
            'from' => $stanza['from'],
            'priority' => $stanza['priority'] ?? ''
        ];

        if ($stanza['type'] == 'unavailable') {
            $status['status'] = 'una';
        } elseif (!isset($stanza['show'])) {
            $status['status'] = 'ava';
            if (!$status['priority']) {
                $status['priority'] = 50;
            }
        } else {
            $status['status'] = $stanza['show'];
        }

        if (isset($stanza['status'])) {
            $status['title'] = $stanza['status'];
        }

        $clearJid = self::clearJid($status['from']);
        if (
            $clearJid === $this->userJid->getBare()
            && $status['from'] !== $this->userJid->getFull()
        ) {
            // TODO User with userJid logged in under some other xmpp client
        } elseif ($this->hasJid($clearJid)) {
            $rosterId = $this->jid2id[$clearJid];
            RosterDb::updateStatus($this->userId, $rosterId, json_encode($status));
        }
    }

    public function saveRosterRecord($userId, $stanza)
    {
        if (!$userId || empty($stanza['name'])) return;

        MsLog::debug("Roster->saveRosterRecord call");

        if ($exists = RosterDb::isRosterRecordExists($userId, $stanza['from']) > 0) {
            $result = RosterDb::updateName($userId, $stanza['from'], trim($stanza['name']));
        } else {
            $result = RosterDb::add($userId, $stanza['from'], trim($stanza['name']));
        }

        return $result;
    }

}
