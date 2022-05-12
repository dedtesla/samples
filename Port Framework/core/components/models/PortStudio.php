<?php

namespace components\models;

use components\database;
use components\exception;
use helpers;

/**
 * Port
 *
 * @category   Port
 * @package    core
 * @author A.Shenderov (ashenderov@yandex.ru)
 * @copyright  (c) 2017 Simfosoft (http://www.simfosoft.ru)
 */

/**
 * PortStudio
 *
 * Модель сущности "Студия" - элемент административной системы.
 *
 * Практическое назначение:
 * 1. группировка наших проектов по определенному признаку для удобства навигации
 * и их просмотра/поиска в системе управления (например, автономные сайты на техподдержке,
 * проекты посадочных страниц, по клиентам и тп.),
 * 2. аренда клиентом системы для создания и поддержки сайтов собственных клиентов.
 *
 * @package core.components.models
 */
class PortStudio extends PortRecord {

   public $localeData = [];
   private $_attributes = [];
   public $_id;
   public $_castAssistant;

   /**
    * Конструктор
    *
    * @param int $id
    */
   public function __construct($id = NULL) {
      $this->_id = $id;
      $this->setIsNewRecord($this->_id === NULL);
      $this->_castAssistant = new \helpers\PortPropertyValue;
      $this->init();
   }

   public function tableName() {
      return 'studio';
   }

   /**
    * @throws PortDbException
    * @return PortDbConnection
    */
   public function getDbConnection() {
      self::$db = \Port::app()->getProjectsDb();
      if (self::$db instanceof database\PortDbConnection) {
         return self::$db;
      } else {
         throw new exception\PortDbException(\Port::t('port', 'PortStudio requires PortDbConnection.'));
      }
   }

   /**
    * Инициализирует модель.
    */
   public function init() {
      if ($this->_id) {
         $this->setAttributes($this->getDbConnection()->createCommand()
                         ->select('*')
                         ->from($this->tableName())
                         ->where(
                                 [
                                     "and",
                                     "id=" . $this->_id,
                                     "NOT locked",
                                 ]
                         )
                         ->queryRow());
      }
   }

}
