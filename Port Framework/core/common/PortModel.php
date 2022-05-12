<?php

namespace common;

use components\collections;
use components\validator;
use components\loggers;
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
 * PortModel базовый класс объектов, работающих с данными.
 *
 * @property PortList $validatorList Все виды валидаторов, заявленные для модели.
 * @property array $validators Валидаторы, применимые к текущему сценарию.
 * @property array $errors Ошибки для всех атрибутов или атрибута или пустой массив.
 * @property array $attributes Пары имя=>значение атрибутов.
 * @property array $safeAttributeNames Безопасные имена атрибутов.
 * @property PortMapIterator $iterator Итератор перебора элементов в списке.
 *
 * @package core.common
 */
abstract class PortModel extends PortClass implements \IteratorAggregate, \ArrayAccess {

   private $_errors = array();
   private $_validators;

   /**
    * Возвращает список имен атрибутов модели.
    * @return array
    */
   abstract public function attributeNames();

   /**
    * Возвращает правила валидации атрибутов.
    *
    * @return array
    */
   public function rules() {
      return array();
   }

   /**
    * Возвращает ярлыки атрибутов.
    * Главным образом, для сообщений об ошибках валидации.
    *
    * По умолчанию ярлык атрибута генерируется с помощью {@link generateAttributeLabel}.
    * Данный метод служит для более точного определения ярлыков атрибутов.
    *
    * Класс-потомок для использования родительских атрибутов может выполнить слияние
    * со своими (array_merge()).
    *
    * @return array ярлыки атрибутов (имя=>ярлык)
    * @see generateAttributeLabel
    */
   public function attributeLabels() {
      return array();
   }

   /**
    * Выполняет валидацию.
    *
    * Исполняет правила валидации как объявлено в {@link rules}.
    * Будут выполнены правила, применимые только к текущему сценарию.
    * Ошибки в процессе валидации определяются с помощью {@link getErrors}.
    *
    * @param array $attributes список атрибутов для валидации, по умолчанию null,
    * что означает, что любой атрибут из списка применимых к случаю правил должен
    * быть проверен. Если параметр представлен как список атрибутов, то в проверке
    * будут участвовать только атрибуты из списка.
    * @param boolean $clearErrors вызывать ли {@link clearErrors} перед проверкой
    * @return boolean
    */
   public function validate($attributes = null, $clearErrors = true) {
      if ($clearErrors)
         $this->clearErrors();


      foreach ($this->getValidators() as $validator) {
         $validator->validate($this, $attributes);
      }
      return !$this->hasErrors();
   }

   /**
    * Возвращает все валидаторы, объявленные в модели.
    * Этот метод отличается от {@link getValidators} тем, что крайний
    * возвращает только валидаторы, применимые к текущему сценарию.
    * Также, поскольку этот метод возвращает объект {@link PortList}, возможно
    * манипулировать им, добавляя или удаляя валидаторы.
    * Пример:
    * <code>$model->validatorList->add($newValidator)</code>.
    * Изменения в {@link PortList} будут запомнены и отразятся
    * при следующем вызове {@link getValidators}.
    *
    * @return PortList
    */
   public function getValidatorList() {
      if ($this->_validators === null)
         $this->_validators = $this->createValidators();

      return $this->_validators;
   }

   /**
    * Возвращает валидаторы, применимые к текущему сценарию.
    * @param string $attribute имя атрибута для которого будут возвращены валидаторы,
    * если null, будут возвращены валидаторы для всех атрибутов модели.
    * @return array
    */
   public function getValidators($attribute = null) {
      if ($this->_validators === null)
         $this->_validators = $this->createValidators();

      $validators = array();

      foreach ($this->_validators as $validator) {
         if ($attribute === null || in_array($attribute, $validator->attributes, true))
            $validators[] = $validator;
      }

      return $validators;
   }

   /**
    * Создает объекты валидаторов на основании спецификации в правилах {@link rules}.
    * Используется при внутренних вызовах, в основном.
    *
    * @throws PortException если правило валидации некорректно или повреждено
    * @return PortList валидаторы, сформированные на основании правил {@link rules()}.
    */
   public function createValidators() {
      $validators = new collections\PortList;
      foreach ($this->rules() as $rule) {
         if (isset($rule[0], $rule[1]))
            $validators->add(validator\PortValidator::createValidator($rule[1], $this, $rule[0], array_slice($rule, 2)));
         else
            throw new exception\PortException(\Port::t('port', '{class} has an invalid validation rule. The rule must specify attributes to be validated and the validator name.', array('{class}' => get_class($this))));
      }

      return $validators;
   }

   /**
    * Возвращает признак того, что атрибут обязателен.
    * Определяется проверкой, связан ли в текущем сценарии атрибут
    * с {@link PortRequiredValidator}.
    *
    * @param string $attribute имя атрибута
    * @return boolean
    */
   public function isAttributeRequired($attribute) {
      foreach ($this->getValidators($attribute) as $validator) {
         if ($validator instanceof validator\PortRequiredValidator)
            return true;
      }

      return false;
   }

   /**
    * Возвращает признак, безопасен ли атрибут для масштабных присвоений.
    * @param string $attribute имя атрибута
    * @return boolean
    */
   public function isAttributeSafe($attribute) {
      $attributes = $this->getSafeAttributeNames();
      return in_array($attribute, $attributes);
   }

   /**
    * Возвращает текстовый ярлык для указанного атрибута.
    *
    * @param string $attribute имя атрибута
    * @return string ярлык атрибута
    * @see generateAttributeLabel
    * @see attributeLabels
    */
   public function getAttributeLabel($attribute) {
      $labels = $this->attributeLabels();
      if (isset($labels[$attribute]))
         return $labels[$attribute];
      else
         return $this->generateAttributeLabel($attribute);
   }

   /**
    * Возвращает признак наличия ошибок валидации.
    * @param string $attribute имя атрибута, null если проверять все атрибуты.
    * @return boolean
    */
   public function hasErrors($attribute = null) {
      if ($attribute === null)
         return $this->_errors !== array();
      else
         return isset($this->_errors[$attribute]);
   }

   /**
    * Возвращает ошибки для всех атрибутов или для указанного атрибута.
    * @param string $attribute имя атрибута, null если все атрибуты.
    * @return array ошибки или пустой массив
    */
   public function getErrors($attribute = null) {
      if ($attribute === null)
         return $this->_errors;
      else
         return isset($this->_errors[$attribute]) ? $this->_errors[$attribute] : array();
   }

   /**
    * Врзвращает первую ошибку для указанного атрибута.
    * @param string $attribute имя атрибута
    * @return string сообщение об ошибке или null
    */
   public function getError($attribute) {
      return isset($this->_errors[$attribute]) ? reset($this->_errors[$attribute]) : null;
   }

   /**
    * Добавляет ошибку к указанному атрибуту.
    * @param string $attribute имя артибута
    * @param string $error новое сообщение об ошибке
    */
   public function addError($attribute, $error) {
      $this->_errors[$attribute][] = $error;
   }

   /**
    * Добавляе список ошибок.
    * @param array $errors список ошибок, ключами должны быть имена атрибутов,
    * значениями сообщения об ошибках. Если у атрибута несколько ошибок,
    * формируется массив для данного ключа-атрибута.
    * Можно в качестве параметра использовать результат, возвращенный {@link getErrors}.
    */
   public function addErrors($errors) {
      foreach ($errors as $attribute => $error) {
         if (is_array($error)) {
            foreach ($error as $e)
               $this->addError($attribute, $e);
         }
         else
            $this->addError($attribute, $error);
      }
   }

   /**
    * Обнуление ошибок для всех или указанного атрибута.
    * @param string $attribute имя атрибута или null.
    */
   public function clearErrors($attribute = null) {
      if ($attribute === null) {
         $this->_errors = array();
      } else {
         unset($this->_errors[$attribute]);
      }
   }

   /**
    * Создает удобочитаемый ярлык атрибута.
    * @param string $name
    * @return
    */
   public function generateAttributeLabel($name) {
      return ucwords(trim(strtolower(str_replace(array('-', '_', '.'), ' ', preg_replace('/(?<![A-Z])[A-Z]/', ' \0', $name)))));
   }

   /**
    * Возвращает все значения атрибутов.
    * @param array $names список атрибутов, по умолчанию null, что равнозначно всем перчисленным в {@link attributeNames}.
    * Если массив, то возвращаются значения только входящих в него атрибутов.
    * @return array пары имя=>значение
    */
   public function getAttributes($names = null) {
      $values = array();
      foreach ($this->attributeNames() as $name) {
         $values[$name] = $this->$name;
      }
      if (is_array($names)) {
         $values2 = array();
         foreach ($names as $name) {
            $values2[$name] = isset($values[$name]) ? $values[$name] : null;
         }
         return $values2;
      } else {
         return $values;
      }
   }

   /**
    * Присваивает значения аттрибутам в массовом порядке.
    * @param array $values пары имя=>значение
    * @param boolean $safeOnly только ли для безопасных атрибутов.
    * Безопасный атрибут связан с правилом валидации в текущем сценарии.
    * @see getSafeAttributeNames
    * @see attributeNames
    */
   public function setAttributes($values, $safeOnly = FALSE) {
      if (!is_array($values))
         return;

      $attributes = array_flip($safeOnly ? $this->getSafeAttributeNames() : $this->attributeNames());
      foreach ($values as $name => $value) {
         if (isset($attributes[$name]))
            $this->$name = $value;
         elseif ($safeOnly)
            $this->onUnsafeAttribute($name, $value);
      }
   }

   /**
    * Выставляет все атрибуты в null.
    * @param array $names список атрибутов, если пустой, все атрибуты, объявленные как
    * {@link attributeNames} будут обнулены.
    */
   public function unsetAttributes($names = null) {
      if ($names === null)
         $names = $this->attributeNames();

      foreach ($names as $name)
         $this->$name = null;
   }

   /**
    * Вызывается при массовом присвоении небезопасных атрибутов.
    * Стандартно, если включен режим отладки, будет выдано предупреждающее сообщение,
    * но без последующих действий.
    * @param string $name имя атрибута
    * @param mixed $value значение
    */
   public function onUnsafeAttribute($name, $value) {
      if (PORT_DEBUG)
         \Port::log(\Port::t('port', 'Failed to set unsafe attribute "{attribute}" of "{class}".', array('{attribute}' => $name,
                     '{class}' => get_class($this)
                 )), loggers\PortLogger::LEVEL_WARNING);
   }

   /**
    * Возвращает имена атрибутов, безопасные для массового присвоения.
    * @return array
    */
   public function getSafeAttributeNames() {
      $attributes = array();
      $unsafe = array();

      foreach ($this->getValidators() as $validator) {
         if (!$validator->safe) {
            foreach ($validator->attributes as $name)
               $unsafe[] = $name;
         } else {
            foreach ($validator->attributes as $name)
               $attributes[$name] = true;
         }
      }

      foreach ($unsafe as $name)
         unset($attributes[$name]);

      return array_keys($attributes);
   }

   /**
    * Возвращает итератор для перебора атрибутов модели.
    * @return PortMapIterator
    */
   public function getIterator() {
      $attributes = $this->getAttributes();
      return new collections\PortMapIterator($attributes);
   }

   /**
    * Проверяет наличие элемента по указанному смещению.
    * @param mixed $offset
    * @return boolean
    */
   public function offsetExists($offset) {
      return property_exists($this, $offset);
   }

   /**
    * Возвращает элемент по указанному смещению.
    * @param integer $offset
    * @return mixed
    */
   public function offsetGet($offset) {
      return $this->$offset;
   }

   /**
    * Присваивает указанную позицию указанному элементу.
    * @param integer $offset
    * @param mixed $item
    */
   public function offsetSet($offset, $item) {
      $this->$offset = $item;
   }

   /**
    * Удаляет элемент в указанной позиции.
    * @param mixed $offset
    */
   public function offsetUnset($offset) {
      unset($this->$offset);
   }

}
