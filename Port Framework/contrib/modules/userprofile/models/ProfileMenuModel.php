<?php

/**
 * Класс ProfileMenuModel
 * @author A.Shenderov (ashenderov@yandex.ru)
 */
class ProfileMenuModel extends \common\PortModel {

   private $_attributes;
   private $_data;
   private $_current;

   public function setAttributes($values = [], $safeOnly = FALSE) {
      if (!$values)
         return;

      foreach ($values as $key => $value)
         $this->_attributes[$key] = $value;
   }

   public function attributeNames($args = []) {
      return array_keys($args);
   }

   public function load() {
      if (empty($this->_attributes))
         return [];

      $this->_data = [];
      $url = trim(\Port::app()->getRequest()->getRequestUri(), '/');
      $uri = explode('/', $url);
      $_mi = new \components\collections\PortListIterator($this->_attributes);

      do {
         $item = $_mi->current();
         $_mi->next();

         if ($item['url'] === $url) {
            $this->_current = $item;
            $this->_current['method'] = NULL;

            $this->_data[] = [
                'name' => $item['name'],
                'url' => NULL,
            ];
         } else {
            if (end($uri) === 'edit') {
               if ($item['url'] === implode('/', array_slice($uri, 0, count($uri) - 1))) {
                  $this->_data[] = [
                      'name' => $item['name'],
                      'url' => NULL,
                  ];

                  $this->_current = $item;
                  if (!empty($this->_current['title_edit'])) {
                     $this->_current['title'] = $this->_current['title_edit'];
                  } else {
                     $this->_current['title'] = $this->_current['name'];
                  }
                  $this->_current['view'] = !empty($this->_current['edit']) ? $this->_current['edit'] : $this->_current['view'];
               } else {
                  $this->_data[] = [
                      'name' => $item['name'],
                      'url' => DIRECTORY_SEPARATOR . $item['url'],
                  ];
               }
            } elseif (end($uri) === 'new') {
               if ($item['url'] === implode('/', array_slice($uri, 0, count($uri) - 1))) {
                  $this->_data[] = [
                      'name' => $item['name'],
                      'url' => NULL,
                  ];

                  $this->_current = $item;
                  if (!empty($this->_current['title_new'])) {
                     $this->_current['title'] = $this->_current['title_new'];
                  } elseif (!empty($this->_current['title_edit'])) {
                     $this->_current['title'] = $this->_current['title_edit'];
                  } else {
                     $this->_current['title'] = $this->_current['name'];
                  }

                  $this->_current['view'] = !empty($this->_current['new']) ? $this->_current['new'] : !empty($this->_current['edit']) ? $this->_current['edit'] : $this->_current['view'];
                  $this->_current['method'] = NULL;
               } else {
                  $this->_data[] = [
                      'name' => $item['name'],
                      'url' => DIRECTORY_SEPARATOR . $item['url'],
                  ];
               }
            } else {
               if ($item['url'] === $url) {
                  $this->_current = $item;
                  $this->_current['method'] = NULL;
               }

               $this->_data[] = [
                   'name' => $item['name'],
                   'url' => DIRECTORY_SEPARATOR . $item['url'],
               ];
            }
         }
      } while ($_mi->valid());

      return ['menu' => $this->_data];
   }

   public function current() {
      return $this->_current;
   }

}
