<?php

namespace components\models;

use components\database;
use components\exception;
use helpers;
use components\web\PortMailSender;

/**
 * Port
 *
 * @category   Port
 * @package    core
 * @author A.Shenderov (ashenderov@yandex.ru)
 * 
 */

/**
 * PortUserWorker модель, обслуживающая сущность "Пользователь системы администрирования проекта".
 *
 * @package core.components.models
 */
class PortUserWorker extends PortRecord {

   public static $db;
   public $localeData = [];
   private $_attributes = [];
   public $idm;
   public $state;
   public $id_group;
   public $_castAssistant;
   private $_dataOnly;

   /**
    * Статусы пользователя
    */
   const STATUS_NOT_CONFIRMED = 0;
   const STATUS_OK = 1;
   const STATUS_USER_EXISTS = 2;
   const STATUS_PASSWORD_CHANGED = 3;
   const STATUS_REGISTER_SENT = 4;
   const STATUS_NOT_FOUND = 10;
   const STATUS_EXISTS_EMAIL = 20;
   const STATUS_EXISTS_PHONE = 21;
   const STATUS_INVALID_INPUT = 30;
   const STATUS_INVALID_LOGIN = 31;
   const STATUS_INVALID_PASSWORD = 32;

   /**
    * Правила доступа пользователя к проектам
    */
   const ACL_RULE_NULL = '000000000000';
   const ACL_RULE_ROOT = '100000000000';
   const ACL_RULE_USER = '010000000000';
   const ACL_RULE_PROJECT_ADMIN = '001000000000';
   const ACL_RULE_PROJECT_EDITOR = '000100000000';

   /**
    * Правила доступа пользователя к группам
    */
   const ACL_GROUP_NULL = '0000000001';

   /**
    *  Глобальные группы
    *
    * @name ADMIN_GROUP_ROOT - группа суперпользователей, имеющая доступ ко всем студиям
    */
   const ADMIN_GROUP_ROOT = 1;

   /**
    * Конструктор
    *
    * @param int $id
    */
   public function __construct($id = NULL, $onlyData = FALSE) {
      $this->idm = $id;
      $this->getDbConnection();
      $this->setIsNewRecord($this->idm === NULL);
      $this->_dataOnly = $onlyData;
      $this->_castAssistant = new \helpers\PortPropertyValue;
      $this->init();
   }

   /**
    * @throws PortDbException
    * @return PortDbConnection
    */
   public function getDbConnection() {
      self::$db = \Port::getDbPortConnection();
      if (self::$db instanceof database\PortDbConnection) {
         self::$db->createCommand("SET NAMES 'UNICODE'")->execute();
         self::$db->createCommand("SET CLIENT_ENCODING TO 'UNICODE'")->execute();
         return self::$db;
      } else {
         throw new exception\PortDbException(\Port::t('port', 'PortRecord requires PortDbConnection.'));
      }
   }

   /**
    * @return string Таблица базы данных
    */
   public function tableName() {
      return 'managers';
   }

   /**
    * @param string $name
    * @return mixed
    * @see hasAttribute
    */
   public function getAttribute($name) {
      if (property_exists($this, $name)) {
         return $this->$name;
      } elseif (isset($this->_attributes[$name])) {
         return $this->_attributes[$name];
      }
   }

   /**
    * @param string $name
    * @param mixed $value
    * @return boolean
    * @see hasAttribute
    */
   public function setAttribute($name, $value) {
      if (property_exists($this, $name)) {
         $this->$name = $value;
      } elseif (isset($this->getMetaData($this->tableName())->columns[$name])) {
         $this->_attributes[$name] = $value;
      } else {
         return false;
      }
      return true;
   }

   /**
    * Присваивает значения аттрибутам в массовом порядке.
    * @param array $values пары имя=>значение
    */
   public function setAttributes($values = [], $safeOnly = FALSE) {
      if (empty($values))
         return;

      foreach ($values as $name => $value) {
         $this->_attributes[$name] = $value;
      }
   }

   /**
    * @param mixed $names
    * @return array
    */
   public function getAttributes($names = true) {
      $attributes = $this->_attributes;
      foreach ($this->getMetaData($this->tableName())->columns as $name => $column) {
         if (property_exists($this, $name)) {
            $attributes[$name] = $this->$name;
         } elseif ($names === true && !isset($attributes[$name])) {
            $attributes[$name] = null;
         }
      }

      if (is_array($names)) {
         $attrs = array();
         foreach ($names as $name) {
            if (property_exists($this, $name)) {
               $attrs[$name] = $this->$name;
            } else {
               $attrs[$name] = isset($attributes[$name]) ? $attributes[$name] : null;
            }
         }
         return $attrs;
      } else {
         return $attributes;
      }
   }

   public function saveData($attributes) {
      if (!$this->idm || empty($attributes))
         return;

      $attributesToSave = [
          'firstname' => urldecode($attributes['firstname']),
          'lastname' => !empty($attributes['lastname']) ? urldecode($attributes['lastname']) : NULL,
          'middlename' => !empty($attributes['middlename']) ? urldecode($attributes['middlename']) : NULL,
          'phone' => urldecode($attributes['phone']),
          'mail' => $attributes['email'],
          'lastlogon_ip' => \Port::app()->getRequest()->getUserHostAddress(),
          'lastlogon_ts' => 'now()',
      ];

      $this->updateByPk($this->idm, $attributesToSave);
      $this->init();
   }

//   public function save($attributes = []) {
//      if (!$this->idm || !$attributes)
//         return;
//
//      $this->updateByPk($this->idm, $attributes);
//      $this->init();
//   }

   public function create($attributes, $mailsend = FALSE) {
      if (empty($attributes) || empty($attributes['id_group']))
         return;

      $this->setIsNewRecord(TRUE);

      $newId = $this->save([
          'name' => $attributes['email'],
          'passwc' => md5($attributes['password']),
          'firstname' => urldecode($attributes['firstname']),
          'id_group' => $attributes['id_group'],
          'md_flag' => 0,
          'mail' => $attributes['email'],
          'phone' => $attributes['phone'],
          'acl_group' => (isset($attributes['acl_group']) ? $attributes['acl_group'] : self::ACL_GROUP_NULL),
          'reg_ip' => \Port::app()->getRequest()->getUserHostAddress(),
          'lastlogon_ip' => \Port::app()->getRequest()->getUserHostAddress(),
          'lastlogon_ts' => 'now()',
      ]);

      if ($newId) {
         $this->idm = $newId;
         $email = [$attributes['email']];
         $this->mailer($newId, $email, $attributes['target']);
         if ($mailsend === FALSE) {
            return self::STATUS_OK;
         } else {
            return self::STATUS_REGISTER_SENT;
         }
      }
      return self::STATUS_NOT_CONFIRMED;
   }

   public function addProjectConfirm($attributes, $mailsend = FALSE) {
      $result = $this->mailer($attributes['idm'], $attributes['email'], $attributes['target']);
      if ($mailsend === FALSE) {
         return self::STATUS_OK;
      } else {
         return self::STATUS_REGISTER_SENT;
      }
   }

   public function find($condition = '', $params = []) {
      if (empty($condition)) {
         return;
      }
      $where = NULL;
      if (is_string($condition)) {
         $where = ["and", $condition];
      } elseif (is_array($condition)) {
         $where = array_merge(["and"], $condition);
      }
      $ret = self::getDbConnection()->createCommand()
              ->select('*')
              ->from($this->tableName())
              ->where($where)
              ->queryRow();
      if ($ret) {
         $ret['userState'] = [
             'exists' => self::STATUS_USER_EXISTS,
             'confirmed' => ($ret['confirmed'] == TRUE ? self::STATUS_OK : self::STATUS_NOT_CONFIRMED),
         ];
      } else {
         $ret['userState'] = [
             'exists' => self::STATUS_NOT_FOUND,
             'confirmed' => self::STATUS_NOT_CONFIRMED,
         ];
      }
      return $ret;
   }

   public function sendMail($email, $target, $code, $message = '') {
      if ($email && $target && !empty($code['id'])) {
         if ($target === 'recoverPassword' && $code['code'] === self::STATUS_USER_EXISTS) {
            $this->mailer($code['id'], $email, $target);
         } elseif ($target === 'reConfirm' && $code['code'] === self::STATUS_REGISTER_SENT) {
            $this->mailer($code['id'], $email, $target);
         }
      } else {
         $this->mailer($code, $email, $target, $message);
      }
   }

   private function mailer($id, $email, $target = NULL, $message = '') {
      $user = new PortUserWorker($id, TRUE);
      $subject = '';

      if ($target === 'recoverPassword') {
         $subject = "Восстановление пароля";
         $_url = "http://" . $_SERVER['HTTP_HOST'] . "/password-recover?confirm=" . $id . "&token=" . md5($id);

         $_user = $user->getAttribute('firstname') . ($user->getAttribute('lastname') ? " " . $user->getAttribute('lastname') : "");
         if (!preg_match('//u', $_user)) {
            $_user = iconv("CP1251", "UTF-8", $_user);
         }
         $body = "Здравствуйте, " . $_user . "!<br><br>";
         $body .= "<p>Вы получили это письмо, потому что кто-то (возможно, Вы) запросил на сайте ";
         $body .= "<a href='http://" . $_SERVER['HTTP_HOST'] . "'>" . $_SERVER['HTTP_HOST'] . "</a> ";
         $body .= "восстановление пароля для пользователя, зарегистрированного с Вашим e-mail.</p>";
         $body .= "<p>Для завершения процедуры восстановления пароля перейдите по ";
         $body .= " <a href='" . $_url . "'>ссылке</a> и задайте новый пароль.</p>";
         $body .= "<hr><p>С уважением,<br>Служба поддержки <a href='http://" . $_SERVER['HTTP_HOST'] . "'>" . $_SERVER['HTTP_HOST'] . "</a></p>";
      } else if ($target === 'registerComplete') {
         $subject = "Ваш интернет-магазин успешно создан";
         $_user = $user->getAttribute('firstname') . ($user->getAttribute('lastname') ? " " . $user->getAttribute('lastname') : "");
         if (!preg_match('//u', $_user)) {
            $_user = iconv("CP1251", "UTF-8", $_user);
         }
         $body = $_user . "!<br><br>";
         if ($message) {
            $body .= $message;
         }
         $body .= "<hr><p>С уважением,<br>Администрация сайта <a href='http://" . $_SERVER['HTTP_HOST'] . "'>" . str_replace('www.', '', $_SERVER['HTTP_HOST']) . "</a></p>";
      } else if ($target === 'registerCompleteRoot') {
         $subject = "На сайте " . $_SERVER['HTTP_HOST'] . " создан интернет-магазин";
         $_user = $user->getAttribute('firstname') . ($user->getAttribute('lastname') ? " " . $user->getAttribute('lastname') : "");
         if (!preg_match('//u', $_user)) {
            $_user = iconv("CP1251", "UTF-8", $_user);
         }
         $body = "Пользователь " . $_user . "<br>";
         if ($message) {
            $body .= $message;
         }
         $body .= "<hr><p>С уважением,<br>Администрация сайта <a href='http://" . $_SERVER['HTTP_HOST'] . "'>" . str_replace('www.', '', $_SERVER['HTTP_HOST']) . "</a></p>";
      } else {
         $subject = "Интернет-магазин Simfoshop";
         $expired = date("Y-m-d H:i", strtotime("+48 hours"));
         $_url = "http://" . $_SERVER['HTTP_HOST'] . "/register-confirm?id=" . $id . "&exp=" . strtotime($expired) . "&token=" . md5($id) . '&target=' . $target;

         $_user = $user->getAttribute('firstname') . ($user->getAttribute('lastname') ? " " . $user->getAttribute('lastname') : "");
         if (!preg_match('//u', $_user)) {
            $_user = iconv("CP1251", "UTF-8", $_user);
         }
         $body = "Здравствуйте, " . $_user . "!<br><br>";
         $body .= "<p>Вы получили это письмо, потому что Ваш e-mail был указан при создании интернет-магазина Simfoshop.</p>";
         $body .= "<p>Для завершения процедуры создания интернет-магазина перейдите по ";
         $body .= " <a href='" . $_url . "'>ссылке</a>.</p>";
         $body .= "<hr><p>С уважением,<br>Администрация сайта " . str_replace('www.', '', $_SERVER['HTTP_HOST']) . "</a></p>";
      }

      $emailBody = <<<EMAILBODY
<html>
<body>$body
</body>
</html>
EMAILBODY;

      $mailer = new PortMailSender(['Body' => $emailBody, 'Subject' => $subject, 'FromName' => 'Интернет-магазин SimfoShop']);
      return $mailer->doSend($email);
   }

   /**
    * Авторизация
    */
   public function authorize($args) {
      if (!$args) {
         return;
      }
      if ($args['name'] && $args['passwc']) {
         $_user = self::getDbConnection()->createCommand()
                 ->select('*')
                 ->from($this->tableName())
                 ->where(
                         [
                             "and",
                             "lower(name)='" . strtolower($args['name']) . "'",
                             "passwc='" . $args['passwc'] . "'",
                         ]
                 )
                 ->queryRow();
         if (!$_user) {
            return ['exists' => self::STATUS_NOT_FOUND, 'confirmed' => self::STATUS_NOT_CONFIRMED];
         } else {
            return ['status' => TRUE, 'code' => self::STATUS_OK, 'idm' => $_user['idm']];
         }
      }

      return self::STATUS_INVALID_INPUT;
   }

   public function setPassword($password) {
      if ($this->idm && $password !== NULL) {
         if ($this->updateByPk($this->idm, ['passwc' => $password]) === 1) {
            return self::STATUS_PASSWORD_CHANGED;
         }
      }
      return;
   }

   public function getUserProjects($id = null) {
      if (!$this->idm && !$id) {
         return;
      }
      $id = !$id ? $this->idm : $id;
      return self::getDbConnection()->createCommand()
                      ->select('idproj')
                      ->from('mantoproj')
                      ->where(
                              [
                                  "and",
                                  "idm=" . $id,
                              ]
                      )
                      ->queryAll();
   }

   public function getAccountData($idm = null, $ida = null) {
      $data = self::getDbConnection()->createCommand()
              ->select('t1.*')
              ->from('portaccounts t1')
              ->join('portaccmanagers t2', 't1.id=t2.ida')
              ->where(
                      [
                          "and",
                          "t2.idm=" . $idm,
                      ]
              )
              ->queryRow();

      if ($data) {
         $data['ops'] = self::getDbConnection()->createCommand()
                 ->select('*')
                 ->from('portops')
                 ->where(
                         [
                             "and",
                             "ida=" . $data['id'],
                             "tilltime>now()",
                         ]
                 )
                 ->order('tilltime')
                 ->queryAll();
      }

      return $data;
   }

   public function getAccountProjects($ida) {
      if (!$ida) {
         return;
      }
      return self::getDbConnection()->createCommand()
                      ->select('t2.*')
                      ->from('portaccprojects t1')
                      ->join('projects t2', 't1.idp=t2.id')
                      ->where(
                              [
                                  "and",
                                  "t1.ida=" . $ida,
                              ]
                      )
                      ->queryAll();
   }

   public function getPaymentHistory($ida) {

   }

   /**
    * Инициализирует модель.
    */
   public function init($idm = null) {
      if ($this->idm) {
         $this->setAttributes(self::getDbConnection()->createCommand()
                         ->select('*')
                         ->from($this->tableName())
                         ->where(
                                 [
                                     "and",
                                     "idm=" . $this->idm,
                                 ]
                         )
                         ->queryRow());

         if (!$this->_dataOnly) {
            \Port::app()->setUser($this);
            $userToSession = $this->getAttributes();
            $userToSession['id'] = $this->idm;
            $userToSession['isRoot'] = $userToSession['id_group'] === 1;
            $userToSession['account'] = $this->getAccountData($this->idm);
            \Port::app()->getSession()->add('User', $userToSession);
         }
      }
   }

}
