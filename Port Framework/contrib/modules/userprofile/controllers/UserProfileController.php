<?php

/**
* Класс UserProfileController
*
* @author A.Shenderov (ashenderov@yandex.ru)
*/
class UserProfileController extends \components\PortSiteController {

   public $layout = '';
   public $content;

   public function actionIndex() {

      if (!\Port::app()->getSession()->contains('User')) {
         \Port::app()->getRequest()->redirect('/', TRUE);
      }

      $model = $this->getModule()->getModel('UserProfileModel');
      $this->setPageTitle('Мой аккаунт');
      $this->setPageName('Мой аккаунт');

      if (\Port::app()->getRequest()->getIsAjaxRequest()) {
         if (\Port::app()->getRequest()->getPost("action") === "saveuser") {
            $model->saveData(\Port::app()->getRequest()->getRestParams());
         }
      } else {
         if (isset(\Port::app()->params['modules'][$this->getModule()->getId()]['menu'])) {
            $menuModel = $this->getModule()->getModel('ProfileMenuModel');
            $menuModel->setAttributes(\Port::app()->params['modules'][$this->getModule()->getId()]['menu']);
            $this->content['profile_menu'] = $this->render('profilemenu', $menuModel->load(), TRUE);
            $this->setPageTitle($menuModel->current()['name']);
            $this->setPageName($menuModel->current()['name']);
            $this->content['pageTitle'] = empty($menuModel->current()['title']) ? $this->getPageTitle() : $menuModel->current()['title'];
            $this->content['pageName'] = empty($menuModel->current()['title']) ? $this->getPageName() : $menuModel->current()['title'];
            $this->content['showPageTitle'] = TRUE;
            $this->content['profile_content'] = $this->render($menuModel->current()['view'], $model->loadItems($menuModel->current()['method']), TRUE);
         }

         $this->getModule()->output = $this->render('userprofile', array_merge($this->content, \Port::app()->content));
      }
   }

}
