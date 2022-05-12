<?php

namespace MySender\Entities\Operator\Chat\Message;

use MySender\Entities\Operator\Chat\Message\Model\DGroupChatMessageMeta;
use MySender\Entities\Operator\Chat\Message\Model\MessageModel;
use MySender\Exchange\Ws\Structures\DVkPublicMeta;
use MySender\Log\Log;

/**
 * Class MessageFactory
 * @package MySender\Entities\Operator\Chat\Message
 */
class MessageFactory
{
    /**
     * @param array $row
     * @return Message
     */
    public function createFromRecord(array $row): Message
    {
        Log::debug('createFromRecord', ['row' => $row]);
        $meta = json_decode($row['m'] ?? $row['message'] ?? '', true);
        $jsonError = json_last_error();

        return (is_array($meta) && $jsonError == JSON_ERROR_NONE)
            ? $this->createGroupMessageFromRow($row, $meta)
            : $this->createMessageFromRow($row);
    }

    /**
     * @param array $row
     * @return Message
     */
    private function createMessageFromRow(array $row): Message
    {
        Log::debug('MessageFactory->createMessageFromRow call');
        $model = new MessageModel();
        $model->mapRecord($row);

        $message = new Message();
        $message->setModel($model);

        $message->setMessage($model->record()->getMessage());
        Log::debug('MessageFactory->createMessageFromRow', ['message' => print_r($message, true)]);

        return $message;
    }

    /**
     * @param array $row
     * @param array $rawMeta
     * @return Message
     */
    private function createGroupMessageFromRow(array $row, array $rawMeta): Message
    {
        Log::debug('MessageFactory->createGroupMessageFromRow', ['row' => $row, 'rawMeta' => $rawMeta]);
        $message = $this->createMessageFromRow($row);
        Log::debug('MessageFactory->createGroupMessageFromRow', ['message' => print_r($message, true)]);
        $message->setMessage($rawMeta['message'] ?? $rawMeta['text'] ?? '');
        $isInit = isset($rawMeta['action']) && $rawMeta['action'] == 'init';

        $name = !empty($rawMeta['username']) ? '@' . $rawMeta['username'] : '';
        $a_id = isset($rawMeta['id']) ? $rawMeta['id'] : null;
        if (!$name) {
            $a_id = $rawMeta['a_id'] ?? $rawMeta['id'] ?? null;
            $name = $rawMeta['name'] ?? $rawMeta['answerName'] ?? '';
        }

        $meta = (new DGroupChatMessageMeta())
            ->setAnswerId($a_id)
            ->setOperatorName($rawMeta['operatorName'] ?? 'Operator')
            ->setName($name)
            ->setFullName($rawMeta['fullname'] ?? '')
            ->setUserName($rawMeta['username'] ?? '')
            ->setIsGroupChat(true)
            ->setIsInit($isInit);
        Log::debug('MessageFactory->createGroupMessageFromRow', ['setIsInit' => $isInit,'DGroupChatMessageMeta' => $meta]);

        if ($meta->isInit()) {
            Log::debug('MessageFactory->createGroupMessageFromRow is init here');
            $meta->setVkPublicMeta($this->parseVkPubMeta($rawMeta));
        }
        $message->setGroupChatMessageMeta($meta);
        Log::debug('MessageFactory->createGroupMessageFromRow message', ['outMessage' => print_r($message, true)]);

        return $message;
    }

    /**
     * @param array $rawMeta
     * @return DVkPublicMeta
     */
    private function parseVkPubMeta(array $rawMeta): DVkPublicMeta
    {
        Log::debug('MessageFactory->parseVkPubMeta proceed');

        $text = $link = $pic = '';

        $groupChatInfo = $rawMeta;
        if (is_array($groupChatInfo)) {
            $text = $groupChatInfo['text'] ?? $groupChatInfo['message'] ?? '';
            $pic = $groupChatInfo['pic_url'] ?? '';
            $link = $groupChatInfo['link'] ?? '';
        }

        Log::debug('MessageFactory->parseVkPubMeta', [
            'link' => $link,
            'text' => $text,
            'pic' => $pic
        ]);

        return (new DVkPublicMeta)
            ->setLink($link)
            ->setText($text)
            ->setPic($pic);
    }

    /**
     * @param string $string
     * @return Message
     */
    public function createFromString(string $string)
    {
        Log::debug('MessageFactory->createFromString', ['string' => $string]);
        $rawMessage = json_decode($string, true);
        $isGroupChatMessage = (
            json_last_error() == JSON_ERROR_NONE
            && (
                isset($rawMessage['text'])
                || isset($rawMessage['message'])
            )
        );

        Log::debug('MessageFactory->createFromString isGroupChatMessage', [
            'isGroupChatMessage' => $isGroupChatMessage,
            'jserr' => json_last_error() == JSON_ERROR_NONE,
            'issetA' => isset($rawMessage['text']),
            'issetB' => isset($rawMessage['message']),
            'cond' => (
                isset($rawMessage['text'])
                || isset($rawMessage['message'])
            )
        ]);

        $message = new Message();
        $meta = new DGroupChatMessageMeta();
        if ($isGroupChatMessage) {
            $meta->setIsGroupChat(true);
            $pureMessage = $rawMessage['text'] ?? $rawMessage['message'];
        } elseif ($isGroupChatMessage) {
            $pureMessage = '';
        } else {
            $pureMessage = $rawMessage;
        }

        Log::debug('MessageFactory->createFromString', ['pureMessage' => $pureMessage]);

        if (!is_null($pureMessage) || !is_array($pureMessage)) {
            $pureMessage = '';
        }

        $message->setMessage($pureMessage);
        $message->setGroupChatMessageMeta(new DGroupChatMessageMeta());

        return $message;
    }
}
