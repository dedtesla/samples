<?php

namespace App\Modules\Accounting\Threads;

use AktionDigital\App;
use AktionDigital\Utils\Debug;


use AktionDigital\Threading\Worker as ThreadingWorker;

class BackupWorker extends ThreadingWorker
{

    /**
     * @inheritdoc
     */
    public function Run()
    {
        $this->_log("backup background start");


        $accModule = App::$moduleManager->accounting;
        $_SERVER['SCRIPT_FILENAME'] = realpath(App::$webRoot . '/' . $this->_params->year . '/index.php');

        global $maindbname, $_auid, $UserId, $currYear, $dbOpers, $PDO_db;

// нужно помаленьку убирать прямые require
        require_once($accModule->modulePath . "auth.php");
        require_once($accModule->modulePath . "php_func.php");

        $UserId = $this->_params->userid;
/*
        $file_error ='/tmp/1c_imp_errors'.$UserId.'.log';
        unlink($file_error);
        ini_set('log_errors', 'On');
        ini_set('error_log', $file_error);
*/

        $maindbname = "pu{$this->_params->year}";
        $currYear = $this->_params->year;
        $_auid = ['userid', $UserId, 1];
        $_id_thread = $this->_id; //$this->_params->id_task;
        $_REQUEST = [];
        $_REQUEST['act'] = $this->_params->act;
        $_REQUEST['id'] = $this->_params->id_;
        $appPath = $accModule->modulePath;
        $foundFile = false;
        if (file_exists($appPath . "backup.php")) {
            $foundFile = true;
        }

        $res = createScript("$maindbname.tr_threads", 1, [
            ['userid', $UserId],
            ['id_thread', $_id_thread],
            ['status', '0'],
            ['answer', ''],
            ['task_name', 'backup '],
            ['dat_beg', date("Y-m-d H:i:s")]
        ]);
        $id_log = $res['new_id'];
        $this->_log("$maindbname.tr_threads");
        $this->_log([
            ['userid', $UserId],
            ['id_thread', $_id_thread],
            ['status', '0'],
            ['answer', ''],
            ['task_name', 'backup '],
            ['dat_beg', date("Y-m-d H:i:s")]
        ]);
        $this->_log($res);


        if ($foundFile) {
            include_once $appPath . "backup.php";
        }


        $this->log->info('----complete----');

    }

    public function _log($_t){
        $fd = fopen('/tmp/jo_log.txt', "a");
        fwrite($fd, print_r($_t, true));
        fwrite($fd, chr(10));
        fclose($fd);


    }


}
