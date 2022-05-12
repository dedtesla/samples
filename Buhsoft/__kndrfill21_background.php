<?php

if (!isset($_REQUEST['year'])) {
    die('no year');
}
global $user;

require_once('../../../vendor/autoload.php');

use AktionDigital\App;
use AktionDigital\Utils\Debug;
use App\Modules\Accounting\Threads\KuDiRWorker;

require_once("./auth.php");

if (isset($_REQUEST['id_task']) && $_REQUEST['id_task'] * 1 > 0) {
    $row = PDO_row("select * from {$maindbname}.tr_threads where userid=:userid and id_thread=:id",
        [['userid', $UserId], ['id', $_REQUEST['id_task'] * 1]]
    );

    if ($row['id'] * 1 > 0) {
        echo json_encode(
            [
                'result' => 'success',
                'progress' => $row['status'],
                'answer' => $row['answer'],
            ]);
        exit;
    } else {
        echo json_encode([
            'progress' => -1,
            'result' => 'not found task'
        ]);
        exit;
    }
} else {
    $worker = new \App\Modules\Accounting\Threads\KuDiRWorker(0, 0, 'backup');

    $process = App::$threadingManager->CreateProcess($worker);
    $process->Run((object)
    [
        'userid' => $user['id'],
        'token' => $user['action_token'],
        'year' => ($_REQUEST['year'] * 1),
        'actualYear' => ($_REQUEST['actualYear'] * 1),
        'act' => $_REQUEST['act'],
        'id_' => $_REQUEST['id'],
        'request' => $_REQUEST
    ]
    );
    $result['success'] = true;
    $result['thread_start'] = $process->isRunning();
    $result['process'] = $worker->id;
    $result['params']=    [
        'userid' => $user['id'],
        'token' => $user['action_token'],
        'year' => ($_REQUEST['year'] * 1),
        'act' => $_REQUEST['act'],
        'id_' => $_REQUEST['id'],
        'request' => $_REQUEST
    ];

    echo json_encode($result, 512);
    exit;
}
