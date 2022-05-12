<?php

namespace contrib\modules;

/**
 * Port
 *
 * @category   Port
 * @package    contrib
 * @author A.Shenderov (ashenderov@yandex.ru)
 *
 */

/**
 * Login - модуль авторизации.
 *
 * @package contrib.modules
 */
class Login implements \interfaces\IModule {

   private $_id;
   private $_isInitialized;
   private $_isEnabled;
   private $_path;
   private $_modules = [];
   public $defaultController = 'login';
   public $controllerNamespace;
   private $_data;
   public $output;

   /**
    * Конструктор.
    */
   public function __construct($id, $parent = NULL, $config = NULL) {
      $this->setPath();
      $this->init();
   }

   /**
    * @param string $id Идентификатор модуля.
    */
   private function setId($id) {
      $this->_id = $id;
   }

   /**
    * @return string Идентификатор модуля.
    */
   public function getId() {
      return $this->_id;
   }

   /**
    * @param string Абсолютный путь к корневой папке модуля.
    */
   public function setPath() {
      $this->_path = dirname(__FILE__);
   }

   /**
    * @return string Абсолютный путь к корневой папке модуля.
    */
   public function getPath() {
      return $this->_path;
   }

   /**
    * @return string Абсолютный путь к папке контроллеров модуля.
    */
   public function getControllerPath() {
      return $this->getPath() . DIRECTORY_SEPARATOR . 'controllers';
   }

   /**
    * @return string Абсолютный путь к папке представлений модуля.
    */
   public function getViewsPath() {
      return $this->getPath() . DIRECTORY_SEPARATOR . 'views';
   }

   /**
    * @return string Абсолютный путь к папке тем модуля.
    */
   public function getThemePath() {
      return $this->getPath() . DIRECTORY_SEPARATOR . 'themes';
   }

   /**
    * @return string Абсолютный путь к папке моделей модуля.
    */
   public function getModelPath() {
      return $this->getPath() . DIRECTORY_SEPARATOR . 'models';
   }

   /**
    * Предварительная инициализация модуля.
    * При первичном подключении модуля в структуру базы данных приложения
    * добавляются объекты, выполняется импорт первичных данных, если требуется.
    * Проверяются зависимости, например, если модуль является частью
    * комплексного модуля или расширяет функции другого модуля, выполняется
    * проверка их наличия и целостности данных и тп.
    */
   public function preInit() {

   }

   /**
    * Настройка модуля с данной конфигурацией.
    */
   public function configure($config = NULL) {

   }

   /**
    * @return boolean Результат проверки окружения модуля, была ли выполнена
    * предварительная инициализация.
    */
   public function getIsInitialized() {
      return $this->_isInitialized = TRUE;
   }

   /**
    * @return boolean Подключен ли модуль в админке приложения.
    */
   public function getIsEnabled() {
      return $this->_isEnabled = TRUE;
   }

   /**
    * Возвращает дочерний модуль.
    * Модуль объявляется в {@link modules}. При первом вызове этого метода с данным ID
    * создается новый экземпляр.
    * @param string $id ID модуля (регистрозависимый)
    * @return object экземпляр модуля, null если недоступен или не существует.
    */
   public function getModule($id) {
      if (isset($this->_modules[$id]) || array_key_exists($id, $this->_modules))
         return $this->_modules[$id];
      return NULL;
   }

   /**
    * Возвращает родительский модуль.
    * @return object
    */
   public function getParentModule() {
      return;
   }

   public function getModel($id) {
      $classFile = $this->getModelPath() . DIRECTORY_SEPARATOR . $id . '.php';

      if (is_file($classFile)) {
         if (!class_exists($id, false)) {
            require $classFile;
         }
         return new $id;
      }

      return NULL;
   }

   public function getData() {
      return $this->_data;
   }

   public function setData($data) {
      $this->_data = $data;
   }

   /**
    * Инициализация.
    */
   public function init() {

   }

   /**
    * Запуск.
    */
   public function run($light = FALSE) {
      if ($light) {
         $this->setId('block');
         \Port::app()->runController('login/block');
      } else {
         $this->setId('form');
         \Port::app()->runController('Login');
      }
   }

}
