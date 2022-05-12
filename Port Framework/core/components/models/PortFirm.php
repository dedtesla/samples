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
 * PortFirm модель, обслуживающая сущность Фирма.
 *
 * @property array $localeData Локализованные данные
 * @property array $_attributes Стандартно поля записи таблицы БД (имя_атрибута => значение_атрибута)
 * @property int $_id Значение первичного ключа таблицы
 * @package core.components.models
 */
class PortFirm extends PortRecord {

   public $localeData = [];
   private $_attributes = [];
   public $_id;
   public $_castAssistant;
   public $files;

   /**
    * Статусы пользователя
    */

   const STATUS_OK = 1;
   const STATUS_EXISTS = 100;
   const STATUS_NOT_FOUND = 10;

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
      return 'firms';
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

   public function exists($condition = [], $params = []) {
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
            return ['id' => $id, 'code' => self::STATUS_EXISTS, 'status' => TRUE];
         }
         else
            return ['id' => NULL, 'code' => self::STATUS_NOT_FOUND, 'status' => FALSE];
      }
   }

   public function saveData($attributes) {
      if (!$this->_id || empty($attributes))
         return;

      $attributesToSave = [
          'firmname' => urldecode($attributes['firmname']),
          'firmdate' => str_replace('/', '-', urldecode($attributes['firmdate'])),
          'phone' => urldecode($attributes['firmphone']),
          'fax' => urldecode($attributes['firmfax']),
          'email' => $attributes['firmemail'],
          'website' => urldecode($attributes['website']),
          'regid' => $attributes['regid'],
          'taxid' => $attributes['taxid'],
          'bank' => urldecode($attributes['bank']),
          'r_acc' => $attributes['racc'],
          'legaladdress' => urldecode($attributes['legaladdress']),
          'address' => urldecode($attributes['address'])
      ];

      $this->updateByPk($this->_id, $attributesToSave);
      $this->saveFiles($attributes);

      $this->init();
   }

   public function create($attributes, $mailsend = FALSE) {
      if (empty($attributes))
         return;

      $this->setIsNewRecord(TRUE);
      $newId = $this->save([
          'firmname' => urldecode($attributes['firmname']),
          'firmdate' => str_replace('/', '-', urldecode($attributes['firmdate'])),
          'phone' => urldecode($attributes['firmphone']),
          'fax' => urldecode($attributes['firmfax']),
          'email' => $attributes['firmemail'],
          'website' => urldecode($attributes['website']),
          'regid' => $attributes['regid'],
          'taxid' => $attributes['taxid'],
          'bank' => urldecode($attributes['bank']),
          'r_acc' => $attributes['racc'],
          'legaladdress' => urldecode($attributes['legaladdress']),
          'address' => urldecode($attributes['address'])
      ]);

      if ($newId) {
         $this->_id = $newId;
         if (!empty($attributes['tariff'])) {
            $this->saveTariff([
                'fid' => $newId,
                'tid' => $attributes['tariff'],
            ]);
         }

         if (!empty($attributes['doc1']) && !empty($attributes['doc2']) && !empty($attributes['doc3']) && !empty($attributes['doc4'])) {
            $this->saveFiles($attributes);
         }
      }
      $this->init();
      return $newId;
   }

   public function saveTariff($args) {
      if (empty($args))
         return;

      self::getDbConnection()->createCommand("INSERT INTO firms_tariff VALUES (" .
              $args['fid'] . "," .
              $args['tid'] . ")")->execute();
   }

   private function getFilePrioritet($start = 0) {
      return self::getDbConnection()->createCommand()
                      ->select("MAX(pos)")
                      ->from("firms_files")
                      ->where(
                              [
                                  "and",
                                  "id=" . $this->_id,
                                  "pos>=" . $start,
                              ]
                      )
                      ->queryScalar();
      ;
   }

   /**
    * Сохранение в базе файлов, загруженных компанией.
    *
    * @param array $args
    * @return void
    */
   public function saveFiles($args, $additional = FALSE) {
      if (empty($args))
         return;

      $helper = new \helpers\PortHelper;

      $connection = pg_connect("host=127.0.0.1 port=7891 dbname=" .
              substr(self::getDbConnection()->_dsn, strpos(self::getDbConnection()->_dsn, 'dbname=') + strlen('dbname=')) .
              " user=" . self::getDbConnection()->username . " password=" . self::getDbConnection()->password);

      if (!$additional) {
         if (!empty($args['doc1']['name']) && !empty($args['doc1']['tmp_name'])) {
            pg_exec($connection, "BEGIN;");
            $file = pg_lo_import($connection, $args['doc1']['tmp_name']);
            pg_exec($connection, "COMMIT;");

            if ($file) {
               self::getDbConnection()->createCommand("DELETE FROM firms_files WHERE id=" . $this->_id . " AND pos=1")->execute();

               self::getDbConnection()->createCommand("INSERT INTO firms_files
                  VALUES (" . $this->_id . ", " . $file . ", '" . $args['doc1']['name'] . "', '" . $args['doc1']['type'] . "', 1," . (!$args['doc1']['size'] ? 0 : $args['doc1']['size']) . ")"
               )->execute();
            }
         }

         if (!empty($args['doc2']['name']) && !empty($args['doc2']['tmp_name'])) {
            pg_exec($connection, "BEGIN;");
            $file = pg_lo_import($connection, $args['doc2']['tmp_name']);
            pg_exec($connection, "COMMIT;");

            if ($file) {
               self::getDbConnection()->createCommand("DELETE FROM firms_files WHERE id=" . $this->_id . " AND pos=2")->execute();

               self::getDbConnection()->createCommand("INSERT INTO firms_files
            VALUES (" . $this->_id . ", " . $file . ", '" . $args['doc2']['name'] . "', '" . $args['doc2']['type'] . "', 2," . (!$args['doc2']['size'] ? 0 : $args['doc2']['size']) . ")"
               )->execute();
            }
         }

         if (!empty($args['doc3']['name']) && !empty($args['doc3']['tmp_name'])) {
            pg_exec($connection, "BEGIN;");
            $file = pg_lo_import($connection, $args['doc3']['tmp_name']);
            pg_exec($connection, "COMMIT;");

            if ($file) {
               self::getDbConnection()->createCommand("DELETE FROM firms_files WHERE id=" . $this->_id . " AND pos=3")->execute();

               self::getDbConnection()->createCommand("INSERT INTO firms_files
                 VALUES (" . $this->_id . ", " . $file . ", '" . $args['doc3']['name'] . "', '" . $args['doc3']['type'] . "', 3," . (!$args['doc3']['size'] ? 0 : $args['doc3']['size']) . ")"
               )->execute();
            }
         }

         if (!empty($args['doc4']['name']) && !empty($args['doc4']['tmp_name'])) {
            pg_exec($connection, "BEGIN;");
            $file = pg_lo_import($connection, $args['doc4']['tmp_name']);
            pg_exec($connection, "COMMIT;");

            if ($file) {
               self::getDbConnection()->createCommand("DELETE FROM firms_files WHERE id=" . $this->_id . " AND pos=4")->execute();

               self::getDbConnection()->createCommand("INSERT INTO firms_files
                  VALUES (" . $this->_id . ", " . $file . ", '" . $args['doc4']['name'] . "', '" . $args['doc4']['type'] . "', 4," . (!$args['doc4']['size'] ? 0 : $args['doc4']['size']) . ")"
               )->execute();
            }
         }
      } else {
         if (!empty($args['addfiledoc']['name']) && !empty($args['addfiledoc']['tmp_name'])) {
            pg_exec($connection, "BEGIN;");
            $file = pg_lo_import($connection, $args['addfiledoc']['tmp_name']);
            pg_exec($connection, "COMMIT;");

            if ($file) {
               self::getDbConnection()->createCommand("DELETE FROM firms_files WHERE id=" . $this->_id . " AND pos=10")->execute();
               self::getDbConnection()->createCommand("INSERT INTO firms_files
                  VALUES (" . $this->_id . ", " . $file . ", '" . $args['addfiledoc']['name'] . "', '" . $args['addfiledoc']['type'] . "', 10," . (!$args['addfiledoc']['size'] ? 0 : $args['addfiledoc']['size']) . ")"
               )->execute();
            }
         }

         if (!empty($args['addpricedoc']['name']) && !empty($args['addpricedoc']['tmp_name'])) {
            pg_exec($connection, "BEGIN;");
            $file = pg_lo_import($connection, $args['addpricedoc']['tmp_name']);
            pg_exec($connection, "COMMIT;");

            if ($file) {
               self::getDbConnection()->createCommand("DELETE FROM firms_files WHERE id=" . $this->_id . " AND pos=11")->execute();
               self::getDbConnection()->createCommand("INSERT INTO firms_files
                  VALUES (" . $this->_id . ", " . $file . ", '" . $args['addpricedoc']['name'] . "', '" . $args['addpricedoc']['type'] . "', 11," . (!$args['addpricedoc']['size'] ? 0 : $args['addpricedoc']['size']) . ")"
               )->execute();
            }
         }

         $files = $helper->array_key_exists_wildcard($args, 'addfilesdoc*');
         if ($files) {
            $pos = $this->getFilePrioritet(100);
            if (!$pos)
               $pos = 100;
            foreach ($files as $file) {
               pg_exec($connection, "BEGIN;");
               $blob = pg_lo_import($connection, $file['tmp_name']);
               pg_exec($connection, "COMMIT;");

               if ($blob) {
                  self::getDbConnection()->createCommand("INSERT INTO firms_files
                  VALUES (" . $this->_id . ", " . $blob . ", '" . $file['name'] . "', '" . $file['type'] . "', " . $pos . "," . (!$file['size'] ? 0 : $file['size']) . ")"
                  )->execute();
               }
               $pos++;
            }
         }
      }
   }

   public function getFiles($id, $additional = 0, $equal = ">=") {
      if (!$this->_id && !$id)
         return;

      if (!$id)
         $id = $this->_id;

      if ($additional === 0)
         $this->files = self::getDbConnection()->createCommand()
                 ->select("*")
                 ->from("firms_files")
                 ->where("id=" . $id)
                 ->order("pos")
                 ->queryAll();
      else
         $this->files = self::getDbConnection()->createCommand()
                 ->select("*")
                 ->from("firms_files")
                 ->where([
                     "and",
                     "id=" . $id,
                     "pos" . $equal . $additional
                 ])
                 ->order("pos")
                 ->queryAll();

      return $this->files;
   }

   public function deleteFile($id) {
      if (!$id)
         return;
      self::getDbConnection()->createCommand("DELETE FROM firms_files WHERE id_blob=" . $id)->execute();
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

   public function getCurrentBalance($id) {
      if (!$this->_id && !$id)
         return;

      if (!$id)
         $id = $this->_id;

      $outcome = self::getDbConnection()->createCommand()
              ->select('SUM(summa)')
              ->from('firms_billing')
              ->where(
                      [
                          "and",
                          "id=" . $this->_id,
                          "operation_id=1",
                      ]
              )
              ->group("id")
              ->queryScalar();
      $income = self::getDbConnection()->createCommand()
              ->select('SUM(summa)')
              ->from('firms_billing')
              ->where(
                      [
                          "and",
                          "id=" . $this->_id,
                          "operation_id=2",
                      ]
              )
              ->group("id")
              ->queryScalar();
      return $income - $outcome;
   }

   public function getTariffData($id = NULL) {
      if ((!$this->_id && !$id) || empty(\Port::app()->params['modules']['tariffcatalog']['conditions']))
         return;

      if (!$id)
         $id = $this->_id;

      $tariff = self::getDbConnection()->createCommand()
              ->select("t1.tid id, t3.name, t3.comment")
              ->from("firms_tariff t1")
              ->join("catalog t2", "t1.tid=t2.idcat")
              ->join("catalogname t3", "t1.tid=t3.lkcatalogid")
              ->where(
                      [
                          "and",
                          "t1.fid=" . $id,
                      ]
              )
              ->queryRow();

      if ($tariff) {
         $conditions = self::getDbConnection()->createCommand()
                 ->select('t2.id, t1.prioritet, t3.comment')
                 ->from("goodsview t1")
                 ->join('sort t2', 't1.lksortid=t2.id')
                 ->join('sortname t3', 't1.lksortid=t3.lksortid')
                 ->where(
                         [
                             "and",
                             "t1.lkcatalogid=" . $tariff['id'],
                         ]
                 )
                 ->order('t1.prioritet')
                 ->queryAll();

         if ($conditions) {
            return array_merge($tariff, ['conditions' => $conditions]);
         }
      }
      return;
   }

   public function getProducts($id = NULL) {
      if (!$this->_id && !$id)
         return [];

      if (!$id)
         $id = $this->_id;

      $model = new FirmProduct;
      return $model->getAllByFirm($id);
   }

   public function getProduct($id = NULL) {
      if (!$this->_id && !$id)
         return [];

      $model = new FirmProduct($id, $this->_id);
      return $model->data;
   }

   public function saveProduct($args, $isNew = FALSE) {
      if (!$args)
         return;

      if ($isNew) {
         $model = new FirmProduct(NULL, $this->_id);
         return $model->create($args);
      } else {
         if (isset($args['id'])) {
            $model = new FirmProduct($args['id'], $this->_id);
            $model->saveItem($args);
         }
      }
   }

   public function deleteProduct($id) {
      if (!$id)
         return;

      $model = new FirmProduct($id, $this->_id);
      $model->deleteItem();
   }

   public function deleteProductImage($id) {
      if (!$id)
         return;

      $model = new FirmProduct;
      $model->deleteImage($id);
   }

   public function deleteImage($id) {
      if (!$id)
         return;

      self::getDbConnection()->createCommand("DELETE FROM firms_images WHERE id_blob=:id")->execute(["id" => $id]);
   }

   public function saveRepresent($attributes) {
      if (!$attributes)
         return;

      $attributesToSave = [
          'description' => urldecode($attributes['description'])
      ];

      $this->updateByPk($this->_id, $attributesToSave);
      $this->saveFiles($attributes, TRUE);
      $this->saveImages($this->_id, $attributes);

      $this->init();
   }

   private function getImagePrioritet() {
      if (!$this->_id)
         return 1;

      return self::getDbConnection()->createCommand()
                      ->select("MAX(pos)")
                      ->from("firms_images")
                      ->where(
                              [
                                  "and",
                                  "id=" . $this->_id,
                              ]
                      )
                      ->queryScalar();
   }

   public function getImages($id = NULL) {
      if (!$id && !$this->_id)
         return;
      if (!$id)
         $id = $this->_id;

      $images = self::getDbConnection()->createCommand()
              ->select("*")
              ->from("firms_images")
              ->where(
                      [
                          "and",
                          "id=" . $id,
                      ]
              )
              ->order("pos")
              ->queryAll();

      if ($images) {
         $image = new \helpers\PortImage;
         for ($i = 0; $i < count($images); $i++) {
            $imageData = $image->prepareImage([
                'img' => $images[$i]['id_blob'],
                'img_type' => $images[$i]['image_ext'],
                'img_alt' => $images[$i]['image_name'],
                'img_align' => NULL,
            ]);
            $images[$i]['image_ext'] = $imageData['img_type'];
         }
         return $images;
      }

      return;
   }

   private function saveImages($id = NULL, $args, $clear = FALSE) {
      if (!$args || (!$id && !$this->_id))
         return;
      if (!$id)
         $id = $this->_id;

      if ($clear === TRUE) {
         self::getDbConnection()->createCommand("DELETE FROM firms_images WHERE id=" . $id)->execute();
      }

      $helper = new \helpers\PortHelper;

      $connection = pg_connect("host=127.0.0.1 port=7891 dbname=" .
              substr(self::getDbConnection()->_dsn, strpos(self::getDbConnection()->_dsn, 'dbname=') + strlen('dbname=')) .
              " user=" . self::getDbConnection()->username . " password=" . self::getDbConnection()->password);

      $images = $helper->array_key_exists_wildcard($args, 'image*');

      if ($images) {
         $pos = $this->getImagePrioritet();
         if (!$pos)
            $pos = 1;
         foreach ($images as $image) {
            pg_exec($connection, "BEGIN;");
            $blob = pg_lo_import($connection, $image['tmp_name']);
            pg_exec($connection, "COMMIT;");

            if ($blob) {
               self::getDbConnection()->createCommand("INSERT INTO firms_images
                  VALUES (" . $id . ", " . $blob . ", '" . $image['name'] . "', '" . $image['type'] . "', " . $pos . "," . (!$image['size'] ? 0 : $image['size']) . ")"
               )->execute();
            }
            $pos++;
         }
      }
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

         $firmToSession = $this->getAttributes();
         $firmToSession['id'] = $this->_id;
         $firmToSession['tariff'] = $this->getTariffData($this->_id);
         \Port::app()->getSession()->add('Firm', $firmToSession);
      }
   }

}

class FirmProduct extends PortRecord {

   public $localeData = [];
   private $_attributes = [];
   public $_id;
   public $firmId;
   public $_castAssistant;
   public $data;

   /**
    * Конструктор
    *
    * @param int $id
    */
   public function __construct($id = NULL, $firmId = NULL) {
      $this->_id = $id;
      $this->firmId = $firmId;
      $this->_attributes = $this->getMetaData($this->tableName())->attributeDefaults;
      $this->setIsNewRecord($this->_id === NULL);
      $this->_castAssistant = new \helpers\PortPropertyValue;
      $this->init();
   }

   public function tableName() {
      return 'firms_production_items';
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

   public function getAllByFirm($id) {
      if (!$id)
         return [];

      $goods = self::getDbConnection()->createCommand()
              ->select("t1.prioritet, t2.*")
              ->from("firms_production t1")
              ->join('firms_production_items t2', 't1.prodid=t2.id')
              ->where(
                      [
                          "and",
                          "t1.fid=" . $id,
                      ]
              )
              ->order('t1.prioritet')
              ->queryAll();

      if ($goods) {
         for ($i = 0; $i < count($goods); $i++) {
            $item = self::getDbConnection()->createCommand()
                    ->select("*")
                    ->from("firms_production_images")
                    ->where(
                            [
                                "and",
                                "id=" . $goods[$i]['id'],
                            ]
                    )
                    ->order('pos')
                    ->limit(1)
                    ->queryRow();

            if ($item) {
               $image = new \helpers\PortImage;
               $imageData = $image->prepareImage([
                   'img' => $item['id_blob'],
                   'img_type' => $item['image_ext'],
                   'img_alt' => $item['image_name'],
                   'img_align' => NULL,
               ]);

               $goods[$i]['img'] = $imageData['img'];
               $goods[$i]['img_ext'] = $imageData['img_type'];
            } else {
               $productDefaultImage = $this->getDefaultImage('productDefaultImage');
               if ($productDefaultImage) {
                  $goods[$i]['img'] = $productDefaultImage['img'];
                  $goods[$i]['img_ext'] = $productDefaultImage['img_type'];
               } else {
                  $goods[$i]['img'] = $goods[$i]['img_ext'] = NULL;
               }
            }
         }
         return $goods;
      }
      return [];
   }

   public function getDefaultImage($key) {
      if (empty(\Port::app()->params['options']['design']['rootId']) || empty(\Port::app()->params['options']['design']['user_interactions'][$key]))
         return;

      $_rawData = self::getDbConnection()->createCommand()
              ->select('t3.img, t3.img_type, t3.img_alt')
              ->from('goodsview t1')
              ->join('sort t2', 't1.lksortid=t2.id')
              ->join('sortname t3', 't1.lksortid=t3.lksortid')
              ->where(
                      [
                          "and",
                          "t1.lkcatalogid=" . \Port::app()->params['options']['design']['rootId'],
                          "t1.prioritet=" . \Port::app()->params['options']['design']['user_interactions'][$key]
                      ]
              )
              ->queryRow();

      return [
          'img' => $_rawData['img'],
          'img_type' => $_rawData['img_type'],
      ];
   }

   public function create($args) {
      if (!$args)
         return;

      $this->setIsNewRecord(TRUE);
      $newId = $this->save([
          'name' => urldecode($args['name']),
          'artikul' => !empty($args['artikul']) ? urldecode($args['artikul']) : NULL,
          'price' => !empty($args['price']) ? urldecode($args['price']) : NULL,
          'description' => !empty($args['description']) ? urldecode($args['description']) : NULL,
          'minimum_lot' => !empty($args['minimum_lot']) ? urldecode($args['minimum_lot']) : 1,
      ]);

      if ($newId) {
         $this->linkToFirm($newId, $this->firmId);
         $this->saveImages($newId, $args);
      }
   }

   public function saveItem($args) {
      if (!$args || !$this->_id)
         return;

      $args['name'] = urldecode($args['name']);
      if (!empty($args['artikul']))
         $args['artikul'] = urldecode($args['artikul']);
      if (!empty($args['description']))
         $args['description'] = urldecode($args['description']);

      $this->updateByPk($this->_id, $args);
      $this->saveImages($this->_id, $args);
   }

   private function getPrioritet($firmId) {
      if (!$firmId)
         return 1;

      return self::getDbConnection()->createCommand()
                      ->select("MAX(prioritet)")
                      ->from("firms_production")
                      ->where(
                              [
                                  "and",
                                  "fid=" . $firmId,
                              ]
                      )
                      ->queryScalar();
      ;
   }

   private function getImagePrioritet() {
      if (!$this->_id)
         return 1;

      return self::getDbConnection()->createCommand()
                      ->select("MAX(pos)")
                      ->from("firms_production_images")
                      ->where(
                              [
                                  "and",
                                  "id=" . $this->_id,
                              ]
                      )
                      ->queryScalar();
   }

   private function saveImages($id = NULL, $args, $clear = FALSE) {
      if (!$args || (!$id && !$this->_id))
         return;
      if (!$id)
         $id = $this->_id;

      if ($clear === TRUE) {
         self::getDbConnection()->createCommand("DELETE FROM firms_production_images WHERE id=" . $id)->execute();
      }

      $helper = new \helpers\PortHelper;

      $connection = pg_connect("host=127.0.0.1 port=7891 dbname=" .
              substr(self::getDbConnection()->_dsn, strpos(self::getDbConnection()->_dsn, 'dbname=') + strlen('dbname=')) .
              " user=" . self::getDbConnection()->username . " password=" . self::getDbConnection()->password);

      $images = $helper->array_key_exists_wildcard($args, 'image*');

      if ($images) {
         $pos = $this->getImagePrioritet();
         foreach ($images as $image) {
            pg_exec($connection, "BEGIN;");
            $blob = pg_lo_import($connection, $image['tmp_name']);
            pg_exec($connection, "COMMIT;");

            if ($blob) {
               self::getDbConnection()->createCommand("INSERT INTO firms_production_images
                  VALUES (" . $id . ", " . $blob . ", '" . $image['name'] . "', '" . $image['type'] . "', " . $pos . "," . (!$image['size'] ? 0 : $image['size']) . ")"
               )->execute();
            }
            $pos++;
         }
      }
   }

   private function getImages($id = NULL) {
      if (!$id && !$this->_id)
         return;
      if (!$id)
         $id = $this->_id;

      $images = self::getDbConnection()->createCommand()
              ->select("*")
              ->from("firms_production_images")
              ->where(
                      [
                          "and",
                          "id=" . $id,
                      ]
              )
              ->order("pos")
              ->queryAll();

      if ($images) {
         $image = new \helpers\PortImage;
         for ($i = 0; $i < count($images); $i++) {
            $imageData = $image->prepareImage([
                'img' => $images[$i]['id_blob'],
                'img_type' => $images[$i]['image_ext'],
                'img_alt' => $images[$i]['image_name'],
                'img_align' => NULL,
            ]);
            $images[$i]['image_ext'] = $imageData['img_type'];
         }
         return $images;
      }

      return;
   }

   private function linkToFirm($id, $firmId) {
      if (!$id || !$firmId)
         return;

      self::getDbConnection()->createCommand("INSERT INTO firms_production VALUES (" .
              $firmId . "," .
              $id . "," .
              ($this->getPrioritet($firmId) + 1) . ")")->execute();
   }

   public function deleteImage($id) {
      if (!$id)
         return;

      self::getDbConnection()->createCommand("DELETE FROM firms_production_images WHERE id_blob=:id")->execute(["id" => $id]);
   }

   public function deleteItem() {
      if (!$this->_id)
         return;

      self::getDbConnection()->createCommand("DELETE FROM firms_production_images WHERE id=:id")->execute(["id" => $this->_id]);
      self::getDbConnection()->createCommand("DELETE FROM firms_production WHERE prodid=:id")->execute(["id" => $this->_id]);
      self::getDbConnection()->createCommand("DELETE FROM " . $this->tableName() . " WHERE id=:id")->execute(["id" => $this->_id]);
   }

   public function init() {
      if (!$this->_id)
         return;

      $this->data = self::getDbConnection()->createCommand()
              ->select("*")
              ->from($this->tableName())
              ->where(
                      [
                          "and",
                          "id=" . $this->_id,
                      ]
              )
              ->queryRow();

      $this->data['images'] = $this->getImages();
   }

}
