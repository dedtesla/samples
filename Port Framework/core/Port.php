<?php

use components\database;
use components\exception\PortException;
use components\loggers;
use components\i18n;

/**
 * Port
 * Стартовый класс фреймворка. 
 *
 * @category   Port
 * @package    core
 * @author A.Shenderov (ashenderov@yandex.ru)
 * 
 */
/**
 * Метка старта.
 */
defined('PORT_BEGIN_TIME') || define('PORT_BEGIN_TIME', microtime(TRUE));
/**
 * Режим отладки, стандартно выключен.
 */
defined('PORT_DEBUG') || define('PORT_DEBUG', TRUE);
/**
 * Уровень вложенности данных стека вызова при логировании (Port::trace()).
 * Стандартно 0. Пока рассчитано только на работу с сайтами.
 */
defined('PORT_TRACE_LEVEL') || define('PORT_TRACE_LEVEL', 0);
/**
 * Режим обработки исключений, стандартно включен.
 */
defined('PORT_ENABLE_EXCEPTION_HANDLER') || define('PORT_ENABLE_EXCEPTION_HANDLER', FALSE);
/**
 * Режим обработки ошибочных ситуаций, стандартно включен.
 */
defined('PORT_ENABLE_ERROR_HANDLER') || define('PORT_ENABLE_ERROR_HANDLER', FALSE);
/**
 * Путь к директории программного ядра.
 */
defined('PORT_PATH') || define('PORT_PATH', dirname(__FILE__));
/**
 * Первичная проверка системного окружения.
 */
defined('PORT_SETUP') || define('PORT_SETUP', FALSE);

defined('PAGE_CATALOG') || define('PAGE_CATALOG', 1);
defined('PAGE_ARTICLE') || define('PAGE_ARTICLE', 2);

/**
 * Класс-стартер для всех проектов.
 *
 * Базовые свойства передаются в файле конфигурации (config/config.php):
 *
 * @property string coreCommonPath Путь к разделу с базовыми классами
 * @property string coreComponentsPath Путь к разделу с базовыми классами-компонентами
 * @property string coreModelsPath Путь к разделу с базовыми классами-моделями
 * @property string coreViewPath Путь к разделу с представлениями, используемыми на уровне системы
 * @property string coreThemePath Путь к разделу с тематическими наборами, используемыми на уровне системы
 * @property string coreModulesPath Путь к разделу с базовыми модулями
 * @property string coreVendorsPath Путь к разделу с привлеченными библиотеками и классами
 * @property string contribModulesPath Путь к разделу с модулями, используемыми в проектах
 * @property string contribThemesPath Путь к разделу с тематическими наборами, используемыми в проектах
 * @property string sitesCachePath Путь к разделу с кешем постоянного хранения файлов проектов.
 * Это файловая структура, в которой каждый вновь создаваемый проект сохраняет типовой набор
 * файлов, в соответствии с выбором типа сайта/шаблона.
 * @property array db Массив из двух элементов-массивов, обслуживающих подключение к глобальным базам данных
 * уровня системы:
 * <ul>
 * <li>@property-read array projects: База данных, обслуживающая стартовую идентификацию по доменным именам,
 * обслуживание проектов системой администрирования.
 * <ul>
 * <li>dsn Строка подключения (pgsql:host=[имя хоста];port=[номер порта];dbname=[имя базы])</li>
 * <li>user Логин</li>
 * <li>pass Пароль</li>
 * </ul>
 * </li>
 * <li>@property-read array port: База данных, обслуживающая систему администрирования.
 * <ul>
 * <li>dsn Строка подключения (pgsql:host=[имя хоста];port=[номер порта];dbname=[имя базы])</li>
 * <li>user Логин</li>
 * <li>pass Пароль</li>
 * </ul>
 * </li>
 * </ul>
 * @property string supportEmail E-mail, который указывается на страницах в нештатных ситуациях
 * уровня системы, или в случаях штатного прерывания выполнения приложений.
 * @property string defaultTimeZone Стандартная временная зона (Europe/Moscow)
 * @property string defaultApplicationType Стандартный тип приложения (site):
 * <ol>
 * <li>site</li>
 * <li>cms</li>
 * </ol>
 *
 * @package core
 */
class Port {

   private static $_app;
   private static $_config;
   private static $_mime_types;
   private static $_dbProjects;
   private static $_dbProjectsNext;
   private static $_dbPort;
   private static $_dbPortNext;
   private static $_logger;
   private static $_generation;

   const PORT_CATALOG = 1;
   const PORT_ARTICLE = 2;

   /**
    * @todo Разработать функционал, который можно использовать для анализа
    * технической площадки (железа, софта, настройки программного окружения),
    * в том числе автномно, т.е., без установленной системы Порт, на предмет
    * соответствия требованиям Порта.
    * Предполагется применение в связке с приложением для развертывания программного
    * кода Порта, а также, для мониторинга рабочей площадки с уже развернутым Портом.
    *
    */
   public static function checkPortEnv() {
      if (!is_dir(self::$_config['coreRuntimePath'] . DIRECTORY_SEPARATOR . 'twig')) {
         helpers\PortFileHelper::createDir(self::$_config['coreRuntimePath'] . DIRECTORY_SEPARATOR . 'twig');
      }
      return TRUE;
   }

   /**
    * @return string версия Порта
    */
   public static function getVersion() {
      return '2.0.0';
   }

   /**
    * @return string версия Порта
    */
   public static function getGeneration() {
      return self::$_generation;
   }

   /**
    * Выполняется конфигурирование Порта и запуск приложения с указанной как аргумент
    * конфигурацией.
    *
    * @param mixed $config конфигурация приложения
    * @return mixed экземпляр приложения
    */
   public static function loader($config = NULL) {
      self::$_config = require dirname(__FILE__) . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php';
      self::$_mime_types = require dirname(__FILE__) . DIRECTORY_SEPARATOR . 'helpers' . DIRECTORY_SEPARATOR . 'mimeTypes.php';
      /*
       * Фиксация версии фреймворка.
       */
      self::$_generation = $_SERVER['HTTP_HOST'] === 'newport.mc2.ru' ? 2 : 1;

      if (self::$_generation === 1 && strpos($_SERVER['HTTP_HOST'], 'mc2.ru') !== FALSE) {
         self::$_generation = 2;
      }

      if (empty(self::$_config)) {
         throw new PortException(Port::t('port', 'Core configuration file missing.'));
      }

      if (empty(self::$_config['db'])) {
         throw new PortException(Port::t('port', 'Core database configuration options missing.'), 1);
      }

      /*
       * Установление подключения к базе данных проектов, актуальной для текущей версии приложения.
       */
      if (self::$_generation === 1) {
         /*
          * Промежуточная версия.
          */
         \Port::setDbProjectsConnection(new database\PortDbConnection(self::$_config['db']['projects']['dsn'], self::$_config['db']['projects']['user'], self::$_config['db']['projects']['pass']));
      } else {
         /*
          * Версия нового поколения.
          */
         \Port::setDbProjectsNextConnection(new database\PortDbConnection(self::$_config['db']['projectsNext']['dsn'], self::$_config['db']['projectsNext']['user'], self::$_config['db']['projectsNext']['pass']));
      }

      /*
       * Установление подключения к базе данных администрирования, актуальной для текущей версии приложения.
       */
      if (self::$_generation === 1) {
         /*
          * Промежуточная версия.
          * База данных в кодировке cp1251, выполняется настройка кодировки приложения на юникод.
          */
         if (!empty(self::$_config['db']['port'])) {
            \Port::setDbPortConnection(new database\PortDbConnection(self::$_config['db']['port']['dsn'], self::$_config['db']['port']['user'], self::$_config['db']['port']['pass']));
            self::$_dbPort->createCommand("SET NAMES 'UNICODE'")->execute();
            self::$_dbPort->createCommand("SET CLIENT_ENCODING TO 'UNICODE'")->execute();
         } else {
            throw new PortException(Port::t('port', 'Application configuration database connection data for "port" missing.'), 1);
         }
      } elseif (self::$_generation === 2) {
         /*
          * Версия нового поколения.
          */
         if (!empty(self::$_config['db']['portNext'])) {
            \Port::setDbPortNextConnection(new database\PortDbConnection(self::$_config['db']['portNext']['dsn'], self::$_config['db']['portNext']['user'], self::$_config['db']['portNext']['pass']));
         } else {
            throw new PortException(Port::t('port', 'Application configuration database connection "portNext" missing.'), 1);
            exit;
         }
      }
      if (!empty($config)) {
         if (empty($config['typeApplication']) && empty(self::$_config['defaultApplicationType'])) {
            throw new PortException(self::t('port', 'Application configuration data missing "typeApplication" option.'));
         } else {
            if (!self::checkPortEnv()) {
               throw new PortException(self::t('port', 'Server configuration bad.'));
            }
            $_appType = !empty($config['typeApplication']) ? $config['typeApplication'] : self::$_config['defaultApplicationType'];
            $class = 'components\Port' . ucfirst($_appType) . 'Application';
            $_loader = new $class($config);
            $_loader->run();
         }
      } else {
         throw new PortException(Port::t('port', 'Application configuration data missing.'));
      }
   }

   /**
    * Возвращает синглтон приложения или NULL, если синглтон еще не существует.
    *
    * @return PortApplication
    */
   public static function app() {
      return self::$_app;
   }

   public static function option($key) {
      return isset(self::$_config[$key]) ? self::$_config[$key] : NULL;
   }

   /**
    * Возвращает экземпляр подключения к БД системы администрирования.
    * Промежуточная версия.
    *
    * @return PortDbConnection
    */
   public static function getDbPortConnection() {
      return self::$_dbPort;
   }

   /**
    * Возвращает экземпляр подключения к БД системы администрирования.
    * Для версии нового поколения.
    *
    * @return PortDbConnection
    */
   public static function getDbPortNextConnection() {
      return self::$_dbPortNext;
   }

   /**
    * Возвращает данные для подключения к БД статистики
    *
    * @return mix array|NULL
    */
   public static function getDbStatistics() {
      return (isset(self::$_config['db']['statistics']) ? self::$_config['db']['statistics'] : NULL);
   }

   /**
    * Возвращает данные для подключения к БД поиискового сервера
    *
    * @return mix array|NULL
    */
   public static function getDbSearch() {
      return (isset(self::$_config['db']['search']) ? self::$_config['db']['search'] : NULL);
   }

   /**
    * Возвращает экземпляр подключения к БД идентификации и настройки проектов.
    * Промежуточная версия.
    *
    * @return PortDbConnection
    */
   public static function getDbProjectsConnection() {
      return self::$_dbProjects;
   }

   /**
    * Возвращает экземпляр подключения к БД идентификации и настройки проектов.
    * Для версии нового поколения.
    *
    * @return PortDbConnection
    */
   public static function getDbProjectsNextConnection() {
      return self::$_dbProjectsNext;
   }

   /**
    * Устанавливает или сбрасывает экземпляр подключения к БД системы администрирования.
    * Промежуточная версия.
    *
    * @param PortDbConnection $connection экземпляр PDO объекта
    */
   public static function setDbPortConnection($connection) {
      if (self::$_dbPort === NULL || $connection === NULL) {
         self::$_dbPort = $connection;
      }
   }

   /**
    * Устанавливает или сбрасывает экземпляр подключения к БД системы администрирования.
    * Для версии нового поколения.
    *
    * @param PortDbConnection $connection экземпляр PDO объекта
    */
   public static function setDbPortNextConnection($connection) {
      if (self::$_dbPortNext === NULL || $connection === NULL) {
         self::$_dbPortNext = $connection;
      }
   }

   /**
    * Устанавливает или сбрасывает экземпляр подключения к БД идентификации и настройки проектов.
    * Промежуточная версия.
    *
    * @param PortDbConnection $connection экземпляр PDO объекта
    */
   public static function setDbProjectsConnection($connection) {
      if (self::$_dbProjects === NULL || $connection === NULL) {
         self::$_dbProjects = $connection;
      }
   }

   /**
    * Устанавливает или сбрасывает экземпляр подключения к БД идентификации и настройки проектов.
    * Для версии нового поколения.
    *
    * @param PortDbConnection $connection экземпляр PDO объекта
    */
   public static function setDbProjectsNextConnection($connection) {
      if (self::$_dbProjectsNext === NULL || $connection === NULL) {
         self::$_dbProjectsNext = $connection;
      }
   }

   /**
    * Закладывает экземпляр приложения в статический член класса.
    * Работает как шаблон синглтона PortApplication.
    * Повторный вызов метода или конструктора PortApplication вызывает исключение.
    * Для получения экземпляра приложения используется {@link app()}.
    *
    * @param PortApplication $app экземпляр приложения, NULL - существующий экземпляр удаляется.
    * @throws PortException
    */
   public static function setApplication($app) {
      if (self::$_app === NULL || $app === NULL) {
         self::$_app = $app;
      } else {
         throw new PortException(Port::t('port', 'Port application can only be created once.'));
      }
   }

   /**
    *
    * @return string путь к ядру
    */
   public static function corePath() {
      return PORT_PATH;
   }

   /**
    *
    * Создает объект и инициализирует его с указанной конфигурацией.
    *
    * Конфигурация может передаваться как:
    * строка - объект, либо имя класса, массив - элемент 'class' обрабатывается
    * как объект, остальные пары массива используются для инициализации.
    * Дополнительные параметры, переданные в метод, передаются конструктору
    * создаваемого объекта.
    *
    * @param mixed $config
    * @return mixed
    * @throws PortException если в конфигурации не найден элемент 'class'.
    */
   public static function createComponent($config, $args = NULL) {
      if (is_string($config)) {
         $type = $config;
         $config = array();
      } elseif (isset($config['class'])) {
         $type = $config['class'];
         unset($config['class']);
      } else {
         throw new PortException(Port::t('port', 'Object configuration must be an array containing a "class" element.'));
      }

      if (($n = func_num_args()) > 1) {
         $args = func_get_args();
         if ($n === 2) {
            $object = new $type($args[1]);
         } elseif ($n === 3) {
            $object = new $type($args[1], $args[2]);
         } elseif ($n === 4) {
            $object = new $type($args[1], $args[2], $args[3]);
         } else {
            unset($args[0]);
            $class = new \ReflectionClass($type);
            $object = call_user_func_array(array($class, 'newInstance'), $args);
         }
      } else {
         $object = new $type;
      }

      if (is_array($config)) {
         foreach ($config as $key => $value) {
            $object->$key = $value;
         }
      }

      return $object;
   }

   /**
    * Автозагрузчик класса.
    * Вызывается из магического __autoload().
    * @param string $className имя класса
    * @return boolean успешно ли загружен класс
    */
   public static function autoload($className) {
      $classFile = dirname(__FILE__) . DIRECTORY_SEPARATOR . str_replace('\\', '/', $className) . '.php';

      if (is_file($classFile))
         include $classFile;

      return class_exists($className, false) || interface_exists($className, false);
   }

   /**
    * Пишет сообщение трассировщика, в режиме отладки.
    * @param string $msg
    * @param string $category
    * @see log
    */
   public static function trace($msg, $category = 'application') {
      if (PORT_DEBUG) {
         self::log($msg, loggers\PortLogger::LEVEL_TRACE, $category);
      }
   }

   /**
    * Логирование.
    * Сообщение можно посмотреть с {@link PortLogger::getLogs} и записать с {@link PortLogRouter}.
    * @param string $msg сообщение для лога
    * @param string $level регистронезависимый тип сообщения ('trace', 'warning', 'error').
    * @param string $category регистронезависимая категория сообщения ('port.web').
    */
   public static function log($msg, $level = PortLogger::LEVEL_INFO, $category = 'application') {
      if (self::$_logger === NULL)
         self::$_logger = new \components\loggers\PortLogger();
      if (PORT_DEBUG && PORT_TRACE_LEVEL > 0 && $level !== loggers\PortLogger::LEVEL_PROFILE) {
         $traces = debug_backtrace();
         $count = 0;
         foreach ($traces as $trace) {
            if (isset($trace['file'], $trace['line']) && strpos($trace['file'], PORT_PATH) !== 0) {
               $msg .= "\nin " . $trace['file'] . ' (' . $trace['line'] . ')';
               if (++$count >= PORT_TRACE_LEVEL)
                  break;
            }
         }
      }
      self::$_logger->log($msg, $level, $category);
   }

   /**
    * Помечает начало блока кода для профилирования.
    * <pre>
    * Port::beginProfile('block1');
    * Port::beginProfile('block2');
    * Port::endProfile('block2');
    * Port::endProfile('block1');
    * </pre>
    * @param string $token токен блока кода
    * @param string $category категория сообщения лога
    * @see endProfile
    */
   public static function beginProfile($token, $category = 'application') {
      self::log('begin:' . $token, loggers\PortLogger::LEVEL_PROFILE, $category);
   }

   /**
    * Помечает конец блока кода для профилирования.
    * @param string $token токен блока кода
    * @param string $category категория сообщения лога
    * @see beginProfile
    */
   public static function endProfile($token, $category = 'application') {
      self::log('end:' . $token, loggers\PortLogger::LEVEL_PROFILE, $category);
   }

   /**
    * @return PortLogger логгер
    */
   public static function getLogger() {
      if (self::$_logger !== NULL)
         return self::$_logger;
      else
         return self::$_logger = new loggers\PortLogger();
   }

   /**
    * Назначает объект логгер.
    * @param PortLogger $logger
    */
   public static function setLogger($logger) {
      self::$_logger = $logger;
   }

   /**
    * Возвращает строку-информатор о платформе.
    * @return string
    */
   public static function powered() {
      return Port::t('port', 'Поддерживается {port}.', array('{port}' => '<a href="http://www.simfosoft.ru" rel="external" target="_blank">системой Порт</a>'));
   }

   /**
    * Возвращает строку-информатор о движке.
    * @return string
    */
   public static function getProperty($name = '') {
      return (!empty(self::$_config[$name]) ? self::$_config[$name] : NULL);
   }

   public static function mime_types() {
      return self::$_mime_types;
   }

   public static function mime_type($mime_type, $prefix = '.') {
      switch ($mime_type) {
         case 'image/gif':
         case 'gif':
            return $prefix . 'gif';
         case 'image/jpeg':
         case 'jpeg':
         case 'jpg':
            return $prefix . 'jpg';
         case 'image/png':
         case 'png':
            return $prefix . 'png';
         case 'application/x-shockwave-flash':
         case 'swf':
            return $prefix . 'swf';
         case 'ico':
            return $prefix . 'ico';
         default:
            return $prefix . 'png';
      }
   }

   /**
    * Переводит сообщение на указанный язык.
    *
    * Поддерживает вариативный формат {@link PortChoiceFormat}.
    * @param string $category категория сообщения, только слова.
    * Категория 'port' зарезервирована/
    * @see {@link PortCoreMessageSource}
    * @param string $message исходное сообщение
    * @param array $params параметры для <code>strtr</code>.
    * Первый параметр может быть числом без индекса, тогда метод вызывает {@link PortChoiceFormat::format}.
    * @param string $source источник сообщения, стандартно NULL, что означает использование 'coreMessages'
    * для сообщений в категории 'port'  и 'messages' для всего остального.
    * @param string $language язык, стандартно NULL - используется {@link PortApplication::getLanguage язык приложения}.
    * @return string переведенное сообщение
    * @see PortMessageSource
    */
   public static function t($category, $message, $params = array(), $source = NULL, $language = NULL) {
      if (self::$_app !== NULL) {
         if ($source === NULL) {
            $source = ($category === 'port') ? 'coreMessages' : 'messages';
         }
         if (($source = self::$_app->getComponent($source)) !== NULL) {
            $message = $source->translate($category, $message, $language);
         }
      }
      if ($params === array()) {
         return $message;
      }
      if (!is_array($params)) {
         $params = array($params);
      }
      if (isset($params[0])) {
         if (strpos($message, '|') !== false) {
            if (strpos($message, '#') === false) {
               $chunks = explode('|', $message);
               $expressions = self::$_app->getLocale($language)->getPluralRules();
               if ($n = min(count($chunks), count($expressions))) {
                  for ($i = 0; $i < $n; $i++) {
                     $chunks[$i] = $expressions[$i] . '#' . $chunks[$i];
                  }
                  $message = implode('|', $chunks);
               }
            }
            $message = i18n\PortChoiceFormat::format($message, $params[0]);
         }
         if (!isset($params['{n}'])) {
            $params['{n}'] = $params[0];
         }
         unset($params[0]);
      }
      return $params !== array() ? strtr($message, $params) : $message;
   }

   /**
    * Регистрирует новый автозагрузчик класса.
    * Новый автозагрузчик размещается перед {@link autoload} и после любых других
    * автозагрузчиков.
    * @param callback $callback имя функции или массив ($className,$methodName).
    * @param boolean $append надо ли добавлять новый автозагрузчик после стандарного автозагрузчика.
    */
   public static function registerAutoloader($callback, $append = false) {
      spl_autoload_unregister(array('Port', 'autoload'));
      spl_autoload_register($callback);
      spl_autoload_register(array('Port', 'autoload'));
   }

}

spl_autoload_register(array('Port', 'autoload'));
