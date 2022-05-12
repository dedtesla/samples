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
 * PortRecord базовый класс представляющий реляционные данные.
 *
 * @property PortDbConnection $dbConnection
 * @property array $attributes
 * @property boolean $isNewRecord
 * @property mixed $primaryKey
 * @property mixed $oldPrimaryKey
 * @property string $tableAlias
 *
 * @package core.components.models
 */
abstract class PortRecord extends \common\PortModel {

   /**
    * @todo 1. Доработать функционал связей объектов базы данных.
    * 2. Доработать связку с построителем команд.
    */
   const BELONGS_TO = 'components\models\PortBelongsToRelation';
   const HAS_ONE = 'components\models\PortHasOneRelation';
   const HAS_MANY = 'components\models\PortHasManyRelation';
   const MANY_MANY = 'components\models\PortManyManyRelation';
   const STAT = 'components\models\PortStatRelation';

   /**
    * @var PortDbConnection
    * @see getDbConnection
    */
   public static $db;
   private static $_models = []; // имя класса => модель
   private static $_md = [];  // имя класса => метаданные
   private $_new = false;
   private $_attributes = []; // имя_атрибута => значение_атрибута
   private $_related = []; // имя_атрибута => связанные_объекты
   private $_condition;
   private $_pk;
   private $_alias = 't'; // алиас таблицы в запросе
   public $_id;

   /**
    * Конструктор.
    *
    * @param integer $id
    */
   public function __construct($id = NULL) {
      $this->_id = $id;
      $this->setIsNewRecord($this->_id === NULL);
      $this->_attributes = $this->getMetaData($this->tableName())->attributeDefaults;
      $this->init();
   }

   /**
    * Инициализирует модель.
    */
   public function init() {

   }

   /**
    * Устанавливает параметры кеширования запроса.
    * Короткая форма {@link PortDbConnection::cache()}.
    * Изменяет параметры кеширования экземпляра {@link dbConnection}.
    * @param integer $duration
    * @param PortCacheDependency|ICacheDependency $dependency
    * @param integer $queryCount
    * @return PortRecord
    */
   public function cache($duration, $dependency = null, $queryCount = 1) {
      $this->getDbConnection()->cache($duration, $dependency, $queryCount);
      return $this;
   }

   /**
    * @return array
    */
   public function __sleep() {
      return array_keys((array) $this);
   }

   /**
    * @param string $name
    * @return mixed
    * @see getAttribute
    */
   public function __get($name) {
      if (isset($this->_attributes[$name]))
         return $this->_attributes[$name];
      elseif (isset($this->getMetaData()->columns[$name]))
         return null;
      elseif (isset($this->_related[$name]))
         return $this->_related[$name];
      elseif (isset($this->getMetaData()->relations[$name]))
         return $this->getRelated($name);
      else {
         return parent::__get($name);
      }
   }

   /**
    * @param string $name
    * @param mixed $value
    */
   public function __set($name, $value) {
      if ($this->setAttribute($name, $value) === false) {
         if (isset($this->getMetaData()->relations[$name]))
            $this->_related[$name] = $value;
         else
            parent::__set($name, $value);
      }
   }

   /**
    * @param string $name
    * @return boolean
    */
   public function __isset($name) {
      if (isset($this->_attributes[$name]))
         return true;
      elseif (isset($this->getMetaData()->columns[$name]))
         return false;
      elseif (isset($this->_related[$name]))
         return true;
      elseif (isset($this->getMetaData()->relations[$name]))
         return $this->getRelated($name) !== null;
      else
         return parent::__isset($name);
   }

   /**
    * @param string $name
    */
   public function __unset($name) {
      if (isset($this->getMetaData()->columns[$name]))
         unset($this->_attributes[$name]);
      elseif (isset($this->getMetaData()->relations[$name]))
         unset($this->_related[$name]);
      else
         parent::__unset($name);
   }

   /**
    * @param string $name
    * @param array $parameters
    * @return mixed
    */
   public function __call($name, $parameters) {
      if (isset($this->getMetaData()->relations[$name])) {
         if (empty($parameters))
            return $this->getRelated($name, false);
         else
            return $this->getRelated($name, false, $parameters[0]);
      }
      $scopes = $this->scopes();
      if (isset($scopes[$name])) {
         $this->getDbCriteria()->mergeWith($scopes[$name]);
         return $this;
      }
      return parent::__call($name, $parameters);
   }

   /**
    * Возвращает связанные объекты текущей записи.
    *
    * @param string $name имя отношения {@link relations}
    * @param boolean $refresh надо ли выгружать отношения из базы, по умолчанию false.
    * Если текущая запись не новая и не имеет загруженных отношений false игнорируется.
    * @param mixed $params
    * @return mixed
    * @throws PortDbException если отношение не указано в {@link relations}.
    */
   public function getRelated($name, $refresh = false, $params = array()) {
      if (!$refresh && $params === [] && (isset($this->_related[$name]) || array_key_exists($name, $this->_related))) {
         return $this->_related[$name];
      }
      $md = $this->getMetaData();
      if (!isset($md->relations[$name])) {
         throw new exception\PortDbException(\Port::t('port', '{class} does not have relation "{name}".', array('{class}' => get_class($this), '{name}' => $name)));
      }
      $relation = $md->relations[$name];
      if ($this->getIsNewRecord() && !$refresh) {
         return [];
      }
      if ($params !== []) {
         $exists = isset($this->_related[$name]) || array_key_exists($name, $this->_related);
         if ($exists) {
            $save = $this->_related[$name];
         }
         if ($params instanceof database\PortDbQueryCondition) {
            $params = $params->toArray();
         }
         $r = [$name => $params];
      } else {
         $r = $name;
      }
      unset($this->_related[$name]);

      $finder = $this->getActiveFinder($r);
      $finder->lazyFind($this);

      if (!isset($this->_related[$name])) {
         $this->_related[$name] = null;
      }
      if ($params !== array()) {
         $results = $this->_related[$name];
         if ($exists) {
            $this->_related[$name] = $save;
         } else {
            unset($this->_related[$name]);
         }
         return $results;
      } else {
         return $this->_related[$name];
      }
   }

   /**
    * @param string $name
    * @return boolean
    */
   public function hasRelated($name) {
      return isset($this->_related[$name]) || array_key_exists($name, $this->_related);
   }

   /**
    * @param boolean $createIfNull
    * @return PortDbQueryCondition
    */
   public function getDbCriteria($createIfNull = TRUE) {
      if ($this->_condition === null) {
         if (($c = $this->defaultScope()) !== [] || $createIfNull) {
            $this->_condition = new database\PortDbQueryCondition($c);
         }
      }
      return $this->_condition;
   }

   /**
    * @param PortDbQueryCondition $criteria
    */
   public function setDbCriteria($criteria) {
      $this->_condition = $criteria;
   }

   /**
    * @return array
    */
   public function defaultScope() {
      return [];
   }

   /**
    * @param boolean $resetDefault
    * @return PortRecord
    */
   public function resetScope($resetDefault = true) {
      if ($resetDefault)
         $this->_condition = new database\PortDbQueryCondition();
      else
         $this->_condition = null;
      return $this;
   }

   /**
    * @param mixed $with
    * @return PortFinder
    */
   public function getActiveFinder($with) {
      return new database\PortFinder($this, $with);
   }

   /**
    * @param string $className
    * @return PortActiveRecord
    */
   public static function model($className = __CLASS__) {
      if (isset(self::$_models[$className]))
         return self::$_models[$className];
      else {
         $model = self::$_models[$className] = new $className(null);
         return $model;
      }
   }

   /**
    * Возвращает класс-метаданные объекта базы данных.
    * Если аргумент не передается - обрабатывается класс модели, выполнившей
    * вызов метода, иначе обрабатывается таблица с указанным именем.
    *
    * @param string $relationalObject имя объекта базы данных (таблицы)
    * @return PortRecordMetaData
    */
   public function getMetaData($relationalObject = NULL) {
      $className = $relationalObject !== NULL ? get_class($this) : $relationalObject;
      if (!array_key_exists($className, self::$_md)) {
         self::$_md[$className] = null;
         self::$_md[$className] = new PortRecordMetaData($this, $relationalObject);
      }
      return self::$_md[$className];
   }

   public function refreshMetaData() {
      $className = get_class($this);
      if (array_key_exists($className, self::$_md)) {
         unset(self::$_md[$className]);
      }
   }

   /**
    * TODO
    * 1. Доработать с учетом всех возможных объявлений имени класса.
    * 2. Перевести на регулярку.
    *
    * @return string
    */
   public function tableName() {
      $_ = explode('\\', get_class($this));
      return strtolower(end($_));
   }

   /**
    * Возвращает первичный ключ связанной таблицы.
    * Метод переопределяется если таблица не определена с первичным ключом.
    * Переопределение не требуется, если таблица уже использует первичный ключ.
    * @return mixed
    */
   public function primaryKey() {

   }

   /**
    * Должен переопределяться для определения связанных объектов,
    * когда данные модели хранятся более чем в одной таблице.
    * Например, локализованные текстовые данные.
    * @return array
    */
   public function related() {
      return [];
   }

   /**
    * Должен переопределяться для определения реляционных объектов.
    * @return array
    */
   public function relations() {
      return [];
   }

   /**
    * Декларирует именованный диапазон.
    * Именованный диапазон представляет критерий запроса, который может быть
    * связан с другим именованным диапазоном и наложен на запрос.
    * Должен переопределяться для конкретных классов записей.
    *
    * @return array
    */
   public function scopes() {
      return [];
   }

   /**
    * Возвращает список всех имен атрибутов модели.
    * Возвращает все имена полей таблицы, ассоциированной с объектом записи.
    * @return array
    */
   public function attributeNames() {
      return array_keys($this->getMetaData()->columns);
   }

   /**
    * Возвращает текстовую метку для указанного атрибута.
    * Переопределяет родительскую реализацию.
    * @param string $attribute
    * @return string
    * @see generateAttributeLabel
    */
   public function getAttributeLabel($attribute) {
      $labels = $this->attributeLabels();
      if (isset($labels[$attribute]))
         return $labels[$attribute];
      else
         return $this->generateAttributeLabel($attribute);
   }

   /**
    * @throws PortDbException
    * @return PortDbConnection
    */
   public function getDbConnection() {
      self::$db = \Port::app()->getDb();
      if (self::$db instanceof database\PortDbConnection) {
         return self::$db;
      } else {
         throw new exception\PortDbException(\Port::t('port', 'PortRecord requires PortDbConnection.'));
      }
   }

   /**
    * @param string $name
    * @return PortRelation
    */
   public function getActiveRelation($name) {
      return isset($this->getMetaData()->relations[$name]) ? $this->getMetaData()->relations[$name] : null;
   }

   /**
    * @return PortDbTableSchema
    */
   public function getTableSchema() {
      return $this->getMetaData()->tableSchema;
   }

   /**
    * @return PortDbCommandBuilder
    */
   public function getCommandBuilder() {
      return $this->getDbConnection()->getCommandBuilder();
   }

   /**
    * @param string $name
    * @return boolean
    */
   public function hasAttribute($name) {
      return isset($this->getMetaData()->columns[$name]);
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
    * @param string $name
    * @param mixed $value
    * @return boolean
    * @see hasAttribute
    */
   public function setAttribute($name, $value) {
      if (property_exists($this, $name))
         $this->$name = $value;
      elseif (isset($this->getMetaData($this->tableName())->columns[$name]))
         $this->_attributes[$name] = $value;
      else
         return false;

      return true;
   }

   /**
    * @param string $name
    * @param mixed $record
    * @param mixed $index
    */
   public function addRelatedRecord($name, $record, $index) {
      if ($index !== false) {
         if (!isset($this->_related[$name]))
            $this->_related[$name] = array();

         if ($record instanceof PortRecord) {
            if ($index === true)
               $this->_related[$name][] = $record;
            else
               $this->_related[$name][$index] = $record;
         }
      }
      elseif (!isset($this->_related[$name]))
         $this->_related[$name] = $record;
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
      } else
         return $attributes;
   }

   /**
    * Сохранение текущей записи.
    *
    * Запись добавляется как строка таблицы базы данных если ее свойство {@link isNewRecord}
    * равно true (если запись создается оператором 'new'). Иначе запись обновляется.
    *
    * Проверка выполняется перед сохранением, если проверка неудачна, запись не будет
    * сохранена. Для отработки ошибок вызывается {@link getErrors()}.
    *
    * Если запись вставляется, ее свойство {@link isNewRecord} выставляется в false
    *
    * @param boolean $runValidation надо ли выполнять проверку перед сохранением
    * @param array $attributes список атрибутов для сохранения, по умолчанию null,
    * что означает сохранение всех атрибутов
    * @return boolean
    */
   public function save($attributes = []) {
      $attributes = !$attributes ? $this->_attributes : $attributes;
      return $this->getIsNewRecord() ? $this->insert($attributes) : $this->update($attributes);
   }

   /**
    * Проверка - новая запись или нет.
    * @return boolean
    */
   public function getIsNewRecord() {
      return $this->_new;
   }

   /**
    * Управление статусом "новая запись".
    * @param boolean $value
    * @see getIsNewRecord
    */
   public function setIsNewRecord($value) {
      $this->_new = $value;
   }

   /**
    * Вставка новой записи.
    * @param array $attributes
    * @return boolean
    * @throws PortDbException
    */
   public function insert($attributes = null) {
      if (!$this->getIsNewRecord()) {
         throw new exception\PortDbException(\Port::t('port', 'The record cannot be inserted to database because it is not new.'));
      }

      $attributes = !$attributes ? $this->_attributes : $attributes;
      $builder = $this->getCommandBuilder();
      $table = $this->getMetaData($this->tableName())->tableSchema;

//      $command = $builder->createInsertCommand($table, $this->getAttributes($attributes));
      $command = $builder->createInsertCommand($table, $attributes);
      if ($command->execute()) {
         $primaryKey = $table->primaryKey;
         if ($table->sequenceName !== null) {
            if (is_string($primaryKey) && $this->$primaryKey === null) {
               $this->$primaryKey = $builder->getLastInsertID($table);
            } elseif (is_array($primaryKey) && $primaryKey) {
               foreach ($primaryKey as $pk) {
                  if ($this->$pk === null) {
                     $this->$pk = $builder->getLastInsertID($table);
                     break;
                  }
               }
            }
         }

         $this->_pk = $this->getPrimaryKey();
         $this->setIsNewRecord(false);
         return $builder->getLastInsertID($table);
      }

      return false;
   }

   /**
    * Обновление текущей записи.
    * @param array $attributes
    * @return boolean
    * @throws PortDbException
    */
   public function update($attributes = null) {
      if ($this->getIsNewRecord()) {
         throw new exception\PortDbException(\Port::t('port', 'The record cannot be updated because it is new.'));
      }
      $attributes = !$attributes ? $this->_attributes : $attributes;

      if ($this->_pk === null) {
         $this->_pk = $this->getPrimaryKey();
      }
      $this->updateByPk($this->_pk, $attributes);

      $this->_pk = $this->getPrimaryKey();
      return true;
   }

   /**
    * Сохраняет данные заданных полей.
    * @param array $attributes
    * @throws PortDbException
    * @return boolean
    */
   public function saveAttributes($attributes) {
      if (!$this->getIsNewRecord()) {
         \Port::trace(get_class($this) . '.saveAttributes()', 'port.db.PortRecord');
         $values = array();

         foreach ($attributes as $name => $value) {
            if (is_integer($name)) {
               $values[$value] = $this->$value;
            } else {
               $values[$name] = $this->$name = $value;
            }
         }

         if ($this->_pk === null) {
            $this->_pk = $this->getPrimaryKey();
         }

         if ($this->updateByPk($this->getOldPrimaryKey(), $values) > 0) {
            $this->_pk = $this->getPrimaryKey();
            return true;
         } else {
            return false;
         }
      } else {
         throw new exception\PortDbException(\Port::t('port', 'The record cannot be updated because it is new.'));
      }
   }

   /**
    * @throws PortDbException
    * @return boolean
    */
   public function delete() {
      if (!$this->getIsNewRecord()) {
         $result = $this->deleteByPk($this->getPrimaryKey()) > 0;
         $this->afterDelete();
         return $result;
      } else {
         throw new exception\PortDbException(\Port::t('port', 'The record cannot be deleted because it is new.'));
      }
   }

   /**
    * @return boolean
    */
   public function refresh() {
      if (($record = $this->findByPk($this->getPrimaryKey())) !== null) {
         $this->_attributes = array();
         $this->_related = array();
         foreach ($this->getMetaData()->columns as $name => $column) {
            if (property_exists($this, $name)) {
               $this->$name = $record->$name;
            } else {
               $this->_attributes[$name] = $record->$name;
            }
         }
         return true;
      } else {
         return false;
      }
   }

   /**
    * @param PortRecord $record
    * @return boolean
    */
   public function equals($record) {
      return $this->tableName() === $record->tableName() && $this->getPrimaryKey() === $record->getPrimaryKey();
   }

   /**
    * @return mixed $value
    */
   public function getPrimaryKey() {
      $table = $this->getMetaData($this->tableName())->tableSchema;
      if (is_string($table->primaryKey)) {
         return $this->{$table->primaryKey};
      } elseif (is_array($table->primaryKey)) {
         $values = array();
         foreach ($table->primaryKey as $name) {
            $values[$name] = $this->$name;
         }
         return $values;
      } else {
         return null;
      }
   }

   /**
    * @param mixed $value
    */
   public function setPrimaryKey($value) {
      $this->_pk = $this->getPrimaryKey();
      $table = $this->getMetaData($this->tableName())->tableSchema;
      if (is_string($table->primaryKey)) {
         $this->{$table->primaryKey} = $value;
      } elseif (is_array($table->primaryKey)) {
         foreach ($table->primaryKey as $name) {
            $this->$name = $value[$name];
         }
      }
   }

   /**
    * @return mixed
    */
   public function getOldPrimaryKey() {
      return $this->_pk;
   }

   /**
    * @param mixed $value
    */
   public function setOldPrimaryKey($value) {
      $this->_pk = $value;
   }

   /**
    * @param PortDbQueryCondition $criteria
    * @param boolean $all
    * @return mixed
    */
   protected function query($criteria, $all = false) {
      $this->applyScopes($criteria);
      if (empty($criteria->with)) {
         if (!$all) {
            $criteria->limit = 1;
         }
         $command = $this->getCommandBuilder()->createFindCommand($this->getTableSchema(), $criteria, $this->getTableAlias());
         return $all ? $this->populateRecords($command->readAll(), true, $criteria->index) : $this->populateRecord($command->readRow());
      } else {
         $finder = $this->getActiveFinder($criteria->with);
         return $finder->query($criteria, $all);
      }
   }

   /**
    * @param PortDbQueryCondition $criteria
    */
   public function applyScopes(&$criteria) {
      if (!empty($criteria->scopes)) {
         $scs = $this->scopes();
         $c = $this->getDbCriteria();
         foreach ((array) $criteria->scopes as $k => $v) {
            if (is_integer($k)) {
               if (is_string($v)) {
                  if (isset($scs[$v])) {
                     $c->mergeWith($scs[$v], true);
                     continue;
                  }
                  $scope = $v;
                  $params = array();
               } elseif (is_array($v)) {
                  $scope = key($v);
                  $params = current($v);
               }
            } elseif (is_string($k)) {
               $scope = $k;
               $params = $v;
            }
            call_user_func_array(array($this, $scope), (array) $params);
         }
      }

      if (isset($c) || ($c = $this->getDbCriteria(false)) !== null) {
         $c->mergeWith($criteria);
         $criteria = $c;
         $this->resetScope(false);
      }
   }

   /**
    * Возвращает алиас таиблицы.
    * @param boolean $quote
    * @param boolean $checkScopes
    * @return string
    */
   public function getTableAlias($quote = false, $checkScopes = true) {
      if ($checkScopes && ($criteria = $this->getDbCriteria(false)) !== null && $criteria->alias != '') {
         $alias = $criteria->alias;
      } else {
         $alias = $this->_alias;
      }
      return $quote ? $this->getDbConnection()->getSchema()->quoteTableName($alias) : $alias;
   }

   /**
    * Назначает алиас таблицы.
    * @param string $alias
    */
   public function setTableAlias($alias) {
      $this->_alias = $alias;
   }

   /**
    * Выборка записи.
    * @param mixed $condition
    * @param array $params
    * @return PortRecord или NULL
    */
   public function find($condition = '', $params = array()) {
      $criteria = $this->getCommandBuilder()->createCriteria($condition, $params);
      return $this->query($criteria);
   }

   /**
    * Выборка диапазона записей.
    * @param mixed $condition
    * @param array $params
    * @return PortRecord[]
    */
   public function findAll($condition = '', $params = array()) {
      $criteria = $this->getCommandBuilder()->createCriteria($condition, $params);
      return $this->query($criteria, true);
   }

   /**
    * Выборка единичной записи по заданному первичному ключу.
    * @param mixed $pk значение ключа, может быть массив, для композитных ключей
    * ДОЛЖЕН быть массив (имя_поля=>значение).
    * @param mixed $condition условие или критерий выборки
    * @param array $params параметры SQL
    * @return PortRecord или NULL
    */
   public function findByPk($pk, $condition = '', $params = array()) {
      \Port::trace(get_class($this) . '.findByPk()', 'Port.models.PortRecord');
      $prefix = $this->getTableAlias(true) . '.';
      $criteria = $this->getCommandBuilder()->createPkCriteria($this->getTableSchema(), $pk, $condition, $params, $prefix);
      return $this->query($criteria);
   }

   /**
    * Выборка диапазона записей по заданным значениям первичных ключей.
    * @param mixed $pk значение ключа, может быть массив, для композитных ключей
    * ДОЛЖЕН быть массив (имя_поля=>значение).
    * @param mixed $condition условие или критерий выборки
    * @param array $params параметры SQL
    * @return PortRecord[] или пустой массив
    */
   public function findAllByPk($pk, $condition = '', $params = array()) {
      \Port::trace(get_class($this) . '.findAllByPk()', 'Port.Database.PortRecord');
      $prefix = $this->getTableAlias(true) . '.';
      $criteria = $this->getCommandBuilder()->createPkCriteria($this->getTableSchema(), $pk, $condition, $params, $prefix);
      return $this->query($criteria, true);
   }

   /**
    * Выборка единичной записи по заданным значениям атрибутов.
    * @param array $attributes список значений атрибутов, или массив для условия IN.
    * @param mixed $condition условие или критерий запроса
    * @param array $params параметры SQL
    * @return PortRecord или NULL
    */
   public function findByAttributes($attributes, $condition = '', $params = array()) {
      \Port::trace(get_class($this) . '.findByAttributes()', 'Port.Database.PortRecord');
      $prefix = $this->getTableAlias(true) . '.';
      $criteria = $this->getCommandBuilder()->createColumnCriteria($this->getTableSchema(), $attributes, $condition, $params, $prefix);
      return $this->query($criteria);
   }

   /**
    * Выборка диапазона записей по заданным значениям атрибутов.
    * @param array $attributes список значений атрибутов, или массив для условия IN
    * @param mixed $condition условие или критерий запроса
    * @param array $params параметры SQL
    * @return PortRecord[] или пустой массив
    */
   public function findAllByAttributes($attributes, $condition = '', $params = array()) {
      \Port::trace(get_class($this) . '.findAllByAttributes()', 'Port.Database.PortRecord');
      $prefix = $this->getTableAlias(true) . '.';
      $criteria = $this->getCommandBuilder()->createColumnCriteria($this->getTableSchema(), $attributes, $condition, $params, $prefix);
      return $this->query($criteria, true);
   }

   /**
    * Выборка единичной записи по заданному SQL-выражению.
    * @param string $sql SQL-выражение
    * @param array $params параметры SQL
    * @return PortRecord или NULL
    */
   public function findBySql($sql, $params = array()) {
      \Port::trace(get_class($this) . '.findBySql()', 'Port.Database.PortRecord');
      $this->beforeFind();
      if (($criteria = $this->getDbCriteria(false)) !== null && !empty($criteria->with)) {
         $this->resetScope(false);
         $finder = $this->getActiveFinder($criteria->with);
         return $finder->findBySql($sql, $params);
      } else {
         $command = $this->getCommandBuilder()->createSqlCommand($sql, $params);
         return $this->populateRecord($command->queryRow());
      }
   }

   /**
    * Выборка диапазона записей по заданному SQL-выражению.
    * @param string $sql SQL-выражение
    * @param array $params параметры SQL
    * @return PortRecord[] или пустой массив
    */
   public function findAllBySql($sql, $params = array()) {
      \Port::trace(get_class($this) . '.findAllBySql()', 'Port.Database.PortRecord');
      $this->beforeFind();
      if (($criteria = $this->getDbCriteria(false)) !== null && !empty($criteria->with)) {
         $this->resetScope(false);
         $finder = $this->getActiveFinder($criteria->with);
         return $finder->findAllBySql($sql, $params);
      } else {
         $command = $this->getCommandBuilder()->createSqlCommand($sql, $params);
         return $this->populateRecords($command->queryAll());
      }
   }

   /**
    * Вычисление числа строк, удовлетворяющих заданному условию выборки.
    * @param mixed $condition условие или критерий запроса
    * @param array $params параметры SQL
    * @return string
    * @todo Заменить на integer.
    */
   public function count($condition = '', $params = array()) {
      \Port::trace(get_class($this) . '.count()', 'Port.Database.PortRecord');
      $builder = $this->getCommandBuilder();
      $this->beforeCount();
      $criteria = $builder->createCriteria($condition, $params);
      $this->applyScopes($criteria);
      if (empty($criteria->with)) {
         return $builder->createCountCommand($this->getTableSchema(), $criteria)->queryScalar();
      } else {
         $finder = $this->getActiveFinder($criteria->with);
         return $finder->count($criteria);
      }
   }

   /**
    * Вычисление числа строк, удовлетворяющих заданным значениям атрибутов..
    * @param array $attributes список значений атрибутов, или массив для условия IN
    * @param mixed $condition условие или критерий запроса
    * @param array $params параметры SQL
    * @return string
    * @todo Заменить на integer.
    */
   public function countByAttributes($attributes, $condition = '', $params = array()) {
      \Port::trace(get_class($this) . '.countByAttributes()', 'Port.Database.PortRecord');
      $prefix = $this->getTableAlias(true) . '.';
      $builder = $this->getCommandBuilder();
      $this->beforeCount();
      $criteria = $builder->createColumnCriteria($this->getTableSchema(), $attributes, $condition, $params, $prefix);
      $this->applyScopes($criteria);
      if (empty($criteria->with)) {
         return $builder->createCountCommand($this->getTableSchema(), $criteria)->queryScalar();
      } else {
         $finder = $this->getActiveFinder($criteria->with);
         return $finder->count($criteria);
      }
   }

   /**
    * Вычисление числа строк, удовлетворяющих заданному выражению SQL.
    * @param string $sql SQL-выражение
    * @param array $params параметры SQL
    * @return string
    * @todo Заменить на integer.
    */
   public function countBySql($sql, $params = array()) {
      \Port::trace(get_class($this) . '.countBySql()', 'Port.Database.PortRecord');
      $this->beforeCount();
      return $this->getCommandBuilder()->createSqlCommand($sql, $params)->queryScalar();
   }

   /**
    * Проверка на наличие строки, удовлетворяющей заданному условию.
    * @param mixed $condition условие или критерий запроса
    * @param array $params параметры SQL
    * @return boolean
    */
   public function exists($condition = '', $params = array()) {
      \Port::trace(get_class($this) . '.exists()', 'Port.components.models.PortRecord');
      $builder = $this->getCommandBuilder();
      $criteria = $builder->createCriteria($condition, $params);
      $table = $this->getTableSchema();
      $criteria->select = '1';
      $criteria->limit = 1;
      $this->applyScopes($criteria);
      if (empty($criteria->with)) {
         return $builder->createFindCommand($table, $criteria, $this->getTableAlias(false, false))->queryRow();
      } else {
         $criteria->select = '*';
         $finder = $this->getActiveFinder($criteria->with);
         return $finder->count($criteria) > 0;
      }
   }

   /**
    * Указание на связанные с основным родственные объекты базы данных, которые
    * должны участвовать в выборке.
    * Число параметров не ограничено, но они должны быть объявлены
    * в {@link relations()}.
    * Стандартно опции {@link relations()} используются для выполнения
    * реляционных запросов. Можно динамически управлять процессом, передавая
    * массив как параметр метода with(). Ключи массива - имена реляционных
    * объектов, их значения - опции запроса.
    * @return PortRecord
    */
   public function with() {
      if (func_num_args() > 0) {
         $with = func_get_args();
         if (is_array($with[0])) {
            $with = $with[0];
         }
         if (!empty($with)) {
            $this->getDbCriteria()->mergeWith(['with' => $with]);
         }
      }
      return $this;
   }

   /**
    * Включает свойство {@link PortDbQueryCondition::together}, которое используется
    * в реляционных запросах.
    * @see {@link PortDbQueryCondition::together}
    * @return PortRecord
    */
   public function together() {
      $this->getDbCriteria()->together = true;
      return $this;
   }

   /**
    * Выполняет запрос на обновление записей по заданным первичным ключам или ключу.
    * @param mixed $pk
    * @param array $attributes
    * @param mixed $condition
    * @param array $params
    * @return integer число реально обновленных записей
    */
   public function updateByPk($pk, $attributes, $condition = '', $params = array()) {
      \Port::trace(get_class($this) . '.updateByPk()', 'Port.Database.PortRecord');
      $builder = $this->getCommandBuilder();
      $table = $this->getMetaData($this->tableName())->tableSchema;
      $criteria = $builder->createPkCriteria($table, $pk, $condition, $params);
      $command = $builder->createUpdateCommand($table, $attributes, $criteria);
      return $command->execute();
   }

   /**
    * Выполняет запрос на обновление записей по заданным первичным ключам или ключу.
    * @param mixed $pk
    * @param array $attributes
    * @param mixed $condition
    * @param array $params
    * @return integer число реально обновленных записей
    */
   public function updateBy($attributes, $condition = '', $params = array()) {
//      \Port::trace(get_class($this) . '.updateByPk()', 'Port.Database.PortRecord');
      $builder = $this->getCommandBuilder();
      $table = $this->getMetaData($this->tableName())->tableSchema;
//      $criteria = $builder->createPkCriteria($table, $pk, $condition, $params);
//      $command = $builder->createUpdateCommand($table, $attributes, $criteria);
      $command = $builder->createUpdateCommand($table, $attributes);
      return $command->execute();
   }

   /**
    * Выполняет запрос на обновление записей по заданным условиям.
    * @param array $attributes
    * @param mixed $condition
    * @param array $params
    * @return integer число реально обновленных записей
    */
   public function updateAll($attributes, $condition = '', $params = array()) {
      \Port::trace(get_class($this) . '.updateAll()', 'Port.Database.PortRecord');
      $builder = $this->getCommandBuilder();
      $criteria = $builder->createCriteria($condition, $params);
      $command = $builder->createUpdateCommand($this->getTableSchema(), $attributes, $criteria);
      return $command->execute();
   }

   /**
    * Выполняет обновление автоинкрементных полей.
    * @param array $counters (имя_поля=>значение счетчика)
    * @param mixed $condition
    * @param array $params
    * @return integer
    * @see saveCounters
    */
   public function updateCounters($counters, $condition = '', $params = array()) {
      \Port::trace(get_class($this) . '.updateCounters()', 'Port.models.PortRecord');
      $builder = $this->getCommandBuilder();
      $criteria = $builder->createCriteria($condition, $params);
      $command = $builder->createUpdateCounterCommand($this->getTableSchema(), $counters, $criteria);
      return $command->execute();
   }

   /**
    * Удаляет записи по заданному первичному ключу.
    * @param mixed $pk
    * @param mixed $condition
    * @param array $params
    * @return integer
    */
   public function deleteByPk($pk, $condition = '', $params = array()) {
      \Port::trace(get_class($this) . '.deleteByPk()', 'Port.Database.PortRecord');
      $builder = $this->getCommandBuilder();
      $criteria = $builder->createPkCriteria($this->getTableSchema(), $pk, $condition, $params);
      $command = $builder->createDeleteCommand($this->getTableSchema(), $criteria);
      return $command->execute();
   }

   /**
    * Удаляет записи по заданному условию.
    * @param mixed $condition
    * @param array $params
    * @return integer
    */
   public function deleteAll($condition = '', $params = array()) {
      \Port::trace(get_class($this) . '.deleteAll()', 'Port.Database.PortRecord');
      $builder = $this->getCommandBuilder();
      $criteria = $builder->createCriteria($condition, $params);
      $command = $builder->createDeleteCommand($this->getTableSchema(), $criteria);
      return $command->execute();
   }

   /**
    * Удаляет записи, по заданным значениям атрибутов.
    * @param array $attributes
    * @param mixed $condition
    * @param array $params
    * @return integer
    */
   public function deleteAllByAttributes($attributes, $condition = '', $params = array()) {
      \Port::trace(get_class($this) . '.deleteAllByAttributes()', 'Port.Database.PortRecord');
      $builder = $this->getCommandBuilder();
      $table = $this->getTableSchema();
      $criteria = $builder->createColumnCriteria($table, $attributes, $condition, $params);
      $command = $builder->createDeleteCommand($table, $criteria);
      return $command->execute();
   }

   /**
    * Создает запись с заданными атрибутами.
    * Внутренний метод для функционала выборок (find).
    * @param array $attributes значения атрибутов (поле=>значение)
    * @param boolean $callAfterFind
    * @return PortRecord или NULL
    */
   public function populateRecord($attributes, $callAfterFind = true) {
      if ($attributes !== false) {
         $record = $this->instantiate($attributes);
         $record->setScenario('update');
         $record->init();
         $md = $record->getMetaData();
         foreach ($attributes as $name => $value) {
            if (property_exists($record, $name)) {
               $record->$name = $value;
            } elseif (isset($md->columns[$name])) {
               $record->_attributes[$name] = $value;
            }
         }
         $record->_pk = $record->getPrimaryKey();
         if ($callAfterFind) {
            $record->afterFind();
         }
         return $record;
      } else {
         return null;
      }
   }

   /**
    * Создает список записей на основе введенных данных.
    * Для внутренних вызовов.
    * @param array $data список атрибутов и значений
    * @param boolean $callAfterFind
    * @param string $index имя атрибута, по которому индексировать результирующий массив
    * или если не указан - обычная целочисленная индексация от 0.
    * @return PortRecord[]
    */
   public function populateRecords($data, $callAfterFind = true, $index = null) {
      $records = array();
      foreach ($data as $attributes) {
         if (($record = $this->populateRecord($attributes, $callAfterFind)) !== null) {
            if ($index === null) {
               $records[] = $record;
            } else {
               $records[$record->$index] = $record;
            }
         }
      }
      return $records;
   }

   /**
    * Создает экземпляр текущей записи.
    * Используется в методах {@link populateRecord} и {@link populateRecords}.
    * Переопределяем, если надо.
    * @param array $attributes
    * @return PortRecord
    */
   protected function instantiate($attributes = []) {
      $class = get_class($this);
      $model = new $class(null);
      return $model;
   }

   /**
    * Проверяет, если элемент по заданному смещению в коллекции.
    * Требование интефейса ArrayAccess.
    * @param mixed $offset
    * @return boolean
    */
   public function offsetExists($offset) {
      return $this->__isset($offset);
   }

}

/**
 * PortBaseRelation базовый класс всех реляционных объектов баз данных.
 *
 * @package core.components.models
 */
class PortBaseRelation extends \common\PortApplicationComponent {

   /**
    * @var string имя реляционного объекта
    */
   public $name;

   /**
    * @var string
    */
   public $className;

   /**
    * @var mixed внешний ключ
    */
   public $foreignKey;

   /**
    * @var mixed список имен полей (массив или строка имен через запятую).
    * Имена не экранируются и не имеют префиксов, если они не используются в выражении.
    * В выражении имена полей идут с префиксом имени реляционного объекта.
    */
   public $select = '*';

   /**
    * @var string строка WHERE для классов, наследующих {@link PortRelation}.
    */
   public $condition = '';

   /**
    * @var array массив параметров
    */
   public $params = array();

   /**
    * @var string строка GROUP BY для классов, наследующих {@link PortRelation}.
    */
   public $group = '';

   /**
    * @var string строка JOIN с другими таблицами (<code>'JOIN users ON users.id=authorID'</code>).
    */
   public $join = '';

   /**
    * @var string строка HAVING  для классов, наследующих {@link PortRelation}.
    */
   public $having = '';

   /**
    * @var string строка ORDER BY для классов, наследующих {@link PortRelation},.
    */
   public $order = '';

   /**
    * Конструктор.
    *
    * @param string $name
    * @param string $className
    * @param string $foreignKey
    * @param array
    */
   public function __construct($name, $className, $foreignKey, $options = array()) {
      $this->name = $name;
      $this->className = $className;
      $this->foreignKey = $foreignKey;
      foreach ($options as $name => $value) {
         $this->$name = $value;
      }
   }

   /**
    * Слияние реляционных объектов по динамически задаваемым критериям..
    * @param array $criteria
    * @param boolean $fromScope
    */
   public function mergeWith($criteria, $fromScope = false) {
      if ($criteria instanceof PortDbQueryCondition) {
         $criteria = $criteria->toArray();
      }
      if (isset($criteria['select']) && $this->select !== $criteria['select']) {
         if ($this->select === '*') {
            $this->select = $criteria['select'];
         } elseif ($criteria['select'] !== '*') {
            $select1 = is_string($this->select) ? preg_split('/\s*,\s*/', trim($this->select), -1, PREG_SPLIT_NO_EMPTY) : $this->select;
            $select2 = is_string($criteria['select']) ? preg_split('/\s*,\s*/', trim($criteria['select']), -1, PREG_SPLIT_NO_EMPTY) : $criteria['select'];
            $this->select = array_merge($select1, array_diff($select2, $select1));
         }
      }

      if (isset($criteria['condition']) && $this->condition !== $criteria['condition']) {
         if ($this->condition === '') {
            $this->condition = $criteria['condition'];
         } elseif ($criteria['condition'] !== '') {
            $this->condition = "({$this->condition}) AND ({$criteria['condition']})";
         }
      }
      if (isset($criteria['params']) && $this->params !== $criteria['params']) {
         $this->params = array_merge($this->params, $criteria['params']);
      }
      if (isset($criteria['order']) && $this->order !== $criteria['order']) {
         if ($this->order === '') {
            $this->order = $criteria['order'];
         } elseif ($criteria['order'] !== '') {
            $this->order = $criteria['order'] . ', ' . $this->order;
         }
      }
      if (isset($criteria['group']) && $this->group !== $criteria['group']) {
         if ($this->group === '') {
            $this->group = $criteria['group'];
         } elseif ($criteria['group'] !== '') {
            $this->group .= ', ' . $criteria['group'];
         }
      }
      if (isset($criteria['join']) && $this->join !== $criteria['join']) {
         if ($this->join === '') {
            $this->join = $criteria['join'];
         } elseif ($criteria['join'] !== '') {
            $this->join .= ' ' . $criteria['join'];
         }
      }
      if (isset($criteria['having']) && $this->having !== $criteria['having']) {
         if ($this->having === '') {
            $this->having = $criteria['having'];
         } elseif ($criteria['having'] !== '') {
            $this->having = "({$this->having}) AND ({$criteria['having']})";
         }
      }
   }

}

/**
 * PortRelation
 *
 * @package core.components.models
 */
class PortRelation extends PortBaseRelation {

   /**
    * @var string
    */
   public $joinType = 'LEFT OUTER JOIN';

   /**
    * @var string
    */
   public $on = '';

   /**
    * @var string
    */
   public $alias;

   /**
    * @var string|array
    */
   public $with = array();

   /**
    * @var boolean
    */
   public $together;

   /**
    * @var mixed
    */
   public $scopes;

   /**
    * @var string
    */
   public $through;

   /**
    * @param array $criteria
    * @param boolean $fromScope
    */
   public function mergeWith($criteria, $fromScope = false) {
      if ($criteria instanceof database\PortDbQueryCondition)
         $criteria = $criteria->toArray();

      if ($fromScope) {
         if (isset($criteria['condition']) && $this->on !== $criteria['condition']) {
            if ($this->on === '')
               $this->on = $criteria['condition'];
            elseif ($criteria['condition'] !== '')
               $this->on = "({$this->on}) AND ({$criteria['condition']})";
         }
         unset($criteria['condition']);
      }

      parent::mergeWith($criteria);

      if (isset($criteria['joinType']))
         $this->joinType = $criteria['joinType'];

      if (isset($criteria['on']) && $this->on !== $criteria['on']) {
         if ($this->on === '')
            $this->on = $criteria['on'];
         elseif ($criteria['on'] !== '')
            $this->on = "({$this->on}) AND ({$criteria['on']})";
      }

      if (isset($criteria['with']))
         $this->with = $criteria['with'];

      if (isset($criteria['alias']))
         $this->alias = $criteria['alias'];

      if (isset($criteria['together']))
         $this->together = $criteria['together'];
   }

}

/**
 * PortStatRelation - реляционные запросы, возвращающие вычисляемые результаты.
 *
 * @package core.components.models
 */
class PortStatRelation extends PortBaseRelation {

   /**
    * @var string
    */
   public $select = 'COUNT(*)';

   /**
    * @var mixed
    */
   public $defaultValue = 0;

   /**
    * @param array $criteria
    * @param boolean $fromScope
    */
   public function mergeWith($criteria, $fromScope = false) {
      if ($criteria instanceof database\PortDbCriteria)
         $criteria = $criteria->toArray();
      parent::mergeWith($criteria, $fromScope);

      if (isset($criteria['defaultValue']))
         $this->defaultValue = $criteria['defaultValue'];
   }

}

/**
 * PortBelongsToRelation для работы с отношением BELONGS_TO.
 *
 * @package core.components.models
 */
class PortBelongsToRelation extends PortRelation {

}

/**
 * PortHasOneRelation для работы с отношением HAS_ONE.
 *
 * @package core.components.models
 */
class PortHasOneRelation extends PortRelation {

}

/**
 * PortHasManyRelation для работы с отношением HAS_MANY.
 * @package core.components.models
 */
class PortHasManyRelation extends PortRelation {

   /**
    * @var integer
    */
   public $limit = -1;

   /**
    * @var integer offset
    */
   public $offset = -1;

   /**
    * @var string
    */
   public $index;

   /**
    * @param array $criteria
    * @param boolean $fromScope
    */
   public function mergeWith($criteria, $fromScope = false) {
      if ($criteria instanceof database\PortDbCriteria)
         $criteria = $criteria->toArray();
      parent::mergeWith($criteria, $fromScope);
      if (isset($criteria['limit']) && $criteria['limit'] > 0)
         $this->limit = $criteria['limit'];

      if (isset($criteria['offset']) && $criteria['offset'] >= 0)
         $this->offset = $criteria['offset'];

      if (isset($criteria['index']))
         $this->index = $criteria['index'];
   }

}

/**
 * PortManyManyRelation для работы с отношением MANY_MANY.
 * @package core.components.models
 */
class PortManyManyRelation extends PortHasManyRelation {

   /**
    * @var string
    */
   private $_junctionTableName = null;

   /**
    * @var array
    */
   private $_junctionForeignKeys = null;

   /**
    * @return string
    */
   public function getJunctionTableName() {
      if ($this->_junctionTableName === null)
         $this->initJunctionData();
      return $this->_junctionTableName;
   }

   /**
    * @return array
    */
   public function getJunctionForeignKeys() {
      if ($this->_junctionForeignKeys === null)
         $this->initJunctionData();
      return $this->_junctionForeignKeys;
   }

   /**
    * @throws PortDbException
    */
   private function initJunctionData() {
      if (!preg_match('/^\s*(.*?)\((.*)\)\s*$/', $this->foreignKey, $matches))
         throw new exception\PortDbException(\Port::t('port', 'The relation "{relation}" in active record class "{class}" is specified with an invalid foreign key. The format of the foreign key must be "joinTable(fk1,fk2,...)".', array('{class}' => $this->className, '{relation}' => $this->name)));
      $this->_junctionTableName = $matches[1];
      $this->_junctionForeignKeys = preg_split('/\s*,\s*/', $matches[2], -1, PREG_SPLIT_NO_EMPTY);
   }

}

/**
 * PortRecordMetaData представляет метаданные записи.
 *
 * @package core.components.models
 */
class PortRecordMetaData {

   /**
    * @var PortDbTableSchema
    */
   public $tableSchema;

   /**
    * @var array поля таблицы
    */
   public $columns;

   /**
    * @var array реляционные объекты
    */
   public $relations = [];
   public $attributeDefaults = [];
   private $_modelClassName;

   /**
    * Конструктор.
    *
    * @param PortRecord $model
    * @throws PortDbException
    */
   public function __construct($model, $tableNameForce = NULL) {
      $this->_modelClassName = get_class($model);
      $tableName = empty($tableNameForce) ? $model->tableName() : $tableNameForce;

      if (($table = $model->getDbConnection()->getSchema()->getTable($tableName)) === NULL) {
         throw new exception\PortDbException(\Port::t('port', 'The table "{table}" for record class "{class}" cannot be found in the database.', array('{class}' => $this->_modelClassName, '{table}' => $tableName)));
      }
      if ($table->primaryKey === null) {
         $table->primaryKey = $model->primaryKey();
         if (is_string($table->primaryKey) && isset($table->columns[$table->primaryKey])) {
            $table->columns[$table->primaryKey]->isPrimaryKey = true;
         } elseif (is_array($table->primaryKey)) {
            foreach ($table->primaryKey as $name) {
               if (isset($table->columns[$name])) {
                  $table->columns[$name]->isPrimaryKey = true;
               }
            }
         }
      }

      $this->tableSchema = $table;
      $this->columns = $table->columns;

      foreach ($table->columns as $name => $column) {
         if (!$column->isPrimaryKey && $column->defaultValue !== null)
            $this->attributeDefaults[$name] = $column->defaultValue;
         elseif (!$column->isPrimaryKey)
            $this->attribute[$name] = NULL;
      }

      foreach ($model->relations() as $name => $config)
         $this->addRelation($name, $config);
   }

   /**
    * $config массив из трех элементов:
    * тип отношения, класс отношения записи и внешний ключ.
    *
    * @throws PortDbException
    * @param string $name
    * @param array $config
    * @return void
    */
   public function addRelation($name, $config) {
      if (isset($config[0], $config[1], $config[2]))
         $this->relations[$name] = new $config[0]($name, $config[1], $config[2], array_slice($config, 3));
      else
         throw new exception\PortDbException(\Port::t('port', 'Record "{class}" has an invalid configuration for relation "{relation}". It must specify the relation type, the related active record class and the foreign key.', array('{class}' => $this->_modelClassName, '{relation}' => $name)));
   }

   /**
    * @param string $name $name
    * @return boolean
    */
   public function hasRelation($name) {
      return isset($this->relations[$name]);
   }

   /**
    * @param string $name
    * @return void
    */
   public function removeRelation($name) {
      unset($this->relations[$name]);
   }

}
