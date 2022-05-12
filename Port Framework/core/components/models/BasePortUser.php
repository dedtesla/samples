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
 * @version 2.0.0
 * @package    core
 * @author A.Shenderov (ashenderov@yandex.ru)
 * @copyright  (c) 2017 Simfosoft (http://www.simfosoft.ru)
 */

/**
 * BasePortUser - модель Пользователь.
 * Базовая модель для всех сущностей типа "пользователь системы", "посетитель сайта".
 *
 * @property int $_id Значение первичного ключа пользователя в базе данных.
 * @property array $_attributes Стандартно поля записи таблиц БД (имя_атрибута => значение_атрибута).
 * @property object $_castAssistant Класс, обслуживающий кастинг значений.
 * @property string $_dbTable Название основной таблицы БД с данными пользователей.
 *
 * @version 1.0.0
 * @package core.components.models
 */
class BasePortUser extends PortRecord {

   public $id;
   private $_attributes = [];
   public $_castAssistant;
   private $_dbTable = 'users';
   private $_hashAlgorithm = 'sha512';
   private $_saltAdd = 'kysh312';
   private $_saltAddOrdinary = 'Sm456elt';

   /*
    * Статусы пользователя.
    */

   const STATUS_NOT_FOUND = "0000000000"; // 0
   const STATUS_NOT_CONFIRMED = "0000000001"; // 1
   const STATUS_PASSWORD_SENT = "0000000010"; // 2
   const STATUS_PASSWORD_CHANGED = "0000000011"; // 3
   const STATUS_OK = "0000001010"; // 10
   const STATUS_EXISTS_EMAIL = "0000010100"; // 20
   const STATUS_EXISTS_PHONE = "0000010101"; // 21
   const STATUS_INVALID_INPUT = "0001100100"; // 100

   /*
    * Роли
    */
   const ROLE_USER_GUEST = "0000000001"; // 1
   const ROLE_USER_SITE_USER = "0000000010"; // 2
   const ROLE_USER_SITE_DESIGNER = "0000010101"; // 21
   const ROLE_USER_SITE_EDITOR = "0000010110"; // 22
   const ROLE_USER_SITE_MANAGER = "0000011101"; // 29
   const ROLE_USER_SITE_OWNER = "0000011110"; // 30
   const ROLE_USER_STUDIO_DESIGNER = "0000011111"; // 31
   const ROLE_USER_STUDIO_EDITOR = "0000100000"; // 32
   const ROLE_USER_STUDIO_MANAGER = "0000100111"; // 39
   const ROLE_USER_STUDIO_OWNER = "0000101000"; // 40
   const ROLE_USER_ROOT = "1111101000"; // 1000

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

   /**
    * Получение свойства таблица базы данных.
    * @return string Таблица базы данных
    */
   public function tableName() {
      return $this->_dbTable;
   }

   /**
    * Назначение свойства таблица базы данных.
    */
   public function setTableName($value = NULL) {
      if (!$value)
         return;
      $this->_dbTable = $value;
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
      if (!$name) {
         return;
      }
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
      if (!$values) {
         return;
      }
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
         $attrs = [];
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

   /**
    * @throws PortDbException
    * @return PortDbConnection
    */
   public function getDbConnection() {
      self::$db = \Port::app()->getSecureDb();
      if (self::$db instanceof database\PortDbConnection) {
         return self::$db;
      } else {
         throw new exception\PortDbException(\Port::t('port', 'BasePortUser requires PortDbConnection.'));
      }
   }

   /**
    * Проверка наличия пользователя в базе данных.
    *
    * @param type $condition
    * @param type $params
    * @return type
    */
   public function exists($condition = '', $params = []) {
      if (!empty($condition)) {
         if ($user = self::getDbConnection()->createCommand()
                 ->select("id, firstname, lastname")
                 ->from($this->tableName())
                 ->where(
                         [
                             "and",
                             $condition
                         ]
                 )
                 ->queryRow()) {

         } else {
            return ['id' => NULL, 'code' => self::STATUS_NOT_FOUND];
         }
      }
   }

   public function sendMail($email, $target, $code) {
      if ($email && $target && $code['id'] !== NULL) {
         if ($target === 'recoverPassword' && $code['code'] === self::STATUS_EMAIL_SENT) {
            $this->mailer($code['id'], $email, $target);
         } elseif ($target === 'reConfirm' && $code['code'] === self::STATUS_REGISTER_SENT) {
            $this->mailer($code['id'], $email, $target);
         }
      }
   }

   private function mailer($uid, $email, $target) {
      $user = new PortUser($uid);
      $user->init();

      $subject = '';

      if ($target === 'recoverPassword') {
         $subject = "Восстановление пароля в интернет-магазине «" . \Port::app()->name . "»";
         $_url = "http://" . $_SERVER['HTTP_HOST'] . "/password-recover?confirm=" . $uid . "&token=" . md5($uid);

         $body = "Здравствуйте, " . $user->getAttribute('firstname') . " " . $user->getAttribute('lastname') . "!<br><br>";
         $body .= "<p>Вы получили это письмо, потому что кто-то (возможно, Вы) запросил на сайте ";
         $body .= "<a href='http://" . $_SERVER['HTTP_HOST'] . "'>" . $_SERVER['HTTP_HOST'] . "</a> ";
         $body .= "восстановление пароля для пользователя, зарегистрированного с Вашим e-mail.</p>";
         $body .= "<p>Для завершения процедуры восстановления пароля перейдите по ";
         $body .= " <a href='" . $_url . "'>ссылке</a> и задайте новый пароль.</p>";
         $body .= "<hr><p>С уважением,<br>Служба поддержки <a href='http://" . $_SERVER['HTTP_HOST'] . "'>" . $_SERVER['HTTP_HOST'] . "</a></p>";
      } elseif ($target === 'confirm' || $target === 'reConfirm') {
         $subject = "Регистрация в интернет-магазине «" . \Port::app()->name . "»";
         $_url = "http://" . $_SERVER['HTTP_HOST'] . "?confirm=" . $uid . "&token=" . md5($uid);

         $body = "Здравствуйте, " . $user->getAttribute('firstname') . " " . $user->getAttribute('lastname') . "!<br><br>";
         $body .= "<p>Ваш e-mail " . $email . " был указан при регистрации в интернет-магазине " . \Port::app()->name . " <a href='http://" . $_SERVER['HTTP_HOST'] . "'>" . $_SERVER['HTTP_HOST'] . "</a>.</p>";
         $body .= "<p>Для подтверждения регистрации, пожалуйста, перейдите по ссылке <a href='" . $_url . "'>" . $_url . "</a>.</p>";
         $body .= "<p>Если не Вы указали e-mail " . $email . " при регистрации, проигнорируйте это письмо.</p>";
         $body .= "<hr><p>С уважением,<br>администрация интернет-магазина «" . \Port::app()->name . "»<br>";
         $body .= "<p><a href='http://" . $_SERVER['HTTP_HOST'] . "'>" . $_SERVER['HTTP_HOST'] . "</a></p>";
      }

      $emailBody = <<<EMAILBODY
<html>
<body>$body
</body>
</html>
EMAILBODY;

      \Port::app()->getSession()->remove('User');
      \Port::app()->setUser();

      $mailer = new PortMailSender(['Body' => $emailBody, 'Subject' => $subject]);
      return $mailer->doSend($email);
   }

   /**
    * Авторизация
    */
   public function auth($attributes = []) {
      if (!$attributes)
         return;

      if ($attributes['login'] && $attributes['password']) {
         $algo = isset(\Port::app()->_componentConfig['securePolicy']['hashAlgorithm']) ? \Port::app()->_componentConfig['securePolicy']['hashAlgorithm'] : $this->_hashAlgorithm;
         $_user = \Port::getDbPortNextConnection()->createCommand()
                 ->select('*')
                 ->from($this->tableName())
                 ->where(
                         [
                             "and",
                             "login='" . strtolower($attributes['login']) . "'",
                             "password='" . hash($algo, $attributes['password'] . $this->_saltAdd) . "'"
                         ]
                 )
                 ->queryRow();

         if (!$_user) {
            \Port::app()->setUser();
            $msg = isset(\Port::app()->params['modules']['login']['states'][bindec(self::STATUS_NOT_FOUND)]) ? \Port::app()->params['modules']['login']['states'][bindec(self::STATUS_NOT_FOUND)]['msg'] : 'Пользователь с такими данными не существует';
            return ['code' => bindec(self::STATUS_NOT_FOUND), 'msg' => $msg];
         } else {
            $this->init($_user);
            return ['code' => bindec(self::STATUS_OK), 'url' => 'https://newport.mc2.ru'];
         }
      } else {
         return ['code' => self::STATUS_INVALID_INPUT];
      }
   }

   public function confirm() {
      if ($this->_id) {
         return $this->updateByPk($this->_id, ['confirm' => TRUE]);
      }
      return;
   }

   public function subscribe($id, $force = TRUE) {
      $subscriber = new UserSubscription;
      $subscriber->setIsNewRecord(TRUE);
      $subscriber->addSubscriber($id, $force);
      return self::STATUS_OK;
   }

   public function unsubscribe($id) {
      $subscriber = new UserSubscription;
      $subscriber->removeSubscriber($id);
   }

   public function setPassword($password) {
      if ($this->_id && $password !== NULL) {
         if ($this->updateByPk($this->_id, ['passwd' => $password]) === 1) {
            return self::STATUS_PASSWORD_CHANGED;
         }
      }
      return;
   }

   public function create($attributes, $mailsend = TRUE, $forceId = NULL) {
      if (empty($attributes)) {
         return;
      }

      $dataToSave = [
          'login' => $attributes['email'],
          'email' => $attributes['email'],
          'passwd' => md5($attributes['password']),
          'firstname' => urldecode($attributes['firstname']),
          'lastname' => urldecode($attributes['lastname']),
          'middlename' => !empty($attributes['middlename']) ? urldecode($attributes['middlename']) : NULL,
          'confirm' => $mailsend === TRUE ? 'false' : 'true',
          'reg_ip' => \Port::app()->getRequest()->getUserHostAddress(),
          'lastlogon_ip' => \Port::app()->getRequest()->getUserHostAddress(),
          'lastlogon_ts' => 'now()',
          'id_group' => 1,
          'phone1' => urldecode($attributes['phone']),
          'customer_type' => $attributes['customer_type'],
      ];

      if ($forceId !== NULL) {
         $this->setIsNewRecord(FALSE);
         $this->updateByPk($forceId, $dataToSave);
         $newId = $forceId;
      } else {
         $this->setIsNewRecord(TRUE);
         $newId = $this->save($dataToSave);
      }

      if ($newId) {
         if (isset($attributes['legalzip'])) {
            $address = new UserAddress;
            $address->setIsNewRecord(TRUE);

            $address->save([
                'id_client' => $newId,
                'zip' => $attributes['zip'],
                'region' => urldecode($attributes['region']),
                'city' => urldecode($attributes['city']),
                'street' => urldecode($attributes['street']),
                'bldng' => urldecode($attributes['bldng']),
                'apartment' => urldecode($attributes['apartment']),
                'post_address' => TRUE,
            ]);
         }

         if (!empty($attributes['customer_type']) && $attributes['customer_type'] == self::CUSTOMER_LEGAL) {
            $customer = new CustomerLegal;
            $customer->setIsNewRecord(TRUE);
            $customer->save([
                'uid' => $newId,
                'b_type' => urldecode($attributes['b_type']),
                'firm_name' => urldecode($attributes['firm_name']),
                'inn' => $attributes['inn'],
                'kpp' => $attributes['kpp'],
                'ogrn' => $attributes['ogrn'],
                'r_acc' => $attributes['racc'],
                'kr_acc' => $attributes['cacc'],
                'kr_acc' => $attributes['cacc'],
                'bank' => urldecode($attributes['bank']),
                'bik' => $attributes['bik'],
            ]);

            $address = new UserAddress;
            $address->setIsNewRecord(TRUE);

            if (isset($attributes['legalzip'])) {
               $address->save([
                   'id_client' => $newId,
                   'zip' => $attributes['legalzip'],
                   'region' => urldecode($attributes['legalzipregion']),
                   'city' => urldecode($attributes['legalzipcity']),
                   'street' => urldecode($attributes['legalzipstreet']),
                   'bldng' => urldecode($attributes['legalzipbldng']),
                   'apartment' => urldecode($attributes['office']),
                   'post_address' => FALSE,
               ]);
            } else {
               $address->save([
                   'id_client' => $newId,
                   'zip' => $attributes['zip'],
                   'region' => urldecode($attributes['region']),
                   'city' => urldecode($attributes['city']),
                   'street' => urldecode($attributes['street']),
                   'bldng' => urldecode($attributes['bldng']),
                   'apartment' => urldecode($attributes['apartment']),
                   'post_address' => (!empty($attributes['sameaspost']) && \Port::app()->castHelper->castToBoolean($attributes['sameaspost']) == TRUE) ? FALSE : TRUE,
               ]);
            }

            if (!empty($attributes['sameaspost']) && \Port::app()->castHelper->castToBoolean($attributes['sameaspost']) == TRUE) {
               $address->setIsNewRecord(TRUE);
               $address->save([
                   'id_client' => $newId,
                   'zip' => $attributes['zip'],
                   'region' => urldecode($attributes['region']),
                   'city' => urldecode($attributes['city']),
                   'street' => urldecode($attributes['street']),
                   'bldng' => urldecode($attributes['bldng']),
                   'apartment' => urldecode($attributes['apartment']),
                   'post_address' => TRUE
               ]);
            }
         }

         if (!empty($attributes['subscribe']) && \Port::app()->castHelper->castToBoolean($attributes['subscribe']) === TRUE) {
            $subsciber = new UserSubscription;
            $subsciber->setIsNewRecord(TRUE);
            $subsciber->addSubscriber($newId);
         }

         if ($mailsend == TRUE) {
            $this->updateByPk($newId, ['confirm' => FALSE]);
            $this->mailer($newId, $attributes['email'], 'confirm');
         } else {
            if (!isset($attributes['createOnly']) || $attributes['createOnly'] == FALSE) {
               $this->_id = $newId;
               $this->init();
            }
         }
         return self::STATUS_EMAIL_SENT;
      }
      return 0;
   }

   public function find($condition = '', $params = []) {
      if (empty($condition)) {
         return;
      }
      return self::getDbConnection()->createCommand()
                      ->select('*')
                      ->from($this->tableName())
                      ->where($condition)
                      ->queryRow();
   }

   public function displayName() {
      $string = [
          $this->getAttribute('firstname') ? $this->getAttribute('firstname') : '',
          $this->getAttribute('lastname') ? $this->getAttribute('lastname') : ''
      ];
      return implode(' ', $string);
   }

   /**
    * Инициализирует модель.
    */
   public function init($data = []) {
      if ($data && isset($data['id'])) {
         $this->_id = $data['id'];
         $this->setAttributes($data);
         \Port::app()->setUser($this);
         $data['DisplayName'] = $this->displayName();
//         $userToSession['role'] = $this->role ? $this->role : self::ROLE_USER_SITE_USER;
         \Port::app()->getSession()->add('User', $data);
      }
   }

}
