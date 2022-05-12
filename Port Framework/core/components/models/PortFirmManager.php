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
 * PortFirmManager модель, обслуживающая сущность Менеджер компании.
 *
 * @property array $localeData Локализованные данные
 * @property array $_attributes Стандартно поля записи таблицы БД (имя_атрибута => значение_атрибута)
 * @property int $_id Значение первичного ключа таблицы
 * @package core.components.models
 */
class PortFirmManager extends PortRecord {

   public $localeData = [];
   private $_attributes = [];
   public $_id;
   public $state;
   public $_castAssistant;
   private $_dataOnly;

   /**
    * Статусы пользователя
    */
   /* const STATUS_NOT_CONFIRMED = 0;
     const STATUS_OK = 1;
     const STATUS_USER_EXISTS = 2;
     const STATUS_PASSWORD_CHANGED = 3;
     const STATUS_REGISTER_SENT = 4;
     const STATUS_NOT_FOUND = 10;
     const STATUS_EXISTS_EMAIL = 20;
     const STATUS_EXISTS_PHONE = 21;
     const STATUS_INVALID_INPUT = 30; */

   const STATUS_NOT_CONFIRMED = 31;
   const STATUS_OK = 32;
   const STATUS_USER_EXISTS = 33;
   const STATUS_PASSWORD_CHANGED = 34;
   const STATUS_REGISTER_SENT = 35;
   const STATUS_NOT_FOUND = 36;
   const STATUS_EXISTS_EMAIL = 37;
   const STATUS_EXISTS_PHONE = 38;
   const STATUS_INVALID_INPUT = 39;

   /**
    * Конструктор
    *
    * @param int $id
    */
   public function __construct($id = NULL, $onlyData = FALSE) {
      $this->_id = $id;
      $this->setIsNewRecord($this->_id === NULL);
      $this->_dataOnly = $onlyData;
      $this->_castAssistant = new \helpers\PortPropertyValue;
      $this->init();
   }

   /**
    * @return string Таблица базы данных
    */
   public function tableName() {
      return 'firms_managers';
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
         if ($id = self::getDbConnection()->createCommand()
                 ->select("id")
                 ->from($this->tableName())
                 ->where(
                         [
                             "and",
                             $condition
                         ]
                 )
                 ->queryScalar($params)) {
            return ['id' => $id, 'code' => self::STATUS_USER_EXISTS, 'status' => TRUE];
         } else {
            return ['id' => NULL, 'code' => self::STATUS_NOT_FOUND, 'status' => FALSE];
         }
      }
   }

   public function sendMail($email, $target, $code) {
      if ($email && $target && $code['id'] !== NULL) {
         if ($target === 'recoverPassword' && $code['code'] === self::STATUS_USER_EXISTS) {
            $this->mailer($code['id'], NULL, $email, $target);
         } elseif ($target === 'reConfirm' && $code['code'] === self::STATUS_REGISTER_SENT) {
            $this->mailer($code['id'], NULL, $email, $target);
         }
      }
   }

   private function mailer($uid, $fid, $email, $target = 'newfirm') {
      $user = new PortFirmManager($uid, TRUE);
      if ($fid) {
         $firm = new PortFirm($fid);
         $firm->init();
      }

      $subject = '';

      if ($target === 'recoverPassword') {
         if (in_array(\Port::app()->getId(), [1644])) {
            $subject = "恢复密码 «" . \Port::app()->name . "»";
            $_url = "http://" . $_SERVER['HTTP_HOST'] . "/password-recover?confirm=" . $uid . "&token=" . md5($uid);

            $body = "您好, " . $user->getAttribute('firstname') . " " . $user->getAttribute('lastname') . "!<br><br>";
            $body .= "<p>这封信，是为您在 ";
            $body .= "<a href='http://" . $_SERVER['HTTP_HOST'] . "'>" . $_SERVER['HTTP_HOST'] . "</a> ";
            $body .= "注册后，获取和恢复密码之用.</p>";
            $body .= "<p>如需获取密码，请先点击链接操作并输入您的新密码 <a href='" . $_url . "'>" . $_url . "</a>.</p>";
            $body .= "<hr><p>С уважением,<br>Служба поддержки <a href='http://" . $_SERVER['HTTP_HOST'] . "'>" . $_SERVER['HTTP_HOST'] . "</a></p>";
         } else {
            $subject = "Восстановление пароля на сайте «" . \Port::app()->name . "»";
            $_url = "http://" . $_SERVER['HTTP_HOST'] . "/password-recover?confirm=" . $uid . "&token=" . md5($uid);

            $body = "Здравствуйте, " . $user->getAttribute('firstname') . " " . $user->getAttribute('lastname') . "!<br><br>";
            $body .= "<p>Вы получили это письмо, потому что кто-то (возможно, Вы) запросил на сайте ";
            $body .= "<a href='http://" . $_SERVER['HTTP_HOST'] . "'>" . $_SERVER['HTTP_HOST'] . "</a> ";
            $body .= "восстановление пароля для пользователя, зарегистрированного с Вашим e-mail.</p>";
            $body .= "<p>Для завершения процедуры восстановления пароля перейдите по ";
            $body .= " <a href='" . $_url . "'>ссылке</a> и задайте новый пароль.</p>";
            $body .= "<hr><p>С уважением,<br>Служба поддержки <a href='http://" . $_SERVER['HTTP_HOST'] . "'>" . $_SERVER['HTTP_HOST'] . "</a></p>";
         }
      } else {
         $subject = "Регистрация компании на сайте «" . \Port::app()->name . "»";
         $body = "На сайте зарегистрирована новая компания " . $firm->getAttribute('firmname') . ".<br>";
         $body .= "<hr><p>С уважением,<br>администрация сайта «" . \Port::app()->name . "»<br>";
         $body .= "<p><a href='http://" . $_SERVER['HTTP_HOST'] . "'>" . $_SERVER['HTTP_HOST'] . "</a></p>";
      }

      $emailBody = <<<EMAILBODY
<html>
<body>$body
</body>
</html>
EMAILBODY;

      $mailer = new PortMailSender(['Body' => $emailBody, 'Subject' => $subject]);
      return $mailer->doSend($email);
   }

   /**
    * Авторизация
    */
   public function auth($args) {
      if (!$args)
         return;

      if ($args['login'] && $args['password']) {
         $_user = self::getDbConnection()->createCommand()
                 ->select('t1.*')
                 ->from($this->tableName() . ' t1')
                 ->join('firms_contacts t2', 't1.id=t2.mid')
                 ->join('firms t3', 't2.fid=t3.id')
                 ->where(
                         [
                             "and",
                             "lower(login)='" . strtolower($args['login']) . "'",
                             "password='" . md5($args['password']) . "'",
                         ]
                 )
                 ->queryRow();

         if (!$_user) {
            return self::STATUS_NOT_FOUND;
         } else {
            $this->_id = $_user['id'];
            $this->init();
            $firm = new PortFirm($this->getFirm());
            return ['status' => TRUE, 'code' => self::STATUS_OK];
         }
      }
      return self::STATUS_INVALID_INPUT;
   }

   public function setPassword($password) {
      if ($this->_id && $password !== NULL) {
         if ($this->updateByPk($this->_id, ['password' => $password]) === 1) {
            return self::STATUS_PASSWORD_CHANGED;
         }
      }
      return;
   }

   public function saveData($attributes) {
      if (!$this->_id || empty($attributes))
         return;

      $_ = urldecode($attributes['languages']);
      $languages = explode(';', $_);

      $attributesToSave = [
          'firstname' => urldecode($attributes['firstname']),
          'lastname' => urldecode($attributes['lastname']),
          'middlename' => !empty($attributes['middlename']) ? urldecode($attributes['middlename']) : NULL,
          'phone' => urldecode($attributes['phone']),
          'email' => $attributes['email'],
          'lastlogon_ip' => \Port::app()->getRequest()->getUserHostAddress(),
          'lastlogon_ts' => 'now()',
          'languages' => serialize($languages)
      ];

      $this->updateByPk($this->_id, $attributesToSave);
      $this->init();

      $firm = new PortFirm($this->getFirm());
      $firm->saveData($attributes);
   }

   public function create($attributes, $mailsend = FALSE) {
      if (empty($attributes))
         return;

      $this->setIsNewRecord(TRUE);
      $_ = urldecode($attributes['languages']);
      $languages = explode(';', $_);

      $newId = $this->save([
          'login' => $attributes['login'],
          'password' => md5($attributes['password']),
          'firstname' => urldecode($attributes['firstname']),
          'lastname' => urldecode($attributes['lastname']),
          'middlename' => !empty($attributes['middlename']) ? urldecode($attributes['middlename']) : NULL,
          'phone' => urldecode($attributes['phone']),
          'email' => $attributes['email'],
          'reg_ip' => \Port::app()->getRequest()->getUserHostAddress(),
          'lastlogon_ip' => \Port::app()->getRequest()->getUserHostAddress(),
          'lastlogon_ts' => 'now()',
          'languages' => serialize($languages),
      ]);

      if ($newId) {
         $this->_id = $newId;
         $this->init();

         if (isset($attributes['firmname'])) {
            $firm = new PortFirm;

            /* $checkFirm = $firm->exists([
              'firmname' => urldecode($attributes['firmname']),
              'firmdate' => urldecode($attributes['firmdate']),
              'email' => $attributes['firmemail'],
              'phone' => urldecode($attributes['firmphone']),
              'regid' => $attributes['regid'],
              'taxid' => $attributes['taxid']
              ]); */

//            if ($checkFirm['id'])
//               return $checkFirm['code'];
//            else {
            $newFirmId = $firm->create($attributes);
            if ($newFirmId) {
               $this->saveFirmsContacts([
                   'fid' => $newFirmId,
                   'mid' => $newId
               ]);

               if (isset(\Port::app()->params['options']['feedbackEmail'])) {
                  $catalog = new PortCatalog(\Port::app()->params['options']['feedbackEmail']['idc']);
                  $article = $catalog->getCatalogArticleByPriority($catalog->_id, \Port::app()->params['options']['feedbackEmail']['ids']);
                  if ($article) {
                     $email = [strip_tags($article['comment'])];
                     $this->mailer($newId, $newFirmId, $email);
                  }
               }
//               }
            }
         }

         return self::STATUS_OK;
      }
      return 0;
   }

   public function saveFirmsContacts($args) {
      if (empty($args))
         return;

      self::getDbConnection()->createCommand("INSERT INTO firms_contacts VALUES(" . $args['fid'] . "," . $args['mid'] . ")")->execute();
   }

   public function getFirm() {
      return self::getDbConnection()->createCommand()
                      ->select('fid')
                      ->from('firms_contacts')
                      ->where('mid=:id', ['id' => $this->_id])
                      ->queryScalar();
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

         if (!$this->_dataOnly) {
            \Port::app()->setUser($this);
            $userToSession = $this->getAttributes();
            $userToSession['id'] = $this->_id;
            \Port::app()->getSession()->add('User', $userToSession);
         }
      }
   }

}
