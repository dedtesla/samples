<?php

namespace MySender\Exchange\Xmpp;

use JAXL0184;
use JAXLUtil;
use MySender\App\Config;
use MySender\Entities\User\Model\UserDb;
use MySender\Entities\User\Roster\Model\RosterDb;
use MySender\Entities\User\Roster\Roster;
use MySender\Exchange\CrossProcessCom\MsWithXmpp;
use MySender\Exchange\Events\ExchangeActions;
use MySender\Exchange\MsBot\Controller\ChainHandlers\ReceiveMessage\DDataHub;
use MySender\Exchange\Structures\DExchange;
use MySender\Log\Log;
use MySender\Log\MsLog;
use XMPPSend;

/**
 * Class XmppClient
 * @package MySender\Exchange\Xmpp
 */
class XmppClient extends JaxlDriver
{
    /** @var Roster $msRoster */
    private $msRoster;
    private $lastRestartTime = 0;
    private $restartIntervalSec;

    /**
     * XmppClient constructor.
     * @param string $jid
     */
    public function __construct(string $jid)
    {
        parent::__construct();

        $this->jid = $jid;
        $this->msRoster = new Roster();
        $this->restartIntervalSec = Config::get()->xmpp->jaxl->restartIntervalSec;
        $this->lastRestartTime = time() + $this->restartIntervalSec;
    }

    protected function registerJaxlCallbacks()
    {
        $this->jaxl->addPlugin('jaxl_post_auth', function () {
            $this->postAuth();
        });

        $this->jaxl->addPlugin('jaxl_post_auth_failure', function ($reason) {
            $this->postAuthFailure($reason);
        });

        $this->jaxl->addPlugin('jaxl_post_disconnect', function () {
            $this->postDisconnect();
        });

        $this->jaxl->addPlugin('jaxl_post_roster_update', function ($stanza) {
            $this->postRosterUpdate($stanza);
        });

        $this->jaxl->addPlugin('jaxl_get_message', function ($stanza) {
            $this->getXmppMessage($stanza);
        });

        $this->jaxl->addPlugin('jaxl_get_presence', function ($stanza) {
            $this->getPresence($stanza);
        });

        $this->jaxl->addPlugin('jaxl_get_iq', function ($stanza) {
            $this->getIq($stanza);
        });
    }

    protected function registerTasks()
    {
        $this->restartInterval();
    }

    protected function registerListeners()
    {
        $package = MsWithXmpp::fromMs($this->userId);
        if (empty($package)) return;
        MsLog::info('JaxlClient->registerListeners package', [$package->toJson()]);

        switch ($package->getAction()) {
            case ExchangeActions::MESSAGE_SEND:
                $this->send($package);
                break;

            case ExchangeActions::S_GET_ROSTER:
                $payload = (new DExchange)
                    ->setAction(ExchangeActions::S_GET_ROSTER)
                    ->setPayload($this->jaxl->roster);
                MsWithXmpp::toMs($this->userId, $payload);
                break;

            case ExchangeActions::S_UPDATE_ROSTER:
                /** @var DDataHub $dataHub */
                $dataHub = $package->getPayload();
                $this->msRoster->enqueueMessage($dataHub);
                $this->jaxl->getRosterList();
                break;
        }
    }

    private function restartInterval()
    {
        if (
            $this->lastRestartTime
            && (time() - $this->lastRestartTime) < $this->restartIntervalSec
        ) {
            return;
        }
        MsLog::info('JaxlClient->restartInterval restarting');

        $this->lastRestartTime = time();
    }

    private function send(DExchange $package)
    {
        /** @var DXmppOutMessage $dXmppOutMessage */
        $dXmppOutMessage = $package->getPayload();

        $child = [
            'body' => $dXmppOutMessage->getMessage(),
            'payload' => JAXL0184::requestReceipt()
        ];

        if ($dXmppOutMessage->getExtchannel()) {
            $child['extchannel'] = $dXmppOutMessage->getExtchannel();
        }

        if (empty($dXmppOutMessage->getMessage())) {
            return;
        }

        XMPPSend::message(
            $this->jaxl,
            $dXmppOutMessage->getJidTo(),
            $dXmppOutMessage->getJidFrom(),
            $child,
            $dXmppOutMessage->getType(),
            'jm' . $dXmppOutMessage->getId()
        );
    }

    private function postAuth()
    {
        Log::info('Xmpp->postAuth');
        $this->jaxl->setStatus(null, null, 50);
        $this->jaxl->getRosterList();

        if ($this->isRestart) return;

        $package = (new DExchange())
            ->setAction(ExchangeActions::S_ON_XMPP_AUTH);
        MsWithXmpp::toMs($this->userId, $package);
    }

    /**
     * @param string $reason
     */
    private function postAuthFailure($reason)
    {
        MsLog::critical('XMPP auth failed', ['reason' => $reason]);

        $this->stop();
    }

    private function postDisconnect()
    {
        MsLog::warning('XMPP disconnected');
    }

    /**
     * @param $stanza[]
     */
    private function getXmppMessage($stanza)
    {
        Log::debug('JaxlClient->getXmppMessage in XmppClient ', [$stanza]);
        $package = (new DExchange())
            ->setAction(ExchangeActions::MESSAGE_RECEIVE)
            ->setPayload($stanza);
        MsWithXmpp::toMs($this->userId, $package);
    }

    /**
     * @param $stanza[]
     */
    private function postRosterUpdate($stanza)
    {
        Log::debug('JaxlClient->postRosterUpdate', [$stanza]);
        MsLog::debug('JaxlClient->postRosterUpdate');
        $this->isRestart = false;

        $package = (new DExchange())
            ->setAction(ExchangeActions::S_GET_ROSTER)
            ->setPayload($this->jaxl->roster);
        MsWithXmpp::toMs($this->userId, $package);

        while ($dataHub = $this->msRoster->dequeueMessage()) {
            $package = (new DExchange())
                ->setAction(ExchangeActions::S_UPDATE_ROSTER)
                ->setPayload($dataHub);
            MsWithXmpp::toMs($this->userId, $package);
        }
    }

    /**
     * Получение отображаемого имени контакта.
     *
     * @param $stanza
     */
    private function getIq($stanza): void
    {
        if (
            ($stanza['type'] ?? '') === 'result'
            && ($stanza['from'] ?? '') === $this->jaxl->domain
        ) {
            UserDb::updateLastPinged($this->userId);
        }

        elseif (
            ($stanza['type'] ?? '') === 'set'
            && ($stanza['queryXmlns'] ?? '') === 'jabber:iq:roster'
            && $stanza['queryItemSub'] ?? ''
            && $stanza['queryItemJid'] ?? ''
            && strpos($stanza['queryItemJid'], '@') !== false
            && isset($stanza['queryItemName'])
            && $stanza['queryItemName'] !== ''
        ) {
            $jid = JAXLUtil::getBareJid($stanza['queryItemJid']);
            $name = $stanza['queryItemName'];
            $this->jaxl->_addRosterNode($jid, true, $name);
            $this->jaxl->roster[$jid]['name'] = $name;
            RosterDb::updateName($this->userId, $jid, $name);
        }
    }

}
