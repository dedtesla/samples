<?php

namespace singletone;

/**
 * ����� ContragentCheck
 * ��������� �������� ����������� ����� ������� API.
 *
 * @author    ��������� �������� <ashenderov@yandex.ru>
 * @copyright 2022  AktionDigital
 */
class ContragentCheck
{
    /** @var array */
    private static $instances = [];

    /** @var string URI API �������� �� ��������� � ����������� ������. */
    const SANCTIONSURL = 'http://service.1cont.ru/api/v2/sanctions/';
    /** @var string ����� API 1cont.ru */
    const TOKEN = 'b69adb98-434a-4336-84c5-579bf81f9346';

    /**
     * �������������/��������� ���������� ������.
     *
     * @return object ContragentCheck
     */
    public static function getInstance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    protected function __clone()
    {
    }

    /**
     * @throws \Exception
     */
    public function __wakeup()
    {
        throw new \Exception("Cannot unserialize a singleton.");
    }

    /**
     * ����� get
     * HTTP GET ����� ������ API.
     *
     * @param string $url
     * @param array $_data
     *
     * @return array
     */
    private function get($url, $_data = [])
    {
        $httpHeader = [];
        $httpHeader[] = 'X-Ist: ' . self::TOKEN;
        $httpHeader[] = "Accept: application/json";
        $httpHeader[] = "Content-Type: application/json";

        $curl = curl_init();

        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 3);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $httpHeader);
        curl_setopt($curl, CURLOPT_ENCODING, '');

        $cdata = curl_exec($curl);
        $curl_errno = curl_errno($curl);
        $curl_error = curl_error($curl);
        curl_close($curl);

        if ($curl_errno > 0) {
            $result['status'] = false;
            $result['data'] = $curl_error;
        } else {
            $result['status'] = true;
            $result['data'] = json_decode($cdata, 512);
        }

        return $result;
    }

    /**
     * ����� checkSanctionsStatus
     * ��������� ������� ����������� - ������� ��� ��� � ����������� ������ ��� � ��.
     * ����������� ��������� � ������� ��������, ���� ���� ��������� �����������
     * ������ �� ���������� ���� "sanctions" ������� pu2014.tr_contra.
     *
     * @param int $uid
     * @param int $id
     * @param string|null $ogrn
     * @param int $state ������� ������ �������
     * @param bool $save
     *
     * @return int 0|1
     */
    public static function checkSanctionsStatus($uid, $id, $ogrn = null, $state = 0, $save = false)
    {
        if ($uid && $id && $ogrn) {
            $response = self::get(self::SANCTIONSURL . $ogrn . '?__AT=' . self::TOKEN);

            if ($response['status'] === true) {
                $check = $response['data']['europeanSanctions'] == false && $response['data']['usSanctions'] == false ? 0 : 1;
                if ($save && $state != $check) {
                    PDO_exec("UPDATE pu2014.tr_contra
                          SET sanctions=:chk 
                          WHERE userid=:userid AND id=:id", [['userid', $uid], ['id', $id], ['chk', $check]]);
                }

                return $check;
            }
        }

        return 0;
    }

    /**
     * ����� triggerCheck
     * ��������������, ��� ��� �������� ����� ����������� ����� ������������ ���������� �������.
     * �� ���������, ������������ �� 1 ��� � 3 �����.
     *
     * ����� ���������:
     * 1. ����������� ������ - lastDateSanctions
     *
     * @param int $uid
     * @param string $namefield
     * @param string $offset
     *
     * @return bool
     */
    public static function triggerCheck($uid, $namefield, $offset = '+3 day')
    {
        if (!$uid || !$namefield) return false;

        $_now = date('Y-m-d');

        $sql = "SELECT `data` AS lastdate FROM $maindbname.tr_states WHERE userid=:uid AND namefield=:namefield";
        $data = PDO_row($sql, [['uid', $uid], ['namefield', $namefield]]);

        if ($data) {
            $_last = date('Y-m-d', strtotime($data['lastdate'] . ' ' . $offset));
            $ret = $_now > $_last;
        } else {
            $ret = true;
        }

        if ($ret) {
            $sql = "INSERT INTO $maindbname.tr_states (userid, namefield, `data`)
                    VALUES (:uid, :namefield, :val)";
            PDO_exec($sql, [['uid', $uid], ['namefield', $namefield], ['val', $_now]]);
        }

        return $ret;
    }

    /**
     * ����� listForSanctionsCheck
     * ���������� ������ ������������ ���������� ������������,
     * �������������� ��� ����������� ��������.
     * ������������ ������� - ������� ����, �� �������� �����������
     * �������� ����� API.
     *
     * @param int $uid
     *
     * @return array|false
     */
    public static function listForSanctionsCheck($uid)
    {
        if (!$uid) return false;

        $sql = "SELECT id, ogrn, sanctions 
                    FROM pu2014.tr_contra 
                    WHERE userid=:uid AND (ogrn IS NOT NULL AND TRIM(ogrn)!='') AND deleted=0 
                    ORDER BY id";

        return PDO_rowset($sql, [['uid', $uid]]);
    }

    /**
     * ����� log
     * ������� ������� ��������.
     *
     * @param string $message ����� ������ � ������.
     */
    private static function log($message) {
        if (!$message) return;
        $ts = date('Y-m-d H:i:s');
        $fh = fopen("/tmp/contrastates.log", "a");
        $logstr .= $ts . " " . $message;
        fwrite($fh, $logstr . chr(13) . chr(10));
        fclose($fh);
    }

}
