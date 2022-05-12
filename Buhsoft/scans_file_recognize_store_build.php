<?php

/**
 * Интеграция с API сервиса сканирования cloud42
 */

require_once("./auth.php");
require_once("./php_func.php");
require_once "classes/recognition/cloud42/cloud42.class.php";

$UserId = $user['id'];
$rawDocId = to_num($_REQUEST['rawdoc_id']);

$ndsArray = ['Не обл.' => '4', '20' => '5', '18' => '1', '10' => '2', '0' => '3'];
$ndsArray2Calc = ['Не обл.' => 0, '20' => 20, '18' => 18, '10' => 10, '0' => 0];

$result = [];
$result['rawdoc_id'] = $rawDocId;
$testScript = false;

/**
 * getTagContent - извлечение содержания xml-тега.
 *
 * @param $content
 * @param $tag
 * @return string|string[]|null
 */
function getTagContent($content, $tag)
{
    preg_match('/<_' . $tag . '>(.+)\<\/_' . $tag . '>/sU', $content, $xmlArr);
    return preg_replace("/[^,\p{C}\p{P}\p{Zs}\p{N}\p{L}]/ui", '', $xmlArr[1]);
}

/**
 * getFileExtension - извлечение расширения файла.
 *
 * @param $fileName
 * @return string
 */
function getFileExtension($fileName)
{
    $fileStructure = explode('.', $fileName);
    return strtolower(end($fileStructure));
}

/**
 * setRawDocState - фиксация статуса исходного документа в базе данных.
 * Все статусы:
 * 0 - готовность к процедуре распознавания
 * 1 - распознавание выполнено
 * 2 - распознавание в процессе
 * -1 - неудачная попытка распознавания
 *
 * @param int $state
 */
function setRawDocState($state = 0)
{
    global $maindbname, $UserId, $rawDocId;

    PDO_exec("UPDATE $maindbname.tr_scans_rawdocs
            SET state=:state
            WHERE id=:rawdoc_id AND
                  userId=:userid", [
        ["rawdoc_id", $rawDocId, 1],
        ["userid", $UserId, 1],
        ["state", $state, 1],
    ]);
}

/**
 * setRawDocField - обновление указанного поля таблицы tr_scans_rawdocs.
 *
 * @param $fieldname
 * @param $value
 */
function setRawDocField($fieldname, $value)
{
    global $maindbname, $UserId, $rawDocId;

    PDO_exec("UPDATE $maindbname.tr_scans_rawdocs
        SET $fieldname=:value
        WHERE id=:rawdoc_id AND
              userId=:userid", [
        ["rawdoc_id", $rawDocId, 1],
        ["userid", $UserId, 1],
        ["value", $value, 1],
    ]);
}

/**
 * getRawDocFiles - формирование структуры, содержащей данные о файлах, предназначенных для распознавания.
 *
 * Структура таблицы tr_scans_import:
 * id,userId,rawdoc_id,added_date,file_original_name,file_server_name,file_order,created_at,updated_at
 *
 * Набор данных таблицы tr_scans_import (для примера):
 * 464,383644,479,"8 мая 2020 г., 0:47:09",001.jpg,383644_a017e0caf9119cc47e6729799c0161ba.jpg,1,"8 мая 2020 г., 0:47:09","8 мая 2020 г., 0:47:09"
 * 465,383644,479,"8 мая 2020 г., 0:47:19",002.jpg,383644_11f5315d0fdebb3df4e4554339df02f2.jpg,2,"8 мая 2020 г., 0:47:19","8 мая 2020 г., 0:47:19"
 *
 * Сценарий:
 * 1. Файл с расширением pdf - генерация файла изображения с помощью библиотеки Imagick (https://imagemagick.org),
 * добавление названия нового файла в возвращаемый массив.
 * 2. Файл изображения - добавление названия файла в возвращаемый массив.
 *
 * $maxPages = 100 (лимит страниц документа)
 *
 * $docType тип документа в терминологии облачного сервиса:
 * 'AUTO' ('Тип документа не выбран'),
 * 'UD', ('УПД'),
 * 'SF' ('Счет-фактура')
 * 'SC' ('Счет на оплату')
 * 'TN' ('Товарная накладная')
 *
 * @return array
 */
function getRawDocFiles()
{
    global $maindbname, $UserId, $rawDocId, $result;

    $existingFiles = PDO_rowset("SELECT file_order AS id, file_original_name, file_server_name
                                 FROM $maindbname.tr_scans_import
                                 WHERE userid=:userid AND 
                                       rawdoc_id=:rawdoc_id
                                 ORDER BY file_order", [
        ["userid", $UserId, 1], ['rawdoc_id', $rawDocId]
    ]);

    foreach ($existingFiles as $existingFile) {
        if (getFileExtension($existingFile['file_server_name']) != 'pdf') {
            $result['files'][] = SCANS_WEB_DIR . $existingFile['file_server_name'];
        } else {
            $i = 0;
            $maxPages = 100;

            while ($i < $maxPages) {
                if (!file_exists(SCANS_DIR . $existingFile['file_server_name'] . "-$i.jpg")) {
                    try {
                        $im = new Imagick();
                        $im->setResolution(250, 250);
                        $im->readImage(SCANS_DIR . $existingFile['file_server_name'] . "[$i]");
                        $im->setImageFormat('jpeg');
                        $im->writeImage(SCANS_DIR . $existingFile['file_server_name'] . "-$i.jpg");
                        $im->clear();
                        $im->destroy();
                    } catch (ImagickException $e) {
                        break;
                    }
                }

                $result['files'][] = SCANS_WEB_DIR . $existingFile['file_server_name'] . "-$i.jpg";
                $i++;
            }
        }
    }

    return $existingFiles;
}

/*
 * Мониторинг статуса обрабатываемых файлов.
 */
$selRawdoc = PDO_row("SELECT *
                      FROM $maindbname.tr_scans_rawdocs
                      WHERE UserId=:userid AND 
                            id=:id
                      LIMIT 1", [
    $_auid, ['id', $rawDocId]
]);
/** @var string $docType Шаблон документа в API сервиса распознавания. */
$docType = $selRawdoc['doc_type'];
$packguid = $selRawdoc['packguid'];

/*
 * Обработка в процессе. Режим ожидания.
 */
if ($selRawdoc['state'] == 2 && !$packguid) {
    /*$result['success'] = true;
    $result['state'] = 2;
    $result['problem'] = 'still recognizing';
    echo json_encode($result, 512);
    exit;*/
    $selRawdoc['state'] == 0;
}

/*
 * Файл может быть обработан. Старт процедуры распознавания.
 */
if ($selRawdoc['state'] == 0 || ($selRawdoc['state'] == 2 && $packguid)) {
    if ($testScript) {
        // Эмуляция с задержкой 5 секунд для теста.
        setRawDocState(2);
        $getRawDocFilesPrepared = getRawDocFiles();
        if (!$getRawDocFilesPrepared) {
            $result['state'] = -1;
            $result['success'] = false;
            $result['problem'] = 'convert pdf file problem';
            echo json_encode($result, 512);
            setRawDocState(-1);
            exit;
        }
        $content = iconv("Windows-1251", "UTF-8", $testResponce);
        setRawDocState(1);
    } else {
        /*
         * Старт процедуры распознавания.
         * Авторизация в сервисе.
         */
        $app = new cloud42;
        //$app->setTest($logResults);
        $app->login = CLOUD42_LOGIN;

        if (!$app->getToken(CLOUD42_PASSWORD)) {
            $result['success'] = false;
            $result['problem'] = 'auth';
            echo json_encode($result, 512);
            exit;
        }
        if(empty($packguid)) {
            setRawDocState(2);

            $content = '';

            /** Пакет распознавания в API облачного сервиса. */
            $packguid = $app->createPackage();

            if (!$packguid) {
                $result['success'] = false;
                $result['problem'] = 'create_package';
                echo json_encode($result, 512);
                exit;
            }

            PDO_exec("UPDATE $maindbname.tr_scans_rawdocs
            SET packguid = :packguid
            WHERE id=:rawdoc_id AND
                  userId=:userid", [
                ["rawdoc_id", $rawDocId, 1],
                ["userid", $UserId, 1],
                ["packguid", $packguid, 1],
            ]);

            /** Фиксация шаблона документа в API облачного сервиса. */
            if ($docType !== 'AUTO') {
                if (!$app->setTemplates($packguid, $docType)) {
                    $result['success'] = false;
                    $result['problem'] = 'doc_type';
                    $result['state'] = -1;
                    echo json_encode($result, 512);
                    exit;
                }
            }

            /** Передача файлов в API облачного сервиса. */
            $getRawDocFilesPrepared = getRawDocFiles();

            if (!$getRawDocFilesPrepared) {
                $result['state'] = -1;
                $result['success'] = false;
                $result['problem'] = 'convert pdf file problem';
                echo json_encode($result, 512);
                exit;
            }

            foreach ($getRawDocFilesPrepared as $existingFile) {
                if (!$app->uploadFile($packguid, SCANS_DIR . $existingFile['file_server_name'])) {
                    $result['success'] = false;
                    $result['problem'] = 'upload file error';
                    $result['state'] = -1;
                    echo json_encode($result, 512);
                    exit;
                }
            }

            /* Старт распознавания в API облачного сервиса. */
//        if (count($getRawDocFilesPrepared) > 1) {
            // Многостраничный документ.
            /*
             * https://jira.action-media.ru/browse/GBS-7593
             * Поменял $app->recognizeAsSingle на $app->recognize
             * потому что при мультизагрузке данный метод не всегда работает как надо
             */
            if (!$app->recognize($packguid)) {
                $result['success'] = false;
                $result['problem'] = 'recognize';
                $result['state'] = -1;
                echo json_encode($result, 512);
                setRawDocField('state_desc', $result['problem']);
                setRawDocState(-1);
                exit;
            }
        }
        /*        } else {
                    if (!$app->recognize($packguid)) {
                        $result['success'] = false;
                        $result['problem'] = 'recognize';
                        $result['state'] = -1;
                        echo json_encode($result, 512);
                        setRawDocField('state_desc', $result['problem']);
                        setRawDocState(-1);
                        exit;
                    }*/
//        }

        /*
         * Запрос с интервалом 5 сек к API облачного сервиса для получения статуса процесса.
         * Лимит счетчика интервалов 100, по достижении которого принудительно
         * генерируется ошибка таймаута и процесс прекращается.
         * В таблице tr_scans_rawdocs в поле state_desc записи текущего документа делается
         * запись о проблеме.
         */
        $maxIntervals = 100;
        $i = 0;
        $status = false;

        do {
            sleep(5);
            $status = $app->getPackageStatus($packguid);
            $i++;

            if ($i >= $maxIntervals) {
                $result['success'] = false;
                $result['problem'] = 'recognition timeout';
                $result['state'] = -1;
                setRawDocField('state_desc', $result['problem']);
                echo json_encode($result, 512);
                exit;
            }
        } while (array_search($status, ["Cancelled", "Error", "Ready"]) === false);

        /*
         * Фиксация проблемы с пакетом от сервиса, в случае если таймаут
         * не случился, но сервис сигнализировал о проблеме.
         * Генерируется ошибка и запись о проблеме в таблицу tr_scans_rawdocs,
         * процедура прекращается.
         */
        if ($status != "Ready") {
            $result['success'] = false;
            $result['problem'] = 'server_response:' . $status;
            setRawDocField('state_desc', $result['problem']);
            setRawDocState(-1);
            echo json_encode($result, 512);
            exit;
        }

        $r = $app->getRecognizedDocs($packguid);

        /*
         * Сервис не смог обработать пакеты.
         * Генерируется ошибка и запись о проблеме в таблицу tr_scans_rawdocs,
         * процедура прекращается.
         */
        if ($r === false) {
            $result['success'] = false;
            $result['problem'] = 'problem with guid';
            $result['state'] = -1;
            echo json_encode($result, 512);
            setRawDocField('state_desc', $result['problem']);
            setRawDocState(-1);
            exit;
        }

        /*
         * Сервис обработал пакет.
         *
         * Сценарий:
         * 1. Сервис не вернул структуру свойств документа по указанному guid.
         * Генерируется ошибка и запись о проблеме в таблицу tr_scans_rawdocs,
         * процедура прекращается.
         * 2. Сервис вернул структуру свойств документа по указанному guid.
         * Запрашивается содержание указанного пакета / документа.
         *
         */
        foreach ($r as $docguid) {
            $resultFile = $app->getDocumentProperties($docguid);

            /*                file_put_contents('/var/www/vhosts/data/online/buh/scans/docguid.txt', $docguid . PHP_EOL);
                            file_put_contents('/var/www/vhosts/data/online/buh/scans/packagedoc.txt', print_r($resultFiles, true));*/

            if ($resultFile === false) {
                $result['success'] = false;
                $result['problem'] = 'Package properties extraction error.';
                $result['state'] = -1;
                echo json_encode($result, 512);
                setRawDocField('state_desc', $result['problem']);
                setRawDocState(-1);
                exit;
            }

            if (!empty($resultFile['XmlResultFileId'])) {
                $contentPart = $app->downloadResultFile($resultFile['XmlResultFileId']);
                $content .= $contentPart;
            }

//            file_put_contents('/var/www/vhosts/data/online/buh/scans/content.xml', $content);

            /*                foreach ($resultFiles as $fileId) {
                                $contentPart = $app->downloadResultFile($fileId);
                                $content .= $contentPart;
                            }*/
            /*            } else {
                            $doc = $app->getDocumentProperties($docguid);

                            if ($doc === false) {
                                $result['success'] = false;
                                $result['problem'] = 'Document properties extraction error.';
                                $result['state'] = -1;
                                echo json_encode($result, 512);
                                setRawDocField('state_desc', $result['problem']);
                                setRawDocState(-1);
                                exit;
                            }

                            // скачивание по гуиду в XML
                            $contentPart = $app->downloadResultFile($doc["XmlResultFileId"]);
                            $content .= $contentPart;
                        }*/
        }

        // Удаление пакета.
        $packageDeleted = $app->deletePackage($packguid);

        /*
         * Сервис не вернул содержание документов.
         * Генерируется ошибка и запись о проблеме в базу.
         */
        if (!$content) {
            $result['success'] = false;
            $result['problem'] = 'decoding';
            $result['state'] = -1;
            echo json_encode($result, 512);
            setRawDocField('state_desc', $result['problem']);
            setRawDocState(-1);
            exit;
        }
    }

    /*
     * Облачный сервис успешно выполнил процедуру.
     * Старт обработки на стороне Системы.
     *
     * $user['nalog_mode'] - не определен - УСН, иначе ОСНО.
     * $result['dir'] - не определен - Товары по умолчанию (для УСН).
     * $result['sc_ssc'] - не определен - Товары по умолчанию (для ОСНО).
     * $selSc_ssc['analit1'] - не определен - Справочник Товары по умолчанию.
     *
     * Справочник $analitId:
     * 3 - Материалы,
     * 4 - Продукция,
     * 5 - Товары.
     *
     */
    if (!$user['nalog_mode']) {
        $result['dir'] = readState('scans_import_dir');

        if (!$result['dir']) {
            $selDir = PDO_row("SELECT *
                FROM pu2014.tr_sp_sod_user
                WHERE UserId=:userid AND 
                      id_orig=:id_orig 
                LIMIT 1", [
                $_auid, ['id_orig', 70, 2]
            ]);

            $result['dir'] = $selDir['id'];
            saveState('scans_import_dir', $result['dir']);
        } else {
            $selDir = PDO_row("SELECT * 
                FROM pu2014.tr_sp_sod_user 
                WHERE UserId=:userid AND 
                      id=:id 
                LIMIT 1", [
                $_auid, ['id', $result['dir'], 2]
            ]);
        }

        $analitId = $selDir['id_analit2'];
        $result['dir_name'] = iconv("Windows-1251", "UTF-8", $selDir['name']);
        $result['sc_ssc'] = $selDir['acc'];
    } else {
        $result['sc_ssc'] = readState('scans_import_sc_ssc');

        if (!$result['sc_ssc']) {
            $result['sc_ssc'] = '41.1';
            saveState('scans_import_sc_ssc', $result['sc_ssc']);
        }

        $result['dir'] = 0;
        $result['dir_name'] = '';
    }

    setRawDocField('id_j_dr', $result['dir']);
    setRawDocField('sc_ssc', $result['sc_ssc']);

    $call = "call pu2014.getPlan(:userid, :curryear);";
    PDO_exec($call, [['userid', $UserId], ['curryear', $currYear]]);

    $selSc_ssc = PDO_row("SELECT *
                      FROM pu2014.tr_plan_user
                      WHERE sc_ssc=:sc_ssc AND 
                            UserId=:userid
                      LIMIT 1", [
        ["userid", $UserId], ['sc_ssc', $result['sc_ssc']]
    ]);

    if ($selSc_ssc['analit1']) {
        $analitId = $selSc_ssc['analit1'];
    } else {
        $analitId = 5;
    }

    if (!in_array($analitId, [3, 4, 5])) {
        $analitId = 5;
    }

    setRawDocField('id_analit', $analitId);

    $docDate = getTagContent($content, 'DocDate');
    $dateArray = explode('-', $docDate);

    if (count($dateArray) === 3) {
        $result['doc_date'] = $dateArray[2] . '.' . $dateArray[1] . '.' . $dateArray[0];
    } else {
        $result['doc_date'] = date('d.m.Y');
    }

    setRawDocField('rawdate', $result['doc_date']);

    $contraInn = getTagContent($content, 'IssINN');
    $result['contra_inn'] = $contraInn;

    $sel = PDO_row("SELECT id, naim
                    FROM pu2014.tr_contra
                    WHERE userid=:userid AND 
                          inn=:inn
                    LIMIT 1", [
        $_auid, ['inn', $contraInn, 2]
    ]);

    if (!empty($sel['id']) && !empty($contraInn)) {
        $result['contra_name'] = iconv("Windows-1251", "UTF-8", $sel['naim']);
        $result['contra_id'] = $sel['id'];
    } else {
        $contraName = getTagContent($content, 'IssCompany');

        if (!empty($contraName)) {
            $result['contra_name'] = $contraName;
            $sel = PDO_row("SELECT id
                        FROM pu2014.tr_contra
                        WHERE userid=:userid AND 
                              naim=:naim
                        LIMIT 1", [
                $_auid, ['naim', iconv("UTF-8", "Windows-1251", $contraName), 2]
            ]);

            if (!empty($sel['id'])) {
                $result['contra_id'] = $sel['id'];
            } else {
                $result['contra_id'] = 0;
            }

            setRawDocField('contra_name', iconv("UTF-8", "Windows-1251", $result['contra_name']));
        } else {
            $result['contra_name'] = 'Не определено';
            $result['contra_id'] = 0;

            setRawDocField('contra_name', $result['contra_name']);
        }
    }

    setRawDocField('contra_id', $result['contra_id']);
    $iter = 0;

    preg_match_all('/<_Table1>(.+)\<\/_Table1>/sU', $content, $xmlArr);

    $tables = [
        '3' => 'pu2014.tr_mat',
        '4' => 'pu2014.tr_prod',
        '5' => 'pu2014.tr_tovar'
    ];

    foreach ($xmlArr[1] as $tableString) {
        $name = getTagContent($tableString, 'Descript');

        $result['data'][$iter]['desc'] = $name;
        $result['data'][$iter]['sc_ssc'] = $result['sc_ssc'];
        $result['data'][$iter]['sprav'] = $analitId;

        $sql = "SELECT id, edizm_id
                FROM " . $tables[$analitId] . "
                WHERE UserId=:userid AND
                    name=:name AND
                    deleted=0
                LIMIT 1";

        $rowNomenkl = PDO_row($sql, [$_auid, ['name', iconv("UTF-8", "Windows-1251", $name), 2]]);

        if (!empty($rowNomenkl['id'])) {
            $cId = $rowNomenkl['id'];
            $edId = $rowNomenkl['edizm_id'];

            $sql = "SELECT name 
                    FROM pu2014.tr_sp_edizm 
                    WHERE UserId=:userid AND 
                          id=:id 
                    LIMIT 1";
            $rowUnit = PDO_row($sql, [$_auid, ['id', $edId, 1]]);
            $unit = iconv("Windows-1251", "UTF-8", $rowUnit['name']);
        } else {
            $cId = $edId = 0;
            $unit = '';
            $unitCode = getTagContent($tableString, 'UnitCode');

            if ($unitCode) {
                $sql = "SELECT name, id 
                        FROM pu2014.tr_sp_edizm 
                        WHERE UserId=:userid AND 
                              okei=:okei 
                        LIMIT 1";
                $rowUnit = PDO_row($sql, [$_auid, ['okei', $unitCode, 1]]);

                if (!empty($rowUnit['name'])) {
                    $unit = iconv("Windows-1251", "UTF-8", $rowUnit['name']);
                    $edId = $rowUnit['id'];
                }
            }

            if (!$unit) {
                $unit = getTagContent($tableString, 'Unit');

                if ($unit) {
                    $sql = "SELECT name, id 
                            FROM pu2014.tr_sp_edizm 
                            WHERE UserId=:userid AND 
                                  name=:name 
                            LIMIT 1";
                    $rowUnit = PDO_row($sql, [$_auid, ['name', iconv("UTF-8", "Windows-1251", $unit), 2]]);

                    if (!empty($rowUnit['name'])) {
                        $unit = iconv("Windows-1251", "UTF-8", $rowUnit['name']);
                        $edId = $rowUnit['id'];
                    }
                }
            }
        }

        $result['data'][$iter]['items_id'] = $cId;
        $gty = getTagContent($tableString, 'Qty');
        $result['data'][$iter]['qty'] = (int)$gty;

        if (!$result['data'][$iter]['qty']) {
            $gty = 1;
            $result['data'][$iter]['qty'] = '1';
        }

        $result['data'][$iter]['edizm_name'] = $unit;
        $result['data'][$iter]['edizm_id'] = $edId;
        $nds = getTagContent($tableString, 'TaxRate');

        if (!$nds || !array_key_exists($nds, $ndsArray)) {
            $nds_id = '4';
            $nds = '0.00';
        } else {
            $nds_id = $ndsArray[$nds];
            $nds = $ndsArray2Calc[$nds];
        }

        $summa = getTagContent($tableString, 'SumWithTax');

        if ((int)$summa > 0) {
            $result['data'][$iter]['summa'] = $summa;
            $result['data'][$iter]['pricends'] = round($result['data'][$iter]['summa'] / $gty, 2);
            $result['data'][$iter]['price'] = round($result['data'][$iter]['pricends'] / (1 + $ndsArray2Calc[$nds] / 100), 2);
            $result['data'][$iter]['summabnds'] = round($gty * $result['data'][$iter]['price'], 2);
            $result['data'][$iter]['nds'] = round($result['data'][$iter]['summabnds'] * $nds / 100, 2);
        } else {
            $result['data'][$iter]['price'] = getTagContent($tableString, 'Price');
            $result['data'][$iter]['pricends'] = round($result['data'][$iter]['price'] + $result['data'][$iter]['price'] * $nds / 100, 2);
            $result['data'][$iter]['summabnds'] = round($gty * $result['data'][$iter]['price'], 2);
            $result['data'][$iter]['nds'] = round($result['data'][$iter]['summabnds'] * $nds / 100, 2);
            $result['data'][$iter]['summa'] = $result['data'][$iter]['summabnds'] + $result['data'][$iter]['nds'];
        }

        $query = "INSERT INTO $maindbname.tr_scans_rawdoc_rows
                      (userId,
                       rawdoc_id,
                       row_num,
                       item_id_analit,
                       item_id,
                       item_name,
                       edizm_id,
                       edizm_name,
                       kol,
                       cenabeznds,
                       nds_id,
                       cena,
                       summabeznds,
                       summands,
                       summa,
                       created_at,
                       updated_at)
                    VALUES
                      (:userid,
                       :rawdoc_id,
                       :row_num,
                       :item_analit_id,
                       :item_id,
                       :item_name,
                       :edizm_id,
                       :edizm_name,
                       :kol,
                       :cenabeznds,
                       :nds_id,
                       :cena,
                       :summabeznds,
                       :summands,
                       :summa,
                       NOW(),
                       NOW())";

        $values = [
            ["userid", $UserId],
            ["rawdoc_id", $result['rawdoc_id'], 1],
            ["row_num", $iter, 1],
            ["item_analit_id", $analitId, 1],
            ["item_id", $result['data'][$iter]['items_id'], 1],
            ["item_name", iconv("UTF-8", "Windows-1251", $result['data'][$iter]['desc']), 2],
            ["edizm_id", $result['data'][$iter]['edizm_id'], 1],
            ["edizm_name", iconv("UTF-8", "Windows-1251", $result['data'][$iter]['edizm_name']), 2],
            ["kol", $result['data'][$iter]['qty'], 1],
            ["cenabeznds", $result['data'][$iter]['price'], 1],
            ["nds_id", $nds_id, 1],
            ["cena", $result['data'][$iter]['pricends'], 1],
            ["summabeznds", $result['data'][$iter]['summabnds'], 1],
            ["summands", $result['data'][$iter]['nds'], 1],
            ["summa", $result['data'][$iter]['summa'], 1],
        ];

        $ret = PDO_exec($query, $values);
        $iter++;
    }

    $result['data'] = '';
    setRawDocState(1);
} else {
    // Возврат результирующей структуры.
    getRawDocFiles();

    // Подбор склада.
    $selSkl = PDO_row("SELECT id, name
                   FROM pu2014.tr_sklad
                   WHERE UserId=:userid AND 
                         deleted=0
                   ORDER BY id
                   LIMIT 1", [
        $_auid
    ]);

    $result['sklad_id'] = $selSkl['id'];
    $result['sklad_name'] = iconv("Windows-1251", "UTF-8", $selSkl['name']);
    $result['doc_date'] = $selRawdoc['rawdate'];
    $result['contra_name'] = iconv("Windows-1251", "UTF-8", $selRawdoc['contra_name']);
    $result['contra_id'] = $selRawdoc['contra_id'];
    $result['sc_ssc'] = $selRawdoc['sc_ssc'];
    $result['analit_id'] = $selRawdoc['sc_ssc'];
    $result['dir'] = $selRawdoc['id_j_dr'];

    $selDir = PDO_row("SELECT * 
                        FROM pu2014.tr_sp_sod_user 
                        WHERE UserId=:userid AND 
                              id=:id 
                        LIMIT 1", [
        $_auid, ['id', $result['dir'], 1]
    ]);

    $result['dir_name'] = iconv("Windows-1251", "UTF-8", $selDir['name']);
    $result['dir_type'] = $selRawdoc['id_analit'];
}

echo json_encode($result, 512);
