<?php

/**
* Единая точка входа приложения.
*/
set_time_limit(0);

header('Content-Type: text/html; charset=utf-8');

mb_internal_encoding("UTF-8");
date_default_timezone_set('Europe/Moscow');

defined('PRODUCTION_PATH') || define('PRODUCTION_PATH', '/home/web/production/');

$config = include dirname(__FILE__) . DIRECTORY_SEPARATOR . 'config.php';

require($config['corePath'] . DIRECTORY_SEPARATOR . 'Port.php');
require_once($config['corePath'] . DIRECTORY_SEPARATOR . 'vendors/phpmailer/class.phpmailer.php');

Port::loader($config);
