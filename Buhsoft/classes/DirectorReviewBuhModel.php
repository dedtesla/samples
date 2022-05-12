<?php

namespace controller\model;

/**
 * Class directorReviewBuhModel
 *
 *
 * @package controller\model
 * @author �.�������� (ashenderov@action-press.ru)
 * @date 11/13/2020
 */
class DirectorReviewBuhModel
{

    public $databaseOper;
    private $_buhPeriod;
    private $_buhPeriodRanges;

    public function __construct($dboper = null, $period = [], $ranges = [])
    {
        if (!$dboper || !$period) return;

        $this->databaseOper = $dboper;
        $this->_buhPeriod = $period;
        $this->_buhPeriodRanges = $ranges;
    }

    /**
     * Method readKudir
     * ��������� ������ ������� ������ ��� ������������ ���� <��������������������������> ������������ ��������.
     *
     * @param int $id ID ������������
     * @param array $period ������ ������, ������������ ������������� ������
     * @return mixed array|bool ������ ������ ��� false
     */
    public function readKudir($uid)
    {
        if (!$uid) return false;

        $data = [];

        $tableName = 'pu2021.tr_en';
        $_data = $this->databaseOper->rowset("SELECT kvartal, p1_dohod FROM {$tableName} WHERE userid=:uid AND kvartal>0 ORDER BY kvartal", [['uid', $uid]]);

        if ($_data) {
            $i = 1;
            $total = 0;

            foreach ($_data as $datum) {
                if ($i === 1) {
                    $total = $datum['p1_dohod'];
                    $data[] = [
                        'quarter' => $datum['kvartal'],
                        'sum' => $datum['p1_dohod']
                    ];
                } else if ($i === 2) {
                    $total = $datum['p1_dohod'];
                    $data[] = [
                        'quarter' => $datum['kvartal'],
                        'sum' => $datum['p1_dohod'] - $total <= 0 ? 0 : $datum['p1_dohod'] - $total
                    ];
                    $data[] = [
                        'quarter' => 6,
                        'sum' => $datum['p1_dohod']
                    ];
                } else if ($i === 3) {
                    $total = $datum['p1_dohod'] - $total;
                    $data[] = [
                        'quarter' => $datum['kvartal'],
                        'sum' => $total <= 0 ? 0 : $total
                    ];
                    $data[] = [
                        'quarter' => 9,
                        'sum' => $datum['p1_dohod']
                    ];
                } else if ($i === 4) {
                    $total = $datum['p1_dohod'] - $total;
                    $data[] = [
                        'quarter' => $datum['kvartal'],
                        'sum' => $total <= 0 ? 0 : $total
                    ];
                    $data[] = [
                        'quarter' => 12,
                        'sum' => $datum['p1_dohod']
                    ];
                }

                $i++;
            }
        }

        return $data;
    }

    /**
     * Method readReports
     * ���������� ������ ��� ���� ������������ �������� <������>.
     * ������� ������ $taxData �������� ������:
     * 1. 'typ_nalog' = 1 (������� ������)
     * 2. 'obj_nal' = 0 (������ ����� �������) ��� 1 (������).
     *
     * @param $uid ID ������������
     * @param array $taxData ��� � ������ ��������������� ���
     * @return array
     * @see directorReviewCtrl::output()
     *
     */
    public function readReports($uid, $taxData = [])
    {
        if (!$uid) return false;

        $data = [];

        if ($taxData['typ_nalog'] == 0) {
            $data = $this->readReportsUsn($uid, $taxData);
        }

        $data = array_merge($data, $this->readReportsBalance($uid));

        if ($taxData['typ_nalog'] == 1) {
            $data = array_merge($data, $this->readReportsNds($uid));
        }

        $data = array_merge($data, $this->readReportsTax($uid, $taxData));

        return $data;
    }

    /**
     * Method readReportsUsn
     * ���������� ������ ��������� "�����������������="���"" ��� ���� ������������ �������� <������>.
     * ������� ������ $taxData �������� ������:
     * 1. 'typ_nalog' = 1 (������� ������)
     * 2. 'obj_nal' = 0 (������ ����� �������) ��� 1 (������).
     *
     * @param $uid
     * @param $taxData
     * @return array
     * @see directorReviewCtrl::output()
     *
     */
    private function readReportsUsn($uid, $taxData)
    {
        $data = [];

        $this->databaseOper->utf8();

        $tableName = 'pu2021.tr_en';
        $quarter = $this->_buhPeriod['year'] != date('Y') ? 4 : $this->_buhPeriod['quarter'];

        if ($taxData['obj_nal'] == 0) {
            // ������ ����� �������

            // �������� ��� ��� - ������
            /*            $data = [
                            ['name' => '���', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�002110013303', 'sum' => '0.00'],
                            ['name' => '���', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�002120013303', 'sum' => '0.00']
                        ];*/

            // ��� ������ �000220021303 (����� ���������� ������� ����������� ������)
            $data[] = $this->databaseOper->row("
                        SELECT 
                            '���' AS name,
                            '{$this->_buhPeriod['reportDate']}' AS date, 
                            '�000220021303' AS lineCode, 
                            p1_dohod AS sum
                        FROM {$tableName} 
                        WHERE userid=:uid AND kvartal=:quarter",
                [['uid', $uid], ['quarter', $quarter]]);

            // ��� ������ �000220027303 (����� ������������ ������ (���������� ������� �� ������))
            $data[] = $this->databaseOper->row("
                        SELECT 
                            '���' AS name,
                            '{$this->_buhPeriod['reportDate']}' AS date, 
                            '�000220027303' AS lineCode, 
                            p1_nalog_to_pay AS sum
                        FROM {$tableName} 
                        WHERE userid=:uid AND kvartal=:quarter",
                [['uid', $uid], ['quarter', $quarter]]);

            // ��� ������ �000220028003 (����� ������������ ������������ ������ �� ��������� ������ (������ ������ 1%)))
            $data[] = $this->databaseOper->row("
                        SELECT 
                            '���' AS name,
                            '{$this->_buhPeriod['reportDate']}' AS date, 
                            '�000220028003' AS lineCode, 
                            p1_summa_min_nalog AS sum
                        FROM {$tableName} 
                        WHERE userid=:uid AND kvartal=:quarter",
                [['uid', $uid], ['quarter', $quarter]]);
        } else {
            // ������

            // �������� ��� ��� - ������ ����� �������
            /*            $data = [
                            ['name' => '���', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000220021303', 'sum' => '0.00'],
                            ['name' => '���', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000220027303', 'sum' => '0.00'],
                            ['name' => '���', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000220028003', 'sum' => '0.00']
                        ];*/

            // ��� ������ �002110013303 (����� ������������ ������ (���������� ������� �� ������))
            $data[] = $this->databaseOper->row("
                        SELECT 
                            '���' AS name,
                            '{$this->_buhPeriod['reportDate']}' AS date, 
                            '�002110013303' AS lineCode, 
                            p2_nalog_to_pay AS sum
                        FROM {$tableName} 
                        WHERE userid=:uid AND kvartal=:quarter",
                [['uid', $uid], ['quarter', $quarter]]);

            // ��� ������ �002120013303 (����� ������������ ������ (���������� ������� �� ������))
            $data[] = $this->databaseOper->row("
                        SELECT 
                            '���' AS name,
                            '{$this->_buhPeriod['reportDate']}' AS date, 
                            '�002120013303' AS lineCode, 
                            p2_nalog_to_pay AS sum
                        FROM {$tableName} 
                        WHERE userid=:uid AND kvartal=:quarter",
                [['uid', $uid], ['quarter', $quarter]]);

        }

        return $data;
    }

    /**
     * Method readReportsBalance
     * ���������� ������ ��������� "�����������������="������"" ��� ���� ������������ �������� <������>.
     *
     * @param $uid ID ������������
     * @return array
     */
    private function readReportsBalance($uid)
    {
        $data = $balance = [];
        $db = 'pu2021';

        $this->databaseOper->utf8();

        // ��� ������ �000100160004 (����� �� ������)
        $rawData = PDO_rowset("call {$db}.getOSV(:uid, :sc, :d1, :d2, 1, -1, :type)",
            [
                ['uid', $uid],
                ['sc', '%'],
                ['d1', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['year'] . '-01-01'))],
                ['d2', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['reportDate']))],
                ['type', '-1']
            ]);

        $total = $totalDt = $totalCt = 0;

        if ($rawData) {
            $dt = ['01', '03', '04', '07', '08', '09', '10', '11', '15', '16', '19', '20', '21', '23', '29', '41',
                '43', '44', '45', '50', '51', '52', '55', '57', '58', '60', '62', '68', '69', '71', '73', '75', '76',
                '79', '94', '97'];
            $ct = ['02', '05', '14', '16', '59', '63'];

            foreach ($rawData as $datum) {
                $totalDt += in_array($datum['accnt'], $dt) ? $datum['d_out'] : 0;
                $totalCt += in_array($datum['accnt'], $ct) ? $datum['c_out'] : 0;
            }
        }

        $total = $totalDt - $totalCt;
        $data[] = ['name' => '������', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000100160004', 'sum' => $total];

        // ��� ������ �000100211004 (�������)
        $rawData = PDO_rowset("call {$db}.getOSV(:uid, :sc, :d1, :d2,  2, 0, 0)",
            [
                ['uid', $uid],
                ['sc', '90%'],
                ['d1', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['year'] . '-01-01'))],
                ['d2', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['reportDate']))]
            ]);

        $total = $totalDt = $totalCt = 0;

        if ($rawData) {
            $dt = ['90.3', '90.4'];
            $ct = ['90.1'];

            foreach ($rawData as $datum) {
                $totalCt += in_array($datum['acc'], $ct) ? $datum['c_ob'] : 0;
                $totalDt += in_array($datum['acc'], $dt) ? $datum['d_ob'] : 0;
            }
        }

        $total = $totalCt - $totalDt;
        $balance['2120'] = $total;
        $data[] = ['name' => '������', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000100211004', 'sum' => $total];

        // ��� ������ �000100212004 (������������� ������)
        // �. 90.2
        // �. 20, 21, 23, 29, 40, 41, 43, 45
        $rawData = PDO_row("SELECT SUM(summa) AS sum
                                FROM {$db}.tr_journal
                                WHERE UserId=:uid AND
                                        dat BETWEEN :d1 AND :d2 AND 
                                        sc_d='90.2' AND
                                        (sc_c LIKE '20%' OR 
                                        sc_c LIKE '21%' OR 
                                        sc_c LIKE '23%' OR 
                                        sc_c LIKE '29%' OR 
                                        sc_c LIKE '40%' OR 
                                        sc_c LIKE '41%' OR 
                                        sc_c LIKE '43%' OR 
                                        sc_c LIKE '45%')
                                GROUP BY UserId",
            [
                ['uid', $uid],
                ['d1', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['year'] . '-01-01'))],
                ['d2', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['reportDate']))]
            ]);

        $total = $rawData['sum'];
        $balance['2110'] = $total;
        $data[] = ['name' => '������', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000100212004', 'sum' => $total];

        // ��� ������ �000100221004 (������������ �������)
        // �.90.2
        // �.44
        $rawData = PDO_row("SELECT SUM(summa) AS sum
                                FROM {$db}.tr_journal
                                WHERE UserId=:uid AND
                                        dat BETWEEN :d1 AND :d2 AND 
                                        sc_d='90.2' AND sc_c LIKE '44%'
                                GROUP BY UserId",
            [
                ['uid', $uid],
                ['d1', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['year'] . '-01-01'))],
                ['d2', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['reportDate']))]
            ]);

        $total = $rawData['sum'] == null ? '0.00' : $rawData['sum'];
        $balance['2210'] = $total;
        $data[] = ['name' => '������', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000100221004', 'sum' => $total];

        // ��� ������ �000100222004 (�������������� �������)
        // �.90.2
        // �.26
        $rawData = PDO_row("SELECT SUM(summa) AS sum
                                FROM {$db}.tr_journal
                                WHERE UserId=:uid AND
                                        dat BETWEEN :d1 AND :d2 AND 
                                        sc_d='90.2' AND sc_c LIKE '26%'
                                GROUP BY UserId",
            [
                ['uid', $uid],
                ['d1', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['year'] . '-01-01'))],
                ['d2', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['reportDate']))]
            ]);

        $total = $rawData['sum'] == null ? '0.00' : $rawData['sum'];
        $balance['2220'] = $total;
        $data[] = ['name' => '������', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000100222004', 'sum' => $total];

        // ��� ������ �000100220004 (������� (������) �� ������)
        $total = $balance['2110'] - ($balance['2120'] + $balance['2210'] + $balance['2220']);
        $balance['2200'] = $total;
        $data[] = ['name' => '������', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000100220004', 'sum' => $total];

        // ��� ������ �000100230004 (������� (������) �� ���������������)
        // ������� �.91.2, 91.3
        // ������� �. 91.1, 91.4
        $rawData = PDO_row("SELECT SUM(summa) AS sum
                                FROM {$db}.tr_journal
                                WHERE UserId=:uid AND
                                        dat BETWEEN :d1 AND :d2 AND 
                                        (sc_c='91.1' OR sc_c='91.4') 
                                GROUP BY UserId",
            [
                ['uid', $uid],
                ['d1', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['year'] . '-01-01'))],
                ['d2', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['reportDate']))]
            ]);

        $totalCt = $rawData['sum'] == null ? '0.00' : $rawData['sum'];

        $rawData = PDO_row("SELECT SUM(summa) AS sum
                                FROM {$db}.tr_journal
                                WHERE UserId=:uid AND
                                        dat BETWEEN :d1 AND :d2 AND 
                                        (sc_d='91.2' OR sc_d='91.3') 
                                GROUP BY UserId",
            [
                ['uid', $uid],
                ['d1', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['year'] . '-01-01'))],
                ['d2', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['reportDate']))]
            ]);

        $totalDt = $rawData['sum'] == null ? '0.00' : $rawData['sum'];

        $total = $totalCt - $totalDt + $balance['2220'];
        $data[] = ['name' => '������', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000100230004', 'sum' => $total];

        return $data;
    }

    /**
     * Method readReportsNds
     * ���������� ������ ��������� "�����������������="���"" ��� ���� ������������ �������� <������>.
     *
     * @param $uid ID ������������
     * @return array
     */
    private function readReportsNds($uid)
    {
        $data = $balance = [];
        $db = 'pu2021';

        $this->databaseOper->utf8();

        foreach ($this->_buhPeriodRanges as $key => $obj) {
            if ($key <= $this->_buhPeriod['quarter']) {
                $d1 = $d2 = null;

                $d1 = new \DateTime(date('Y-m-d',
                    mktime(0, 0, 0,
                        date('m', $obj->start->getTimestamp()),
                        date('d', $obj->start->getTimestamp()),
                        $this->_buhPeriod['year'])));

                $d2 = new \DateTime(date('Y-m-d',
                    mktime(0, 0, 0,
                        date('m', $obj->end->getTimestamp()),
                        date('d', $obj->end->getTimestamp()),
                        $this->_buhPeriod['year'])));

                // ��� ������ �000300011805 (����� ����� ������, ����������� � ������ ��������������� ���� ������)
                // �.*
                // �.68.2
                $rawData = PDO_row("SELECT SUM(summa) AS sum
                                FROM {$db}.tr_journal
                                WHERE UserId=:uid AND
                                        dat BETWEEN :d1 AND :d2 AND 
                                        sc_c='68.2'
                                GROUP BY UserId",
                    [
                        ['uid', $uid],
                        ['d1', $d1->format('Y-m-d')],
                        ['d2', $d2->format('Y-m-d')]
                    ]);

                $total1 = $rawData['sum'] == null ? '0.00' : $rawData['sum'];
                $data[] = ['name' => '���', 'date' => $d2->format('d.m.Y'), 'lineCode' => '�000300011805', 'sum' => $total1];

                // ��� ������ �000300019003 (����� ����� ������, ����������� � ������ ��������������� ���� ������)
                // �.*
                // �.68.2
                $rawData = PDO_row("SELECT SUM(summa) AS sum
                                FROM {$db}.tr_journal
                                WHERE UserId=:uid AND
                                        dat BETWEEN :d1 AND :d2 AND 
                                        sc_c='68.2'
                                GROUP BY UserId",
                    [
                        ['uid', $uid],
                        ['d1', $d1->format('Y-m-d')],
                        ['d2', $d2->format('Y-m-d')]
                    ]);

                $total2 = $rawData['sum'] == null ? '0.00' : $rawData['sum'];
                $data[] = ['name' => '���', 'date' => $d2->format('d.m.Y'), 'lineCode' => '�000300019003', 'sum' => $total2];

                // ��� ������ �000100004003 (����� ����� ������, ���������� ������)
                // = �000300011805 - �000300019003
                $data[] = ['name' => '���', 'date' => $d2->format('d.m.Y'), 'lineCode' => '�000100004003', 'sum' => $total2];
            } else {
                break;
            }
        }

        return $data;
    }

    private function readReportsTax($uid, $taxData)
    {
        $data = [];
        $db = 'pu2021';

        $this->databaseOper->utf8();

        if ($taxData['typ_nalog'] == 1) {
            // ������ ��� ����
            // ��� ������ �000200018003 (����� ������������ ������ �� �������)
            // �.99.1
            // �.68.1
            $rawData = PDO_row("SELECT SUM(summa) AS sum
                                FROM {$db}.tr_journal
                                WHERE UserId=:uid AND
                                        dat BETWEEN :d1 AND :d2 AND 
                                        sc_d='99.1' AND sc_c='68.1'
                                GROUP BY UserId",
                [
                    ['uid', $uid],
                    ['d1', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['year'] . '-01-01'))],
                    ['d2', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['reportDate']))]
                ]);

            $total = $rawData['sum'] == null ? '0.00' : $rawData['sum'];
            $data[] = ['name' => '����', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000200018003', 'sum' => $total];
        }

        // ��� ������ �000020022003 (����� ������ �� ��������� �� ��������� ������ (� ������))
        // �.*
        // �.68.8
        $rawData = PDO_row("SELECT SUM(summa) AS sum
                                FROM {$db}.tr_journal
                                WHERE UserId=:uid AND
                                        dat BETWEEN :d1 AND :d2 AND 
                                        sc_c='68.8'
                                GROUP BY UserId",
            [
                ['uid', $uid],
                ['d1', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['year'] . '-01-01'))],
                ['d2', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['reportDate']))]
            ]);

        $total = $rawData['sum'] == null ? '0.00' : $rawData['sum'];
        $data[] = ['name' => '����', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000020022003', 'sum' => $total];

        // ��� ������ �000020026003 (����������� ����� ������ �� ���������, ���������� ������ � ������ �� ��������� ������ (� ������))
        // = �000020022003
        $data[] = ['name' => '����', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000020026003', 'sum' => $total];

        // ��� ������ �000010002103 (����������� ����� ���������� ������, ���������� ������ � ������ �� ��������� ������ (���))
        // �.*
        // �.68.5
        $rawData = PDO_row("SELECT SUM(summa) AS sum
                                FROM {$db}.tr_journal
                                WHERE UserId=:uid AND
                                        dat BETWEEN :d1 AND :d2 AND 
                                        sc_c='68.5'
                                GROUP BY UserId",
            [
                ['uid', $uid],
                ['d1', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['year'] . '-01-01'))],
                ['d2', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['reportDate']))]
            ]);

        $total = $rawData['sum'] == null ? '0.00' : $rawData['sum'];
        $data[] = ['name' => '����', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000010002103', 'sum' => $total];

        // ��� ������ �000010002103_1 (����������� ����� ������, ���������� ������ � ������)
        // �.*
        // �.68.10
        $rawData = PDO_row("SELECT SUM(summa) AS sum
                                FROM {$db}.tr_journal
                                WHERE UserId=:uid AND
                                        dat BETWEEN :d1 AND :d2 AND 
                                        sc_c='68.10'
                                GROUP BY UserId",
            [
                ['uid', $uid],
                ['d1', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['year'] . '-01-01'))],
                ['d2', strftime('%Y-%m-%d', strtotime($this->_buhPeriod['reportDate']))]
            ]);

        $total = $rawData['sum'] == null ? '0.00' : $rawData['sum'];
        $data[] = ['name' => '�����', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => '�000010002103_1', 'sum' => $total];

        return $data;
    }

}
