<?php

namespace MySender\Entities\Operator\Chat;

use MySender\Entities\Operator\Chat\Model\ChatModel;

/**
 * Class ChatFactory
 * @package MySender\Entities\Operator\Chat
 */
class ChatFactory
{
    /**
     * @param array $row
     * @return Chat
     */
    public function createFromRecord(array $row): Chat
    {
        $chat = new Chat();
        $model = new ChatModel();
        $model->mapRecord($row);
        $chat->setModel($model);

        return $chat;
    }

}
