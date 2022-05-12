<?php

/**
 * Интеграция с API сервиса распознавания.
 * Интеграция с Recognition 42 (@link http://recognition.42clouds.com)
 * Взаимодействие выполняется в формате xml.
 *
 * В текущей версии все URL API сервиса распознавания размещены в константах:
 * AUTH_URL - авторизация.
 * CREATE_PACKAGE_URL - создание нового пакета.
 * SET_TEMPLATES_URL - назначение типов шаблонов распознавания (через запятую).
 * UPLOAD_URL - добавление файлов в пакет с последующей загрузкой. Файлы передаются в теле запроса.
 * RECOGNIZE_URL - запрос на распознавание пакета с изображениями и таблицами.
 * RECOGNIZE_MULTIPAGES_URL - запрос инициации процесса распознавания всех файлов пакета как единого документа.
 * PACKAGE_STATUS_URL - запрос о текущем статусе обработки пакета.
 * DOCS_LIST_URL - запрос списка идентификаторов документов, полученных в процессе распознавания пакета.
 * DOC_PROPERTIES_URL - запрос полного списка параметров распознанного документа.
 * DOWNLOAD_URL - запрос получения результирующего файла.
 * DELETE_PACKAGE_URL - запрос удаления пакета и связанных с ним данных.
 * DOC_PAGES_URL - запрос получения страниц документа.
 * PAGE_PROPERTIES_URL - запрос получения свойств страницы.
 * DOWNLOAD_PAGE_URL - запрос получения распознанной страницы.
 * PACKAGE_HIERARCHY_PROPERTIES_URL - запрос информации о пакете и всех включенных в него файлах и документах.
 *
 * Коды возврата/ошибок:
 * 1-9 - ошибки коммуникации с API сервиса распознавания,
 * 10-19 - ошибки парсера XML,
 * 20-29 - неперехватываемые исключения.
 *
 * @method getToken
 * @method createPackage
 * @method setTemplates
 * @method uploadFile
 * @method recognize
 * @method recognizeAsSingle
 * @method getPackageStatus
 * @method getRecognizedDocs
 * @method getDocumentProperties
 * @method getPackageProperties
 * @method downloadResultFile
 * @method deletePackage
 * @method parseResponse
 *
 * @uses online.buhsoft.ru/2020/buh_nd/classes/common/GbsCurl.php
 * @uses online.buhsoft.ru/2020/buh_nd/classes/recognition/cloud42/xml.class.php
 *
 * @param array  $errormsg стек данных об ошибках
 * @param string $login    логин в API распознавания
 * @param string $token    сессионный токен API распознавания
 * @param string $_answer  структура ответной части API распознавания
 * @param object $parser   инъекция класса xmlfile
 * @param bool   $test     флаг логирования информации
 *
 */

require_once "xml.class.php";
require_once __DIR__ . "/../../common/GbsCurl.php";

class cloud42
{
    public $errormsg = [];
    public $login;
    public $token;
    private $_answer;
    private $cUrl;
    private $parser;
    private $_test = false;

    const AUTH_URL = 'http://core.42clouds.com/api_v2/AccountUserSessions/Login';
    const CREATE_PACKAGE_URL = 'http://recognition.42clouds.com/api_v1/RecognitionPackages/CreatePackage';
    const SET_TEMPLATES_URL = 'http://recognition.42clouds.com/api_v1/RecognitionPackages/SetPackageTemplates';
    const UPLOAD_URL = 'http://recognition.42clouds.com/api_v1/SourceFiles/UploadFileUsingDirectStream';
    const RECOGNIZE_URL = 'http://recognition.42clouds.com/api_v1/RecognitionPackages/RecognizePackage';
    const RECOGNIZE_MULTIPAGES_URL = 'http://recognition.42clouds.com/api_v1/RecognitionPackages/RecognizeAsSingleDocument';
    const PACKAGE_STATUS_URL = 'http://recognition.42clouds.com/api_v1/RecognitionPackages/GetPackageStatus';
    const DOCS_LIST_URL = 'http://recognition.42clouds.com/api_v1/RecognitionPackages/GetPackageRecognizedDocumentsList';
    const DOC_PROPERTIES_URL = 'http://recognition.42clouds.com/api_v1/RecognizedDocuments/GetDocumentProperties';
    const DOWNLOAD_URL = 'http://recognition.42clouds.com/api_v1/ResultFiles/DownloadFile';
    const DELETE_PACKAGE_URL = 'http://recognition.42clouds.com/api_v1/RecognitionPackages/DeletePackage';
    const DOC_PAGES_URL = 'http://recognition.42clouds.com/api_v1/RecognizedDocuments/GetDocumentPagesList';
    const PAGE_PROPERTIES_URL = 'http://recognition.42clouds.com/api_v1/DocumentPages/GetPageProperties';
    const DOWNLOAD_PAGE_URL = 'http://recognition.42clouds.com/api_v1/DocumentPages/DownloadPage';
    const PACKAGE_HIERARCHY_PROPERTIES_URL = 'http://recognition.42clouds.com/api_v1/RecognitionPackages/GetPackageHierarchyProperties';

    function __construct()
    {
        $this->cUrl = GbsCurl::getInstance();
        $this->parser = new xmlfile;
    }

    public function setTest($arg)
    {
        $this->_test = $arg;
    }

    public function getTest()
    {
        return $this->_test;
    }

    /**
     * Method getToken.
     *
     * Выполняется вход в облако по логину/паролю. Создается запись с новой сессией пользователя.
     * Токен авторизации возвращается в теле ответа.
     *
     * Пример запроса:
     * <Request>
     * <AccountUserLogin>ЛОГИН</AccountUserLogin>
     * <AccountUserPassword>ПАРОЛЬ</AccountUserPassword>
     * <ClientDescription>ИДЕНТИФИКАТОР СЕРВИСА</ClientDescription>
     * <ClientDeviceInfo>ИГНОРИРУЕМ</ClientDeviceInfo>
     * </Request>
     *
     * Пример ответа:
     * <Result>
     * <Token>71c8aa58-392a-4f94-b052-f7d60475d3fd</Token>
     * </Result>
     *
     * @param string $password
     * @param string $description
     *
     * @return bool
     */
    public function getToken($password, $description = 'r42')
    {
        $params = "<Request>\n";
        $params .= "<AccountUserLogin>" . $this->login . "</AccountUserLogin>\n";
        $params .= "<AccountUserPassword>" . $password . "</AccountUserPassword>\n";
        $params .= "<ClientDescription>" . $description . "</ClientDescription>\n";
        $params .= "</Request>";

        $this->_answer = $this->cUrl->post(self::AUTH_URL, $params);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        $this->token = $this->parseResponse($this->_answer['data'], ['Result', 'Token']);
                        return true;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method createPackage.
     *
     * Запрос на создание нового пакета распознавания.
     * В заголовке должен быть указан сессионный токен.
     *
     * Пример запроса:
     * <Request>
     * <OwnerID>7167ee1c-a68f-4aa7-86c9-1f81b1732c33</OwnerID>
     * <AccountID>30076359-f3e6-4952-ba8f-4580ba9bad42</AccountID>
     * </Request>
     *
     * По факту достаточно передать в теле запроса <Request>\n</Request>;
     *
     * Пример ответа:
     * <Result>
     * <RecognitionPackageId>1c06dc45-ca03-415c-9fd2-60680913f218</RecognitionPackageId>
     * </Result>
     *
     * @return bool|string
     */
    function createPackage()
    {
        $params = "<Request>\n</Request>";

        $this->_answer = $this->cUrl->post(self::CREATE_PACKAGE_URL, $params, ["Token: " . $this->token]);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        return $this->parseResponse($this->_answer['data'], ['Result', 'RecognitionPackageId']);
                        break;
                    case 401:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "Ошибка авторизации по токену " . $this->token . ".",
                            'code' => 2
                        ];
                        return false;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method setTemplates.
     *
     * Назначение типов шаблонов распознавания для указанного пакета распознавания (через запятую).
     * В заголовке должен быть указан сессионный токен.
     *
     * Пример запроса:
     * <Request>
     * <RecognitionPackageID>1eb6caf6-3c63-48d9-ab18-2b84cb806f5e</RecognitionPackageID>
     * <RecognitionTemplatesTypes>UD,SF</RecognitionTemplatesTypes>
     * </Request>
     *
     * Пример ответа:
     * <Result />
     *
     * Используемые типы шаблонов :
     * 'AUTO' ('Тип документа не выбран'),
     * 'UD', ('УПД'),
     * 'SF' ('Счет-фактура')
     * 'SC' ('Счет на оплату')
     * 'TN' ('Товарная накладная')
     *
     * @param string $packageGuid - идентификатор пакета
     * @param string $types       - шаблон/список шаблонов
     *
     * @return bool
     */
    function setTemplates($packageGuid, $types)
    {
        $params = "<Request>\n";
        $params .= "<RecognitionPackageID>" . $packageGuid . "</RecognitionPackageID>\n";
        $params .= "<RecognitionTemplatesTypes>" . $types . "</RecognitionTemplatesTypes>\n";
        $params .= "</Request>";

        $this->_answer = $this->cUrl->post(self::SET_TEMPLATES_URL, $params, ["Token: " . $this->token]);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        return true;
                        break;
                    case 401:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "Ошибка авторизации по токену " . $this->token . ".",
                            'code' => 2
                        ];
                        return false;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method uploadFile.
     *
     * Запрос добавления файлов в пакет с последующей загрузкой. Файл передается в теле запроса
     * В заголовке должны быть указаны:
     * 1. Token (сессионный токен).
     * 2. User-Agent (логин).
     * 3. Content-Disposition: RecognitionPackageID=идентификатор_пакета
     *
     * В запросе отправляется объект CURLFile.
     * @link https://secure.php.net/manual/en/curlfile.construct.php
     *
     * Пример ответа:
     * <Result>
     * <SourceFilesList type="sample string 1">
     * <SourceFileId>ca9907d7-6900-49a6-acb7-b20fdac722b7</SourceFileId>
     * <SourceFileId>215631a2-1506-4d35-a8cb-c03668b097f8</SourceFileId>
     * </SourceFilesList>
     * </Result>
     *
     * @param $packageGuid - идентификатор пакета
     * @param $fileName    - имя файла
     *
     * @return bool
     */
    function uploadFile($packageGuid, $fileName)
    {
        $file = new CURLFile($fileName, "application/octet-stream");

        $params = ["file" => $file];

        $header = [
            "Token: " . $this->token,
            "User-Agent: " . $this->login,
            "Content-Disposition: RecognitionPackageID=" . $packageGuid . ";"
        ];

        $this->_answer = $this->cUrl->post(self::UPLOAD_URL, $params, $header);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        $result = $this->parseResponse($this->_answer['data'],
                            ['Result', 'SourceFilesList', 'SourceFileId']);
                        return $result !== false;
                        break;
                    case 401:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "Ошибка авторизации по токену " . $this->token . ".",
                            'code' => 2
                        ];
                        return false;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method recognize.
     *
     * Запрос на распознавание пакета с изображениями и таблицами.
     * В заголовке должен быть указан сессионный токен.
     *
     * Пример запроса:
     * <Request>
     * <RecognitionPackageID>46a018fd-119c-4443-acb7-ca14bd59718a</RecognitionPackageID>
     * <QuickRecognize>false</QuickRecognize>
     * </Request>
     *
     * Пример ответа:
     * <Result />
     *
     * @param      $packageGuid - идентификатор пакета
     * @param bool $quick       false|true (стандартный режим|без очереди)
     *
     * @return bool
     */
    function recognize($packageGuid, $quick = false)
    {
        $params = "<Request>\n";
        $params .= "<RecognitionPackageID>" . $packageGuid . "</RecognitionPackageID>\n";
        $params .= "<QuickRecognize>" . ($quick ? "true" : "false") . "</QuickRecognize>\n";
        $params .= "</Request>";

        $this->_answer = $this->cUrl->post(self::RECOGNIZE_URL, $params, ["Token: " . $this->token]);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        return true;
                        break;
                    case 401:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "Ошибка авторизации по токену " . $this->token . ".",
                            'code' => 2
                        ];
                        return false;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method recognizeAsSingle.
     *
     * Запрос инициации процесса распознавания всех файлов пакета как единого документа.
     * В заголовке должен быть указан сессионный токен.
     *
     * Пример запроса:
     * <Request>
     * <RecognitionPackageID>cf0e9c42-61be-40e1-b185-afaf25a0dad5</RecognitionPackageID>
     * </Request>
     *
     * Пример ответа:
     * <Result />
     *
     * @param $packageGuid - идентификатор пакета
     *
     * @return bool
     */
    function recognizeAsSingle($packageGuid)
    {
        $params = "<Request>\n";
        $params .= "<RecognitionPackageID>" . $packageGuid . "</RecognitionPackageID>\n";
        $params .= "</Request>";

        $this->_answer = $this->cUrl->post(self::RECOGNIZE_MULTIPAGES_URL, $params, ["Token: " . $this->token]);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        return true;
                        break;
                    case 401:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "Ошибка авторизации по токену " . $this->token . ".",
                            'code' => 2
                        ];
                        return false;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method getPackageStatus.
     *
     * Получение информации о текущем статусе обработки пакета.
     * В заголовке должен быть указан сессионный токен.
     *
     * В теле запроса ничего не передается (get).
     *
     * Пример ответа:
     * <Result>
     * <Status>Ready</Status>
     * </Result>
     *
     * @param $packageGuid - идентификатор пакета
     *
     * @return bool|string false|("Cancelled"|"Error"|"Ready")
     */
    function getPackageStatus($packageGuid)
    {
        $params = [
            'recognitionPackageId' => $packageGuid
        ];

        $this->_answer = $this->cUrl->get(self::PACKAGE_STATUS_URL, $params, ["Token: " . $this->token]);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        return $this->parseResponse($this->_answer['data'], ['Result', 'Status']);
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method getRecognizedDocs.
     *
     * Запрос списка идентификаторов документов, полученных в процессе распознавания пакета.
     * В заголовке должен быть указан сессионный токен.
     *
     * В теле запроса ничего не передается (get).
     *
     * Пример ответа:
     * <Result>
     * <RecognizedDocumentsList type="sample string 1">
     * <RecognizedDocumentId>b62f2c47-1c8d-4a1a-a710-5429e439fa21</RecognizedDocumentId>
     * <RecognizedDocumentId>59050204-524d-4cb3-a1fb-bc9be8404fbf</RecognizedDocumentId>
     * </RecognizedDocumentsList>
     * </Result>
     *
     * @param $packageGuid - идентификатор пакета
     *
     * @return array|bool
     */
    function getRecognizedDocs($packageGuid)
    {
        $params = [
            'recognitionPackageId' => $packageGuid
        ];

        $this->_answer = $this->cUrl->get(self::DOCS_LIST_URL, $params, ["Token: " . $this->token]);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        $result = [];
                        $check = $this->parseResponse($this->_answer['data'], ['Result', 'RecognizedDocumentsList']);

                        if ($check !== false) {
                            if ((isset($this->parser->tags[0]['child'][0]['child']) &&
                                is_array($this->parser->tags[0]['child'][0]['child']))) {
                                foreach ($this->parser->tags[0]['child'][0]['child'] as $child) {
                                    if (!empty($child['name']) && $child['name'] == 'RecognizedDocumentId') {
                                        $result[] = trim($child['value']);
                                    }
                                }
                            }
                        }

                        return $result;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method getDocumentProperties.
     *
     * Запрос полного списка параметров распознанного документа.
     * В заголовке должен быть указан сессионный токен.
     *
     * В теле запроса ничего не передается (get).
     *
     * Пример ответа:
     * <Result>
     * <Id>acb7f7e7-6fad-4f32-95bc-d5dc99da15bb</Id> (идентификатор документа)
     * <RecognitionPackageId>a5030851-0ed5-476a-9a31-34244a6ad2fc</RecognitionPackageId> (идентификатор пакета)
     * <Status>TemplateAssigned</Status> (статус документа)
     * <Type>sample string 3</Type> (тип документа - шаблон)
     * <CreateDate>2020-05-09T22:51:53.6368065+03:00</CreateDate> (дата и время создания документа)
     * <EditDate>2020-05-09T22:51:53.6368065+03:00</EditDate> (дата и время редактирования документа)
     * <XmlResultFileId>e1d491d1-8307-4b38-92b8-221f30a0149c</XmlResultFileId> (ID для скачивания в XML)
     * <PdfResultFileId>459f3169-6336-4daa-8cb3-842a1715efde</PdfResultFileId> (ID для скачивания в PDF)
     * <Comment>sample string 4</Comment> (примечание)
     * </Result>
     *
     * @param $docGuid - идентификатор документа
     *
     * @return array|bool
     */
    function getDocumentProperties($docGuid)
    {
        $params = [
            'recognizedDocumentId' => $docGuid
        ];

        $this->_answer = $this->cUrl->get(self::DOC_PROPERTIES_URL, $params, ["Token: " . $this->token]);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        $result = [];
                        $check = $this->parseResponse($this->_answer['data'], ['Result', 'Id']);
                        if ($check !== false) {
                            foreach ($this->parser->tags[0]['child'] as $child) {
                                if (!empty($child['name'])) {
                                    $result[$child['name']] = trim($child['value']);
                                }
                            }
                        }

                        return $result;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Метод getPackageProperties.
     *
     * Запрос информации о пакете и всех включенных в него файлах и документах.
     * В заголовке должен быть указан сессионный токен.
     *
     * В теле запроса ничего не передается (get).
     *
     * Пример ответа:
     * <Result>
     * <Id>9e6c8f9c-fd89-484e-ab41-14c889c0a6e5</Id>
     * <OwnerId>3c1cc777-3a10-4777-ad1d-e24803cf8916</OwnerId>
     * <AccountId>081979d4-923c-4ef6-84c8-c6b54ab60dd4</AccountId>
     * <RecognitionTemplatesTypes>sample string 4</RecognitionTemplatesTypes>
     * <CreateDate>2020-05-09T01:23:20.317361+03:00</CreateDate>
     * <EditDate>2020-05-09T01:23:20.317361+03:00</EditDate>
     * <Status>New</Status>
     * <Type>Scancopies</Type>
     * <ExportPath>sample string 6</ExportPath>
     * <PdfResultFileId>sample string 7</PdfResultFileId>
     * <WebDavLogin>sample string 8</WebDavLogin>
     * <Comment>sample string 9</Comment>
     * <RecognizedDocuments type="sample string 1">
     * <Row>
     * <Id>4eb84599-ad2a-4efe-8ad1-36c6bd4d24bc</Id>
     * <RecognitionPackageId>fab30d66-3051-42de-9cc9-1ad5244db071</RecognitionPackageId>
     * <Status>TemplateAssigned</Status>
     * <Type>sample string 3</Type>
     * <CreateDate>2020-05-09T01:23:20.317361+03:00</CreateDate>
     * <EditDate>2020-05-09T01:23:20.317361+03:00</EditDate>
     * <XmlResultFileId>51b24b99-f872-48b9-90e8-acee6ec5798a</XmlResultFileId>
     * <PdfResultFileId>be6825e8-1956-42b1-a303-66457ef97788</PdfResultFileId>
     * <Comment>sample string 4</Comment>
     * <DocumentPages type="sample string 1">
     * <Row>
     * <Id>02941cf0-1724-4a37-9191-f61e5461e085</Id>
     * <RecognizedDocumentId>483addd7-04e1-460c-8148-713d779bb094</RecognizedDocumentId>
     * <SourceFileId>c40e3dd1-320f-4244-9295-e51d12c515b1</SourceFileId>
     * <PageNumber>1</PageNumber>
     * </Row>
     * <Row>
     * <Id>02941cf0-1724-4a37-9191-f61e5461e085</Id>
     * <RecognizedDocumentId>483addd7-04e1-460c-8148-713d779bb094</RecognizedDocumentId>
     * <SourceFileId>c40e3dd1-320f-4244-9295-e51d12c515b1</SourceFileId>
     * <PageNumber>2</PageNumber>
     * </Row>
     * </DocumentPages>
     * <ResultFiles type="sample string 1">
     * </Row>
     * </RecognizedDocuments>
     * </Result>
     *
     * @param $packageGuid - идентификатор пакета
     *
     * @return bool|string
     */
    function getPackageProperties($packageGuid)
    {
        $params = [
            'recognitionPackageId' => $packageGuid
        ];

        $this->_answer = $this->cUrl->get(self::PACKAGE_HIERARCHY_PROPERTIES_URL, $params, ["Token: " . $this->token]);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        $data = [];
                        $package = simplexml_load_string($this->_answer['data']);
                        $pageNo = count($package->RecognizedDocuments->Row);

                        foreach ($package->RecognizedDocuments->Row as $doc) {
                            $data[(string)$doc->DocumentPages->Row->RecognizedDocumentId] = [
                                'status' => (string)$doc->Status,
                                'type' => (string)$doc->Type,
                                'xmlResultFileId' => (string)$doc->XmlResultFileId,
                                'pageNum' => $pageNo,
                                'sourceFile' => (string)$doc->SourceFiles->Row->OriginalName,
                            ];

                            $pageNo--;
                        }

                        return $data;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method getDocumentPages.
     *
     * @param string $docGuid
     *
     * @return array|bool
     */
    function getDocumentPages($docGuid)
    {
        $params = [
            'recognizedDocumentId' => $docGuid
        ];

        $this->_answer = $this->cUrl->get(self::DOC_PAGES_URL, $params, ["Token: " . $this->token]);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        $result = [];
                        $check = $this->parseResponse($this->_answer['data'], ['Result', 'DocumentPagesList']);

                        if ($check !== false) {
                            if ((isset($this->parser->tags[0]['child'][0]['child']) &&
                                is_array($this->parser->tags[0]['child'][0]['child']))) {
                                foreach ($this->parser->tags[0]['child'][0]['child'] as $child) {
                                    if (!empty($child['name']) && $child['name'] == 'DocumentPageId') {
                                        $result[] = trim($child['value']);
                                    }
                                }
                            }
                        }

                        return $result;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method getPageProperties.
     *
     * @param string $pageId
     *
     * @return array|bool
     */
    public function getPageProperties($pageId)
    {
        $params = [
            'documentPageId' => $pageId
        ];

        $this->_answer = $this->cUrl->get(self::PAGE_PROPERTIES_URL, $params, ["Token: " . $this->token]);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        $result = [];
                        $check = $this->parseResponse($this->_answer['data'], ['Result', 'Id']);

                        if ($check !== false) {
                            if ((isset($this->parser->tags[0]['child']) &&
                                is_array($this->parser->tags[0]['child']))) {
                                foreach ($this->parser->tags[0]['child'] as $child) {
                                    if (!empty($child['name'])) {
                                        $result[$child['name']] = trim($child['value']);
                                    }
                                }
                            }
                        }

                        return $result;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method downloadPage.
     *
     * @param string $pageId
     *
     * @return bool
     */
    public function downloadPage($pageId)
    {
        $params = [
            'documentPageId' => $pageId,
            'longSideLength' => 100000
        ];

        $this->_answer = $this->cUrl->get(self::DOWNLOAD_PAGE_URL, $params, ["Token: " . $this->token]);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        return $this->_answer['data'];
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }

    }

    /**
     * Method downloadResultFile.
     *
     * Запрос на скачивание результирующего файла.
     * В заголовке должен быть указан сессионный токен.
     *
     * В теле запроса ничего не передается (get).
     *
     * Пример ответа:
     * <Result />
     *
     * @param $fileGuid - идентификатор файла - результата распознавания
     *
     * @return bool|string false|(содержание файла)
     */
    function downloadResultFile($fileGuid)
    {
        $params = [
            'resultFileID' => $fileGuid
        ];

        $this->_answer = $this->cUrl->get(self::DOWNLOAD_URL, $params, ["Token: " . $this->token]);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        return $this->_answer['data'];
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method deletePackage.
     *
     * Запрос удаления пакета и связанных с ним данных.
     * В заголовке должен быть указан сессионный токен.
     *
     * Пример запроса:
     * <Request>
     * <RecognitionPackageID>944f630a-046c-4bf4-b812-f3983f02d281</RecognitionPackageID>
     * </Request>
     *
     * Пример ответа:
     * <Result />
     *
     * @param $packageGuid - идентификатор пакета
     *
     * @return bool
     */
    function deletePackage($packageGuid)
    {
        $params = "<Request>\n";
        $params .= "<RecognitionPackageID>" . $packageGuid . "</RecognitionPackageID>\n";
        $params .= "</Request>";

        $this->_answer = $this->cUrl->post(self::DELETE_PACKAGE_URL, $params, ["Token: " . $this->token]);

        try {
            if ($this->_answer['data'] !== false) {
                switch ($this->_answer['httpCode']) {
                    case 200:
                        return true;
                        break;
                    case 401:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "Ошибка авторизации по токену " . $this->token . ".",
                            'code' => 2
                        ];
                        return false;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API сервиса вернул ошибку с кодом " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API сервиса не смог обработать запрос.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "Исключение: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method parseResponse.
     *
     * Обработка ответов API сервиса распознавания.
     *
     * @param string $xml
     * @param array  $tags
     *
     * @return bool|string
     */
    private function parseResponse($xml, $tags = [])
    {
        if (!$this->parser->opencontent($xml)) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => 'Невалидный или пустой xml.',
                'code' => 10
            ];
            return false;
        } elseif ((!isset($this->parser->tags[0]['name']) || $this->parser->tags[0]['name'] != $tags[0]) ||
            (!isset($this->parser->tags[0]['child'][0]['name']) || $this->parser->tags[0]['child'][0]['name'] != $tags[1])
        ) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => 'Некорректная структура xml.',
                'code' => 11
            ];
            return false;
        }

        return trim($this->parser->tags[0]['child'][0]['value']);
    }

    /**
     * Method setError.
     *
     * Добавление структур ошибок в стек.
     * Ограничение стека на глубину 100 элементов.
     *
     * @param array $array
     * @param int   $limit
     */
    private function setError($array, $limit = 100)
    {
        if (count($this->errormsg) === 100) {
            $_ = array_reverse($this->errormsg);
            array_pop($_);
            $this->errormsg = array_reverse($_);
        }
        $this->errormsg[] = $array;
    }

    /**
     * Method getError.
     *
     * Получение стека ошибок. Допускается извлечение среза.
     *
     * @param int $offset
     * @param int $length
     *
     * @return array
     */
    public function getError($offset = 0, $length = 0)
    {
        return array_slice($this->errormsg, $offset, $length === 0 ? count($this->errormsg) : $length);
    }

}
