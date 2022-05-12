<?php

namespace components\models;

use components\database;
use components\exception;

/**
 * Port
 *
 * @category   Port
 * @package    core
 * @author A.Shenderov (ashenderov@yandex.ru)
 * 
 */

/**
 * UserManager модель, обслуживающая сущность Пользователь админ-системы.
 *
 * @package core.components.models
 */
class UserManager extends PortRecord {

   /**
    * Конструктор
    *
    * @param int $id
    */
   public function __construct($id = NULL) {
      parent::__construct($id);
   }

   /**
    * @return string Таблица базы данных
    */
   public function tableName() {
      return 'managers';
   }

   /**
    * Инициализирует модель.
    */
   public function init() {

   }

}
