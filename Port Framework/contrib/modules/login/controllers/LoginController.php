<?php

/**
* Класс LoginController
* @author A.Shenderov (ashenderov@yandex.ru)
*/
class LoginController extends \components\PortSiteController {

   public $layout = '';
   public $content;

   public function init() {
      $this->setPageTitle('Авторизация');
      $this->setPageName('Авторизация');
      $this->content = [
          'pageTitle' => $this->getPageTitle(),
          'pageName' => $this->getPageName(),
          'reconfirm_url' => \Port::app()->urlPrefix . 're-confirm',
          'pass_recover_url' => \Port::app()->urlPrefix . 'password-recover',
          'register_url' => \Port::app()->urlPrefix . 'register',
          'showPageTitle' => TRUE,
      ];
   }

   public function actionIndex() {
      if (\Port::app()->getRequest()->getIsAjaxRequest()) {
         if (\Port::app()->getRequest()->getPost("action") === "userauth") {
            /**
             * Авторизация пользователя
             */
            $model = new \components\models\PortUser;
            $model->setAttribute('login', \Port::app()->getRequest()->getPost('login'));
            $model->setAttribute('password', \Port::app()->getRequest()->getPost('password'));
            $authCode = $model->auth();
            $url = !\Port::app()->getSession()->contains('User') ? [] : ['url' => '/profile'];
            if (!is_array($authCode)) {
               if (isset(\Port::app()->params['modules']['login']['states'][$authCode])) {
                  echo json_encode(array_merge(\Port::app()->params['modules']['login']['states'][$authCode], $url), JSON_UNESCAPED_UNICODE);
               }
            } else {
               echo json_encode(array_merge($authCode, $url), JSON_UNESCAPED_UNICODE);
            }
         }
      } else {
         $this->getModule()->output = $this->render('loginform', array_merge($this->content, \Port::app()->content));
      }
   }

}
