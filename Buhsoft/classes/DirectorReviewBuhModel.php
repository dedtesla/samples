<?php

namespace controller\model;

/**
 * Class directorReviewBuhModel
 *
 *
 * @package controller\model
 * @author А.Шендеров (ashenderov@action-press.ru)
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
     * Выполняет сборку массива данных для формирования узла <КнигаУчетаДоходовИРасходов> директорских проверок.
     *
     * @param int $id ID пользователя
     * @param array $period Массив данных, определяющих бухгалтерский период
     * @return mixed array|bool Массив данных или false
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
     * Возвращает данные для узла директорских проверок <Отчеты>.
     * Входной массив $taxData содержит данные:
     * 1. 'typ_nalog' = 1 (признак юрлица)
     * 2. 'obj_nal' = 0 (Доходы минус расходы) или 1 (Доходы).
     *
     * @param $uid ID пользователя
     * @param array $taxData Тип и объект налогообложения УСН
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
     * Возвращает данные атрибутов "НаименованиеОтчет="УСН"" для узла директорских проверок <Отчеты>.
     * Входной массив $taxData содержит данные:
     * 1. 'typ_nalog' = 1 (признак юрлица)
     * 2. 'obj_nal' = 0 (Доходы минус расходы) или 1 (Доходы).
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
            // Доходы минус расходы

            // Заглушка для УСН - Доходы
            /*            $data = [
                            ['name' => 'УСН', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П002110013303', 'sum' => '0.00'],
                            ['name' => 'УСН', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П002120013303', 'sum' => '0.00']
                        ];*/

            // Код строки П000220021303 (сумма полученных доходов нарастающим итогом)
            $data[] = $this->databaseOper->row("
                        SELECT 
                            'УСН' AS name,
                            '{$this->_buhPeriod['reportDate']}' AS date, 
                            'П000220021303' AS lineCode, 
                            p1_dohod AS sum
                        FROM {$tableName} 
                        WHERE userid=:uid AND kvartal=:quarter",
                [['uid', $uid], ['quarter', $quarter]]);

            // Код строки П000220027303 (сумма исчисленного налога (авансового платежа по налогу))
            $data[] = $this->databaseOper->row("
                        SELECT 
                            'УСН' AS name,
                            '{$this->_buhPeriod['reportDate']}' AS date, 
                            'П000220027303' AS lineCode, 
                            p1_nalog_to_pay AS sum
                        FROM {$tableName} 
                        WHERE userid=:uid AND kvartal=:quarter",
                [['uid', $uid], ['quarter', $quarter]]);

            // Код строки П000220028003 (сумма исчисленного минимального налога за налоговый период (ставка налога 1%)))
            $data[] = $this->databaseOper->row("
                        SELECT 
                            'УСН' AS name,
                            '{$this->_buhPeriod['reportDate']}' AS date, 
                            'П000220028003' AS lineCode, 
                            p1_summa_min_nalog AS sum
                        FROM {$tableName} 
                        WHERE userid=:uid AND kvartal=:quarter",
                [['uid', $uid], ['quarter', $quarter]]);
        } else {
            // Доходы

            // Заглушка для УСН - Доходы минус расходы
            /*            $data = [
                            ['name' => 'УСН', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000220021303', 'sum' => '0.00'],
                            ['name' => 'УСН', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000220027303', 'sum' => '0.00'],
                            ['name' => 'УСН', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000220028003', 'sum' => '0.00']
                        ];*/

            // Код строки П002110013303 (сумма исчисленного налога (авансового платежа по налогу))
            $data[] = $this->databaseOper->row("
                        SELECT 
                            'УСН' AS name,
                            '{$this->_buhPeriod['reportDate']}' AS date, 
                            'П002110013303' AS lineCode, 
                            p2_nalog_to_pay AS sum
                        FROM {$tableName} 
                        WHERE userid=:uid AND kvartal=:quarter",
                [['uid', $uid], ['quarter', $quarter]]);

            // Код строки П002120013303 (сумма исчисленного налога (авансового платежа по налогу))
            $data[] = $this->databaseOper->row("
                        SELECT 
                            'УСН' AS name,
                            '{$this->_buhPeriod['reportDate']}' AS date, 
                            'П002120013303' AS lineCode, 
                            p2_nalog_to_pay AS sum
                        FROM {$tableName} 
                        WHERE userid=:uid AND kvartal=:quarter",
                [['uid', $uid], ['quarter', $quarter]]);

        }

        return $data;
    }

    /**
     * Method readReportsBalance
     * Возвращает данные атрибутов "НаименованиеОтчет="Баланс"" для узла директорских проверок <Отчеты>.
     *
     * @param $uid ID пользователя
     * @return array
     */
    private function readReportsBalance($uid)
    {
        $data = $balance = [];
        $db = 'pu2021';

        $this->databaseOper->utf8();

        // Код строки П000100160004 (итого по Активу)
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
        $data[] = ['name' => 'Баланс', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000100160004', 'sum' => $total];

        // Код строки П000100211004 (выручка)
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
        $data[] = ['name' => 'Баланс', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000100211004', 'sum' => $total];

        // Код строки П000100212004 (себестоимость продаж)
        // Д. 90.2
        // К. 20, 21, 23, 29, 40, 41, 43, 45
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
        $data[] = ['name' => 'Баланс', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000100212004', 'sum' => $total];

        // Код строки П000100221004 (коммерческие расходы)
        // Д.90.2
        // К.44
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
        $data[] = ['name' => 'Баланс', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000100221004', 'sum' => $total];

        // Код строки П000100222004 (управленческие расходы)
        // Д.90.2
        // К.26
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
        $data[] = ['name' => 'Баланс', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000100222004', 'sum' => $total];

        // Код строки П000100220004 (прибыль (убыток) от продаж)
        $total = $balance['2110'] - ($balance['2120'] + $balance['2210'] + $balance['2220']);
        $balance['2200'] = $total;
        $data[] = ['name' => 'Баланс', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000100220004', 'sum' => $total];

        // Код строки П000100230004 (прибыль (убыток) до налогообложения)
        // Обороты Д.91.2, 91.3
        // Обороты К. 91.1, 91.4
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
        $data[] = ['name' => 'Баланс', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000100230004', 'sum' => $total];

        return $data;
    }

    /**
     * Method readReportsNds
     * Возвращает данные атрибутов "НаименованиеОтчет="НДС"" для узла директорских проверок <Отчеты>.
     *
     * @param $uid ID пользователя
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

                // Код строки П000300011805 (общая сумма налога, исчисленная с учетом восстановленных сумм налога)
                // Д.*
                // К.68.2
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
                $data[] = ['name' => 'НДС', 'date' => $d2->format('d.m.Y'), 'lineCode' => 'П000300011805', 'sum' => $total1];

                // Код строки П000300019003 (общая сумма налога, исчисленная с учетом восстановленных сумм налога)
                // Д.*
                // К.68.2
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
                $data[] = ['name' => 'НДС', 'date' => $d2->format('d.m.Y'), 'lineCode' => 'П000300019003', 'sum' => $total2];

                // Код строки П000100004003 (общая сумма налога, подлежащая вычету)
                // = П000300011805 - П000300019003
                $data[] = ['name' => 'НДС', 'date' => $d2->format('d.m.Y'), 'lineCode' => 'П000100004003', 'sum' => $total2];
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
            // Только для ОСНО
            // Код строки П000200018003 (сумма исчисленного налога на прибыль)
            // Д.99.1
            // К.68.1
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
            $data[] = ['name' => 'ПРИБ', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000200018003', 'sum' => $total];
        }

        // Код строки П000020022003 (сумма налога на имущество за налоговый период (в рублях))
        // Д.*
        // К.68.8
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
        $data[] = ['name' => 'ИМУД', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000020022003', 'sum' => $total];

        // Код строки П000020026003 (Исчисленная сумма налога на имущество, подлежащая уплате в бюджет за налоговый период (в рублях))
        // = П000020022003
        $data[] = ['name' => 'ИМУД', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000020026003', 'sum' => $total];

        // Код строки П000010002103 (исчисленная сумма земельного налога, подлежащая уплате в бюджет за налоговый период (руб))
        // Д.*
        // К.68.5
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
        $data[] = ['name' => 'ЗЕМД', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000010002103', 'sum' => $total];

        // Код строки П000010002103_1 (исчисленная сумма налога, подлежащая уплате в бюджет)
        // Д.*
        // К.68.10
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
        $data[] = ['name' => 'ТРАНД', 'date' => $this->_buhPeriod['reportDate'], 'lineCode' => 'П000010002103_1', 'sum' => $total];

        return $data;
    }

}
