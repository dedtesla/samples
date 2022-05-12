<?php

namespace App\Modules\Accounting\Threads;

use AktionDigital\App;
use AktionDigital\Utils\Debug;


use AktionDigital\Threading\Worker as ThreadingWorker;

class Prov20Worker extends ThreadingWorker
{

    /**
     * @inheritdoc
     */
    public function Run()
    {

        $accModule = App::$moduleManager->accounting;
        $_SERVER['SCRIPT_FILENAME'] = realpath(App::$webRoot . '/' . $this->_params->year . '/index.php');

        global $maindbname, $_auid, $UserId, $currYear, $dbOpers, $PDO_db, $user, $dbs;

// нужно помаленьку убирать прямые require
        require_once($accModule->modulePath . "auth.php");
        require_once($accModule->modulePath . "php_func.php");

        $UserId = $this->_params->userid;
        $file_error = '/tmp/jo_log.txt';
        unlink($file_error);
        ini_set('log_errors', 'On');
        ini_set('error_log', $file_error);


        $maindbname = "pu{$this->_params->year}";
        $currYear = $this->_params->year;
        $_auid = ['userid', $UserId, 1];
        $_id_thread = $this->_id; //$this->_params->id_task;
        $_REQUEST = $this->_params->request;
        $appPath = $accModule->modulePath;


        $_auid = ['userid', $UserId, 1];
        $user = $this->_params->user;
        $foundFile = false;
        if (file_exists($appPath . "__fillprov_background_2020.php")) {
            $foundFile = true;
        }
        svjo('start');
        $res = createScript("$maindbname.tr_threads", 1, [
            ['userid', $UserId],
            ['id_thread', $_id_thread],
            ['status', '0'],
            ['answer', ''],
            ['task_name', 'fill_prov_20'],
            ['dat_beg', date("Y-m-d H:i:s")]
        ]);
        $id_log = $res['new_id'];

        if ($foundFile) {
            chdir($appPath);
            include_once $appPath . "__fillprov_background_2020.php";

            $result['success'] = true;
            $result['file'] = 'yes';
            $res = createScript("$maindbname.tr_threads", 2, [
                ['status', '100'],
                ['answer', json_encode($result, 512)],
                ['dat_end', date("Y-m-d H:i:s")]
            ], [['id', $id_log]]);
        } else {
            $result['success'] = false;
            $result['file'] = 'no';
            $res = createScript("$maindbname.tr_threads", 2, [
                ['status', '100'],
                ['answer', json_encode($result, 512)],
                ['dat_end', date("Y-m-d H:i:s")]
            ], [['id', $id_log]]);


        }

        $this->log->info('----complete----');

    }


}
