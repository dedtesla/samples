<?php

namespace components\models;

use components\database;
use components\exception;
use helpers;

/**
 * Port
 *
 * @category   Port
 * @package    core
 * @author A.Shenderov (ashenderov@yandex.ru)
 * 
 */

/**
 * PortProjectInstall модель для создания проекта в системе Порт.
 *
 * @package core.components.models
 */
class PortProjectInstall {

   private $db;
   private $dbStatistics;
   private $dbSearch;
   public $id_group;
   public $_castAssistant;
   public $ownerId;
   public $sourceProjectId;
   public $sourceDb;
   public $dbName;
   public $userName;
   public $userPassword;
   public $projectId;

   /**
    * Конструктор
    *
    * @param int $id
    */
   public function __construct($ownerId, $sourceProjectId) {
      $this->ownerId = $ownerId;
      $this->sourceProjectId = $sourceProjectId;
      $this->getDbConnection();
      $this->setDbStatisticsConnection();
      $this->setDbSearchConnection();
      $this->_castAssistant = new \helpers\PortPropertyValue;
   }

   /**
    * @throws PortDbException
    * @return PortDbConnection
    */
   public function getDbConnection() {
      $this->db = \Port::getDbPortConnection();
      if ($this->db instanceof database\PortDbConnection) {
         return $this->db;
      } else {
         throw new exception\PortDbException(\Port::t('port', 'PortRecord requires PortDbConnection.'));
      }
   }

   /**
    * @throws PortDbException
    * @return PortDbConnection
    */
   public function setDbStatisticsConnection() {
      if (!$this->dbStatistics && $_dsn = \Port::getDbStatistics()) {
         $this->dbStatistics = new database\PortDbConnection($_dsn['dsn'], $_dsn['user'], $_dsn['pass']);
      }
   }

   /**
    * @return PortDbConnection
    */
   public function getDbStatisticsConnection() {
      return $this->dbStatistics;
   }

   /**
    * @throws PortDbException
    * @return PortDbConnection
    */
   public function setDbSearchConnection() {
      if (!$this->dbSearch && $_dsn = \Port::getDbSearch()) {
         $this->dbSearch = new database\PortDbConnection($_dsn['dsn'], $_dsn['user'], $_dsn['pass']);
      }
   }

   /**
    * @return PortDbConnection
    */
   public function getDbSearchConnection() {
      return $this->dbSearch;
   }

   public function runJob() {
      $this->sourceDb = $this->getSourceDatabase();
      $this->generateDbName();
      $this->generateUser();
      $this->generateUserPassword();
      $this->createRole();
      sleep(3);
      $this->createDatabase();

      return [
          'id' => !$this->projectId ? NULL : $this->projectId,
          'siteUrl' => !$this->projectId ? NULL : 'http://www.' . $this->projectId . '.simfoshop.ru',
          'portUrl' => !$this->projectId ? NULL : 'https://port.mc2.ru',
          'status' => !$this->projectId ? FALSE : TRUE
      ];
   }

   private function getSourceDatabase() {
      return $this->db->createCommand()
                      ->select("db_name")
                      ->from("projects")
                      ->where([
                          "and",
                          "id=" . $this->sourceProjectId
                      ])
                      ->queryScalar();
   }

   private function generateDbName() {
      do {
         $this->dbName = mt_rand();
         $this->dbName = "n_" . $this->dbName;
         $_db = $this->db->createCommand()
                 ->select("COUNT(datname)")
                 ->from("pg_database")
                 ->where([
                     "and",
                     "datname='" . $this->dbName . "'"
                 ])
                 ->queryScalar();
      } while ($_db != 0);
   }

   private function generateUser() {
      do {
         $this->userName = mt_rand();
         $this->userName = "n_" . $this->userName;
         $_user = $this->db->createCommand()
                 ->select("COUNT(usename)")
                 ->from("pg_shadow")
                 ->where([
                     "and",
                     "usename='" . $this->userName . "'"
                 ])
                 ->queryScalar();
      } while ($_user != 0);
   }

   private function generateUserPassword() {
      $this->userPassword = mt_rand();
      $this->userPassword = "p_" . $this->userPassword;
   }

   private function createRole() {
      $sql = "CREATE USER " . $this->userName . " WITH PASSWORD '" . $this->userPassword . "' CREATEDB";
      $this->db->createCommand($sql)->execute();
   }

   private function createDatabase() {
      $sql = "CREATE DATABASE " . $this->dbName . " OWNER=" . $this->userName . " TEMPLATE=" . $this->sourceDb;
      $this->db->createCommand($sql)->execute();

      $sql = "UPDATE pg_class SET relowner=(SELECT max(usesysid) FROM pg_shadow WHERE usename='" . $this->userName . "')
         WHERE relowner=(SELECT max(usesysid) FROM pg_shadow WHERE usesysid=(SELECT max(datdba) FROM pg_database WHERE datname='" . $this->sourceDb . "'))";
      $this->db->createCommand($sql)->execute();

      $sql = "ALTER USER " . $this->userName . " NOCREATEDB";
      $this->db->createCommand($sql)->execute();

      $sql = "SELECT * FROM projects WHERE id=" . $this->sourceProjectId;
      $pgconn = pg_connect("host=127.0.0.1 port=6666 dbname=bauth_n_storona user=postgres password=rjyec");
      $tempData = pg_fetch_all(pg_exec($pgconn, $sql));
      if ($tempData) {
         $tempData = $tempData[0];
      }
      pg_close($pgconn);

      if ($tempData) {
         $sql = "INSERT INTO projects (
            name,
            site_element,
            catalog,
            statistics,
            files,
            firms,
            ipub,
            id_group,
            db_name,
            db_user,
            db_passwd,
            project_help,
            project_help_catalog,
            project_adv,
            project_adv_catalog,
            project_vote,
            project_vote_catalog,
            orders,
            orders_doc_cat,
            host,
            port,
            image_extended)
            VALUES ('" .
                 pg_escape_string('Мой сайт') . "',
            '" . ($tempData['site_element'] == FALSE ? "f" : "t") . "',
            '" . ($tempData['catalog'] == FALSE ? "f" : "t") . "',
            '" . ($tempData['statistics'] == FALSE ? "f" : "t") . "', 'f',
            '" . ($tempData['firms'] == FALSE ? "f" : "t") . "',
            '" . ($tempData['ipub'] == FALSE ? "f" : "t") . "',
            " . $tempData['id_group'] . ",
            '" . $this->dbName . "',
            '" . $this->userName . "',
            '" . $this->userPassword . "',
            '" . ($tempData['project_help'] == FALSE ? "f" : "t") . "',
            " . $tempData['project_help_catalog'] . ",
            '" . ($tempData['project_adv'] == FALSE ? "f" : "t") . "',
            " . $tempData['project_adv_catalog'] . ",
            '" . ($tempData['project_vote'] == FALSE ? "f" : "t") . "',
            " . $tempData['project_vote_catalog'] . ",
            '" . ($tempData['orders'] == FALSE ? "f" : "t") . "',
            " . $tempData['orders_doc_cat'] . ",
            '" . $tempData['host'] . "',
            " . $tempData['port'] . ",
            '" . ($tempData['image_extended'] == FALSE ? "f" : "t") . "'
            )";

         $this->db->createCommand($sql)->execute();

         $this->projectId = $this->db->createCommand()
                 ->select("id")
                 ->from("projects")
                 ->where([
                     "and",
                     "db_name='" . $this->dbName . "'",
                     "db_user='" . $this->userName . "'"
                 ])
                 ->queryScalar();

         if ($this->projectId) {
            $sql = "UPDATE projects SET name='" . $this->projectId . ".simfoshop.ru', url='http://www." . $this->projectId . ".simfoshop.ru', id_group=25
               WHERE id=" . $this->projectId;
            $this->db->createCommand($sql)->execute();

            $sql = "INSERT INTO url_alias (pid, url, main_url) VALUES(" . $this->projectId . ",'www." . $this->projectId . ".simfoshop.ru','t');";
            $this->db->createCommand($sql)->execute();
            $sql = "INSERT INTO url_alias (pid, url, main_url) VALUES(" . $this->projectId . ", '" . $this->projectId . ".simfoshop.ru','f');";
            $this->db->createCommand($sql)->execute();

            $sql = "INSERT INTO mantoproj (idm, idproj, acl, acl_group) VALUES(" . $this->ownerId . ", " . $this->projectId . ", '111100000000','0000000001')";
            $this->db->createCommand($sql)->execute();

            /*
             * Работа с аккаунтом.
             */
            $ida = $this->db->createCommand()
                    ->select("ida")
                    ->from("portaccmanagers")
                    ->where([
                        "and",
                        "idm=" . $this->ownerId
                    ])
                    ->queryScalar();

            if (!$ida) {
               $sql = "INSERT INTO portaccounts (auto) VALUES(true)";
               $this->db->createCommand($sql)->execute();
               $ida = $this->db->getLastInsertID('portaccounts_id_seq');

//               $ida = $this->db->createCommand($sql)->qu();
//               pg_fetch_row(pg_exec($this->conn, "SELECT currval('catalog_idcat_seq')"));

               if ($ida) {
                  $sql = "INSERT INTO portaccmanagers VALUES(" . $ida . ", " . $this->ownerId . ")";
                  $this->db->createCommand($sql)->execute();

                  $sql = "INSERT INTO portaccprojects VALUES(" . $ida . ", " . $this->projectId . ")";
                  $this->db->createCommand($sql)->execute();
               }
            } else {
               $sql = "INSERT INTO portaccprojects VALUES(" . $ida . ", " . $this->projectId . ")";
               $this->db->createCommand($sql)->execute();
            }

            $_newDbConnection = new database\PortDbConnection("pgsql:host=127.0.0.1;port=6666;dbname=" . $this->dbName, 'postgres', 'rjyec');
            if ($_newDbConnection) {
               $_ = $_newDbConnection->createCommand()
                       ->select("tablename")
                       ->from("pg_tables")
                       ->where([
                           "and",
                           "schemaname='public'"
                       ])
                       ->queryAll();

               if ($_) {
                  foreach ($_ as $tbl) {
                     $_newDbConnection->createCommand("ALTER TABLE " . $tbl['tablename'] . " OWNER TO " . $this->userName)->execute();
                  }
               }

               $blobs = $_newDbConnection->createCommand()
                       ->select("loid")
                       ->from("pg_largeobject")
                       ->queryAll();

               if ($blobs) {
                  $_newDbConnection->createCommand("BEGIN;")->execute();
                  foreach ($blobs as $blob) {
                     $_newDbConnection->createCommand("GRANT ALL ON LARGE OBJECT " . $blob['loid'] . " TO " . $this->userName . ";")->execute();
                  }
                  $_newDbConnection->createCommand("COMMIT;")->execute();
               }

               $_newDbConnection->createCommand("UPDATE projects SET project_create='now()'")->execute();
               $_newDbConnection->createCommand("DELETE FROM basket")->execute();
               $_newDbConnection->createCommand("ALTER SEQUENCE basket_id_seq RESTART")->execute();
               $_newDbConnection->createCommand("DELETE FROM log_change")->execute();
               $_newDbConnection->createCommand("DELETE FROM news_subscribers")->execute();
               $_newDbConnection->createCommand("ALTER SEQUENCE news_subscribers_id_seq RESTART")->execute();
               $_newDbConnection->createCommand("DELETE FROM order_clients")->execute();
               $_newDbConnection->createCommand("ALTER SEQUENCE order_clients_id_seq RESTART")->execute();
               $_newDbConnection->createCommand("DELETE FROM order_clients_address")->execute();
               $_newDbConnection->createCommand("ALTER SEQUENCE order_clients_address_id_seq RESTART")->execute();
               $_newDbConnection->createCommand("DELETE FROM order_currency")->execute();
               $_newDbConnection->createCommand("DELETE FROM order_orders")->execute();
               $_newDbConnection->createCommand("ALTER SEQUENCE order_orders_id_seq RESTART")->execute();
               $_newDbConnection->createCommand("DELETE FROM order_goods")->execute();
               $_newDbConnection->createCommand("DELETE FROM viewed_goods")->execute();

               if ($this->getDbStatisticsConnection()) {
                  $projectStatisticsId = $this->getDbStatisticsConnection()->createCommand("SELECT MAX(code)+1 FROM stat_site_name")->queryScalar();
                  if ($projectStatisticsId) {
                     $this->getDbStatisticsConnection()->createCommand("INSERT INTO stat_site_name(code,name,lk_projectid,actual)
                        VALUES(" . $projectStatisticsId . ",'" . $this->projectId . ".simfoshop.ru'," . $this->projectId . ",1)")->execute();

                     $this->db->createCommand("UPDATE projects SET code_stat='" . $projectStatisticsId . "' WHERE id=" . $this->projectId)->execute();
                  }
               }

                if ($this->getDbSearchConnection()) {
                 $this->getDbSearchConnection()->createCommand("INSERT INTO projects(name,url) VALUES('" . $this->projectId . ".simfoshop.ru','www." . $this->projectId . ".simfoshop.ru')")->execute();
                 $projectSearchId = $this->getDbSearchConnection()->createCommand("SELECT currval('projects_id_seq')")->queryScalar();
                 if ($projectSearchId) {
                 $this->db->createCommand("UPDATE projects SET search_engine=" . $projectSearchId . " WHERE id=" . $this->projectId)->execute();
                 }
               }
            }
         }
      }
   }

}
