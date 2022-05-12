<?php

namespace App\Modules\Accounting\Threads;

use AktionDigital\App;
use AktionDigital\Utils\Debug;


use AktionDigital\Threading\Worker as ThreadingWorker;

class KuDiRWorker extends ThreadingWorker
{

    /**
     * @inheritdoc
     */
    public function Run()
    {

        $accModule = App::$moduleManager->accounting;
        $_SERVER['SCRIPT_FILENAME'] = realpath(App::$webRoot . '/' . $this->_params->year . '/index.php');

        global $maindbname, $_auid, $UserId, $currYear, $dbOpers, $PDO_db;

// нужно помаленьку убирать прямые require
        require_once($accModule->modulePath . "auth.php");
        require_once($accModule->modulePath . "php_func.php");

        $UserId = $this->_params->userid;
        $file_error = '/tmp/kudir_errors' . $UserId . '.log';
        unlink($file_error);
        ini_set('log_errors', 'On');
        ini_set('error_log', $file_error);


        $maindbname = "pu{$this->_params->year}";
        $currYear = $this->_params->year;
        $_auid = ['userid', $UserId, 1];
        $_id_thread = $this->_id; //$this->_params->id_task;
        $_REQUEST = $this->_params->request;
        $appPath = $accModule->modulePath;
        $foundFile = false;
        if (file_exists($appPath . "kndr_fill_21.php")) {
            $foundFile = true;
        }

        $res = createScript("$maindbname.tr_threads", 1, [
            ['userid', $UserId],
            ['id_thread', $_id_thread],
            ['status', '0'],
            ['answer', ''],
            ['task_name', 'kndr_fill'],
            ['dat_beg', date("Y-m-d H:i:s")]
        ]);
        $id_log = $res['new_id'];


        if ($foundFile) {
            chdir($appPath);

            $states = [
                ["userid" , $UserId],
                ["oper" , 4],
                ["dat_beg" , "now()"],
                ["start" , 1]
            ];

            $res = createScript("$maindbname.tr_oper_states", 1, $states);
            $id_proc_trace = $res['new_id'];

            include_once $appPath . "kndr_fill_21.php";

            $states = [
                ["finish" , 1],
                ["dat_end" , "now()"]
            ];

            createScript("$maindbname.tr_oper_states", 2, $states, [ ['id', $id_proc_trace]]);


            $result['success'] = true;
            $result['file'] = 'yes';
            $res = createScript("$maindbname.tr_threads", 2, [
                ['status', '100'],
                ['answer', json_encode($result, 512)],
                ['dat_end', date("Y-m-d H:i:s")]
            ], [['id', $id_log]]);



        }
        else{
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
