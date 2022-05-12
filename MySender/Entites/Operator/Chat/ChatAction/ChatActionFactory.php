<?php

namespace MySender\Entities\Operator\Chat\ChatAction;

use MySender\Entities\Operator\Chat\ChatAction\Model\ChatActionModel;

/**
 * Class ChatActionFactory
 * @package MySender\Entities\Operator\Chat\ChatAction
 */
class ChatActionFactory
{
    /**
     * @param array $row
     * @return ChatAction
     */
    public function createFromRecord(array $row)
    {
        $chatAction = new ChatAction();
        $model = new ChatActionModel();
        $model->mapRecord($row);
        $chatAction->setModel($model);

        $info = null;
        if (isset($row['m']) && $row['m'] !== '') {
            $info = json_decode($row['m'], true);
        }
        $chatAction->setInfo($info);

        return $chatAction;
    }
}
