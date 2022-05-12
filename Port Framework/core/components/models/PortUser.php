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
 * PortUser модель, обслуживающая сущность Пользователь приложения.
 *
 * @property array $localeData Локализованные данные
 * @property array $_attributes Стандартно поля записи таблицы БД (имя_атрибута => значение_атрибута)
 * @property int $_id Значение первичного ключа таблицы
 * @property array $address Список адресных данных, привязанных к пользователю
 * @property array $roles Роли, доступные пользователю
 * @property array $role Роли, доступные пользователю
 * @package core.components.models
 */
class PortUser extends PortRecord {

   public $localeData = [];
   private $_attributes = [];
   public $_id;
   public $address;
   public $subscription;
   public $legal;
   public $role = 10;
   public $state;
   public $login;
   public $password;
   public $_castAssistant;

   /**
    * Пользователи по ролям.
    * Роли могут комбинироваться.
    */

   const ROLE_USER_GUEST = 0;
   const ROLE_USER_SITE_USER = 10;
   const ROLE_USER_SITE_MANAGER = 20;
   const ROLE_USER_SITE_EDITOR = 21;
   const ROLE_USER_SITE_DESIGNER = 22;
   const ROLE_USER_SITE_OWNER = 30;
   const ROLE_USER_STUDIO_MANAGER = 40;
   const ROLE_USER_STUDIO_OWNER = 50;
   const ROLE_USER_ROOT = 100;

   /**
    * Тип покупателя
    * 0 - физическое лицо
    * 1 - юридическое лицо
    */
   const CUSTOMER_PERSON = 0;
   const CUSTOMER_LEGAL = 1;

   /**
    * Пользователь как участник сообщества
    */
   const MEMBER_SUBSCRIBER_ONLY = 1;
   const MEMBER_SUBSCRIBER = 2;

   /**
    * Статусы пользователя
    */
   const STATUS_NOT_CONFIRMED = 0;
   const STATUS_OK = 1;
   const STATUS_EMAIL_SENT = 2;
   const STATUS_PASSWORD_CHANGED = 3;
   const STATUS_REGISTER_SENT = 4;
   const STATUS_SUBSCRIBER_ONLY = 5;
   const STATUS_NOT_FOUND = 10;
   const STATUS_EXISTS_EMAIL = 20;
   const STATUS_EXISTS_PHONE = 21;
   const STATUS_INVALID_INPUT = 30;

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
    * @return string Таблица базы данных
    */
   public function tableName() {
      return 'news_subscribers';
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
      if (!$values)
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
            if ($user['firstname'] === 'fromsite' || $user['lastname'] === 'fromsite') {
               return ['id' => $user['id'], 'code' => self::STATUS_SUBSCRIBER_ONLY];
            } else {
               return ['id' => $user['id'], 'code' => self::STATUS_EMAIL_SENT];
            }
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
   public function auth() {

      if ($this->getAttribute('login') && $this->getAttribute('password')) {
         if (!strpos($this->getAttribute('login'), "@")) {
            $_user = \Port::getDbPortConnection()->createCommand()
                    ->select('*')
                    ->from('managers')
                    ->where(
                            [
                                "and",
                                "lower(name)='" . strtolower($this->login) . "'",
                                "passwc='" . md5($this->password) . "'"
                            ]
                    )
                    ->queryRow();

            if (!$_user) {
               return self::STATUS_NOT_FOUND;
            } else {
               $this->_id = $_user['idm'];
               $this->role = self::ROLE_USER_ROOT;
               $this->init();
               return ['status' => TRUE, 'code' => self::STATUS_OK];
            }
         } else {
            $_user = self::getDbConnection()->createCommand()
                    ->select('*')
                    ->from($this->tableName())
                    ->where(
                            [
                                "and",
                                "lower(login)='" . strtolower($this->login) . "'",
                                "passwd='" . md5($this->password) . "'",
                                "confirm"
                            ]
                    )
                    ->queryRow();

            if (!$_user) {
               $_user = self::getDbConnection()->createCommand()
                       ->select('*')
                       ->from($this->tableName())
                       ->where(
                               [
                                   "and",
                                   "lower(login)='" . strtolower($this->login) . "'",
                                   "passwd='" . md5($this->password) . "'",
                                   "NOT confirm"
                               ]
                       )
                       ->queryRow();

               if ($_user) {
                  return self::STATUS_NOT_CONFIRMED;
               } else {
                  return self::STATUS_NOT_FOUND;
               }
            } else {
               $this->_id = $_user['id'];
               $this->role = self::ROLE_USER_SITE_USER;
               $this->init();
               return ['status' => TRUE, 'code' => self::STATUS_OK];
            }
         }
      }
      return self::STATUS_INVALID_INPUT;
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
      if (empty($condition))
         return;

      return self::getDbConnection()->createCommand()
                      ->select('*')
                      ->from($this->tableName())
                      ->where($condition)
                      ->queryRow();
   }

   /**
    * Инициализирует модель.
    */
   public function init() {

      if ($this->_id) {
//         if (!\Port::app()->getSession()->contains('User')) {
         if ($this->role === self::ROLE_USER_SITE_USER || !$this->role) {
            $this->setAttributes(self::getDbConnection()->createCommand()
                            ->select('*')
                            ->from($this->tableName())
                            ->where(
                                    [
                                        "and",
                                        "id=" . $this->_id,
                                    ]
                            )
                            ->queryRow());

            $this->setAttribute('address', new UserAddress($this->_id));

            $subscription = new UserSubscription();
            $this->setAttribute('subscription', $subscription->getSubscriptions($this->_id));

            if ($this->getAttribute('customer_type') === 1) {
               $this->setAttribute('legal', new CustomerLegal($this->_id));
            }
         } elseif ($this->role === self::ROLE_USER_ROOT) {
            $this->setAttributes(\Port::getDbPortConnection()->createCommand()
                            ->select('*')
                            ->from('managers')
                            ->where(
                                    [
                                        "and",
                                        "lower(name)='" . strtolower($this->login) . "'",
                                        "passwc='" . md5($this->password) . "'"
                                    ]
                            )
                            ->queryRow());
         }

         \Port::app()->setUser($this);
         $userToSession = $this->getAttributes();
         $userToSession['role'] = $this->role ? $this->role : self::ROLE_USER_SITE_USER;
         $userToSession['id'] = $this->_id;

         if (isset($this->getAttribute('address')->data)) {
            $userToSession = array_merge($this->getAttributes(), ['address' => $this->getAttribute('address')->data]);
         }

         if ($this->getAttribute('subscription')) {
            $userToSession = array_merge($userToSession, ['subscription' => $this->getAttribute('subscription')]);
         }

         if (isset($this->getAttribute('legal')->data)) {
            $userToSession = array_merge($userToSession, ['legal' => $this->getAttribute('legal')->data]);
         }

         \Port::app()->getSession()->add('User', $userToSession);
//         }
      }
   }

}

/**
 * UserAddress
 *
 * @package core.components.models
 */
class UserAddress extends PortRecord {

   public $localeData = [];
   private $_attributes = []; // имя_атрибута => значение_атрибута
   public $_id;
   public $data;

   const POSTAL_ADDRESS = TRUE;
   const LEGAL_ADDRESS = FALSE;

   /**
    * Конструктор
    *
    * @param int $id
    */
   public function __construct($id = NULL) {
      $this->_id = $id;
      $this->_attributes = $this->getMetaData($this->tableName())->attributeDefaults;
      $this->init();
      $this->setIsNewRecord($this->_id === NULL);
   }

   public function tableName() {
      return 'order_clients_address';
   }

   /**
    * @param string $name
    * @return mixed
    * @see hasAttribute
    */
   public function getAttribute($name) {
      if (property_exists($this, $name))
         return $this->$name;
      elseif (isset($this->_attributes[$name]))
         return $this->_attributes[$name];
   }

   /**
    * @param mixed $names
    * @return array
    */
   public function getAttributes($names = true) {
      $attributes = $this->_attributes;
      foreach ($this->getMetaData($this->tableName())->columns as $name => $column) {
         if (property_exists($this, $name))
            $attributes[$name] = $this->$name;
         elseif ($names === true && !isset($attributes[$name]))
            $attributes[$name] = null;
      }

      if (is_array($names)) {
         $attrs = array();
         foreach ($names as $name) {
            if (property_exists($this, $name))
               $attrs[$name] = $this->$name;
            else
               $attrs[$name] = isset($attributes[$name]) ? $attributes[$name] : null;
         }
         return $attrs;
      }
      else
         return $attributes;
   }

   /**
    * Присваивает значения аттрибутам в массовом порядке.
    * @param array $values пары имя=>значение
    */
   public function setAttributes($values = [], $safeOnly = FALSE) {
      foreach ($values as $name => $value) {
         $this->_attributes[$name] = $value;
      }
   }

   public function current() {
      return (!empty($this->data[0]) ? $this->data[0] : NULL);
   }

   public function contains($args, $postal = self::POSTAL_ADDRESS) {
      if (!$args)
         return;

      if ($this->data) {

         $_di = new \components\collections\PortListIterator($this->data);
         do {
            $item = $_di->current();
            $_di->next();

            $_diff = array_diff($args, $item);
            if (array_key_exists('crttime', $_diff) && count($_diff) === 1)
               return $item['id'];
         } while ($_di->valid());

//         return self::getDbConnection()->createCommand()
//                         ->select('id')
//                         ->from($this->tableName())
//                         ->where(
//                                 [
//                                     "and",
//                                     "id_client=" . $this->_id,
//                                     "zip='" . $args['zip'] . "'",
//                                     "region='" . $args['region'] . "'",
//                                     "city='" . $args['city'] . "'",
//                                     "street='" . $args['street'] . "'",
//                                     "bldng='" . $args['bldng'] . "'",
//                                     "apartment='" . $args['apartment'] . "'",
//                                     "post_address=" . \Port::app()->castHelper->castToBoolean($postal)
//                                 ]
//                         )
//                         ->queryScalar();
      }

      return FALSE;
   }

   public function getByAttributes($args) {
      if (!$args)
         return [];

      return self::getDbConnection()->createCommand()
                      ->select("id address_id, *")
                      ->from($this->tableName())
                      ->where(
                              $args
                      )
                      ->order('crttime DESC')
                      ->queryRow();
   }

   public function refresh() {
      $this->data = self::getDbConnection()->createCommand()
              ->select("id address_id, *")
              ->from($this->tableName())
              ->where(
                      [
                          "and",
                          "id_client=" . $this->_id,
                          "post_address=true"
                      ]
              )
              ->order('crttime DESC')
              ->queryAll();
   }

   public function deleteRow($id) {
      if (!$id)
         return;

      self::getDbConnection()->createCommand("DELETE FROM " . $this->tableName() . " WHERE id=:id")->execute(["id" => $id]);
   }

   public function init() {
      if (!$this->_id)
         return;

      $this->refresh();
   }

}

/**
 * CustomerLegal
 *
 * @package core.components.models
 */
class CustomerLegal extends PortRecord {

   public $localeData = [];
   private $_attributes = [];
   public $_id;
   public $data;

   /**
    * Конструктор
    *
    * @param int $id
    */
   public function __construct($id = NULL) {
      $this->_id = $id;
      $this->_attributes = $this->getMetaData($this->tableName())->attributeDefaults;
      $this->init();
      $this->setIsNewRecord($this->_id === NULL);
   }

   public function tableName() {
      return 'order_clients_juric';
   }

   /**
    * @param string $name
    * @return mixed
    * @see hasAttribute
    */
   public function getAttribute($name) {
      if (property_exists($this, $name))
         return $this->$name;
      elseif (isset($this->_attributes[$name]))
         return $this->_attributes[$name];
   }

   /**
    * @param mixed $names
    * @return array
    */
   public function getAttributes($names = true) {
      $attributes = $this->_attributes;
      foreach ($this->getMetaData($this->tableName())->columns as $name => $column) {
         if (property_exists($this, $name))
            $attributes[$name] = $this->$name;
         elseif ($names === true && !isset($attributes[$name]))
            $attributes[$name] = null;
      }

      if (is_array($names)) {
         $attrs = array();
         foreach ($names as $name) {
            if (property_exists($this, $name))
               $attrs[$name] = $this->$name;
            else
               $attrs[$name] = isset($attributes[$name]) ? $attributes[$name] : null;
         }
         return $attrs;
      }
      else
         return $attributes;
   }

   /**
    * Присваивает значения аттрибутам в массовом порядке.
    * @param array $values пары имя=>значение
    */
   public function setAttributes($values = [], $safeOnly = FALSE) {
      foreach ($values as $name => $value) {
         $this->_attributes[$name] = $value;
      }
   }

   public function getCustomerLegal($id) {
      if (!$id)
         return;

      return self::getDbConnection()->createCommand()
                      ->select("id legal_id, *")
                      ->from($this->tableName())
                      ->where([
                          "and",
                          "uid=" . $id,
                      ])
                      ->queryRow();
   }

   public function refresh() {
      $this->data = self::getDbConnection()->createCommand()
              ->select("id legal_id, *")
              ->from($this->tableName())
              ->where([
                  "and",
                  "uid=" . $this->_id,
              ])
              ->queryRow();
   }

   public function deleteRow($id) {
      if (!$id)
         return;

      self::getDbConnection()->createCommand("DELETE FROM " . $this->tableName() . " WHERE id=:id")->execute(["id" => $id]);
   }

   public function init() {
      if (!$this->_id)
         return;

      $this->refresh();
      $address = new UserAddress($this->_id);
      $legalAddress = $address->getByAttributes(["and", "id_client=" . $this->_id, "post_address=false"]);
      if (is_array($legalAddress))
         $this->data = array_merge($this->data, $legalAddress);
   }

}

/**
 * UserSubscription
 *
 * @package core.components.models
 */
class UserSubscription extends PortRecord {

   public function tableName() {
      return 'news_subscriber_theme';
   }

   public function getSubscriptions($id) {
      if ($id === NULL)
         return;

      return self::getDbConnection()->createCommand()
                      ->select("t1.idt, t2.name")
                      ->from($this->tableName() . " t1")
                      ->join("news_theme t2", "t1.idt=t2.id")
                      ->where(
                              [
                                  "and",
                                  "t1.ids=" . $id,
                                  "t2.show_theme"
                              ]
                      )
                      ->order("t1.idt")
                      ->queryAll();
   }

   public function addSubscriber($id, $force = FALSE) {
      if ($id === NULL)
         return;

      if ($force == TRUE) {
         self::getDbConnection()->createCommand("DELETE FROM " . $this->tableName() . " WHERE ids=" . $id);
      }

      $themes = $this->getThemes();
      if ($themes) {
         $_thi = new \components\collections\PortListIterator($themes);
         do {
            $theme = $_thi->current();
            $_thi->next();
            $this->save([
                'ids' => $id,
                'idt' => $theme['id']
            ]);
         } while ($_thi->valid());
      }
   }

   public function removeSubscriber($id) {
      if (!$id) {
         return;
      }
      self::getDbConnection()->createCommand("DELETE FROM " . $this->tableName() . " WHERE ids=" . $id);
   }

   private function _checkUserSubscribeToTheme($themeId, $userId) {
      if (!$themeId || !$userId) {
         return 0;
      }
      return self::getDbConnection()->createCommand()
                      ->select("COUNT(*)")
                      ->from($this->tableName() . " t1")
                      ->join("news_theme t2", "t1.idt=t2.id")
                      ->where(
                              [
                                  "and",
                                  "t1.idt=" . $themeId,
                                  "t1.ids=" . $userId,
                                  "t2.show_theme"
                              ]
                      )
                      ->queryScalar();
   }

   public function getThemes($withUserId = NULL) {
      if ($withUserId === NULL) {
         return self::getDbConnection()->createCommand()
                         ->select('*')
                         ->from("news_theme")
                         ->where(
                                 [
                                     "and",
                                     "show_theme",
                                 ]
                         )
                         ->queryAll();
      } else {
         $_themes = self::getDbConnection()->createCommand()
                 ->select('*')
                 ->from("news_theme")
                 ->where(
                         [
                             "and",
                             "show_theme",
                         ]
                 )
                 ->queryAll();
         if ($_themes) {
            for ($i = 0; $i < count($_themes); $i++) {
               if ($this->_checkUserSubscribeToTheme($_themes[$i]['id'], $withUserId) > 0) {
                  $_themes[$i]['subscriber'] = TRUE;
               }
            }
         }
         return $_themes;
      }
   }

}
