<?php

/**
 * ���������� � API ������� �������������.
 * ���������� � Recognition 42 (@link http://recognition.42clouds.com)
 * �������������� ����������� � ������� xml.
 *
 * � ������� ������ ��� URL API ������� ������������� ��������� � ����������:
 * AUTH_URL - �����������.
 * CREATE_PACKAGE_URL - �������� ������ ������.
 * SET_TEMPLATES_URL - ���������� ����� �������� ������������� (����� �������).
 * UPLOAD_URL - ���������� ������ � ����� � ����������� ���������. ����� ���������� � ���� �������.
 * RECOGNIZE_URL - ������ �� ������������� ������ � ������������� � ���������.
 * RECOGNIZE_MULTIPAGES_URL - ������ ��������� �������� ������������� ���� ������ ������ ��� ������� ���������.
 * PACKAGE_STATUS_URL - ������ � ������� ������� ��������� ������.
 * DOCS_LIST_URL - ������ ������ ��������������� ����������, ���������� � �������� ������������� ������.
 * DOC_PROPERTIES_URL - ������ ������� ������ ���������� ������������� ���������.
 * DOWNLOAD_URL - ������ ��������� ��������������� �����.
 * DELETE_PACKAGE_URL - ������ �������� ������ � ��������� � ��� ������.
 * DOC_PAGES_URL - ������ ��������� ������� ���������.
 * PAGE_PROPERTIES_URL - ������ ��������� ������� ��������.
 * DOWNLOAD_PAGE_URL - ������ ��������� ������������ ��������.
 * PACKAGE_HIERARCHY_PROPERTIES_URL - ������ ���������� � ������ � ���� ���������� � ���� ������ � ����������.
 *
 * ���� ��������/������:
 * 1-9 - ������ ������������ � API ������� �������������,
 * 10-19 - ������ ������� XML,
 * 20-29 - ����������������� ����������.
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
 * @param array  $errormsg ���� ������ �� �������
 * @param string $login    ����� � API �������������
 * @param string $token    ���������� ����� API �������������
 * @param string $_answer  ��������� �������� ����� API �������������
 * @param object $parser   �������� ������ xmlfile
 * @param bool   $test     ���� ����������� ����������
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
     * ����������� ���� � ������ �� ������/������. ��������� ������ � ����� ������� ������������.
     * ����� ����������� ������������ � ���� ������.
     *
     * ������ �������:
     * <Request>
     * <AccountUserLogin>�����</AccountUserLogin>
     * <AccountUserPassword>������</AccountUserPassword>
     * <ClientDescription>������������� �������</ClientDescription>
     * <ClientDeviceInfo>����������</ClientDeviceInfo>
     * </Request>
     *
     * ������ ������:
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
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method createPackage.
     *
     * ������ �� �������� ������ ������ �������������.
     * � ��������� ������ ���� ������ ���������� �����.
     *
     * ������ �������:
     * <Request>
     * <OwnerID>7167ee1c-a68f-4aa7-86c9-1f81b1732c33</OwnerID>
     * <AccountID>30076359-f3e6-4952-ba8f-4580ba9bad42</AccountID>
     * </Request>
     *
     * �� ����� ���������� �������� � ���� ������� <Request>\n</Request>;
     *
     * ������ ������:
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
                            'msg' => "������ ����������� �� ������ " . $this->token . ".",
                            'code' => 2
                        ];
                        return false;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method setTemplates.
     *
     * ���������� ����� �������� ������������� ��� ���������� ������ ������������� (����� �������).
     * � ��������� ������ ���� ������ ���������� �����.
     *
     * ������ �������:
     * <Request>
     * <RecognitionPackageID>1eb6caf6-3c63-48d9-ab18-2b84cb806f5e</RecognitionPackageID>
     * <RecognitionTemplatesTypes>UD,SF</RecognitionTemplatesTypes>
     * </Request>
     *
     * ������ ������:
     * <Result />
     *
     * ������������ ���� �������� :
     * 'AUTO' ('��� ��������� �� ������'),
     * 'UD', ('���'),
     * 'SF' ('����-�������')
     * 'SC' ('���� �� ������')
     * 'TN' ('�������� ���������')
     *
     * @param string $packageGuid - ������������� ������
     * @param string $types       - ������/������ ��������
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
                            'msg' => "������ ����������� �� ������ " . $this->token . ".",
                            'code' => 2
                        ];
                        return false;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method uploadFile.
     *
     * ������ ���������� ������ � ����� � ����������� ���������. ���� ���������� � ���� �������
     * � ��������� ������ ���� �������:
     * 1. Token (���������� �����).
     * 2. User-Agent (�����).
     * 3. Content-Disposition: RecognitionPackageID=�������������_������
     *
     * � ������� ������������ ������ CURLFile.
     * @link https://secure.php.net/manual/en/curlfile.construct.php
     *
     * ������ ������:
     * <Result>
     * <SourceFilesList type="sample string 1">
     * <SourceFileId>ca9907d7-6900-49a6-acb7-b20fdac722b7</SourceFileId>
     * <SourceFileId>215631a2-1506-4d35-a8cb-c03668b097f8</SourceFileId>
     * </SourceFilesList>
     * </Result>
     *
     * @param $packageGuid - ������������� ������
     * @param $fileName    - ��� �����
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
                            'msg' => "������ ����������� �� ������ " . $this->token . ".",
                            'code' => 2
                        ];
                        return false;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method recognize.
     *
     * ������ �� ������������� ������ � ������������� � ���������.
     * � ��������� ������ ���� ������ ���������� �����.
     *
     * ������ �������:
     * <Request>
     * <RecognitionPackageID>46a018fd-119c-4443-acb7-ca14bd59718a</RecognitionPackageID>
     * <QuickRecognize>false</QuickRecognize>
     * </Request>
     *
     * ������ ������:
     * <Result />
     *
     * @param      $packageGuid - ������������� ������
     * @param bool $quick       false|true (����������� �����|��� �������)
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
                            'msg' => "������ ����������� �� ������ " . $this->token . ".",
                            'code' => 2
                        ];
                        return false;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method recognizeAsSingle.
     *
     * ������ ��������� �������� ������������� ���� ������ ������ ��� ������� ���������.
     * � ��������� ������ ���� ������ ���������� �����.
     *
     * ������ �������:
     * <Request>
     * <RecognitionPackageID>cf0e9c42-61be-40e1-b185-afaf25a0dad5</RecognitionPackageID>
     * </Request>
     *
     * ������ ������:
     * <Result />
     *
     * @param $packageGuid - ������������� ������
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
                            'msg' => "������ ����������� �� ������ " . $this->token . ".",
                            'code' => 2
                        ];
                        return false;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method getPackageStatus.
     *
     * ��������� ���������� � ������� ������� ��������� ������.
     * � ��������� ������ ���� ������ ���������� �����.
     *
     * � ���� ������� ������ �� ���������� (get).
     *
     * ������ ������:
     * <Result>
     * <Status>Ready</Status>
     * </Result>
     *
     * @param $packageGuid - ������������� ������
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
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method getRecognizedDocs.
     *
     * ������ ������ ��������������� ����������, ���������� � �������� ������������� ������.
     * � ��������� ������ ���� ������ ���������� �����.
     *
     * � ���� ������� ������ �� ���������� (get).
     *
     * ������ ������:
     * <Result>
     * <RecognizedDocumentsList type="sample string 1">
     * <RecognizedDocumentId>b62f2c47-1c8d-4a1a-a710-5429e439fa21</RecognizedDocumentId>
     * <RecognizedDocumentId>59050204-524d-4cb3-a1fb-bc9be8404fbf</RecognizedDocumentId>
     * </RecognizedDocumentsList>
     * </Result>
     *
     * @param $packageGuid - ������������� ������
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
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method getDocumentProperties.
     *
     * ������ ������� ������ ���������� ������������� ���������.
     * � ��������� ������ ���� ������ ���������� �����.
     *
     * � ���� ������� ������ �� ���������� (get).
     *
     * ������ ������:
     * <Result>
     * <Id>acb7f7e7-6fad-4f32-95bc-d5dc99da15bb</Id> (������������� ���������)
     * <RecognitionPackageId>a5030851-0ed5-476a-9a31-34244a6ad2fc</RecognitionPackageId> (������������� ������)
     * <Status>TemplateAssigned</Status> (������ ���������)
     * <Type>sample string 3</Type> (��� ��������� - ������)
     * <CreateDate>2020-05-09T22:51:53.6368065+03:00</CreateDate> (���� � ����� �������� ���������)
     * <EditDate>2020-05-09T22:51:53.6368065+03:00</EditDate> (���� � ����� �������������� ���������)
     * <XmlResultFileId>e1d491d1-8307-4b38-92b8-221f30a0149c</XmlResultFileId> (ID ��� ���������� � XML)
     * <PdfResultFileId>459f3169-6336-4daa-8cb3-842a1715efde</PdfResultFileId> (ID ��� ���������� � PDF)
     * <Comment>sample string 4</Comment> (����������)
     * </Result>
     *
     * @param $docGuid - ������������� ���������
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
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * ����� getPackageProperties.
     *
     * ������ ���������� � ������ � ���� ���������� � ���� ������ � ����������.
     * � ��������� ������ ���� ������ ���������� �����.
     *
     * � ���� ������� ������ �� ���������� (get).
     *
     * ������ ������:
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
     * @param $packageGuid - ������������� ������
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
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
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
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
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
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
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
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }

    }

    /**
     * Method downloadResultFile.
     *
     * ������ �� ���������� ��������������� �����.
     * � ��������� ������ ���� ������ ���������� �����.
     *
     * � ���� ������� ������ �� ���������� (get).
     *
     * ������ ������:
     * <Result />
     *
     * @param $fileGuid - ������������� ����� - ���������� �������������
     *
     * @return bool|string false|(���������� �����)
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
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method deletePackage.
     *
     * ������ �������� ������ � ��������� � ��� ������.
     * � ��������� ������ ���� ������ ���������� �����.
     *
     * ������ �������:
     * <Request>
     * <RecognitionPackageID>944f630a-046c-4bf4-b812-f3983f02d281</RecognitionPackageID>
     * </Request>
     *
     * ������ ������:
     * <Result />
     *
     * @param $packageGuid - ������������� ������
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
                            'msg' => "������ ����������� �� ������ " . $this->token . ".",
                            'code' => 2
                        ];
                        return false;
                        break;
                    default:
                        $this->errormsg = [
                            'call' => __FUNCTION__,
                            'msg' => "API ������� ������ ������ � ����� " . $this->_answer['httpCode'] . ".",
                            'code' => 1
                        ];
                        return false;
                        break;
                }
            } else {
                $this->errormsg = [
                    'call' => __FUNCTION__,
                    'msg' => "API ������� �� ���� ���������� ������.",
                    'code' => 9
                ];
                return false;
            }
        } catch (Exception $e) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => "����������: " . $e->getMessage(),
                'code' => 20
            ];
            return false;
        }
    }

    /**
     * Method parseResponse.
     *
     * ��������� ������� API ������� �������������.
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
                'msg' => '���������� ��� ������ xml.',
                'code' => 10
            ];
            return false;
        } elseif ((!isset($this->parser->tags[0]['name']) || $this->parser->tags[0]['name'] != $tags[0]) ||
            (!isset($this->parser->tags[0]['child'][0]['name']) || $this->parser->tags[0]['child'][0]['name'] != $tags[1])
        ) {
            $this->errormsg = [
                'call' => __FUNCTION__,
                'msg' => '������������ ��������� xml.',
                'code' => 11
            ];
            return false;
        }

        return trim($this->parser->tags[0]['child'][0]['value']);
    }

    /**
     * Method setError.
     *
     * ���������� �������� ������ � ����.
     * ����������� ����� �� ������� 100 ���������.
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
     * ��������� ����� ������. ����������� ���������� �����.
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
