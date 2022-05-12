<?php

namespace components;

use components\exception;
use components\models;
use components\cache;

/**
 * Port
 *
 * @category   Port
 * @package    core
 * @author A.Shenderov (ashenderov@yandex.ru)
 * 
 */

/**
 * PortSiteApplication класс приложений с опцией typeApplication === cms.
 *
 * @property boolean $isDemo Флаг сайта-шаблона для демонстрации.
 * @package core.components
 */
class PortSiteApplication extends \common\PortApplication {

   public $defaultController = 'main';
   public $layout = 'standard';
   public $pageId;
   public $Page404Id;
   public $pageType = PAGE_CATALOG;
   public $pageCatalog;
   public $pageArticle;
   public $content;
   public $cookiePrefix;
   public $cookies;
   public static $user;
   public $name;
   public $castHelper;
   public $keywords;
   public $description;
   public $theme = 0;
   public $designTemplate;
   public $localeID = 1;
   public $urlPrefix = '/';
   public $isDemo = false;
   public $isShopCatalog = false;
   public $isBrand = false;
   public $classificator;
   public $atHome = false;
   public $proto = 'http:';
   public $backUrl;
   public $yaCassa;
   private $_css;

   public function __construct($config = null) {
      \Port::setApplication($this);
      parent::__construct($config);

      /*
       * Текущий протокол сайта
       */
      $this->proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443 ? 'https:' : 'http:';

      if (strpos($_SERVER['HTTP_HOST'], 'www.') === FALSE) {
         header('HTTP/1.1 301 Moved Permanently', TRUE, 301);
         header('Location: ' . $this->proto . '//' . '//www.' . $_SERVER['HTTP_HOST'] . $this->getRequest()->getUrl());
         exit;
      }

      /*
       * Подключение и настройка компонентов сайта
       */
      if (isset($config['components'])) {
         $this->tuneComponents($config['components']);
      }

      /*
       * Регистрация проекта по данным в диспетчерской базе данных.
       * Отсутствие проекта или его блокировка вызывают соответствующие исключения.
       */
      $project = new \components\models\PortProject($this->getId());
      if ($project->getAttribute('id') === NULL) {
         throw new exception\PortHttpException(404, \Port::t('port', 'Сайт не найден.'));
      } elseif ($project->getAttribute('admin_block') == TRUE) {
         throw new exception\PortHttpException(404, \Port::t('port', 'Сайт заблокирован.'));
      }

      /*
       * Инициализация проекта как ключевого объекта сайта.
       */
      $this->setProject($project);
      /*
       * Инициализация базы данных проекта.
       */
      $this->setDb($this->getProject());
      /*
       * Регистрация идентификатора проекта.
       */
      $this->setId($this->getProject()->itemAt('id'));
      /*
       * Регистрация наименования проекта.
       */
      $this->name = mb_convert_encoding($this->getProject()->itemAt('name'), 'UTF-8', 'windows-1251');
      /*
       * Регистрация префикса кук - всегда доменное имя текущего сайта (без 'www').
       */
      $this->cookiePrefix = explode('.', str_replace('www.', '', $this->getAppUrl()))[0];
      /*
       * Регистрация префикса для системы кеширования - всегда соответствует префиксу кук.
       */
      $this->cache->keyPrefix = $this->cookiePrefix;
      /*
       * Регистрация кук текущего сайта.
       */
      $this->cookies = $this->getRequest()->getCookies();
      /*
       * Регистрация и кеширование таблицы стилей сайта.
       */
      $this->getCss();
      /*
       * Регистрация объекта-помощника для работы с типами данных.
       */
      $this->castHelper = new \helpers\PortPropertyValue;
      /*
       * Настройка данных локализациидля текущего сайта.
       */
      $project->setLocalData();
      /*
       * Регистрация шаблона текущего сайта.
       */
      $this->designTemplate = $project->getDesignTemplate();
      /*
       * Регистрация классификатора текущего сайта.
       */
      $this->classificator = $project->getClassificatorOptions();
      /*
       * Установка флага, указывающего является ли текущий сайт демо-версией проекта.
       */
      $this->isDemo = isset($this->params['studio'][$this->getProject()->itemAt('id_group')]) &&
              $this->getProject()->itemAt('id') !== $this->params['studio'][$this->getProject()->itemAt('id_group')]['rootProjectId'] &&
              $this->getProject()->itemAt('files') === TRUE;
      /*
       * Регистрация системы онлайн-эквайринга.
       */
      $this->yaCassa = $project->checkOnlinePaymentOption();
      /*
       * Регистрация абсолютного пути к разделу индексных файлов шаблона текущего сайта в файловой системе сервера.
       */
      $this->setViewPath(PRODUCTION_PATH . 'contrib/templates/' . $this->designTemplate . '/layout');
      /*
       * Регистрация абсолютного пути к разделу шаблона текущего сайта в файловой системе сервера.
       */
      $this->setThemePath(PRODUCTION_PATH . 'contrib/templates/' . $this->designTemplate);
      /*
       * Регистрация и кеширование файлов js текущего сайта.
       */
      $this->getJS();

      /*
       * Регистрация и конфигурирование текущего сайта.
       * Файл params.php размещен в корневой директории шаблона текущего сайта. Содержит
       * данные для более точной настройки или переропределения уже включенных атрибутов
       * глобального конфигуратора сайтов.
       * Глобальный конфигуратор размещается в директории sites, которая является
       * корневой директорией для всех сайтов платформы PORT 2.0. Содержит структуру
       * данных, общую для всех сайтов платформы.
       */
      if (is_file($this->getThemePath() . DIRECTORY_SEPARATOR . 'params.php')) {
         $params = include_once($this->getThemePath() . DIRECTORY_SEPARATOR . 'params.php');
         $this->params = array_merge_recursive($this->params, $params);
         if (isset($this->params['options']['localeId'])) {
            $exceptWWW = TRUE;
            $_ = $this->params['options']['localeId'][$this->getRequest()->getServerName($exceptWWW)]['id'];

            $this->localeID = $_ ? $_ : $this->localeID;
            $this->setLanguage($this->params['options']['localeId'][$this->getRequest()->getServerName($exceptWWW)]['language']);
         }

         if (isset($this->params['components'])) {
            $this->resetComponents($this->params['components']);
         }

         if (isset($this->params['modulesAssign'])) {
            $this->setModules($this->params['modulesAssign']);
         }
      }

      $this->Page404Id = !is_array($this->params['catalogs']['error']) ? $this->params['catalogs']['error'] : end($this->params['catalogs']['error']);

      /*
       * Регистрация шаблонизатора twig.
       */
      $this->setComponent('templateEngine', new \components\renders\PortTwigEngine(
              $this->getViewPath(), [
          'cache' => $this->getRuntimePath() . DIRECTORY_SEPARATOR . 'twig' . DIRECTORY_SEPARATOR . $config['appUrl'],
          'debug' => TRUE,
          'auto_reload' => TRUE,
      ]));
      /*
       * Регистрация компонента синтаксического и грамматического анализа.
       */
      $this->setComponent('morpher', new \helpers\PortMorpher);
   }

   /**
    * Регистрация и кеширование таблицы стилей текущего сайта.
    */
   private function getCss() {
      $cache_path = $this->cssCachePath . DIRECTORY_SEPARATOR . $_SERVER['HTTP_HOST'] . DIRECTORY_SEPARATOR;
      if (!is_dir($cache_path)) {
         mkdir($cache_path, 0755);
      }
      $this->_css = $this->db->createCommand()
              ->select("css")
              ->from("projects")
              ->queryScalar();
      if ($this->_css) {
//            if (!file_exists($cache_path . "style.css")) {
         $fw = fopen($cache_path . "style.css", "w");
         fwrite($fw, $this->_css);
//            }
      }
   }

   /**
    * Извлечение из базы данных текущего сайта записи типа blob, которая
    * содержит изображение, и вывод ее содержания.
    *
    * @param string $imageName
    * @return resource
    */
   private function getImage($imageName = '') {
      if (!$imageName) {
         return;
      }
      $imageName = preg_replace('/(\/|\.png$|\.jpeg$|\.jpg$|\.gif$|\.ico$)/i', '', $imageName);
      /*
       * Объект-помощник обработки изображений.
       */
      $image = new \helpers\PortImage;
      $image->getBlob($imageName, $this->temporarySitesDirectory);
   }

   /**
    * Извлечение из базы данных текущего сайта записи типа blob, которая
    * содержит файл, и вывод ее содержания.
    *
    * @param string $fileName
    * @return resource
    */
   private function getFile($fileName = '') {
      if (!$fileName) {
         return;
      }
      $file = new \helpers\PortFileHelper;
      $file->getBlob($fileName, $this->temporarySitesDirectory);
   }

   /**
    * Регистрация и кеширование файлов js, которые размещены в директории js
    * шаблона текущего сайта.
    */
   private function getJS() {
      $fileHelper = new \helpers\PortFileHelper;
      $cache_path = $this->jsCachePath . DIRECTORY_SEPARATOR . $_SERVER['HTTP_HOST'] . DIRECTORY_SEPARATOR;
      if (!is_dir($cache_path)) {
         mkdir($cache_path, 0775);
      }
      $files = $fileHelper->findFiles(realpath($this->getThemePath() . DIRECTORY_SEPARATOR . 'js' . DIRECTORY_SEPARATOR));
      if ($files) {
         foreach ($files as $file) {
            $_ = pathinfo($file);
            if ($_['extension'] == 'js' || $_['extension'] == 'gz') {
               $fileContent = file_get_contents($_['dirname'] . DIRECTORY_SEPARATOR . $_['basename']);
               $tempFile = fopen($this->jsCachePath . DIRECTORY_SEPARATOR . $_SERVER['HTTP_HOST'] . DIRECTORY_SEPARATOR . $_['basename'], "w");
               fwrite($tempFile, $fileContent);
               fclose($tempFile);
            }
         }
      }
   }

   /**
    * Регистрация пользователя сайта
    *
    * @param object $user
    */
   public static function setUser($user = NULL) {
      self::$user = $user;
   }

   /**
    * Настройка компонентов приложения (сайта).
    *
    * @param array $args
    */
   protected function tuneComponents($args = []) {
      if ($args) {
         foreach ($args as $id => $component) {
            $_c = $this->getComponent($id);
            if ($_c && $_c->getIsInitialized()) {
               foreach ($component as $param => $value) {
                  $_c->$param = $value;
               }
            }
         }
      }
   }

   /**
    * Обработка текущего запроса.
    * Разбирает запрос на контроллер и действие, после чего создается
    * контроллер для выполнения действия.
    */
   public function processRequest() {
      $this->content['proto'] = $this->proto;
      $request = $this->getRequest()->getRequestUri();

      if (isset($this->params['options']['localeId'])) {
         if (isset($this->params['options']['localeId'][$request])) {
            $this->localeID = $this->params['options']['localeId'][$request]['id'];
            $this->urlPrefix = $this->params['options']['localeId'][$request]['prefix'];
         } else {
            $_requestArray = explode('/', $request);
            if (isset($_requestArray[1]) && isset($this->params['options']['localeId'][DIRECTORY_SEPARATOR . $_requestArray[1]])) {
               $this->localeID = $this->params['options']['localeId'][DIRECTORY_SEPARATOR . $_requestArray[1]]['id'];
               $this->urlPrefix = $this->params['options']['localeId'][DIRECTORY_SEPARATOR . $_requestArray[1]]['prefix'];
            }
         }
      }

      if ($this->getRequest()->getQuery('page') && $this->getRequest()->getQuery('page') == 1) {
         header('HTTP/1.1 301 Moved Permanently', TRUE, 301);
         header('Location: ' . $this->proto . '//' . $this->getRequest()->getServerName() . "/" . $this->getRequest()->getPathInfo());
      }

      if ($this->getRequest()->getQuery('page') || $this->getRequest()->getQuery('sign')) {
         $this->content['canonicalLink'] = $this->proto . '//' . $this->getRequest()->getServerName() . "/" . $this->getRequest()->getPathInfo();
      }

      if (trim($request, '/') === '404') {
         header('HTTP/1.0 404 Not Found', TRUE);
      }

      if (preg_match('/(\/1000000000\/.*)$/i', $request, $m)) {
         header('HTTP/1.0 404 Not Found', TRUE);
         header('Location: ' . $this->proto . '//' . $this->getRequest()->getServerName() . '/404', TRUE);
      }

      if (preg_match('/(\/rss)$/i', $request, $m)) {
         $module = $this->getModule('rss');
         if ($module) {
            $module->run();
            exit;
         } else {
            header('HTTP/1.0 404 Not Found', TRUE);
            header('Location: ' . $this->proto . '//' . $this->getRequest()->getServerName() . '/404', TRUE);
         }
      }

      if (preg_match('/(robots\.txt)$/i', $request, $m)) {
         $module = $this->getModule('seocommon');
         $module->run();
         exit;
      }

      if (preg_match('/(sitemap\.xml)$/i', $request, $m)) {
         $module = $this->getModule('seocommon');
         $module->run();
         exit;
      }

      if ($request === $this->urlPrefix . 'logout') {
         $this->getSession()->remove('User');
         $this->setUser();
         $this->getRequest()->redirect('/');
      }

      if ($this->getRequest()->getQuery('p') && $this->getRequest()->getQuery('c') && $this->getRequest()->getQuery('n')) {
         $catalog = new models\PortCatalog($this->getRequest()->getQuery('c'));
         $article = new models\PortArticle($this->getRequest()->getQuery('n'), $this->getRequest()->getQuery('c'));
         header('HTTP/1.1 301 Moved Permanently', TRUE, 301);
         header('Location: ' . $this->proto . '//' . $this->getRequest()->getServerName() . DIRECTORY_SEPARATOR . $catalog->getUrl() . $article->getUrl(TRUE));
      }

      if (preg_match('/(jpeg|jpg|gif|png|ico|cdr)$/i', $request, $m)) {
         $this->getImage($request);
         return;
      }

      if (preg_match('/(doc|docx|xls|xlsx|ppt|pptx|pps|ppsx|zip|rar|pdf|psd|tiff|tif|mp3|txt|rtf|wmv)$/i', $request, $m)) {
         $this->getFile($request);
         return;
      }

      if (preg_match('/(\.js)$/i', $request, $m)) {
         return;
      }

      if ($this->getRequest()->getQuery('usegt') == 1) {
         $this->getSession()->add('googleTranslateAPIUse', TRUE);
      }

      $this->content['googleTranslateAPIUse'] = \Port::app()->getSession()->contains('googleTranslateAPIUse') ? \Port::app()->getSession()->itemAt('googleTranslateAPIUse') : FALSE;

      if (!$this->getRequest()->getQuery('page') && !$this->getRequest()->getQuery('year')) {
         $this->currentPage($request);
      } else {
         $this->currentPage($this->getRequest()->getPathInfo($request));
      }

      if ($this->pageId === $this->Page404Id) {
         header('HTTP/1.0 404 Not Found', TRUE);
      }

      if (isset(\Port::app()->params['components']['urlManager']['urlRedirect']) && isset(\Port::app()->params['components']['urlManager']['urlRedirect'][ltrim($request, '/')])) {
         header('HTTP/1.1 301 Moved Permanently', TRUE, 301);
         header('Location: ' . $this->proto . '//' . $this->getRequest()->getServerName() . DIRECTORY_SEPARATOR . \Port::app()->params['components']['urlManager']['urlRedirect'][ltrim($request, '/')]);
      }

      if ($this->getId() == 1777 &&
              ((isset($this->pageId['idc']) && $this->pageId['idc'] == 48151623) ||
              (isset($this->pageId['id']) && !is_numeric($this->pageId['id']))) &&
              (isset($this->params['components']['urlManager']['allowedAliases']) &&
              !in_array(trim($request, '/'), $this->params['components']['urlManager']['allowedAliases'])) &&
              !$this->getRequest()->getQuery()) {
         header('HTTP/1.0 404 Not Found', TRUE);
         header('Location: ' . $this->proto . '//' . $this->getRequest()->getServerName() . '/404');
      }

      $this->atHome = $this->pageId == $this->params['catalogs']['homepage'];

      $catalog = new \components\models\PortCatalog;

      $catalogAsShowcase = FALSE;
      if (isset($this->params['options']['catalogAsShowcase'])) {
         $catalogAsShowcase = is_array($this->params['options']['catalogAsShowcase']) ? $this->params['options']['catalogAsShowcase'][count($this->params['options']['catalogAsShowcase']) - 1] : $this->params['options']['catalogAsShowcase'];
      }

      if ($this->pageType === PAGE_CATALOG) {
         $this->isShopCatalog = $this->content['isShopCatalog'] = $catalog->getRootCatalog($this->pageId, TRUE) == 1;
         $this->isBrand = $this->content['isShopCatalog'] = $catalog->getRootCatalog($this->pageId, TRUE) == 5;
      } elseif ($this->pageType === PAGE_ARTICLE && !empty($this->pageArticle->_idcat)) {
         $idcat = !is_array($this->pageArticle->_idcat) ? $this->pageArticle->_idcat : $this->pageArticle->_idcat[0];
         $this->isShopCatalog = $this->content['isShopCatalog'] = $catalog->getRootCatalog($idcat, TRUE) == 1;
      }

      /**
       * @todo Зафиксировать сценарии определения текущего запроса как относящегося к каталогу (товаров/услуг и тп.)
       */
      if ($catalogAsShowcase === FALSE && $catalog->getRootCatalog($this->pageId) == 1 && (!preg_match('/(\/catalog|catalog)/i', $request) && !in_array($idc, \Port::app()->getComponent('urlManager')->urlRestrict))) {
         header('HTTP/1.1 301 Moved Permanently', TRUE, 301);
         header('Location: ' . $this->proto . '//' . $this->getRequest()->getServerName() . '/catalog' . $request);
      } elseif ($catalogAsShowcase === TRUE && preg_match('/(\/catalog|catalog)/i', $request)) {
         $url = preg_replace('/(\/catalog|catalog)/i', '', $request);
         header('HTTP/1.1 301 Moved Permanently', TRUE, 301);
         header('Location: ' . (!empty($url) ? $url : "/"));
      }

      $this->content['appTitle'] = $this->content['logoTitle'] = $this->name;

      $this->content['currency_label'] = empty($this->params['options']['ch_currency']['short_label']) ?
              $this->params['options']['currency']['short_label'] :
              $this->params['options']['ch_currency']['short_label'];

      $this->content['favoriteUrl'] = $this->params['options']['fixedUrls']['favorite'] ? $this->params['options']['fixedUrls']['favorite'] : 'favorite';
      $this->content['registerUrl'] = $this->params['options']['fixedUrls']['register'] ? $this->params['options']['fixedUrls']['register'] : 'register';
      $this->content['recoverPassUrl'] = $this->params['options']['fixedUrls']['password-recover'] ? $this->params['options']['fixedUrls']['password-recover'] : 'password-recover';

      if (!isset($this->params['reAssignModuleId'])) {
         $this->content['feedbackUrl'] = $this->params['options']['fixedUrls']['feedback'];
      } else {
         if (isset(array_flip($this->params['reAssignModuleId'])['feedback'])) {
            $catalog = new models\PortCatalog(array_flip($this->params['reAssignModuleId'])['feedback']);
            $this->content['feedbackUrl'] = $catalog->getURL();
         }
      }

      $this->content['userAllowProfile'] = \Port::app()->getSession()->contains('User');
      $this->content['appThemePath'] = $this->getThemePath();
      $this->content['favicon'] = $this->getFavicon();
      $this->content['showTopButtonsBlock'] = $this->params['options']['showTopButtonsBlock'];

      if (isset($this->params['options']['localeId'])) {
         $module = $this->getModule('localepad');
         $module->run();
         $this->content['localepad'] = $module->output;
      }

      if (isset($this->params['options']['devMark'][$this->localeID]['staticText']) && isset($this->params['options']['devMark'][$this->localeID]['linkText'])) {
         $this->content['devStaticText'] = $this->params['options']['devMark'][$this->localeID]['staticText'];
         $this->content['devLinkText'] = $this->params['options']['devMark'][$this->localeID]['linkText'];
      }

      if ($this->getSession()->contains('User')) {
         $session = $this->getSession()->itemAt('User');
         if ((isset($session['role']) && $session['role'] === models\PortUser::ROLE_USER_SITE_USER) || !isset($session['role'])) {
            $this->content['profileUrl'] = $this->params['options']['fixedUrls']['profile'];
            $this->content['profileLabel'] = $this->params['options']['userEnv'][models\PortUser::ROLE_USER_SITE_USER]['profileLabel'];
         } elseif (isset($session['role']) && $session['role'] === models\PortUser::ROLE_USER_ROOT) {
            $this->content['profileUrl'] = $this->params['options']['fixedUrls']['site-office'];
            $this->content['profileLabel'] = $this->params['options']['userEnv'][models\PortUser::ROLE_USER_ROOT]['profileLabel'];
         }
      }

      if (isset($this->params['customOptions']['seoRules']['cssEmbedding']) && $this->params['customOptions']['seoRules']['cssEmbedding'] === TRUE) {
         $this->content['embedCss'] = $this->_css;
      } else {
         $this->content['generalCss'] = $this->proto . '//' . $_SERVER['HTTP_HOST'] . DIRECTORY_SEPARATOR . 'style.css';
      }

      /**
       * @todo Заменить параметр $this->params['registration']['exclude'].
       * 1. Преобразование в булево значение.
       * 2. Значение по умолчанию в базовой комплектации TRUE.
       * 3. Отключение - в проектах, где регистрация не требуется - в параметрах.
       * Параметры склеиваются, значит в проектном наборе параметров должен располагаться на том же уровне
       * вложенности, что и в базовом.
       */
      if (!isset($this->params['registration']['exclude']) || (isset($this->params['registration']['exclude']) && !in_array($this->getId(), $this->params['registration']['exclude']))) {
         $module = $this->getModule('loginblock');
         $module->run();
         $this->content['loginBlock'] = $module->output;
      }

      if ($this->atHome) {
         $module = $this->getModule('homepage');
         if ($module) {
            $module->run();
            $this->content['hp_blocks'] = $module->output;

            if (isset($this->params['modules']['homepage']['blocks2'])) {
               $module->type_view = 1;
               $module->run();
               $this->content['hp_blocks2'] = $module->output;
            }
         }

         if (isset(\Port::app()->params['design']['siteDesignItems']['id']) && isset(\Port::app()->params['design']['siteDesignItems']['options']['parallaxImage'])) {
            $catalog = new \components\models\PortCatalog(\Port::app()->params['design']['siteDesignItems']['id']);
            $article = $catalog->getCatalogArticleByPriority($catalog->_id, \Port::app()->params['design']['siteDesignItems']['options']['parallaxImage']);
            if ($article && $article['img']) {
               $image = new \helpers\PortImage;
               $parallaxImage = $image->prepareImage([
                   'img' => $article['img'],
                   'img_type' => $article['img_type'],
                   'img_alt' => $article['img_alt'],
                   'img_align' => $article['img_align'],
               ]);
               if ($parallaxImage['img']) {
                  $this->content['parallaxImage'] = '/' . $parallaxImage['img'] . '.' . $parallaxImage['img_type'];
               }
            }
         }

         $module = \Port::app()->getModule('articles');
         $module->setAttribute('standalone', FALSE);
         $module->run();
         $this->content['hp_articles'] = $module->output;
      }

      $_backUrl = $this->getRequest()->getUrlReferrer(TRUE);
      $this->backUrl = $this->content['backUrl'] = !$_backUrl ? '/' : $_backUrl;

      /**
       * Очистка сессионных переменных
       */
      if (isset($this->params['options']['keepSessionVars'])) {
         foreach ($this->params['options']['keepSessionVars'] as $key => $val) {
            if (!in_array($this->pageCatalog->_id, $val)) {
               $this->getSession()->remove($key);
            }
         }
      }

      $module = $this->getModule('block');
      $module->run();
      $this->content['siteblock'] = $module->output;

      if (isset($this->params['customOptions']['footer'])) {
         $module = $this->getModule('footerblock');
         if ($module) {
            $module->run();
            $this->content['footerText'] = $module->output;
         }
      }

      $module = $this->getModule('headerblock');
      $module->run();
      $this->content['headerblock'] = $module->output;

      $module = $this->getModule('breadcrumbs');
      $module->run();
      $this->content['breadcrumbs'] = $module->output;

//      $module = $this->getModule('sitemap');
//      $module->run();
//      $this->content['sitemap'] = $module->output;

      if (isset($this->params['catalogs']['catalogmenu'])) {
         $module = $this->getModule('catalogmenu');
         $module->run();
         $this->content['catalogmenu'] = $module->output;
      }

      if (isset($this->params['modules']['addressblock'])) {
         $module = $this->getModule('addressblock');
         $module->run();
         $this->content['addressblock'] = $module->output;
      }

      if (isset($this->params['catalogs']['hotnewsgallery'])) {
         $module = $this->getModule('hotnewsgallery');
         $module->run();
         $this->content['hotnewsgallery'] = $module->output;
      }

      if (isset($this->params['modules']['menupack'])) {
         $module = $this->getModule('menupack');
         $module->run();
         $this->content['menupack'] = $module->output;
      }

      $module = $this->getModule('topmenu');
      $module->run();
      $this->content['topmenu'] = $module->output;

      $module = $this->getModule('submenu');
      $module->run();
      $this->content['submenu'] = $module->output;

      $module = $this->getModule('headermenu');
      if ($module) {
         $module->run();
         $this->content['headermenu'] = $module->output;
      }

      $module = $this->getModule('footermenu');
      $module->run();
      $this->content['footermenu'] = $module->output;

      $module = $this->getModule('banners');
      $module->run();
      $this->content['leftbanners'] = $module->output;

      $module = $this->getModule('subscription');
      $module->run();
      $this->content['quicksubscription'] = $module->output;

      $module = $this->getModule('slider');
      $module->run();
      $this->content['slider'] = $module->output;

      $module = $this->getModule('counters');
      $module->run();
      $this->content['counters'] = $this->content['footerwidgets'] = $module->output;

      $module = $this->getModule('sitestatistics');
      $module->run();
      $this->content['statistics'] = $module->output;

      $module = $this->getModule('socialblock');
      $module->run();
      $this->content['socialblock'] = $module->output;

      if (isset($this->params['modules']['headersocialblock'])) {
         $module = $this->getModule('headersocialblock');
         $module->run();
         $this->content['headersocialblock'] = $module->output;
      }

      $module = $this->getModule('cartblock');
      $module->run();
      $this->content['cart_total_count'] = $module->getData()['cart_total_count'];
      $this->content['cartBlock'] = $module->output;

      if ($this->hasModule('cartwishblock')) {
         $module = $this->getModule('cartwishblock');
         $module->run();
         $this->content['cartWishBlock'] = $module->output;
      }

      if (isset($this->params['modules']['templatethrough'])) {
         $module = \Port::app()->getModule('templatethrough');
         $module->setId($this->params['modules']['templatethrough']['id']);
         $module->setObjectType($this->params['modules']['templatethrough']['type']);
         $module->run();
         $this->content['contentthrough'] = $module->output;
      }

      $module = \Port::app()->getModule('mosaic');
      if ($module) {
         $module->run();
         $this->content['mosaic'] = $module->output;
      }

      $module = \Port::app()->getModule('abc');
      if ($module) {
         $module->run();
         $this->content['abc'] = $module->output;
      }

      $module = \Port::app()->getModule('productcase');
      if ($module) {
         $module->run();
         $this->content['productcase'] = $module->output;
      }

      $module = \Port::app()->getModule('hotarticles');
      if ($module) {
         $module->run();
         $this->content['hotarticles'] = $module->output;
      }

      $module = \Port::app()->getModule('photocase');
      if ($module) {
         $module->run();
         $this->content['photocase'] = $module->output;
      }

      $module = \Port::app()->getModule('accordeonarticles');
      if ($module) {
         $module->run();
         $this->content['accordeonarticles'] = $module->output;
      }

      $module = \Port::app()->getModule('contactslanding');
      if ($module) {
         $module->run();
         $this->content['contactslanding'] = $module->output;
      }

      $module = \Port::app()->getModule('callus');
      if ($module) {
         $module->run();
         $this->content['callUs'] = $module->output;
      }

      $module = \Port::app()->getModule('catalogfiltercontext');
      if ($module) {
         $model = $module->getModel('CatalogFilterContextModel');
         $args = ['idc' => $this->pageCatalog->getChildrenCatalogsKeys($this->params['catalogs']['catalog'], 'idcat')];
         $model->setAttributes($args);
         $this->content['catalogfiltersearch'] = $model->getData();
      }

      if ($this->isDemo === TRUE) {
         $module = \Port::app()->getModule('cboxdemotoolbar');
         if ($module) {
            $module->run();
            $this->content['cBoxDemoToolbar'] = $module->output;
         }
      }


      /**
       * @todo Некоторые страницы (каталог товаров, например) могут иметь альтернативные
       * варианты паттернов вызова. Надо проработать реализацию.
       * В настоящий момент используется параметр приложения isShopCatalog.
       */
      if ($this->isShopCatalog === FALSE) {
         $route = $this->getUrlManager()->parseUrl($this->getRequest());
      } else {
         $route = $this->pageType === PAGE_CATALOG ? 'catalog' : 'product';
      }

      $this->content['isBrand'] = $this->isBrand;
      $this->content['showInstagram'] = isset($this->params['modules']['page']['customContent'][$this->pageCatalog->_id]['showInstagram']) &&
              $this->params['modules']['page']['customContent'][$this->pageCatalog->_id]['showInstagram'] === TRUE;

      $module = $this->getModule('seocommon');
      $module->run();

      $module = $this->getModule('advertisertb');
      $module->run();
      $this->content['yandexRtbCode'] = $module->output;
      $this->runController($route);
   }

   public function getFavicon() {
      $icon = new \helpers\PortImage;
      return $icon->prepareImage(['favicon' => TRUE]);
   }

   /**
    * Разбирает строку пути на ID действия и GET-переменные.
    * @param string $pathInfo path info
    * @return string action ID
    */
   public function parseActionParams($pathInfo) {
      if (($pos = strpos($pathInfo, '/')) !== false) {
         $manager = $this->getUrlManager();
         $manager->parsePathInfo((string) substr($pathInfo, $pos + 1));
         $actionID = substr($pathInfo, 0, $pos);
         return $manager->caseSensitive ? $actionID : strtolower($actionID);
      } else {
         return $pathInfo;
      }
   }

   /**
    * Регистрация модулей приложения.
    * @see setModules
    */
   protected function registerAppModules() {
      $modules = [
          'template' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'template' . DIRECTORY_SEPARATOR . 'Template.php',
              'class' => '\\contrib\\modules\\Template'
          ],
          'loginblock' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'loginblock' . DIRECTORY_SEPARATOR . 'LoginBlock.php',
              'class' => '\\contrib\\modules\\LoginBlock'
          ],
          'login' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'login' . DIRECTORY_SEPARATOR . 'Login.php',
              'class' => '\\contrib\\modules\\Login'
          ],
          'hotnews' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'hotnews' . DIRECTORY_SEPARATOR . 'HotNews.php',
              'class' => '\\contrib\\modules\\HotNews'
          ],
          'firms' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'firms' . DIRECTORY_SEPARATOR . 'Firms.php',
              'class' => '\\contrib\\modules\\Firms'
          ],
          'firmscatalog' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'firmscatalog' . DIRECTORY_SEPARATOR . 'FirmsCatalog.php',
              'class' => '\\contrib\\modules\\FirmsCatalog'
          ],
          'firm' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'firm' . DIRECTORY_SEPARATOR . 'Firm.php',
              'class' => '\\contrib\\modules\\Firm'
          ],
          'hotfirms' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'hotfirms' . DIRECTORY_SEPARATOR . 'HotFirms.php',
              'class' => '\\contrib\\modules\\HotFirms'
          ],
          'hotproducts' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'hotproducts' . DIRECTORY_SEPARATOR . 'HotProducts.php',
              'class' => '\\contrib\\modules\\HotProducts'
          ],
          'topmenu' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'topmenu' . DIRECTORY_SEPARATOR . 'TopMenu.php',
              'class' => '\\contrib\\modules\\TopMenu'
          ],
          'submenu' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'submenu' . DIRECTORY_SEPARATOR . 'SubMenu.php',
              'class' => '\\contrib\\modules\\SubMenu'
          ],
          'footermenu' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'footermenu' . DIRECTORY_SEPARATOR . 'FooterMenu.php',
              'class' => '\\contrib\\modules\\FooterMenu'
          ],
          'slider' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'slider' . DIRECTORY_SEPARATOR . 'Slider.php',
              'class' => '\\contrib\\modules\\Slider'
          ],
          'catalog' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'catalog' . DIRECTORY_SEPARATOR . 'Catalog.php',
              'class' => '\\contrib\\modules\\Catalog'
          ],
          'brands' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'brands' . DIRECTORY_SEPARATOR . 'Brands.php',
              'class' => '\\contrib\\modules\\Brands'
          ],
          'banners' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'banners' . DIRECTORY_SEPARATOR . 'Banners.php',
              'class' => '\\contrib\\modules\\Banners'
          ],
          'headerblock' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'headerblock' . DIRECTORY_SEPARATOR . 'HeaderBlock.php',
              'class' => '\\contrib\\modules\\HeaderBlock'
          ],
          'block' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'block' . DIRECTORY_SEPARATOR . 'Block.php',
              'class' => '\\contrib\\modules\\Block'
          ],
          'product' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'product' . DIRECTORY_SEPARATOR . 'Product.php',
              'class' => '\\contrib\\modules\\Product'
          ],
          'page' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'page' . DIRECTORY_SEPARATOR . 'Page.php',
              'class' => '\\contrib\\modules\\Page'
          ],
          'articles' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'articles' . DIRECTORY_SEPARATOR . 'Articles.php',
              'class' => '\\contrib\\modules\\Articles'
          ],
          'error' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'error' . DIRECTORY_SEPARATOR . 'Error.php',
              'class' => '\\contrib\\modules\\Error'
          ],
          'novelty' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'novelty' . DIRECTORY_SEPARATOR . 'Novelty.php',
              'class' => '\\contrib\\modules\\Novelty'
          ],
          'sales' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'sales' . DIRECTORY_SEPARATOR . 'Sales.php',
              'class' => '\\contrib\\modules\\Sales'
          ],
          'cartblock' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'cartblock' . DIRECTORY_SEPARATOR . 'CartBlock.php',
              'class' => '\\contrib\\modules\\CartBlock'
          ],
          'cart' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'cart' . DIRECTORY_SEPARATOR . 'Cart.php',
              'class' => '\\contrib\\modules\\Cart'
          ],
          'favorite' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'favorite' . DIRECTORY_SEPARATOR . 'Favorite.php',
              'class' => '\\contrib\\modules\\Favorite'
          ],
          'modalpopup' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'modalpopup' . DIRECTORY_SEPARATOR . 'ModalPopup.php',
              'class' => '\\contrib\\modules\\ModalPopup'
          ],
          'register' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'register' . DIRECTORY_SEPARATOR . 'Register.php',
              'class' => '\\contrib\\modules\\Register'
          ],
          'registerfirm' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'registerfirm' . DIRECTORY_SEPARATOR . 'RegisterFirm.php',
              'class' => '\\contrib\\modules\\RegisterFirm'
          ],
          'gallery' => [
              'path' => (str_replace('www.', '', $this->getRequest()->getServerName()) === 'simfoshop.ru' ?
              $this->getModulePath() . DIRECTORY_SEPARATOR . 'galleryx4' . DIRECTORY_SEPARATOR . 'Gallery.php' :
              $this->getModulePath() . DIRECTORY_SEPARATOR . 'gallery' . DIRECTORY_SEPARATOR . 'Gallery.php'),
              'class' => '\\contrib\\modules\\Gallery'
          ],
          'breadcrumbs' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'breadcrumbs' . DIRECTORY_SEPARATOR . 'Breadcrumbs.php',
              'class' => '\\contrib\\modules\\Breadcrumbs'
          ],
          'order' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'order' . DIRECTORY_SEPARATOR . 'Order.php',
              'class' => '\\contrib\\modules\\Order'
          ],
          'quickorder' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'quickorder' . DIRECTORY_SEPARATOR . 'QuickOrder.php',
              'class' => '\\contrib\\modules\\QuickOrder'
          ],
          'userprofile' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'userprofile' . DIRECTORY_SEPARATOR . 'UserProfile.php',
              'class' => '\\contrib\\modules\\UserProfile'
          ],
          'siteoffice' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'siteoffice' . DIRECTORY_SEPARATOR . 'SiteOffice.php',
              'class' => '\\contrib\\modules\\SiteOffice'
          ],
          'subsections' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'subsections' . DIRECTORY_SEPARATOR . 'Subsections.php',
              'class' => '\\contrib\\modules\\Subsections'
          ],
          'contacts' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'contacts' . DIRECTORY_SEPARATOR . 'Contacts.php',
              'class' => '\\contrib\\modules\\Contacts'
          ],
          'feedback' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'feedback' . DIRECTORY_SEPARATOR . 'Feedback.php',
              'class' => '\\contrib\\modules\\Feedback'
          ],
          'subscription' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'subscription' . DIRECTORY_SEPARATOR . 'Subscription.php',
              'class' => '\\contrib\\modules\\Subscription'
          ],
          'productsrelated' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'productsrelated' . DIRECTORY_SEPARATOR . 'ProductsRelated.php',
              'class' => '\\contrib\\modules\\ProductsRelated'
          ],
          'productsviewed' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'productsviewed' . DIRECTORY_SEPARATOR . 'ProductsViewed.php',
              'class' => '\\contrib\\modules\\ProductsViewed'
          ],
          'portfolio' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'portfolio' . DIRECTORY_SEPARATOR . 'Portfolio.php',
              'class' => '\\contrib\\modules\\Portfolio'
          ],
          'search' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'search' . DIRECTORY_SEPARATOR . 'Search.php',
              'class' => '\\contrib\\modules\\Search'
          ],
          'seocommon' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'seocommon' . DIRECTORY_SEPARATOR . 'SeoCommon.php',
              'class' => '\\contrib\\modules\\SeoCommon'
          ],
          'advertisertb' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'advertisertb' . DIRECTORY_SEPARATOR . 'AdvertiseRtb.php',
              'class' => '\\contrib\\modules\\AdvertiseRtb'
          ],
          'counters' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'counters' . DIRECTORY_SEPARATOR . 'Counters.php',
              'class' => '\\contrib\\modules\\Counters'
          ],
          'sliderinner' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'sliderinner' . DIRECTORY_SEPARATOR . 'SliderInner.php',
              'class' => '\\contrib\\modules\\SliderInner'
          ],
          'production' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'production' . DIRECTORY_SEPARATOR . 'Production.php',
              'class' => '\\contrib\\modules\\Production'
          ],
          'productioncatalog' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'productioncatalog' . DIRECTORY_SEPARATOR . 'ProductionCatalog.php',
              'class' => '\\contrib\\modules\\ProductionCatalog'
          ],
          'socialblock' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'socialblock' . DIRECTORY_SEPARATOR . 'SocialBlock.php',
              'class' => '\\contrib\\modules\\SocialBlock'
          ],
          'sitestatistics' => [
              'path' => $this->getModulePath() . DIRECTORY_SEPARATOR . 'sitestatistics' . DIRECTORY_SEPARATOR . 'SiteStatistics.php',
              'class' => '\\contrib\\modules\\SiteStatistics'
          ],
          'hottariff' => [
              'path' => \Port::app()->getModulePath() . DIRECTORY_SEPARATOR . 'hottariff' . DIRECTORY_SEPARATOR . 'HotTariff.php',
              'class' => '\\contrib\\modules\\HotTariff'
          ],
          'tariffcatalog' => [
              'path' => \Port::app()->getModulePath() . DIRECTORY_SEPARATOR . 'tariffcatalog' . DIRECTORY_SEPARATOR . 'TariffCatalog.php',
              'class' => '\\contrib\\modules\\TariffCatalog'
          ],
          'tariff' => [
              'path' => \Port::app()->getModulePath() . DIRECTORY_SEPARATOR . 'tariff' . DIRECTORY_SEPARATOR . 'Tariff.php',
              'class' => '\\contrib\\modules\\Tariff'
          ],
          'bannerspack' => [
              'path' => \Port::app()->getModulePath() . DIRECTORY_SEPARATOR . 'bannerspack' . DIRECTORY_SEPARATOR . 'BannersPack.php',
              'class' => '\\contrib\\modules\\BannersPack'
          ],
          'companyprofile' => [
              'path' => \Port::app()->getModulePath() . DIRECTORY_SEPARATOR . 'companyprofile' . DIRECTORY_SEPARATOR . 'CompanyProfile.php',
              'class' => '\\contrib\\modules\\CompanyProfile'
          ],
          'cboxdemotoolbar' => [
              'path' => \Port::app()->getModulePath() . DIRECTORY_SEPARATOR . 'cboxdemotoolbar' . DIRECTORY_SEPARATOR . 'CboxDemoToolbar.php',
              'class' => '\\contrib\\modules\\CboxDemoToolbar'
          ],
          'catalogfilter' => [
              'path' => \Port::app()->getModulePath() . DIRECTORY_SEPARATOR . 'catalogfilter' . DIRECTORY_SEPARATOR . 'CatalogFilter.php',
              'class' => '\\contrib\\modules\\CatalogFilter'
          ],
      ];

      $this->setModules($modules);
   }

   /**
    * @return PortDbConnection
    */
   public function getDb() {
      if ($this->hasComponent('db') && $this->getComponent('db', FALSE) instanceof \components\database\PortDbConnection) {
         return $this->getComponent('db', FALSE);
      } elseif ($this->hasComponent('dbProjects') && $this->getComponent('dbProjects', FALSE) instanceof \components\database\PortDbConnection) {
         return $this->getComponent('dbProjects', FALSE);
      }
   }

   public function currentPage($request, $pageType = PAGE_CATALOG) {
      $this->pageCatalog = NULL;
      $this->pageArticle = NULL;

      $this->pageType = $pageType;
      $request = DIRECTORY_SEPARATOR . rtrim($request, '/');
      $request = str_replace('//', '/', $request);

      if ($request === $this->urlPrefix || $request === str_replace('/', '', $this->urlPrefix)) {
         $this->pageId = $this->params['catalogs']['homepage'];
         if ($this->pageId) {
            $this->pageCatalog = new models\PortCatalog($this->pageId);
         }
      } else {
         $catalog = new models\PortCatalog;
         if ($this->localeID !== 1 && $this->urlPrefix !== '/') {
            $request = str_replace($this->urlPrefix, '', $request);
         }

         if ($this->pageId = $catalog->getCatalogByURL($this->getRequest()->getPathInfo())) {
            $this->pageCatalog = new models\PortCatalog($this->pageId);
            if (in_array($this->pageCatalog->_id, $this->getComponent('urlManager')->urlRestrict)) {
               $this->pageId = $this->Page404Id;
               $this->pageCatalog = new models\PortCatalog($this->Page404Id);
               header('HTTP/1.0 404 Not Found', TRUE);
            }

            if (!DEBUGIT && $this->pageCatalog->getAttribute('lockcatalog') == TRUE) {
               $this->pageId = $this->Page404Id;
               $this->pageCatalog = new models\PortCatalog($this->Page404Id);
               header('HTTP/1.0 404 Not Found', TRUE);
            }

            if (!empty($this->pageCatalog->getAttribute('real_url')) && (!@preg_match("/" . $this->pageCatalog->getAttribute('real_url') . "/", $request))) {
               header('HTTP/1.1 301 Moved Permanently', TRUE, 301);
               header('Location: ' . $this->proto . '//' . $this->getRequest()->getServerName() . $this->urlPrefix . $this->pageCatalog->getUrl());
            } else if (ltrim($request, '/') !== $this->pageCatalog->getUrl() && !$this->getRequest()->getQuery()) {
               $redir = $this->urlPrefix . $this->pageCatalog->getUrl();
               header('HTTP/1.1 301 Moved Permanently', TRUE, 301);
               header('Location: ' . $this->proto . '//' . $this->getRequest()->getServerName() . str_replace('//', '/', $redir));
            }
         } else {
            if (trim($request) == '404') {
               $this->pageId = $this->Page404Id;
            } else {
               $article = new models\PortArticle;
               if ($pageType === PAGE_ARTICLE) {
                  $this->pageType = PAGE_ARTICLE;
                  $this->pageId = $article->getArticleByURL($request);
                  $this->pageCatalog = new models\PortCatalog($this->pageId['idc']);
                  $this->pageArticle = new models\PortArticle($this->pageId['id']);
                  if (!empty($this->pageArticle->getAttribute('real_url')) && !@preg_match("/" . $this->pageArticle->getAttribute('real_url') . "/", $request)) {
                     header('HTTP/1.1 301 Moved Permanently', TRUE, 301);
                     header('Location: ' . $this->proto . '//' . $this->urlPrefix . $this->pageArticle->getUrl());
                  } else if (ltrim($request, '/') !== $this->pageArticle->getUrl()) {
                     $redir = $this->urlPrefix . $this->pageArticle->getUrl();
                     header('HTTP/1.1 301 Moved Permanently', TRUE, 301);
                     header('Location: ' . $this->proto . '//' . $this->getRequest()->getServerName() . str_replace('//', '/', $redir));
                  }
               } else {
                  $this->pageId = $article->getArticleByURL($request);
                  $this->pageCatalog = new models\PortCatalog($this->pageId['idc']);
                  $this->pageArticle = new models\PortArticle($this->pageId['id'], $this->pageId['idc']);
                  if ((in_array($this->pageCatalog->_id, $this->getComponent('urlManager')->urlRestrict) || !$this->pageCatalog->_id) &&
                          (isset($this->params['components']['urlManager']['allowedAliases']) &&
                          !in_array(trim($request, '/'), $this->params['components']['urlManager']['allowedAliases']) &&
                          !$this->getRequest()->getQuery())) {
                     $this->pageId = $this->Page404Id;
                     $this->pageCatalog = new models\PortCatalog($this->Page404Id);
                     header('HTTP/1.0 404 Not Found', TRUE);
                  }
                  if ($this->pageArticle && $this->pageArticle->getAttribute('name')) {
                     $this->pageType = PAGE_ARTICLE;
                     if ($this->pageCatalog && in_array($this->pageCatalog->_id, $this->pageArticle->getParentCatalogsKeys())) {
                        if (!empty($this->pageArticle->getAttribute('real_url')) && !@preg_match("/" . $this->pageArticle->getAttribute('real_url') . "/", $request)) {
                           header('HTTP/1.1 301 Moved Permanently', TRUE, 301);
                           header('Location: ' . $this->proto . '//' . $this->getRequest()->getServerName() . str_replace('//', '/', $redir));
                        } else if ($request !== $this->pageArticle->getUrl(TRUE)) {
                           $request = rtrim($request, '/');
                           $redir = $this->urlPrefix . $this->pageArticle->getUrl(TRUE);
                           header('HTTP/1.1 301 Moved Permanently', TRUE, 301);
                           header('Location: ' . $this->proto . '//' . $this->getRequest()->getServerName() . str_replace('//', '/', $redir));
                        }
                     } else {
                        if (isset($this->params['components']['urlManager']['allowedAliases']) &&
                                !in_array(trim($request, '/'), $this->params['components']['urlManager']['allowedAliases'])) {
                           $this->pageId = $this->Page404Id;
                           $this->pageCatalog = new models\PortCatalog($this->Page404Id);
                           header('HTTP/1.0 404 Not Found', TRUE);
                        }
                     }
                  } else {
                     if (trim($request) == '404') {
                        header('HTTP/1.0 404 Not Found', TRUE);
                     } else {
                        if (!$this->getUrlManager()->validateRequestByRule($request)) {
                           $this->pageId = $this->Page404Id;
                           $this->pageCatalog = new models\PortCatalog($this->Page404Id);
                           header('HTTP/1.0 404 Not Found', TRUE);
                        } else {
                           if (!$this->getUrlManager()->validateRequestByRule($request) &&
                                   $this->pageArticle->_idcat == 48151623 &&
                                   !$this->getRequest()->getQuery() &&
                                   $this->getRequest()->getIsAjaxRequest() === FALSE &&
                                   (isset($this->params['components']['urlManager']['allowedAliases']) &&
                                   !in_array(trim($request, '/'), $this->params['components']['urlManager']['allowedAliases']))) {
                              $this->pageId = $this->Page404Id;
                              $this->pageCatalog = new models\PortCatalog($this->Page404Id);
                              header('HTTP/1.0 404 Not Found', TRUE);
                           } else if (!$this->pageArticle->_idcat &&
                                   !$this->getRequest()->getQuery() &&
                                   !strpos($request, 'svoy-internet-magazin-prosto-i-besplatno') &&
                                   $this->getRequest()->getIsAjaxRequest() === FALSE &&
                                   !$this->getUrlManager()->validateRequestByRule($request) &&
                                   (isset($this->params['components']['urlManager']['allowedAliases']) &&
                                   !in_array(trim($request, '/'), $this->params['components']['urlManager']['allowedAliases']))) {
                              $this->pageId = $this->Page404Id;
                              $this->pageCatalog = new models\PortCatalog($this->Page404Id);
                              header('HTTP/1.0 404 Not Found', TRUE);
                           } else {
                              if ($this->getComponent('urlManager')->forceArticleContentCheck === TRUE && !$this->getRequest()->getQuery('text') &&
                                      (isset($this->params['components']['urlManager']['allowedAliases']) &&
                                      !in_array(trim($request, '/'), $this->params['components']['urlManager']['allowedAliases']))) {
                                 if ($_ = $this->pageArticle->validateArticle($this->pageArticle->_id) === FALSE) {
                                    $this->pageId = $this->Page404Id;
                                    $this->pageCatalog = new models\PortCatalog($this->Page404Id);
                                    header('HTTP/1.0 404 Not Found', TRUE);
                                 }
                              } else {
                                 if ($this->getComponent('urlManager')->forceCatalogContentCheck === TRUE &&
                                         (!$this->getRequest()->getQuery('text') &&
                                         $this->getRequest()->getIsAjaxRequest() === FALSE &&
                                         strpos($request, 'my-products') === FALSE &&
                                         strpos($request, 'order') === FALSE &&
                                         strpos($request, 'brands') === FALSE) &&
                                         (isset($this->params['components']['urlManager']['allowedAliases']) &&
                                         !in_array(trim($request, '/'), $this->params['components']['urlManager']['allowedAliases']))) {
                                    $this->pageId = $this->Page404Id;
                                    $this->pageCatalog = new models\PortCatalog($this->Page404Id);
                                 }
                              }
                           }
                        }
                     }
                  }
               }
            }
         }
      }
   }

   public function resetComponents($components) {
      if (!$components) {
         return;
      }
      foreach ($components as $id => $component) {
         unset($this->_components[$id]);
         if ($component instanceof \interfaces\IApplicationComponent) {
            $this->_components[$id] = $component;
            if (!$component->getIsInitialized()) {
               $component->init();
            }
            return;
         } elseif (is_object($component)) {
            $this->_components[$id] = $component;
            return;
         } elseif (isset($this->_components[$id])) {
            if (isset($component['class']) && get_class($this->_components[$id]) !== $component['class']) {
               unset($this->_components[$id]);
               $this->_componentConfig[$id] = $component;
               return;
            }
            foreach ($component as $key => $value) {
               if ($key !== 'class') {
                  $this->_components[$id]->$key = $value;
               }
            }
         } elseif (isset($this->_componentConfig[$id]['class'], $component['class']) && $this->_componentConfig[$id]['class'] !== $component['class']) {
            $this->_componentConfig[$id] = $component;
            return;
         }
         $this->_componentConfig[$id] = $component;
      }
   }

   public function getModel($id) {
      $classFile = $this->appPath . DIRECTORY_SEPARATOR . 'models' . DIRECTORY_SEPARATOR . $id . '.php';
      if (is_file($classFile)) {
         if (!class_exists($id, false)) {
            require $classFile;
         }
         return new $id;
      }
      return NULL;
   }

   protected function init() {

   }

}
