<?php

/**
 * Класс UserProfileModel
 * @author A.Shenderov (ashenderov@yandex.ru)
 */
class UserProfileModel extends \components\models\PortUser {

   public $_id;
   public $user;
   public $address;
   public $orders;
   public $finalData;
   private $_hash;
   private $_totalSum;
   private $_dateAssistant;

   /**
    * Конструктор
    *
    * @param int $id
    */
   public function __construct($id = NULL) {
      $this->_id = \Port::app()->getSession()->itemAt('User') ? \Port::app()->getSession()->itemAt('User')['id'] : NULL;
      $this->_hash = \Port::app()->getRequest()->cookies->itemAt(\Port::app()->cookiePrefix . '_cart')->value;
      $this->_dateAssistant = new \helpers\PortFormatter;
      $this->init();
   }

   public function loadItems($args = NULL) {
      if (!$args) {
         $this->prepareItems();
      } else {
         $this->{$args}();
      }
      return $this->finalData;
   }

   public function prepareItems() {
      $this->finalData['currency_label'] = \Port::app()->params['options']['currency']['short_label'];
      $this->finalData['user'] = $this->attributes;

      if (!empty($this->legal->data)) {
         $this->finalData['user'] = array_merge($this->finalData['user'], $this->legal->data);
      }

      $legal_address = [];
      if (!empty($this->address->data)) {
         $_adri = new \components\collections\PortListIterator($this->address->data);
         do {
            $item = $_adri->current();
            $_adri->next();

            if ($item['post_address'] === TRUE || $adri->count() == 1) {
               $this->finalData['address'][] = array_merge($item, [
                   'address' => $this->getSplitAddress($item)
               ]);
            } else {
               $legal_address = $item;
            }
         } while ($_adri->valid());
      }

      if ($legal_address) {
         $this->finalData['user'] = array_merge($this->finalData['user'], $legal_address);
      } else {
         if ($this->finalData['user']['customer_type'] == self::CUSTOMER_LEGAL && isset($this->finalData['address'][0])) {
            $this->finalData['user'] = array_merge($this->finalData['user'], $this->finalData['address'][0]);
         } else if (isset($this->finalData['address'][0])) {
            $this->finalData['user'] = array_merge($this->finalData['user'], $this->finalData['address'][0]);
         }
      }

      if ($this->finalData['user']['customer_type'] == self::CUSTOMER_LEGAL && isset(\Port::app()->params['options']['legalTypes'])) {
         $this->finalData['legalTypes'] = \Port::app()->params['options']['legalTypes'];
      }

      $distribution = new \components\models\UserSubscription;
      $_distribution = $distribution->getThemes($this->_id);
      $this->finalData['distribution'] = $distribution->getThemes($this->_id);

      $this->orders = $this->getOrdersHistory();
      if ($this->orders) {
         $_ordi = new \components\collections\PortListIterator($this->orders);
         do {
            $item = $_ordi->current();
            $_ordi->next();

            $this->finalData['orders'][] = [
                'id' => $item['id'],
                'date' => $this->_dateAssistant->prepareDateFormat($item['crt_time'], 'medium'),
                'full_price' => number_format($item['full_price'], 2, '.', ''),
            ];
         } while ($_ordi->valid());
      }
   }

   public function loadUserData() {
      if ($this->user = $this->getAttributes()) {
         $this->finalData['user'] = $this->user;
         if (!empty($this->legal->data)) {
            $this->finalData['user'] = array_merge($this->finalData['user'], $this->legal->data);
         }

         $legal_address = [];
         if (!empty($this->address->data)) {
            $_adri = new \components\collections\PortListIterator($this->address->data);
            do {
               $item = $_adri->current();
               $_adri->next();
               if ($item['post_address'] === FALSE) {
                  $legal_address = $item;
               }
            } while ($_adri->valid());
         }

         if ($legal_address) {
            $this->finalData['user'] = array_merge($this->finalData['user'], $legal_address);
         }

         if (isset(\Port::app()->params['options']['legalTypes'])) {
            $this->finalData['legalTypes'] = \Port::app()->params['options']['legalTypes'];
         }
      }
   }

   private function getOrderSum($id) {
      if (!$id)
         return;

      return \Port::app()->db->createCommand()
                      ->select('full_price')
                      ->from('order_orders')
                      ->where(
                              [
                                  "and",
                                  "order_id=" . $id,
                              ]
                      )
                      ->queryScalar();
   }

   private function getSplitAddress($args) {
      if (!$args)
         return NULL;

      if (is_string($args))
         return $args;
      else {
         $_addressStructure = [
             $args['city'],
             $args['street'],
             ($args['bldng'] !== NULL ? 'д.' . $args['bldng'] : $args['bldng']),
             ($args['corp'] !== NULL ? 'к.' . $args['corp'] : $args['corp']),
             ($args['apartment'] !== NULL ? 'кв.' . $args['apartment'] : $args['apartment']),
         ];

         return implode(', ', array_filter($_addressStructure));
      }
   }

   public function getOrdersHistory() {
      if ($this->_id) {
         return \Port::app()->db->createCommand()
                         ->select('*')
                         ->from('order_orders')
                         ->where(
                                 [
                                     "and",
                                     "id_client=" . $this->_id,
                                     "isreal",
                                 ]
                         )
                         ->order('crt_time DESC')
                         ->queryAll();
      }
   }

   public function loadOrderGoods($args = []) {
      if (!$args) {
         $_rawData = new \components\models\PortCart($this->_hash);
         if (isset($_rawData->goodsList) && $_rawData->goodsList instanceof \components\collections\PortMap) {
            $args = $_rawData->goodsList;
         }
      }

      $_ci = $args->getIterator();
      do {
         $rowData = [];
         $item = $_ci->current();
         $_ci->next();

         $rowData = [
             'order_id' => $this->_id,
             'good_id' => $item['lkgoodsid'],
             'catalog_id' => $item['lkcatalogid'],
             'qty' => $item['volume'],
             'price' => number_format($this->getPrice($item), 2, '.', ''),
             'brand_id' => $this->getBrand($item['lkgoodsid'])['id'],
             'brand_name' => $this->getBrand($item['lkgoodsid'])['name'],
         ];

         $plu = [];
         $options = [
             'id' => NULL,
             'art' => NULL,
             'name' => NULL,
             'price' => NULL,
         ];

         if ($item['options']) {
            $options = unserialize($item['options']);
            if ($options['art'] === 'delivery') {
               $this->_delivery = [
                   'id' => $options['id'],
                   'name' => $options['name'],
                   'cost' => $options['price'],
               ];
            } else {
               $plu['art'] = $options['art'];
               $plu['options'] = $item['options'];
            }
         }

         $rowData = array_merge($rowData, $plu);

         $rowData['sum'] = number_format($rowData['qty'] * $rowData['price'], 2, '.', '');
         $this->_totalSum += $rowData['sum'];

         $article = new \components\models\PortArticle($item['lkgoodsid'], $item['lkcatalogid']);

         $imageData = [
             'img' => NULL,
             'img_type' => NULL,
             'img_alt' => NULL,
             'img_align' => NULL
         ];

         $rowData['name'] = NULL;
         $rowData['art'] = NULL;

         if ($article) {
            $rowData['name'] = $article->getAttribute('name');
            $rowData['art'] = !$rowData['art'] ? $article->getAttribute('text_art') : $rowData['art'];

            $image = new \helpers\PortImage;
            $imageData = $image->prepareImage([
                'img' => $article->getAttribute('img'),
                'img_type' => $article->getAttribute('img_type'),
                'img_alt' => $article->getAttribute('img_alt'),
                'img_align' => $article->getAttribute('img_align'),
                'force' => TRUE,
            ]);
         }

         $rowData = array_merge($rowData, $imageData);

         if ($options['art'] !== 'delivery')
            $this->finalData['goods'][] = $rowData;
      } while ($_ci->valid());
   }

   public function loadAddressData() {
      if (empty($this->address->data))
         return;

      $_adri = new \components\collections\PortListIterator($this->address->data);
      do {
         $item = $_adri->current();
         $_adri->next();
         if ($item['id'] == \Port::app()->getSession()->itemAt('ProfileAddressId'))
            return $this->finalData['address'] = $item;
      } while ($_adri->valid());
   }

   public function saveData($args) {
      if (!$args) {
         return ['status' => false];
      }

      if (!empty($args['action'])) {
         $user = new \components\models\PortUser($this->_id);
         $user->init();

         if ($args['action'] === 'saveuser') {
            $_save = [
                'firstname' => urldecode($args['firstname']),
                'lastname' => urldecode($args['lastname']),
                'phone1' => urldecode($args['phone1']),
            ];
            if (!empty($args['password'])) {
               $_save = array_merge($_save, ['password' => $args['password']]);
            }
            $this->updateByPk($this->_id, $_save);

            if ($user->getAttribute('legal')) {
               $user->getAttribute('legal')->updateByPk($args['legal_id'], [
                   'b_type' => urldecode($args['legaltypes']),
                   'firm_name' => urldecode($args['firmname']),
                   'inn' => $args['inn'],
                   'kpp' => $args['kpp'],
                   'ogrn' => $args['ogrn'],
                   'r_acc' => $args['racc'],
                   'kr_acc' => $args['cacc'],
                   'bank' => urldecode($args['bank']),
                   'bik' => $args['bik']
               ]);
               $user->getAttribute('legal')->refresh();

               $user->getAttribute('address')->updateByPk($args['address_id'], [
                   'crttime' => 'now()',
                   'zip' => $args['zipcode'],
                   'region' => urldecode($args['region']),
                   'city' => urldecode($args['city']),
                   'street' => urldecode($args['street']),
                   'bldng' => urldecode($args['bldn']),
                   'apartment' => urldecode($args['office']),
                   'section' => isset($args['section']) ? urldecode($args['section']) : NULL,
                   'floor' => isset($args['floor']) ? urldecode($args['floor']) : NULL,
                   'intercom' => isset($args['intercom']) ? urldecode($args['intercom']) : NULL,
               ]);
               $user->getAttribute('address')->refresh();
            }

            if ($args['subscribe'] == 'true') {
               self::getDbConnection()->createCommand("DELETE FROM news_subscriber_theme WHERE ids=" . $this->_id)->execute();
               $themes = self::getDbConnection()->createCommand()
                       ->select('*')
                       ->from("news_theme")
                       ->where(
                               [
                                   "and",
                                   "show_theme",
                               ]
                       )
                       ->queryAll();

               if ($themes) {
                  $_thi = new \components\collections\PortListIterator($themes);
                  do {
                     $theme = $_thi->current();
                     $_thi->next();
                     self::getDbConnection()->createCommand("INSERT INTO news_subscriber_theme VALUES(" . $this->_id . ", " . $theme['id'] . ")")->execute();
                  } while ($_thi->valid());
               }
            } else if ($args['subscribe'] == 'false') {
               self::getDbConnection()->createCommand("DELETE FROM news_subscriber_theme WHERE ids=" . $this->_id)->execute();
            }
            return ['status' => TRUE];
         } elseif ($args['action'] === 'saveaddress') {
            $address = NULL;

            $addressToSave = [
                'id_client' => $this->_id,
                'crttime' => 'now()',
                'zip' => $args['zip'],
                'region' => urldecode($args['region']),
                'city' => urldecode($args['city']),
                'street' => urldecode($args['street']),
                'bldng' => urldecode($args['bldng']),
                'apartment' => urldecode($args['apartment']),
                'section' => isset($args['section']) ? urldecode($args['section']) : NULL,
                'floor' => isset($args['floor']) ? urldecode($args['floor']) : NULL,
                'intercom' => isset($args['intercom']) ? urldecode($args['intercom']) : NULL,
                'post_address' => TRUE,
            ];

            $_addressId = NULL;

//            if ($user->getAttribute('address') && !$_addressId = $user->getAttribute('address')->contains($addressToSave) && !$args['id']) {
            if ($user->getAttribute('address') && !$args['id']) {
               $user->getAttribute('address')->setIsNewRecord(TRUE);
               $user->getAttribute('address')->save($addressToSave);
               $user->getAttribute('address')->refresh();
               return ['status' => TRUE];
            } else {
//               if ($_addressId || $args['id']) {
               if ($args['id']) {
                  $user->getAttribute('address')->updateByPk($args['id'], $addressToSave);
                  $user->getAttribute('address')->refresh();
               } else {
                  $user->setAttribute('address', new \components\models\UserAddress($this->_id));
                  $user->getAttribute('address')->setIsNewRecord(TRUE);
                  $user->getAttribute('address')->save($addressToSave);
                  $user->getAttribute('address')->refresh();
               }
               return ['status' => TRUE];
            }
         } elseif ($args['action'] === 'setaddress' && isset($args['id']) && $args['id']) {
            $user->getAttribute('address')->updateByPk($args['id'], ['crttime' => 'now()']);
            $user->getAttribute('address')->refresh();
         } elseif ($args['action'] === 'removeaddress' && isset($args['id']) && $args['id']) {
            $user->getAttribute('address')->deleteRow($args['id']);
            $user->getAttribute('address')->refresh();
         }
      }

      return ['status' => false];
   }

}
