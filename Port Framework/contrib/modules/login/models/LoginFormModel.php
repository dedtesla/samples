<?php

/**
 * Класс LoginFormModel
 * @author A.Shenderov (ashenderov@yandex.ru)
 */
class LoginFormModel extends \components\models\PortUser {

   public $_id;

   public function login() {
      if ($this->getAttribute('login') && $this->getAttribute('password')) {
         $this->_id = \Port::app()->db->createCommand()
                 ->select('id')
                 ->from($this->tableName())
                 ->where(
                         [
                             "and",
                             "lower(login)='" . $this->getAttribute('login') . "'",
                             "passwd='" . md5($this->getAttribute('password')) . "'",
                             "confirm"
                         ]
                 )
                 ->queryScalar();

         if (!$this->_id) {
            $this->_id = \Port::app()->db->createCommand()
                    ->select('id')
                    ->from($this->tableName())
                    ->where(
                            [
                                "and",
                                "lower(login)='" . $this->getAttribute('login') . "'",
                                "passwd='" . md5($this->getAttribute('password')) . "'",
                                "NOT confirm"
                            ]
                    )
                    ->queryScalar();

            if ($this->_id)
               return 'userNotConfirmed';
         }
         else {
            $user = new \components\models\PortUser($this->_id);
            \Port::app()->getSession()->add('User', [
                'id' => $user->_id,
                'login' => $user->getAttribute('login'),
                'name' => $user->getAttribute('firstname'),
                'lastname' => $user->getAttribute('lastname'),
                'midname' => $user->getAttribute('middlename'),
                'phone' => $user->getAttribute('phone1'),
                'registerDate' => $user->getAttribute('crttime'),
                'status' => $user->getAttribute('status3'),
                'customer_type' => $user->getAttribute('customer_type'),
            ]);

            return \Port::app()->user = $user;
         }
      }
      return;
   }

}
