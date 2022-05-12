<?php

namespace businessmodels;

/**
 * Class Kudir
 * Обрабатывает бизнес-логику Книги доходов и расходов-21.
 *
 *
 * Эпик GBS-6829, GBS-8590.
 * 08.20
 */
class kudir extends \businessmodels\repo
{
    private $_log = [];
    private $_book;
    private $_year;

    public function __construct($tableName, $dboper = null)
    {
        parent::__construct($tableName, $dboper);
        $this->_year =  substr($tableName, 2, 4);
        $this->_book = new \Book($this->_year);
    }

    public function read($id)
    {
        $this->databaseOper->utf8();
        return $this->databaseOper->row("select * from {$this->tableName} where id=:id", [['id', $id]]);
    }

    /**
     * Метод buildTotals
     * Подготовка данных для итоговых строк гридов разделов КУДиР.
     *
     * @param ...$args
     *
     * @return array|void
     */
    private function buildTotals(...$args)
    {
        if (!$args) return [];
        $args = $args[0];

        /** Раздел 1 */
        if ($args['section'] === 1) {
            return [
                'id' => '',
                'id_op' => '',
                'n_doc' => $args['n_doc'],
                'n_doc_orig' => '',
                'short_name' => '',
                'short_name_orig' => '',
                'doc_date' => '',
                'date_orig' => '',
                'at_period' => '',
                'at_period_orig' => '',
                'operation' => '',
                'name_contra' => '',
                'prihod' => $args['prihod'],
                'rashod' => $args['rashod'],
                'd_r_' => '',
                'id_sod' => '',
                'id_sod_orig' => '',
                'auto' => '',
                'iskl' => '',
                'is_dirty' => '',
                'summa' => '',
                'summa_orig' => '',
                'id_doc' => '',
                'id_contra' => '',
                'id_contra_orig' => '',
                'tab_id' => '',
                'details' => '',
                'quarter' => $args['quarter'],
                'date' => '',
                'deal_text' => '',
                'tovar_text' => ''
            ];
        } else if ($args['section'] === 4) {
            /** Раздел 4 */
            return [
                'id' => '',
                'id_op' => '',
                'id_op_orig' => '',
                'n_doc' => $args['n_doc'],
                'n_doc_orig' => '',
                'short_name' => '',
                'short_name_orig' => '',
                'doc_date' => '',
                'date_orig' => '',
                'at_period' => '',
                'at_period_orig' => '',
                'operation' => '',
                'name_contra' => '',
                'ops' => $args['ops'],
                'oss' => $args['oss'],
                'oms' => $args['oms'],
                'fss_trauma' => $args['fss_trauma'],
                'benefit' => $args['benefit'],
                'fss_voluntary' => $args['fss_voluntary'],
                'd_r_' => '',
                'id_sod' => '',
                'auto' => '',
                'iskl' => '',
                'is_dirty' => '',
                'summa' => '',
                'summa_orig' => '',
                'id_doc' => '',
                'id_contra' => '',
                'tab_id' => '',
                'details' => '',
                'quarter' => $args['quarter']
            ];
        }
    }

    /**
     * Метод getPosition
     * Вычисление позиции записи в гриде КУДиР.
     *
     * @param ...$args
     *
     * @return array
     */
    public function getPosition(...$args)
    {
        $args = $args ? $args[0] : $args;
        if (empty($args['uid']) || empty($args['d_beg']) || empty($args['d_end']) || empty($args['id'])) return;

        $uid = $args['uid'];
        $id = $args['id'];
        $d_beg = date('Y-m-d', strtotime($args['d_beg']));
        $d_end = date('Y-m-d', strtotime($args['d_end']));
        $sum1 = $args['sum1'] ? to_num($args['sum1']) : 0;
        $sum2 = $args['sum2'] ? to_num($args['sum2']) : 0;
        $id_contra = $args['id_contra'] ? to_str($args['id_contra']) : 0;
        $n_doc = $args['n_doc'] ? to_str($args['n_doc']) : '';
        $short_name = $args['short_name'] ? to_str($args['short_name']) : '';
        $op_type = $args['op_type'] ? $args['op_type'] : 0;
        $id_sod = $args['id_sod'] ? $args['id_sod'] : 0;
        $period = $args['period'] ? $args['period'] : 0;

        $_filter = [];

        if ($sum1) {
            $_filter[] = "a.summa>=:sum1";
        }

        if ($sum2) {
            $_filter[] = "a.summa<=:sum2";
        }

        if ($id_contra) {
            $_filter[] = "a.id_contra=:id_contra";
        }

        if ($n_doc) {
            $_filter[] = "a.n_doc=:n_doc";
        }

        if ($short_name) {
            $_filter[] = "a.short_name=:short_name";
        }

        if ($op_type) {
            $_filter[] = "if(b.id_orig=116, 1, b.d_r_)=:op_type";
        }

        if ($id_sod) {
            $_filter[] = "a.id_sod=:id_sod";
        }

        $filter = count($_filter) ? " AND " . implode(" AND ", $_filter) : "";

        $sql = "SELECT a.id
                FROM {$this->tableName} a 
                LEFT JOIN pu2014.tr_sp_sod_user b ON a.id_sod=b.id and a.userid=b.userid
                WHERE a.UserId=:uid AND tab_id=:tabid AND a.date BETWEEN :d_beg AND :d_end 
                {$filter}
                ORDER BY a.date, a.id";

        $this->databaseOper->utf8();

        $data = PDO_column($sql, [
            ['uid', $uid],
            ['d_beg', $d_beg],
            ['d_end', $d_end],
            ['tabid', 1],
            $sum1 ? ['sum1', $sum1] : false,
            $sum2 ? ['sum2', $sum2] : false,
            $id_contra ? ['id_contra', $id_contra] : false,
            $n_doc ? ['n_doc', $n_doc] : false,
            $short_name ? ['short_name', $short_name] : false,
            $op_type ? ['op_type', $op_type] : false,
            $id_sod ? ['id_sod', $id_sod] : false
        ]);

        $position = array_search($id, $data);
        return !empty($position) ? ['position' => $position] : ['position' => 0];
    }


    /**
     * Метод getTotalSumSection1.
     * Возвращает итоговые суммы прихода и расхода по заданным условиям.
     *
     * @param array ...$args
     */
    public function getTotalsSumSection1 (...$args)
    {
        $args = $args ? $args[0] : $args;
        if (empty($args['uid']) || empty($args['d_beg']) || empty($args['d_end'])) return;

        $uid = $args['uid'];
        $d_beg = date('Y-m-d', strtotime($args['d_beg']));
        $d_end = date('Y-m-d', strtotime($args['d_end']));
        $sum1 = $args['sum1'] ? to_num($args['sum1']) : 0;
        $sum2 = $args['sum2'] ? to_num($args['sum2']) : 0;
        $id_contra = $args['id_contra'] ? to_str($args['id_contra']) : 0;
        $n_doc = $args['n_doc'] ? to_str($args['n_doc']) : '';
        $short_name = $args['short_name'] ? to_str($args['short_name']) : '';
        $op_type = $args['op_type'] ? $args['op_type'] : 0;
        $id_sod = $args['id_sod'] ? $args['id_sod'] : 0;

        $_filter = [];

        if ($sum1) {
            $_filter[] = "a.summa>=:sum1";
        }

        if ($sum2) {
            $_filter[] = "a.summa<=:sum2";
        }

        if ($id_contra) {
            $_filter[] = "a.id_contra=:id_contra";
        }

        if ($n_doc) {
            $_filter[] = "a.n_doc=:n_doc";
        }

        if ($short_name) {
            $_filter[] = "a.short_name=:short_name";
        }

        if ($op_type) {
            $_filter[] = "if(b.id_orig=116, 1, b.d_r_)=:op_type";
        }

        if ($id_sod) {
            $_filter[] = "a.id_sod=:id_sod";
        }

        $filter = count($_filter) ? " AND " . implode(" AND ", $_filter) : "";

        $sql = "SELECT
                    (SELECT SUM(a.summa)                            
                    FROM {$this->tableName} a
                    LEFT JOIN pu2014.tr_sp_sod_user b ON a.id_sod=b.id
                    WHERE (a.userid, b.userid)=(:uid, :uid)
                        AND a.tab_id=:tabid
                        AND a.iskl=0
                        AND date(a.date) BETWEEN date(:d_beg) AND date(:d_end)
                        AND b.d_r_=1 {$filter}                        
                    GROUP BY b.d_r_) AS income,
                    (SELECT SUM(a.summa)                           
                    FROM {$this->tableName} a
                    LEFT JOIN pu2014.tr_sp_sod_user b ON a.id_sod=b.id
                    WHERE (a.userid, b.userid)=(:uid, :uid)
                        AND a.tab_id=:tabid
                        AND a.iskl=0
                        AND date(a.date) BETWEEN date(:d_beg) AND date(:d_end)
                        AND (b.d_r_=2 AND b.id_orig!=116) {$filter}                       
                    GROUP BY b.d_r_) AS outcome,
                    (SELECT SUM(a.summa)                           
                    FROM {$this->tableName} a
                    LEFT JOIN pu2014.tr_sp_sod_user b ON a.id_sod=b.id
                    WHERE (a.userid, b.userid)=(:uid, :uid)
                        AND a.tab_id=:tabid
                        AND a.iskl=0
                        AND date(a.date) BETWEEN date(:d_beg) AND date(:d_end)
                        AND b.id_orig=116 {$filter}                       
                    GROUP BY b.d_r_) AS storno";

        $this->databaseOper->utf8();

        $data = $this->databaseOper->row($sql, [
            ['uid', $uid],
            ['d_beg', $d_beg],
            ['d_end', $d_end],
            ['tabid', 1],
            $sum1 ? ['sum1', $sum1] : false,
            $sum2 ? ['sum2', $sum2] : false,
            $id_contra ? ['id_contra', $id_contra] : false,
            $n_doc ? ['n_doc', $n_doc] : false,
            $short_name ? ['short_name', $short_name] : false,
            $op_type ? ['op_type', $op_type] : false,
            $id_sod ? ['id_sod', $id_sod] : false
        ]);

        $data['income'] = $data['income'] ?: 0;
        $data['outcome'] = $data['outcome'] ?: 0;
        $data['storno'] = $data['storno'] ?: 0;

        return $data;
    }

    /**
     * Метод readSection1.
     * Возвращает данные Раздела 1 Книги.
     *
     * @param array ...$args
     */
    public function readSection1(...$args)
    {
        $args = $args ? $args[0] : $args;
        if (empty($args['uid']) || empty($args['d_beg']) || empty($args['d_end'])) return;

        $uid = $args['uid'];
        $id = $args['id'] ? $args['id'] : null;
        $d_beg = date('Y-m-d', strtotime($args['d_beg']));
        $d_end = date('Y-m-d', strtotime($args['d_end']));
        $sum1 = $args['sum1'] ? to_num($args['sum1']) : 0;
        $sum2 = $args['sum2'] ? to_num($args['sum2']) : 0;
        $id_contra = $args['id_contra'] ? to_str($args['id_contra']) : 0;
        $n_doc = $args['n_doc'] ? to_str($args['n_doc']) : '';
        $short_name = $args['short_name'] ? to_str($args['short_name']) : '';
        $op_type = $args['op_type'] ? $args['op_type'] : 0;
        $id_sod = $args['id_sod'] ? $args['id_sod'] : 0;
        $period = $args['period'] ? $args['period'] : 0;
        $limit = $args['limit'];
        $offset = $args['offset'];

        $_filter = [];

        if ($id) {
            $_filter[] = "a.id=:id";
        }

        if ($sum1) {
            $_filter[] = "a.summa>=:sum1";
        }

        if ($sum2) {
            $_filter[] = "a.summa<=:sum2";
        }

        if ($id_contra) {
            $_filter[] = "a.id_contra=:id_contra";
        }

        if ($n_doc) {
            $_filter[] = "a.n_doc=:n_doc";
        }

        if ($short_name) {
            $_filter[] = "a.short_name=:short_name";
        }

        if ($op_type) {
            $_filter[] = "if(b.id_orig=116, 1, b.d_r_)=:op_type";
        }

        if ($id_sod) {
            $_filter[] = "a.id_sod=:id_sod";
        }

        $this->filter = count($_filter) ? " AND " . implode(" AND ", $_filter) : "";

        $v1 = iconv('WINDOWS-1251', 'UTF-8', '<br>Оплачены ранее реализованные товары');
        $v2 = iconv('WINDOWS-1251', 'UTF-8', '<br>Реализованы оплаченные товары');
        $sql = "SELECT 
                a.id, 
                a.id_op, 
                b.d_r_,
                a.id_doc,
                CONCAT(pu2014.spsodval(b.name, 1, b.id_orig),' ',
                if(b.id_orig=38, 
                if (a.source=4,'{$v1}', '{$v2}'),'' 
                )) as operation,
                a.id_sod,
                a.id_sod_orig,
                date_format(a.date,'%d.%m.%Y') AS doc_date,
                date_format(a.date_orig,'%d.%m.%Y') AS date_orig,
                a.n_doc,
                a.n_doc_orig,
                a.short_name,
                a.short_name_orig,
                a.auto,
                a.iskl,
                a.is_dirty,
                a.summa,
                a.summa_orig,
                a.id_analit,
                if (if(b.id_orig=116, 1, b.d_r_)=1, if(b.id_orig=116, -a.summa, a.summa), '&mdash;') as prihod,
                if (if(b.id_orig=116, 1, b.d_r_)=2, summa, '&mdash;') as rashod,
                a.id_contra,
                a.id_contra_orig,
                pu2014.get_z_analit_t(a.userid, 6, a.id_contra) as name_contra,
                a.tab_id,
                quarter(date(a.date)) AS quarter,
                a.`source`,
                a.source_id,
                date_format(a.date,'%Y-%m-%d') AS `date`,
                a.deal_text,
                a.tovar_text
        FROM {$this->tableName} a 
        LEFT JOIN pu2014.tr_sp_sod_user b ON a.id_sod=b.id and a.userid=b.userid
        WHERE a.UserId=:uid AND tab_id=:tabid AND a.date BETWEEN :d_beg AND :d_end 
        {$this->filter}
        ORDER BY a.date, a.id  
        LIMIT {$limit}
        OFFSET {$offset}";

        $this->databaseOper->utf8();

        $_data = $this->databaseOper->rowset($sql, [
            ['uid', $uid],
            ['d_beg', $d_beg],
            ['d_end', $d_end],
            ['tabid', 1],
            $id ? ['id', $id] : false,
            $sum1 ? ['sum1', $sum1] : false,
            $sum2 ? ['sum2', $sum2] : false,
            $id_contra ? ['id_contra', $id_contra] : false,
            $n_doc ? ['n_doc', $n_doc] : false,
            $short_name ? ['short_name', $short_name] : false,
            $op_type ? ['op_type', $op_type] : false,
            $id_sod ? ['id_sod', $id_sod] : false
        ]);

        if ($_data) {
            $rowIndex = 1;
            for ($i = 0; $i < count($_data); $i++) {
                if ($_data[$i]['iskl'] == 0) {
                    $_data[$i]['order_num'] = $offset + $rowIndex;
                    $rowIndex++;
                } else {
                    $_data[$i]['order_num'] = '&mdash;';
                }
            }
        }

        $data['packCount'] = count($_data);
        $data['rows'] = $_data ?: [];

        $sql = "SELECT COUNT(id) AS tc FROM {$this->tableName} a                     
                    WHERE a.userid=:uid AND a.tab_id=:tabid AND a.date BETWEEN :d_beg AND :d_end {$this->filter}
                    GROUP BY userid";

        $data['totalCount'] = $this->databaseOper->row($sql, [
            ['uid', $uid],
            ['d_beg', $d_beg],
            ['d_end', $d_end],
            ['tabid', 1],
            $id ? ['id', $id] : false,
            $sum1 ? ['sum1', $sum1] : false,
            $sum2 ? ['sum2', $sum2] : false,
            $id_contra ? ['id_contra', $id_contra] : false,
            $n_doc ? ['n_doc', $n_doc] : false,
            $short_name ? ['short_name', $short_name] : false,
            $op_type ? ['op_type', $op_type] : false,
            $id_sod ? ['id_sod', $id_sod] : false
        ]);

        if (isset($data['totalCount']['tc']) && $data['totalCount']['tc'] >= 0) {
            $data['totalCount'] = $data['totalCount']['tc'];
        } else {
            $data['totalCount'] = 0;
        }

        $data['filter'] = $this->filter;
        return $data;
    }

    /**
     * Метод readSection2.
     * Возвращает данные Раздела 2 Книги.
     *
     * @param array ...$args
     */
    public function readSection2(...$args)
    {
        $args = $args ? $args[0] : $args;
        if (empty($args['uid']) || empty($args['d_beg']) || empty($args['d_end'])) return;

        $uid = $args['uid'];
        $d_beg = date('Y-m-d', strtotime($args['d_beg']));
        $d_end = date('Y-m-d', strtotime($args['d_end']));

        $sql = "SELECT 
                t1.id,
                t2.name,
                t2.name_orig,
                t1.id_op, 
                date_format(t2.datvv,'%d.%m.%Y') AS datvv,
                date_format(t2.datvv_orig,'%d.%m.%Y') AS datvv_orig,
                t1.auto,
                t1.iskl,
                t1.is_dirty,
                t1.tab_id,
                t1.details,
                t1.base_cost,
                t1.base_cost_orig,
                t1.quarter_fees,
                t1.quarter_fees_orig,
                t1.tax_fees,
                t1.tax_fees_orig,
                t1.previous_fees,
                t1.previous_fees_orig,
                t1.future_fees,               
                t1.future_fees_orig               
        FROM {$this->tableName} t1 
        INNER JOIN tr_kndr_os_nma t2 ON t1.id=t2.id
        WHERE t1.userid=:uid AND 
          t1.tab_id=:tabid AND
          t1.auto>0 AND 
          t1.date BETWEEN :d_beg AND :d_end 
        ORDER BY t1.date";

        $this->databaseOper->utf8();

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $uid],
            ['d_beg', $d_beg],
            ['d_end', $d_end],
            ['tabid', 2]
        ]);

        /**
         * Записи, добавленные вручную.
         * Ручные записи физически живут в одном экземпляре, для фронта и печати
         * выполняется их виртуальное тиражирование.
         *
         * GBS-13946
         */
        $sql = "SELECT 
                t1.id,
                t2.name,
                t2.name_orig,
                t1.id_op, 
                date_format(t2.datvv,'%d.%m.%Y') AS datvv,
                date_format(t2.datvv_orig,'%d.%m.%Y') AS datvv_orig,
                t1.auto,
                t1.iskl,
                t1.is_dirty,
                t1.tab_id,
                t1.details,
                t1.base_cost,
                t1.base_cost_orig,
                t1.quarter_fees,
                t1.quarter_fees_orig,
                t1.tax_fees,
                t1.tax_fees_orig,
                t1.previous_fees,
                t1.previous_fees_orig,
                t1.future_fees,               
                t1.future_fees_orig               
        FROM {$this->tableName} t1 
        INNER JOIN tr_kndr_os_nma t2 ON t1.id=t2.id
        WHERE t1.userid=:uid AND 
                t1.tab_id=:tabid AND 
                t1.auto=0 AND 
                year(t1.`date`)=year(:d_beg) AND
                CASE WHEN t2.datvv>t2.datepayed
                THEN (t2.datvv BETWEEN :d_beg AND :d_end OR t2.datvv<:d_beg)
                ELSE (t2.datepayed BETWEEN :d_beg AND :d_end OR t2.datepayed<:d_beg)
                END                
        ORDER BY t1.date";

        $dataManual = $this->databaseOper->rowset($sql, [
            ['uid', $uid],
            ['d_beg', $d_beg],
            ['d_end', $d_end],
            ['tabid', 2]
        ]);

        if (is_array($data) && is_array($dataManual)) {
            $data = array_merge($data, $dataManual);
        } elseif (!$data && $dataManual) {
            $data = $dataManual;
        }

        return $data;
    }

    /**
     * Метод readSection3.
     * Возвращает данные Раздела 3 Книги.
     *
     * @param array ...$args
     */
    public function readSection3(...$args)
    {
        $args = $args ? $args[0] : $args;
        if (empty($args['uid']) || empty($args['d_beg']) || empty($args['d_end'])) return;

        $uid = $args['uid'];
        $d_beg = date('Y-m-d', strtotime($args['d_beg']));
        $d_end = date('Y-m-d', strtotime($args['d_end']));

        $sql = "SELECT
                    tab_id,
                    (SELECT SUM(a.summa)                            
                    FROM {$this->tableName} a
                    LEFT JOIN pu2014.tr_sp_sod_user b ON a.id_sod=b.id
                    WHERE a.userid=:uid
                        AND a.tab_id=:tabid
                        AND a.iskl=0
                        AND date(a.date) BETWEEN date(:d_beg) AND date(:d_end)
                        AND b.d_r_=1                        
                    GROUP BY b.d_r_) AS income,
                    (SELECT SUM(a.summa)                           
                    FROM {$this->tableName} a
                    LEFT JOIN pu2014.tr_sp_sod_user b ON a.id_sod=b.id
                    WHERE a.userid=:uid
                        AND a.tab_id=:tabid
                        AND a.iskl=0
                        AND a.date BETWEEN :d_beg AND :d_end
                        AND b.d_r_=2                        
                    GROUP BY b.d_r_) AS outcome
                    FROM {$this->tableName}";

        $this->databaseOper->utf8();

        $data = $this->databaseOper->row($sql, [
            ['uid', $uid],
            ['d_beg', $d_beg],
            ['d_end', $d_end],
            ['tabid', 1]
        ]);

        $sql = "SELECT summa
                FROM tr_kn_dr_manual
                WHERE userid=:uid AND tab_id=:tabid AND at_year=:year";

        $_data = $this->databaseOper->row($sql, [
            ['uid', $uid],
            ['year', $args['at_year']],
            ['tabid', 10]
        ]);

        $data['ref030'] = !empty($_data['summa']) ? $_data['summa'] : 0;

        $sql = "SELECT id, summa, store_id
                FROM tr_kn_dr_manual
                WHERE userid=:uid AND tab_id=:tabid AND at_year=:year";

        $data['manual'] = $this->databaseOper->rowset($sql, [
            ['uid', $uid],
            ['tabid', 3],
            ['year', $args['at_year']]
        ]);

        return $data;
    }

    /**
     * Метод readSection4.
     * Возвращает данные Раздела 4 Книги.
     *
     * @param array ...$args
     */
    public function readSection4(...$args)
    {
        $args = $args ? $args[0] : $args;
        if (empty($args['uid']) || empty($args['d_beg']) || empty($args['d_end'])) return;

        $uid = $args['uid'];
        $id = $args['id'] ? $args['id'] : null;
        $d_beg = date('Y-m-d', strtotime($args['d_beg']));
        $d_end = date('Y-m-d', strtotime($args['d_end']));
        $sum1 = $args['sum1'] ? to_num($args['sum1']) : 0;
        $sum2 = $args['sum2'] ? to_num($args['sum2']) : 0;
        $n_doc = $args['n_doc'] ? to_str($args['n_doc']) : '';
        $short_name = $args['short_name'] ? to_str($args['short_name']) : '';
        $id_op = $args['id_op'] ? $args['id_op'] : null;
        $at_period = $args['at_period'] ? $args['at_period'] : '';
        $period = $args['period'] ? $args['period'] : 0;

        $_filter = [];

        if ($id) {
            $_filter[] = "a.id=:id";
        }

        if ($sum1) {
            $_filter[] = "a.summa>=:sum1";
        }

        if ($sum2) {
            $_filter[] = "a.summa<=:sum2";
        }

        if ($n_doc) {
            $_filter[] = "a.n_doc=:n_doc";
        }

        if ($short_name) {
            $_filter[] = "a.short_name=:short_name";
        }

        if ($id_op) {
            $_filter[] = "a.id_op=:id_op";
        }

        if ($at_period) {
            $_filter[] = "a.at_period=:at_period";
        }

        $this->filter = count($_filter) ? " AND " . implode(" AND ", $_filter) : "";

        $sql = "SELECT 
                a.id, 
                a.id_op, 
                a.id_op_orig, 
                a.id_doc,
                date_format(a.date,'%d.%m.%Y') AS doc_date,
                date_format(a.date_orig,'%d.%m.%Y') AS date_orig,
                a.short_name,
                a.short_name_orig,
                a.n_doc,
                a.n_doc_orig,
                a.auto,
                a.iskl,
                a.is_dirty,
                a.summa,
                a.summa_orig,
                a.id_analit,
                if (a.id_op=1, summa, '&mdash;') as ops,
                if (a.id_op=2, summa, '&mdash;') as oss,
                if (a.id_op=3, summa, '&mdash;') as oms,
                if (a.id_op=4, summa, '&mdash;') as fss_trauma,
                if (a.id_op=5, summa, '&mdash;') as benefit,
                if (a.id_op=6, summa, '&mdash;') as fss_voluntary,
                a.tab_id,
                a.at_period,
                a.at_period_orig,
                a.details,
                quarter(date(a.date)) AS quarter
        FROM {$this->tableName} a 
        WHERE a.UserId=:uid AND tab_id=:tabid AND a.date BETWEEN :d_beg AND :d_end 
        {$this->filter} 
        ORDER BY a.date";

        $this->databaseOper->utf8();

        $_data = $this->databaseOper->rowset($sql, [
            ['uid', $uid],
            ['d_beg', $d_beg],
            ['d_end', $d_end],
            ['tabid', 4],
            ($id ? ['id', $id] : false),
            $sum1 ? ['sum1', $sum1] : false,
            $sum2 ? ['sum2', $sum2] : false,
            $n_doc ? ['n_doc', $n_doc] : false,
            $short_name ? ['short_name', $short_name] : false,
            $id_op ? ['id_op', $id_op] : false,
            $at_period ? ['at_period', $at_period] : false,
        ]);

        $data = [];

        if ($_data) {
            $qtSign = [
                1 => 'За I квартал итого:',
                2 => 'За II квартал итого:',
                3 => 'За III квартал итого:',
                4 => 'За IY квартал итого:'
            ];

            $periodText = [
                2 => 'За полугодие итого:',
                3 => 'За 9 месяцев итого:'
            ];

            if ($period <= 4) {
                $data = $_data;
            } else {
                $quarters = [];
                $totals = [
                    1 => [
                        'ops' => 0,
                        'oss' => 0,
                        'oms' => 0,
                        'fss_trauma' => 0,
                        'benefit' => 0,
                        'fss_voluntary' => 0
                    ],
                    2 => [
                        'ops' => 0,
                        'oss' => 0,
                        'oms' => 0,
                        'fss_trauma' => 0,
                        'benefit' => 0,
                        'fss_voluntary' => 0
                    ],
                    3 => [
                        'ops' => 0,
                        'oss' => 0,
                        'oms' => 0,
                        'fss_trauma' => 0,
                        'benefit' => 0,
                        'fss_voluntary' => 0
                    ],
                    4 => [
                        'ops' => 0,
                        'oss' => 0,
                        'oms' => 0,
                        'fss_trauma' => 0,
                        'benefit' => 0,
                        'fss_voluntary' => 0
                    ]
                ];

                for ($i = 0; $i < count($_data); $i++) {
                    $quarters[$_data[$i]['quarter']][] = $_data[$i];

                    if ($_data[$i]['iskl'] == 0) {
                        $totals[$_data[$i]['quarter']]['ops'] += is_numeric($_data[$i]['ops']) ? $_data[$i]['ops'] : 0;
                        $totals[$_data[$i]['quarter']]['oss'] += is_numeric($_data[$i]['oss']) ? $_data[$i]['oss'] : 0;
                        $totals[$_data[$i]['quarter']]['oms'] += is_numeric($_data[$i]['oms']) ? $_data[$i]['oms'] : 0;
                        $totals[$_data[$i]['quarter']]['fss_trauma'] += is_numeric($_data[$i]['fss_trauma']) ? $_data[$i]['fss_trauma'] : 0;
                        $totals[$_data[$i]['quarter']]['benefit'] += is_numeric($_data[$i]['benefit']) ? $_data[$i]['benefit'] : 0;
                        $totals[$_data[$i]['quarter']]['fss_voluntary'] += is_numeric($_data[$i]['fss_voluntary']) ? $_data[$i]['fss_voluntary'] : 0;
                    }
                }

                $ops = $oss = $oms = $fss_trauma = $benefit = $fss_voluntary = 0;

                foreach ($qtSign as $key => $val) {
                    if (($period == 6 && $key > 2) || ($period == 9 && $key > 3)) break;

                    $ops += $totals[$key]['ops'];
                    $oss += $totals[$key]['oss'];
                    $oms += $totals[$key]['oms'];
                    $fss_trauma += $totals[$key]['fss_trauma'];
                    $benefit += $totals[$key]['benefit'];
                    $fss_voluntary += $totals[$key]['fss_voluntary'];

                    $quarters[$key][] = $this->buildTotals([
                            'n_doc' => to_utf($val),
                            'ops' => (float)$ops,
                            'oss' => (float)$oss,
                            'oms' => (float)$oms,
                            'fss_trauma' => (float)$fss_trauma,
                            'benefit' => (float)$benefit,
                            'fss_voluntary' => (float)$fss_voluntary,
                            'quarter' => $key,
                            'section' => 4
                        ]
                    );

                    switch ($key) {
                        case 2:
                            if ($period > 6) {
                                $quarters[$key][] = $this->buildTotals([
                                        'n_doc' => to_utf($periodText[$key]),
                                        'ops' => (float)$ops,
                                        'oss' => (float)$oss,
                                        'oms' => (float)$oms,
                                        'fss_trauma' => (float)$fss_trauma,
                                        'benefit' => (float)$benefit,
                                        'fss_voluntary' => (float)$fss_voluntary,
                                        'quarter' => 6,
                                        'section' => 4
                                    ]
                                );
                            }
                            break;
                        case 3:
                            if ($period > 9) {
                                $quarters[$key][] = $this->buildTotals([
                                        'n_doc' => to_utf($periodText[$key]),
                                        'ops' => (float)$ops,
                                        'oss' => (float)$oss,
                                        'oms' => (float)$oms,
                                        'fss_trauma' => (float)$fss_trauma,
                                        'benefit' => (float)$benefit,
                                        'fss_voluntary' => (float)$fss_voluntary,
                                        'quarter' => 9,
                                        'section' => 4
                                    ]
                                );
                            }
                            break;
                    }

                    $data = array_merge($data, $quarters[$key]);
                }
            }
        }
        return $data;
    }

    /**
     * Метод readSection5.
     * Возвращает данные Раздела 5 Книги.
     *
     * @param array ...$args
     */
    public function readSection5(...$args)
    {
        $args = $args ? $args[0] : $args;
        if (empty($args['uid']) || empty($args['d_beg']) || empty($args['d_end'])) return;

        $uid = $args['uid'];
        $id = $args['id'] ? $args['id'] : null;
        $d_beg = date('Y-m-d', strtotime($args['d_beg']));
        $d_end = date('Y-m-d', strtotime($args['d_end']));
        $sum1 = $args['sum1'] ? to_num($args['sum1']) : 0;
        $sum2 = $args['sum2'] ? to_num($args['sum2']) : 0;
        $n_doc = $args['n_doc'] ? to_str($args['n_doc']) : '';
        $short_name = $args['short_name'] ? to_str($args['short_name']) : '';
        $at_period = $args['at_period'] ? $args['at_period'] : '';

        $_filter = [];

        if ($id) {
            $_filter[] = "a.id=:id";
        }

        if ($sum1) {
            $_filter[] = "a.summa>=:sum1";
        }

        if ($sum2) {
            $_filter[] = "a.summa<=:sum2";
        }

        if ($n_doc) {
            $_filter[] = "a.n_doc=:n_doc";
        }

        if ($short_name) {
            $_filter[] = "a.short_name=:short_name";
        }

        if ($at_period) {
            $_filter[] = "a.at_period=:at_period";
        }

        $this->filter = count($_filter) ? " AND " . implode(" AND ", $_filter) : "";

        $sql = "SELECT 
                a.id, 
                a.id_doc,
                date_format(a.date,'%d.%m.%Y') AS doc_date,
                date_format(a.date_orig,'%d.%m.%Y') AS date_orig,
                a.short_name,
                a.short_name_orig,
                a.n_doc,
                a.n_doc_orig,
                a.auto,
                a.iskl,
                a.is_dirty,
                a.summa,
                a.summa_orig,
                a.id_analit,
                a.tab_id,
                a.at_period,
                a.at_period_orig,
                a.details
        FROM {$this->tableName} a 
        WHERE a.UserId=:uid AND tab_id=:tabid AND date(a.date) BETWEEN date(:d_beg) AND date(:d_end) 
        {$this->filter} 
        ORDER BY a.date";

        $this->databaseOper->utf8();

        return $this->databaseOper->rowset($sql, [
            ['uid', $uid],
            ['d_beg', $d_beg],
            ['d_end', $d_end],
            ['tabid', 5],
            $id ? ['id', $id] : false,
            $sum1 ? ['sum1', $sum1] : false,
            $sum2 ? ['sum2', $sum2] : false,
            $n_doc ? ['n_doc', $n_doc] : false,
            $short_name ? ['short_name', $short_name] : false,
            $at_period ? ['at_period', $at_period] : false,
        ]);
    }

    /**
     * Метод readReference.
     * Возвращает данные Справки к 1 Разделу Книги.
     *
     * @param array ...$args
     */
    public function readReference(...$args)
    {
        $args = $args ? $args[0] : $args;
        if (empty($args['uid']) || empty($args['d_beg']) || empty($args['d_end'])) return;

        $uid = $args['uid'];
        $d_beg = date('Y-m-d', strtotime($args['d_beg']));
        $d_end = date('Y-m-d', strtotime($args['d_end']));

        $sql = "SELECT
                    (SELECT SUM(a.summa)                            
                    FROM {$this->tableName} a
                    LEFT JOIN pu2014.tr_sp_sod_user b ON a.id_sod=b.id
                    WHERE a.userid=:uid
                        AND a.tab_id=:tabid
                        AND a.iskl=0
                        AND date(a.date) BETWEEN date(:d_beg) AND date(:d_end)
                        AND b.d_r_=1                        
                    GROUP BY b.d_r_) AS income,
                    (SELECT SUM(a.summa)                           
                    FROM {$this->tableName} a
                    LEFT JOIN pu2014.tr_sp_sod_user b ON a.id_sod=b.id
                    WHERE a.userid=:uid
                        AND a.tab_id=:tabid
                        AND a.iskl=0
                        AND date(a.date) BETWEEN date(:d_beg) AND date(:d_end)
                        AND b.d_r_=2                        
                    GROUP BY b.d_r_) AS outcome,
                    (SELECT SUM(a.summa)                           
                    FROM {$this->tableName} a
                    LEFT JOIN pu2014.tr_sp_sod_user b ON a.id_sod=b.id
                    WHERE a.userid=:uid
                        AND a.tab_id=:tabid
                        AND a.iskl=0
                        AND date(a.date) BETWEEN date(:d_beg) AND date(:d_end)
                        AND b.id_orig=116                       
                    GROUP BY b.d_r_) AS storno
                    FROM {$this->tableName}";

        $this->databaseOper->utf8();

        $data = $this->databaseOper->row($sql, [
            ['uid', $uid],
            ['d_beg', $d_beg],
            ['d_end', $d_end],
            ['tabid', 1]
        ]);

        $data['income'] = $data['income'] ?: 0;
        $data['outcome'] = $data['outcome'] ?: 0;
        $data['storno'] = $data['storno'] ?: 0;

        $sql = "
            SELECT id, summa 
            FROM tr_kn_dr_manual
            WHERE userid=:uid AND tab_id=:tabid AND store_id=:storeid AND at_year=:year
        ";

        $data['manual'] = $this->databaseOper->row($sql, [
            ['uid', $uid],
            ['tabid', 10],
            ['storeid', 3],
            ['year', $args['at_year']]
        ]);

        return $data;
    }

    /**
     * Method fillSummaryTable
     * Заполнение таблицы суммарных значений КУДиР.
     *
     * @param array $args
     */
    private function fillSummaryTable($args)
    {
        $sql = "SELECT COUNT(*) AS qty 
                FROM tr_kndr_sum 
                WHERE userid=:uid AND dat=:dt";

        $year = strftime('%Y', strtotime($args['d_beg']));
        $dt = strftime('%Y-%m-%d', strtotime($year . '-01-01'));

        $data = $this->databaseOper->row($sql, [
            ['uid', $args['uid']],
            ['dt', $dt]
        ]);

        if ($data['qty'] == 0) {
            $this->databaseOper->exec("INSERT INTO tr_kndr_sum (userid, dat) 
                VALUES (:uid, :dat)", [
                ['uid', $args['uid']],
                ['dat', $dt]
            ]);
        }

        $this->databaseOper->exec("UPDATE tr_kndr_sum SET sum1=:sum1, sum2=:sum2 WHERE UserId=:uid and dat=:dat", [
            ['uid', $args['uid']],
            ['sum1', $args['sum1']],
            ['sum2', $args['sum2']],
            ['dat', $dt]
        ]);
    }

    /**
     * Метод fillKudir.
     * Выполняет заполнение Книги доходов и расходов.
     *
     */
    public function fillKudir(...$args)
    {
        $data = [];

        if ($args) {
            /*            $this->fillSummaryTable($args[0]);
                        $this->makeTempTables($args[0]['uid']);
                        $this->clearKudir($args[0]);
                        $textReport = $this->fillSection1($args[0]);*/

            $this->fillSection2($args[0]);
            $this->fillSection4($args[0]);
            $this->fillSection5($args[0]);
        }

        return $data;
    }

    private function clearKudir($args)
    {
        $sql = "DELETE FROM {$this->tableName} 
                WHERE userid=:uid 
                    AND auto>0 
                    AND date BETWEEN :d_beg AND :d_end";

        $this->databaseOper->exec($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);
    }

    /**
     * Method fillSection1
     * Автоматическое заполнение Раздела 1.
     *
     * @param array $args
     */
    private function fillSection1($args)
    {
        // Комиссионные сделки
        $this->fillComission($args);

        // Сделки со взаимозачетом
        $this->fillNetting($args);

        // Сделки с электронными платежами
        $this->fillElectronicPayment($args);

        // Доходы с банковскими платежами, привязанные к сделкам
        $this->fillBankIncomeDeal($args);

        // Доходы с поступлениями в кассу, привязанными к сделкам
        $this->fillCashIncomeDeal($args);

        // Доходы с банковскими платежами, непривязанными к сделкам
        $this->fillBankIncomeNoDeal($args);

        // Доходы с поступлениями в кассу, непривязанными к сделкам
        $this->fillCashIncomeNoDeal($args);

        // ЖО
        $this->fillManJo($args);

        // Расходы из сделок
        sav('rashods');

        $this->fillExpense($args);

        // Расходы из корректировочных сделок
        $this->fillExpenseSBCorrection($args);

        // Расходы непривязанные банковские
        $this->fillExpenseBankNoDeal($args);

        // Расходы непривязанные кассовые
        $this->fillExpenseCashNoDeal($args);

        // Амортизация ОС
        $this->fillFAAmortization($args);

        // Расходы - сделки перепродаж
        $textReport = $this->fillReSaleDeal($args);

        $this->fillSalary($args);

        return $textReport;
    }

    /* Блок заполнения раздела 1 - Начало */

    /**
     * Method fillSalary
     * Автоматическое заполнение Раздела 1 - Зарплата.
     *
     * @param $args
     */
    private function fillSalary($args)
    {
        $data = $this->_book->calcZpBook($args['d_beg'], $args['d_end']);

        if ($data) {
            foreach ($data as $datum) {
                $values = [
                    'id_op' => 0,
                    'auto' => 2,
                    'id_doc' => 0,
                    'n_doc' => $datum['n_doc'],
                    'userid' => $args['uid'],
                    'date' => $datum['date'],
                    'id_sod' => $datum['id_sod'],
                    'id_os' => 0,
                    'id_contra' => 0,
                    'summa' => (float)$datum['summa'],
                    'summa_orig' => (float)$datum['summa'],
                    'tab_id' => 1
                ];

                parent::insert($values);
            }
        }
    }

    /**
     * Method fillFAAmortization
     * Автоматическое заполнение Раздела 1 - амортизация ОС.
     *
     * @param array $args
     */
    public function fillFAAmortization($args)
    {
        $_spSodUser = PDO_row("SELECT id FROM pu2014.tr_sp_sod_user WHERE userid=:uid AND id_orig=:idorig", [
            ['uid', $args['uid']],
            ['idorig', 31]
        ]);

        $sql = "SELECT *                 
                FROM pu2014.tr_os_amort_mon_nalog 
                WHERE userid=:uid AND date(dat) BETWEEN :d_beg AND :d_end";

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        if ($data) {
            $this->databaseOper->utf8();

            foreach ($data as $datum) {
                $_date = strftime('%Y-%m-%d', strtotime($datum['dat']));

                $values = [
                    'id_op' => 0,
                    'auto' => 2,
                    'userid' => $args['uid'],
                    'date' => $_date,
                    'id_sod' => $_spSodUser['id'],
                    'id_os' => $datum['id_os'],
                    'summa' => (float)$datum['summa'],
                    'summa_orig' => (float)$datum['summa'],
                    'tab_id' => 1
                ];

                parent::insert($values);
            }
        }
    }

    /**
     * Method fillReSaleDeal
     * Автоматическое заполнение Раздела 1 - расходы из сделок перепродаж.
     *
     *
     * @param array $args
     */
    private function fillReSaleDeal($args)
    {
        // var $sum_buy_kv - Сумма покупок поквартально.
        // var $sum_pay_kv - Сумма платежей поквартально.
        // var $sum_seb_kv - Сумма себестоимости поквартально.
        // var $sum_pay_buy - Сумма оплат покупок.
        $sum_buy_kv = $sum_pay_kv = 0;
        $sum_seb_kv = $args['sum1'];
        $sum_pay_buy = $args['sum2'];
        $text_rep = " *!* =============" . chr(10);

//        $sprav_text = iconv("UTF-8", "Windows-1251", 'Справка по расчету с/ст-ти товаров');
        $sprav_text = 'Справка по расчету с/ст-ти товаров';

        $year = strftime('%Y', strtotime($args['d_beg']));
        $kvb1 = $year . '-01-01';
        $kve1 = $year . '-03-31';
        $kvb2 = $year . '-04-01';
        $kve2 = $year . '-06-30';
        $kvb3 = $year . '-07-01';
        $kve3 = $year . '-09-30';
        $kvb4 = $year . '-10-01';
        $kve4 = $year . '-12-31';
        $d_beg = $kvb1;
        $d_end = $kve4;

        $sql = "SELECT DISTINCT org_id 
                FROM tr_salesbook_t
                WHERE id_j_dr IN (
                        SELECT id 
                        FROM tmp_tr_sp_sod_user 
                        WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6 AND (id_orig!=113 OR id_orig IS NULL)) AND UserId=:uid)";

        // Точка начала отсчета времени выполнения.
        $start_time = microtime(true);

        // Список ID контрагентов в сделках.
        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                // Покупки за 1 квартал - начало
                $sql = "SELECT 
                            SUM(ifnull(b.summa, 0)) AS summa, 
                            SUM(ifnull(c.summa_pay, 0)) AS summa_pay  
                        FROM tr_salesbook_t a
                        INNER JOIN (
                                SELECT id 
                                FROM tmp_tr_sp_sod_user 
                                WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6 AND (id_orig!=113 OR id_orig IS NULL)) AND UserId=:uid) e ON id_j_dr=e.id
                        LEFT JOIN (
                                SELECT 
                                    SUM(suma) AS summa, 
                                    id_oper 
                                FROM tr_salesitem_t 
                                GROUP BY id_oper) b ON a.id=b.id_oper
                        LEFT JOIN (
                                SELECT 
                                    SUM(summa) AS summa_pay, 
                                    id_salesbook 
                                FROM tr_pay_trade_t 
                                WHERE id_oper IN (7, 9) 
                                GROUP BY id_salesbook) c ON a.id=c.id_salesbook
                        WHERE a.UserId=:uid AND       
                            a.typ_oper=1 AND 
                            a.org_id=:orgid AND 
                            date(dat_ship) BETWEEN :dt1 AND :dt2";

                $dt1 = strftime('%Y-%m-%d', strtotime($year . '-01-01'));
                $dt2 = strftime('%Y-%m-%d', strtotime($year . '-03-31'));

                $subDataBuy = $this->databaseOper->row($sql, [
                    ['uid', $args['uid']],
                    ['orgid', $datum['org_id']],
                    ['dt1', $dt1],
                    ['dt2', $dt2]
                ]);

                $sum_buy_kv = isset($subDataBuy['summa']) ? $subDataBuy['summa'] : 0;
                // Покупки за 1 квартал - окончание

                // Оплата 1 квартал - начало
                $sql = "SELECT SUM(summav) AS summa 
                        FROM (
                            SELECT summav 
                            FROM (
                                SELECT DISTINCT a.* 
                                FROM tr_bank_pay_t a                                
                                WHERE id_j_dr IN (
                                                SELECT id 
                                                FROM tmp_tr_sp_sod_user 
                                                WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6 AND (id_orig!=113 OR id_orig IS NULL)) AND UserId=:uid
                                    ) AND 
                                        reg_plt=1 AND 
                                        (id_oper=4 OR id_oper=16) AND org_id=:orgid AND 
                                        date(dat) BETWEEN :dt1 AND :dt2
                                    ) a
                        
                        UNION ALL 
                        
                        SELECT summav 
                        FROM (
                                SELECT DISTINCT a.* 
                                FROM tr_kassa_pay_t a
                                WHERE id_j_dr IN (
                                                SELECT id 
                                                FROM tmp_tr_sp_sod_user1 
                                                WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6 AND (id_orig!=113 OR id_orig IS NULL)) AND UserId=:uid
                                            ) AND 
                                    reg_plt=1 AND 
                                    id_oper=6 AND 
                                    org_id=:orgid AND 
                                    date(dat) BETWEEN :dt1 AND :dt2
                            ) a1
                        ) a";

                $subDataSell = $this->databaseOper->row($sql, [
                    ['uid', $args['uid']],
                    ['orgid', $datum['org_id']],
                    ['dt1', $dt1],
                    ['dt2', $dt2]
                ]);

                $sum_pay_kv = $subDataSell['summa'] + $subDataBuy['summa_pay'];
                $sum_pay_buy += to_num(min($sum_pay_kv, $sum_buy_kv));
                // Оплата 1 квартал - окончание

                $text_rep .= " *!* 1 kv org " . $datum['org_id'] . chr(10);
                $text_rep .= " *!* buy " . $sum_buy_kv . chr(10);
                $text_rep .= " *!* pay other " . $subDataBuy['summa'] . chr(10);
                $text_rep .= " *!* pay bank + kassa " . $subDataSell['summa'] . chr(10);
                $text_rep .= " *!* pay => buy " . min($sum_pay_kv, $sum_buy_kv) . chr(10);
            }
        }

        // Определение себестоимости
        $sql = "SELECT id FROM tmp_tr_sp_sod_user WHERE (id_orig=38) AND UserId=:uid";
        // Содержание операции
        $row = $this->databaseOper->row($sql, [
            ['uid', $args['uid']]
        ]);
        $id_j_dr = $row['id'];

        $sql = "SELECT 
                            a.id, 
                            id_j_dr, 
                            dat_ship, 
                            org_id, 
                            b.* 
                        FROM tr_salesbook_t a
                        LEFT JOIN (
                                SELECT 
                                    suma, 
                                    id_sprav, 
                                    kol, 
                                    items_id, 
                                    id_oper 
                                FROM tr_salesitem_t where UserId=:uid) b ON a.id=b.id_oper
                        INNER JOIN (
                                SELECT id 
                                FROM tmp_tr_sp_sod_user 
                                WHERE UserId=:uid AND 
                                    id_analit2=5 AND 
                                    id_gr!=14 AND 
                                    id_gr!=6) c ON id_j_dr=c.id
                        WHERE a.UserId=:uid AND 
                                a.typ_oper=2 AND 
                                date(dat_ship) BETWEEN :dt1 AND :dt2";

        // Себестоимость 1 квартал
        $r_seb = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['dt1', $dt1],
            ['dt2', $dt2]
        ]);

        if ($r_seb) {
            foreach ($r_seb as $row_seb) {
                $sp = $kp = $sr = $kr = $seb = $ost = $sum_buy = $kol_buy = 0;

                $vitems_id = $row_seb['items_id'];
                $vid_sprav = $row_seb['id_sprav'];
                $year = strftime('Y%', strtotime($dt1));
                $dbe = $year . '-01-01';

                $sql = "SELECT * 
                                FROM tr_ostat a
                                WHERE userid=:uid AND id_analit=:itemid AND id_sprav=:refid";

                $r_seb1 = $this->databaseOper->rowset($sql, [
                    ['uid', $args['uid']],
                    ['itemid', $row_seb['items_id']],
                    ['refid', $row_seb['id_sprav']]
                ]);

                if ($r_seb1) {
                    foreach ($r_seb1 as $row_seb1) {
                        if ($row_seb1['sum_d'] > 0 & $row_seb1['kol'] >= 0) {
                            $sum_buy += $row_seb1['sum_d'];
                            $kol_buy += $row_seb1['kol'];
                        }
                    }
                }

                $sql = "SELECT 
                                    a.*, 
                                    b.typ_oper, 
                                    dat_ship 
                                FROM tr_salesitem_t a
                                INNER JOIN tr_salesbook_t b ON a.id_oper=b.id
                                WHERE items_id=:itemid AND id_sprav=:refid 
                                    AND ((date(dat_ship)>=:dat1 and date(dat_ship)<=date(:dat2) and typ_oper=1) OR 
                                        (date(dat_ship)>=:dat1 and date(dat_ship)<date(:dat2) and typ_oper=2) OR  
                                        (date(dat_ship)=date(:dat2) and typ_oper=2 and a.id_oper<:idoper))
                                ORDER BY dat_ship, typ_oper, a.id_oper";

                $r_seb1 = $this->databaseOper->rowset($sql, [
                    ['idoper', $row_seb['id']],
                    ['itemid', $vitems_id],
                    ['refid', $vid_sprav],
                    ['dat1', $dbe],
                    ['dat2', $row_seb['dat_ship']],
                ]);

                foreach ($r_seb1 as $row_seb1) {
                    if ($row_seb1['typ_oper'] == 1) {
                        $sum_buy = $sum_buy + $row_seb1['SUMA'];
                        $kol_buy = $kol_buy + $row_seb1['KOL'];

                    }

                    if ($row_seb1['typ_oper'] == 2) {
                        if ($row_seb1['kol'] <= $kol_buy & $kol_buy > 0) {
                            $seb_curr = round($sum_buy / $kol_buy, 2);
                            $kol_buy -= $row_seb1['KOL'];
                            $sum_buy -= ($row_seb1['KOL'] * $seb_curr);
                        }
                    }
                }

                $seb = 0;

                if ($kol_buy > 0) {
                    $seb = to_num(round($sum_buy / $kol_buy, 2));
                }

                $seb_sp = to_num($seb * $row_seb['kol']);

                if ($seb > 0 & $kol_buy >= $row_seb['kol']) {
                    $sum_seb_kv = $sum_seb_kv + $seb_sp;
                }
            }

            $sum_seb_kv = to_num($sum_seb_kv);

            // Себестоимость за 1 квартал
            sav(' 1 kv seb sum ' . $sum_seb_kv);
            sav(' 1 kv seb sumpay ' . $sum_pay_buy);
            $sumkv1 = to_num(min(to_num($sum_seb_kv), to_num($sum_pay_buy)));

            $text_rep .= "  == total sebes = " . $sum_seb_kv . chr(10);
            $text_rep .= "  == kv 1 = " . to_num(min(to_num($sum_seb_kv), to_num($sum_pay_buy))) . chr(10);
            $text_rep .= "  == kv 1 to book = " . $sumkv1 . chr(10);

            if ($sumkv1 > 0) {
                $_v = [
                    ['id_op', 1],
                    ['id_doc', 0],
                    ['auto', 2],
                    ['userId', $args['uid']],
                    ['date', $kve1],
                    ['n_doc', $sprav_text],
                    ['id_sod', $id_j_dr],
                    ['summa', $sumkv1],
                    ['id_os', 0],
                    ['id_contra', 0]
                ];

                if ($kve1 >= $dt1 && $kve1 <= $dt2) {
                    $ret = createScript($this->tableName, 1, $_v);
                }
            }

            // 2 квартал
            $text_rep .= " *!* =============" . chr(10);

            $sum_buy_kv = $sum_pay_kv = 0;
            $sum_seb_kv = $args['sum1'];
            $sum_pay_buy = $args['sum2'];

            $sql = "SELECT DISTINCT org_id 
                            FROM tr_salesbook_t
                            WHERE id_j_dr IN (
                                SELECT id 
                                FROM tmp_tr_sp_sod_user 
                                WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6) AND UserId=:uid
                                )";

            $contraData = $this->databaseOper->rowset($sql, [
                ['uid', $args['uid']]
            ]);

            foreach ($contraData as $contraDatum) {
                $sql = "SELECT 
                                    SUM(ifnull(b.summa, 0)) AS summa, 
                                    SUM(ifnull(c.summa_pay, 0)) AS summa_pay 
                                FROM tr_salesbook_t a
                                INNER JOIN (
                                    SELECT id 
                                    FROM tmp_tr_sp_sod_user 
                                    WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6) AND UserId=:uid) e ON a.id_j_dr=e.id
                                LEFT JOIN (
                                    SELECT
                                           SUM(suma) AS summa,
                                           id_oper 
                                    FROM tr_salesitem_t 
                                    GROUP BY id_oper) b ON a.id=b.id_oper
                                LEFT JOIN (
                                    SELECT 
                                           SUM(summa) AS summa_pay, 
                                           id_salesbook 
                                    FROM tr_pay_trade_t 
                                    WHERE id_oper IN (7,9) 
                                    GROUP BY id_salesbook) c ON a.id=c.id_salesbook
                                WHERE a.UserId=:uid AND a.typ_oper=1 AND a.org_id=:orgid AND                                      
                                    (date(dat_ship)>=str_to_date(:dat1,'%Y-%m-%d') and date(dat_ship)<=str_to_date(:dat2,'%Y-%m-%d'))";

                $row1 = $this->databaseOper->row($sql, [
                    ['uid', $args['uid']],
                    ['orgid', $contraDatum['org_id']],
                    ['dat1', $kvb1],
                    ['dat2', $kve2]
                ]);

                $sum_buy_kv = $row1['summa'];

                $sql = "SELECT 
                                    SUM(summav) AS summa 
                                FROM (
                                    SELECT summav 
                                    FROM (
                                        SELECT DISTINCT a.* 
                                        FROM tr_bank_pay_t a
                                        WHERE id_j_dr IN (
                                            SELECT id 
                                            FROM tmp_tr_sp_sod_user 
                                            WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6) AND UserId=:uid) AND 
                                              reg_plt=1 AND 
                                              (id_oper=4 OR id_oper=16) AND 
                                              org_id=:orgid AND 
                                              (date(dat)>=str_to_date(:dat1,'%Y-%m-%d') and date(dat)<=str_to_date(:dat2,'%Y-%m-%d'))
                                        ) a
           
                                    UNION ALL 
                                    
                                    SELECT summav 
                                    FROM (                                        
                                        SELECT DISTINCT a.* 
                                        FROM tr_kassa_pay_t a 
                                        WHERE id_j_dr IN (
                                            SELECT id 
                                            FROM tmp_tr_sp_sod_user1 
                                            WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6) AND UserId=:uid) AND 
                                              reg_plt=1 AND 
                                              id_oper=6 AND 
                                              org_id=:orgid AND
                                              (date(dat)>=str_to_date(:dat1,'%Y-%m-%d') and date(dat)<=str_to_date(:dat2,'%Y-%m-%d'))
                                        ) a1
                                    ) a";

                $row2 = $this->databaseOper->row($sql, [
                    ['uid', $args['uid']],
                    ['orgid', $contraDatum['org_id']],
                    ['dat1', $kvb1],
                    ['dat2', $kve2]
                ]);

                $sum_pay_kv = $row2['summa'] + $row1['summa_pay'];
                $sum_pay_buy += to_num(min($sum_pay_kv, $sum_buy_kv));

                $text_rep .= " *!* 2 kv org " . $contraDatum['org_id'] . chr(10);
                $text_rep .= " *!* buy " . $sum_buy_kv . chr(10);
                $text_rep .= " *!* pay other " . $row1['summa'] . chr(10);
                $text_rep .= " *!* pay bank + kassa " . $row2['summa'] . chr(10);
                $text_rep .= " *!* pay => buy " . min($sum_pay_kv, $sum_buy_kv) . chr(10);

            }
            $text_rep .= "  == total = " . $sum_pay_buy . chr(10);
            $text_rep .= "  =============" . chr(10);

            /*определение себестоимости*/

            $sql = "SELECT id FROM tmp_tr_sp_sod_user WHERE (id_orig=38) AND UserId=:uid";
            $row = $this->databaseOper->row($sql, [
                ['uid', $args['uid']]
            ]);

            $id_j_dr = $row['id'];
            $sum_seb_kv = $args['sum1'];

            $sql = "SELECT 
                                a.id,
                                id_j_dr, 
                                dat_ship, 
                                org_id, 
                                b.* 
                            FROM tr_salesbook_t a 
                            LEFT JOIN (
                                SELECT 
                                       suma, 
                                       id_sprav, 
                                       kol, 
                                       items_id, 
                                       id_oper 
                                FROM tr_salesitem_t 
                                WHERE UserId=:uid) b ON a.id=b.id_oper
                            INNER JOIN (
                                SELECT id 
                                FROM tmp_tr_sp_sod_user 
                                WHERE UserId=:uid AND 
                                      id_analit2=5 AND 
                                      id_gr!=14 AND 
                                      id_gr!=6) c ON a.id_j_dr=c.id
                        WHERE a.UserId=:uid AND 
                              a.typ_oper=2 AND 
                              (date(dat_ship)>=str_to_date(:dat1,'%Y-%m-%d') and date(dat_ship)<=str_to_date(:dat2,'%Y-%m-%d'))";

            $r_seb = $this->databaseOper->rowset($sql, [
                ['uid', $args['uid']],
                ['dat1', $kvb1],
                ['dat2', $kve2]
            ]);

            foreach ($r_seb as $row_seb) {
                $sp = $kp = $sr = $kr = $seb = $ost = 0;
                $vitems_id = $row_seb['items_id'];
                $vid_sprav = $row_seb['id_sprav'];
                $dbe = $year . '-01-01';
                $sum_buy = $kol_buy = 0;

                $sql = "SELECT * 
                                FROM tr_ostat a 
                                WHERE userid=:uid AND 
                                      id_analit=:itemid AND 
                                      id_sprav=:refid";

                $r_seb1 = $this->databaseOper->rowset($sql, [
                    ['uid', $args['uid']],
                    ['itemid', $row_seb['items_id']],
                    ['refid', $row_seb['id_sprav']],
                ]);

                foreach ($r_seb1 as $row_seb1) {
                    if ($row_seb1['sum_d'] > 0 & $row_seb1['kol'] >= 0) {
                        $sum_buy += $row_seb1['sum_d'];
                        $kol_buy += $row_seb1['kol'];
                    }
                }

                $sql = "SELECT 
                                    a.*, 
                                    b.typ_oper, 
                                    dat_ship 
                                FROM tr_salesitem_t a 
                                INNER JOIN tr_salesbook_t b ON a.id_oper=b.id
                                WHERE items_id=:itemid AND 
                                      id_sprav=:refid AND 
                                      ((date(dat_ship)>=:dat1 and date(dat_ship)<=date(:dat2) and typ_oper=1) OR 
                                        (date(dat_ship)>=:dat1 and date(dat_ship)<date(:dat2) and typ_oper=2) OR
                                       (date(dat_ship)=date(:dat2) and typ_oper=2 and a.id_oper<:id))
                                ORDER BY dat_ship, typ_oper, a.id_oper";

                $r_seb1 = $this->databaseOper->rowset($sql, [
                    ['itemid', $vitems_id],
                    ['refid', $vid_sprav],
                    ['dat1', $dbe],
                    ['dat2', $row_seb['dat_ship']],
                    ['id', $row_seb['id']],
                ]);

                foreach ($r_seb1 as $row_seb1) {
                    if ($row_seb1['typ_oper'] == 1) {
                        $sum_buy = $sum_buy + $row_seb1['SUMA'];
                        $kol_buy = $kol_buy + $row_seb1['KOL'];
                    }

                    if ($row_seb1['typ_oper'] == 2) {
                        if ($row_seb1['kol'] <= $kol_buy & $kol_buy > 0) {
                            $seb_curr = round($sum_buy / $kol_buy, 2);
                            $kol_buy -= $row_seb1['KOL'];
                            $sum_buy -= ($row_seb1['KOL'] * $seb_curr);
                        }
                    }
                }

                $seb = 0;

                if ($kol_buy > 0) {
                    $seb = to_num(round($sum_buy / $kol_buy, 2));
                }

                $seb_sp = to_num($seb * $row_seb['kol']);

                if ($seb > 0 & $kol_buy >= $row_seb['kol']) {
                    $sum_seb_kv = $sum_seb_kv + $seb_sp;
                }
            }
        }

        $sum_seb_kv = to_num($sum_seb_kv);

        $sumkv2 = to_num(min(to_num($sum_seb_kv), to_num($sum_pay_buy)));
        $sumkv2 = to_num($sumkv2 - $sumkv1);
        sav(' 2 kv seb sum ' . $sum_seb_kv);
        sav(' 2 kv seb sumpay ' . $sum_pay_buy);

        $text_rep .= "  == total sebes = " . $sum_seb_kv . chr(10);
        $text_rep .= "  == kv 2 = " . to_num(min(to_num($sum_seb_kv), to_num($sum_pay_buy))) . chr(10);
        $text_rep .= "  == kv 1 prev = " . $sumkv1 . chr(10);
        $text_rep .= "  == kv 2 to book = " . $sumkv2 . chr(10);

        $text_rep .= "  =============" . chr(10);

        if ($sumkv2 > 0) {
            $_v = [
                ['id_op', 1],
                ['id_doc', 0],
                ['auto', 2],
                ['userId', $args['uid']],
                ['date', $kve2],
                ['n_doc', $sprav_text],
                ['id_sod', $id_j_dr],
                ['summa', $sumkv2],
                ['id_os', 0],
                ['id_contra', 0]
            ];

            if ($kve2 >= $args['d_beg'] && $kve2 <= $args['d_end']) {
                $ret = createScript($this->tableName, 1, $_v);
            }
        }

        // 3 квартал
        $sum_buy_kv = $sum_pay_kv = 0;
        $sum_seb_kv = $args['sum1'];
        $sum_pay_buy = $args['sum2'];

        $sql = "SELECT DISTINCT org_id 
                            FROM tr_salesbook_t
                            WHERE id_j_dr IN (
                                SELECT id 
                                FROM tmp_tr_sp_sod_user 
                                WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6) AND UserId=:uid
                                )";

        $contraData = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']]
        ]);

        foreach ($contraData as $contraDatum) {
            $sql = "SELECT 
                        SELECT SUM(ifnull(b.summa, 0)) AS summa, 
                               SUM(ifnull(c.summa_pay, 0)) AS summa_pay 
                        FROM tr_salesbook_t a 
                        INNER JOIN (
                            SELECT id 
                            FROM tmp_tr_sp_sod_user 
                            WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6) AND UserId=:uid) e ON id_j_dr=e.id
                        LEFT JOIN (
                            SELECT SUM(suma) AS summa, 
                                   id_oper 
                            FROM tr_salesitem_t 
                            GROUP BY id_oper) b ON a.id=b.id_oper
                        LEFT JOIN (
                            SELECT SUM(summa) AS summa_pay, 
                                   id_salesbook 
                            FROM tr_pay_trade_t 
                            WHERE id_oper IN(7,9) 
                            GROUP BY id_salesbook ) c ON a.id=c.id_salesbook
                        WHERE a.UserId=:uid AND 
                              a.typ_oper=1 AND 
                              a.org_id=:orgid AND 
                              (date(dat_ship)>=str_to_date(:dat1,'%Y-%m-%d') and date(dat_ship)<=str_to_date(:dat2,'%Y-%m-%d'))";

            $row1 = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['orgid', $contraDatum['org_id']],
                ['dat1', $kvb1],
                ['dat2', $kve3],
            ]);

            $sum_buy_kv = $row1['summa'];

            $sql = "SELECT SUM(summav) AS summa 
                    FROM (
                        SELECT summav 
                        FROM (
                            SELECT DISTINCT a.* 
                            FROM tr_bank_pay_t a                             
                            WHERE id_j_dr IN (
                                SELECT id 
                                FROM tmp_tr_sp_sod_user 
                                WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6) AND UserId=:uid) AND 
                                  reg_plt=1 AND 
                                  (id_oper=4 OR id_oper=16) AND 
                                  org_id=:orgid AND 
                                  (date(dat)>=str_to_date(:dat1,'%Y-%m-%d') and date(dat)<=str_to_date(:dat2,'%Y-%m-%d'))
                            ) a
                        
                    UNION ALL 
                    
                    SELECT summav FROM (
                        SELECT DISTINCT a.* 
                        FROM tr_kassa_pay_t a
                        WHERE id_j_dr IN (
                            SELECT id 
                            FROM tmp_tr_sp_sod_user1 
                            WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6) AND UserId=:uid) AND 
                              reg_plt=1 AND 
                              id_oper=6 AND 
                              org_id=:orgid AND 
                              (date(dat)>=str_to_date(:dat1,'%Y-%m-%d') and date(dat)<=str_to_date(:dat2,'%Y-%m-%d'))
                        ) a1 
                    ) a";

            $row2 = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['orgid', $row['org_id']],
                ['dat1', $kvb1],
                ['dat2', $kve3]
            ]);

            $sum_pay_kv = $row2['summa'] + $row1['summa_pay'];
            $sum_pay_buy += to_num(min($sum_pay_kv, $sum_buy_kv));
        }

        /*определение себестоимости*/
        $sql = "SELECT id FROM tmp_tr_sp_sod_user WHERE (id_orig=38) AND UserId=:uid";
        $row = $this->databaseOper->row($sql, [
            ['uid', $args['uid']]
        ]);

        $id_j_dr = $row['id'];
        $sum_seb_kv = $args['sum1'];

        $sql = "SELECT 
                    a.id, 
                    id_j_dr, 
                    dat_ship, 
                    org_id, 
                    b.* 
                FROM tr_salesbook_t a
                LEFT JOIN (
                    SELECT 
                           suma, 
                           id_sprav, 
                           kol, 
                           items_id, 
                           id_oper 
                    FROM tr_salesitem_t 
                    WHERE UserId=:uid) b ON a.id=b.id_oper
                INNER JOIN (
                    SELECT id 
                    FROM tmp_tr_sp_sod_user 
                    WHERE UserId=:uid AND 
                          id_analit2=5 AND 
                          id_gr!=14 AND 
                          id_gr!=6) c ON a.id_j_dr=c.id
                WHERE a.UserId=:uid AND 
                      a.typ_oper=2 AND 
                      (date(dat_ship)>=str_to_date(:dat1,'%Y-%m-%d') and date(dat_ship)<=str_to_date(:dat2,'%Y-%m-%d'))";

        $r_seb = $this->databaseOper->row($sql, [
            ['uid', $args['uid']],
            ['dat1', $kvb1],
            ['dat2', $kve3]
        ]);

        if ($r_seb) {
            foreach ($r_seb as $row_seb) {
                $sp = $kp = $sr = $kr = $seb = $ost = 0;
                $vitems_id = $row_seb['items_id'];
                $vid_sprav = $row_seb['id_sprav'];
                $dbe = $year . '-01-01';
                $sum_buy = $kol_buy = 0;

                $sql = "SELECT * 
                        FROM tr_ostat a
                        WHERE userid=:uid AND 
                              id_analit=:itemid AND 
                              id_sprav=:refid";

                $r_seb1 = $this->databaseOper->rowset($sql, [
                    ['uid', $args['uid']],
                    ['itemid', $row_seb['items_id']],
                    ['refid', $row_seb['id_sprav']]
                ]);

                foreach ($r_seb1 as $row_seb1) {
                    if ($row_seb1['sum_d'] > 0 & $row_seb1['kol'] >= 0) {
                        $sum_buy += $row_seb1['sum_d'];
                        $kol_buy += $row_seb1['kol'];
                    }
                }

                $sql = "SELECT 
                            a.*, 
                            b.typ_oper, 
                            dat_ship 
                        FROM tr_salesitem_t a
                        INNER JOIN tr_salesbook_t b ON a.id_oper=b.id
                        WHERE items_id=:itemid AND 
                              id_sprav=:refid AND
                              ((date(dat_ship)>=:dat1 AND date(dat_ship)<=date(:dat2) AND typ_oper=1) OR
                               (date(dat_ship)>=:dat1 AND date(dat_ship)<date(:dat2) AND typ_oper=2) OR
                               (date(dat_ship)=date(:dat2) AND typ_oper=2 AND a.id_oper<:id))
                        ORDER BY dat_ship, typ_oper, a.id_oper";

                $r_seb1 = $this->databaseOper->rowset($sql, [
                    ['itemid', $vitems_id],
                    ['refid', $vid_sprav],
                    ['dat1', $dbe],
                    ['dat2', $row_seb['dat_ship']],
                    ['id', $row_seb['id']],
                ]);

                foreach ($r_seb1 as $row_seb1) {
                    if ($row_seb1['typ_oper'] == 1) {
                        $sum_buy = $sum_buy + $row_seb1['SUMA'];
                        $kol_buy = $kol_buy + $row_seb1['KOL'];

                    }
                    if ($row_seb1['typ_oper'] == 2) {
                        if ($row_seb1['kol'] <= $kol_buy && $kol_buy > 0) {
                            $seb_curr = round($sum_buy / $kol_buy, 2);
                            $kol_buy -= $row_seb1['KOL'];
                            $sum_buy -= ($row_seb1['KOL'] * $seb_curr);
                        }
                    }
                }

                $seb = 0;

                if ($kol_buy > 0) {
                    $seb = to_num(round($sum_buy / $kol_buy, 2));
                }

                $seb_sp = to_num($seb * $row_seb['kol']);

                if ($seb > 0 && $kol_buy >= $row_seb['kol']) {
                    $sum_seb_kv = $sum_seb_kv + $seb_sp;
                }
            }
        }

        $sum_seb_kv = to_num($sum_seb_kv);
        sav(' 3 kv seb sum ' . $sum_seb_kv);
        sav(' 3 kv seb sumpay ' . $sum_pay_buy);

        $sumkv3 = to_num(min(to_num($sum_seb_kv), to_num($sum_pay_buy)));
        $sumkv3 = to_num($sumkv3 - $sumkv2 - $sumkv1);

        if ($sumkv3 > 0) {
            $_v = [
                ['id_op', 1],
                ['id_doc', 0],
                ['auto', 2],
                ['userId', $args['uid']],
                ['date', $kve3],
                ['n_doc', $sprav_text],
                ['id_sod', $id_j_dr],
                ['summa', $sumkv3],
                ['id_os', 0],
                ['id_contra', 0]
            ];

            if ($kve3 >= $args['d_beg'] && $kve3 <= $args['d_end']) {
                $ret = createScript($this->tableName, 1, $_v);
            }
        }

        // 4 квартал
        $sum_buy_kv = $sum_pay_kv = 0;
        $sum_seb_kv = $args['sum1'];
        $sum_pay_buy = $args['sum2'];

        $sql = "SELECT DISTINCT org_id 
                            FROM tr_salesbook_t
                            WHERE id_j_dr IN (
                                SELECT id 
                                FROM tmp_tr_sp_sod_user 
                                WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6) AND UserId=:uid
                                )";

        $contraData = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']]
        ]);

        foreach ($contraData as $contraDatum) {
            $sql = "SELECT 
                        SELECT SUM(ifnull(b.summa, 0)) AS summa, 
                               SUM(ifnull(c.summa_pay, 0)) AS summa_pay 
                        FROM tr_salesbook_t a 
                        INNER JOIN (
                            SELECT id 
                            FROM tmp_tr_sp_sod_user 
                            WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6) AND UserId=:uid) e ON id_j_dr=e.id
                        LEFT JOIN (
                            SELECT SUM(suma) AS summa, 
                                   id_oper 
                            FROM tr_salesitem_t 
                            GROUP BY id_oper) b ON a.id=b.id_oper
                        LEFT JOIN (
                            SELECT SUM(summa) AS summa_pay, 
                                   id_salesbook 
                            FROM tr_pay_trade_t 
                            WHERE id_oper IN(7,9) 
                            GROUP BY id_salesbook ) c ON a.id=c.id_salesbook
                        WHERE a.UserId=:uid AND 
                              a.typ_oper=1 AND 
                              a.org_id=:orgid AND 
                              (date(dat_ship)>=str_to_date(:dat1,'%Y-%m-%d') and date(dat_ship)<=str_to_date(:dat2,'%Y-%m-%d'))";

            $row1 = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['orgid', $contraDatum['org_id']],
                ['dat1', $kvb1],
                ['dat2', $kve4],
            ]);

            $sum_buy_kv = $row1['summa'];
            sav('sum_buy_kv  ' . $sum_buy_kv);

            $sql = "SELECT SUM(summav) AS summa 
                    FROM (
                        SELECT summav 
                        FROM (
                            SELECT DISTINCT a.* 
                            FROM tr_bank_pay_t a                             
                            WHERE id_j_dr IN (
                                SELECT id 
                                FROM tmp_tr_sp_sod_user 
                                WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6) AND UserId=:uid) AND 
                                  reg_plt=1 AND 
                                  (id_oper=4 OR id_oper=16) AND 
                                  org_id=:orgid AND 
                                  (date(dat)>=str_to_date(:dat1,'%Y-%m-%d') and date(dat)<=str_to_date(:dat2,'%Y-%m-%d'))
                            ) a
                        
                    UNION ALL 
                    
                    SELECT summav FROM (
                        SELECT DISTINCT a.* 
                        FROM tr_kassa_pay_t a
                        WHERE id_j_dr IN (
                            SELECT id 
                            FROM tmp_tr_sp_sod_user1 
                            WHERE (id_analit2=5 AND id_gr!=14 AND id_gr!=6) AND UserId=:uid) AND 
                              reg_plt=1 AND 
                              id_oper=6 AND 
                              org_id=:orgid AND 
                              (date(dat)>=str_to_date(:dat1,'%Y-%m-%d') and date(dat)<=str_to_date(:dat2,'%Y-%m-%d'))
                        ) a1 
                    ) a";

            $row2 = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['orgid', $contraDatum['org_id']],
                ['dat1', $kvb1],
                ['dat2', $kve4]
            ]);

            $sum_pay_kv = $row2['summa'] + $row1['summa_pay'];
            $sum_pay_buy += to_num(min($sum_pay_kv, $sum_buy_kv));
        }

        /*определение себестоимости*/
        $sql = "SELECT id FROM tmp_tr_sp_sod_user WHERE (id_orig=38) AND UserId=:uid";
        $row = $this->databaseOper->row($sql, [
            ['uid', $args['uid']]
        ]);

        $id_j_dr = $row['id'];
        $sum_seb_kv = $args['sum1'];

        $sql = "SELECT 
                    a.id, 
                    id_j_dr, 
                    dat_ship, 
                    org_id, 
                    b.* 
                FROM tr_salesbook_t a
                LEFT JOIN (
                    SELECT 
                           suma, 
                           id_sprav, 
                           kol, 
                           items_id, 
                           id_oper 
                    FROM tr_salesitem_t 
                    WHERE UserId=:uid) b ON a.id=b.id_oper
                INNER JOIN (
                    SELECT id 
                    FROM tmp_tr_sp_sod_user 
                    WHERE UserId=:uid AND 
                          id_analit2=5 AND 
                          id_gr!=14 AND 
                          id_gr!=6) c ON a.id_j_dr=c.id
                WHERE a.UserId=:uid AND 
                      a.typ_oper=2 AND 
                      (date(dat_ship)>=str_to_date(:dat1,'%Y-%m-%d') and date(dat_ship)<=str_to_date(:dat2,'%Y-%m-%d'))";

        $r_seb = $this->databaseOper->row($sql, [
            ['uid', $args['uid']],
            ['dat1', $kvb1],
            ['dat2', $kve4]
        ]);

        if ($r_seb) {
            foreach ($r_seb as $row_seb) {
                $sp = $kp = $sr = $kr = $seb = $ost = 0;
                $vitems_id = $row_seb['items_id'];
                $vid_sprav = $row_seb['id_sprav'];
                $dbe = $year . '-01-01';
                $sum_buy = $kol_buy = 0;

                $sql = "SELECT * 
                        FROM tr_ostat a
                        WHERE userid=:uid AND 
                              id_analit=:itemid AND 
                              id_sprav=:refid";

                $r_seb1 = $this->databaseOper->rowset($sql, [
                    ['uid', $args['uid']],
                    ['itemid', $row_seb['items_id']],
                    ['refid', $row_seb['id_sprav']]
                ]);

                foreach ($r_seb1 as $row_seb1) {
                    if ($row_seb1['sum_d'] > 0 && $row_seb1['kol'] >= 0) {
                        $sum_buy += $row_seb1['sum_d'];
                        $kol_buy += $row_seb1['kol'];
                    }
                }

                $sql = "SELECT 
                            a.*, 
                            b.typ_oper, 
                            dat_ship 
                        FROM tr_salesitem_t a
                        INNER JOIN tr_salesbook_t b ON a.id_oper=b.id
                        WHERE items_id=:itemid AND 
                              id_sprav=:refid AND
                              ((date(dat_ship)>=:dat1 AND date(dat_ship)<=date(:dat2) AND typ_oper=1) OR
                               (date(dat_ship)>=:dat1 AND date(dat_ship)<date(:dat2) AND typ_oper=2) OR
                               (date(dat_ship)=date(:dat2) AND typ_oper=2 AND a.id_oper<:id))
                        ORDER BY dat_ship, typ_oper, a.id_oper";

                $r_seb1 = $this->databaseOper->rowset($sql, [
                    ['itemid', $vitems_id],
                    ['refid', $vid_sprav],
                    ['dat1', $dbe],
                    ['dat2', $row_seb['dat_ship']],
                    ['id', $row_seb['id']],
                ]);

                foreach ($r_seb1 as $row_seb1) {
                    sav($row_seb1);

                    if ($row_seb1['typ_oper'] == 1) {
                        $sum_buy = $sum_buy + $row_seb1['SUMA'];
                        $kol_buy = $kol_buy + $row_seb1['KOL'];

                    }
                    if ($row_seb1['typ_oper'] == 2) {
                        if ($row_seb1['kol'] <= $kol_buy && $kol_buy > 0) {
                            $seb_curr = round($sum_buy / $kol_buy, 2);
                            $kol_buy -= $row_seb1['KOL'];
                            $sum_buy -= ($row_seb1['KOL'] * $seb_curr);
                        }
                    }
                }

                $seb = 0;

                if ($kol_buy > 0) {
                    $seb = to_num(round($sum_buy / $kol_buy, 2));
                }

                $seb_sp = to_num($seb * $row_seb['kol']);

                if ($seb > 0 && $kol_buy >= $row_seb['kol']) {
                    $sum_seb_kv = $sum_seb_kv + $seb_sp;
                }
            }
        }

        sav(' 4 kv seb sum ' . $sum_seb_kv);
        sav(' 4 kv seb sumpay ' . $sum_pay_buy);

        $sum_seb_kv = to_num($sum_seb_kv);
        $sumkv4 = to_num(min(to_num($sum_seb_kv), to_num($sum_pay_buy)));
        $sumkv4 = to_num($sumkv4 - $sumkv3 - $sumkv2 - $sumkv1);

        sav('sumkv ' . $sumkv4);

        if ($sumkv4 > 0) {
            $_v = [
                ['id_op', 1],
                ['id_doc', 0],
                ['auto', 2],
                ['userId', $args['uid']],
                ['date', $kve4],
                ['n_doc', $sprav_text],
                ['id_sod', $id_j_dr],
                ['summa', $sumkv4],
                ['id_os', 0],
                ['id_contra', 0]
            ];


            if ($kve4 >= $args['d_beg'] && $kve4 <= $args['d_end']) {
                createScript($this->tableName, 1, $_v);
            }
        }

        return $text_rep;
    }

    /**
     * Method fillExpenseCashNoDeal
     * Автоматическое заполнение Раздела 1 - непривязанные к сделкам кассовые расходы.
     *
     * @param array $args
     */
    private function fillExpenseCashNoDeal($args)
    {
        $sql = "SELECT * 
                FROM tr_kassa_pay_t 
                WHERE id_j_dr IN (
                            SELECT id 
                            FROM tmp_tr_sp_sod_user 
                            WHERE (id_gr!=14 AND id_gr!=6 AND (id_orig!=113 OR id_orig IS NULL))
                            ) AND 
                    id NOT IN (
                            SELECT id_pay AS id 
                            FROM tr_pay_trade_t 
                            WHERE id_oper=6 AND 
                            UserId=:uid) AND 
                    UserId=:uid AND id_oper=6 AND 
                    reg_plt!=5 AND reg_plt!=6 AND 
                    date(dat) BETWEEN :d_beg AND :d_end AND 
                    read_only!=1";

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                $datum['table'] = 'tr_kassa_pay';

                if ($this->_book->noCalc($datum) !== false) {
                    $dt = strftime('%Y-%m-$d', strtotime($datum['dat']));

                    $values = [
                        'id_op' => 0,
                        'id_doc' => $datum['id'],
                        'auto' => 2,
                        'userid' => $args['uid'],
                        'date' => $dt,
                        'n_doc' => $datum['n_doc'],
                        'short_name' => to_utf('ПП'),
                        'id_sod' => $datum['id_j_dr'],
                        'summa' => (float)$datum['summa'],
                        'summa_orig' => (float)$datum['summa'],
                        'id_contra' => $datum['org_id'],
                        'tab_id' => 1
                    ];

                    if ($dt >= $args['d_beg'] & $dt <= $args['d_end']) {
                        parent::insert($values);
                    }
                }
            }
        }

    }

    /**
     * Method fillExpenseBankNoDeal
     * Автоматическое заполнение Раздела 1 - непривязанные к сделкам банковские расходы.
     *
     * @param array $args
     */
    private function fillExpenseBankNoDeal($args)
    {
        $sql = "SELECT * 
                FROM tr_bank_pay_t
                WHERE id_j_dr IN (
                        SELECT id 
                        FROM tmp_tr_sp_sod_user 
                        WHERE (id_gr!=14 AND id_gr!=6 AND (id_orig!=113 OR id_orig IS NULL))
                        ) AND 
                        id NOT IN (
                            SELECT 
                                id_pay AS id 
                            FROM tr_pay_trade_t 
                            WHERE (id_oper=4 OR id_oper=16) AND UserId=:uid) AND 
                        UserId=:uid AND 
                        (id_oper=4 OR id_oper=16) AND 
                        reg_plt!=5 AND reg_plt!=6 AND
                        date(dat) BETWEEN :d_beg AND :d_end AND 
                        read_only!=1";

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                if ($this->_book->noCalc($datum) !== false) {
                    $dt = strftime('%Y-%m-$d', strtotime($datum['dat']));

                    $values = [
                        'id_op' => 0,
                        'id_doc' => $datum['id'],
                        'auto' => 2,
                        'userid' => $args['uid'],
                        'date' => $dt,
                        'n_doc' => $datum['n_doc'],
                        'short_name' => to_utf('ПП'),
                        'id_sod' => $datum['id_j_dr'],
                        'summa' => (float)$datum['summa'],
                        'summa_orig' => (float)$datum['summa'],
                        'id_contra' => $datum['org_id'],
                        'tab_id' => 1
                    ];

                    if ($dt >= $args['d_beg'] & $dt <= $args['d_end']) {
                        parent::insert($values);
                    }
                }
            }
        }

    }

    /**
     * Method fillExpenseSBCorrection
     * Автоматическое заполнение Раздела 1 - расходы корректированных сделок.
     *
     * @param array $args
     */
    private function fillExpenseSBCorrection($args)
    {
        $sql = "SELECT 
                    a.id, 
                    a.price_id, 
                    ifnull(b.summa, 0) AS summa, 
                    id_j_dr, 
                    dat_ship, 
                    org_id 
                FROM tr_salesbook_t a 
                INNER JOIN (
                        SELECT id 
                        FROM tmp_tr_sp_sod_user 
                        WHERE (id_gr!=14 AND id_gr!=6 AND (id_orig!=113 OR id_orig IS NULL)) AND 
                            UserId=:uid
                            ) e ON a.id_j_dr=e.id
                LEFT JOIN (
                        SELECT 
                            SUM(suma) AS summa, 
                            id_oper 
                        FROM tr_salesitem_t 
                        GROUP BY id_oper) b ON a.id=b.id_oper
                WHERE a.UserId=:uid AND 
                    a.typ_oper=1 AND price_id>0 AND                     
                    id_j_dr NOT IN (
                                SELECT 
                                    id 
                                FROM tmp_tr_sp_sod_user1 
                                WHERE (id_orig=38 OR id_orig=31) AND 
                                    UserId=:uid) AND
                                    date(dat_ship) BETWEEN :d_beg AND :d_end";

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                $_ = $this->databaseOper->row("SELECT * FROM tr_kn_dr WHERE userid=:uid AND id_op=1 AND id_doc=:priceid", [
                    ['uid', $args['uid']],
                    ['priceid', $datum['price_id']]
                ]);

                if (!empty($_['id'])) {
                    $dt = max($datum['dat_ship'], $_['date']);
                    $summa = -$_['summa'];

                    $values = [
                        'id_op' => 1,
                        'id_doc' => 0,
                        'auto' => 2,
                        'userid' => $args['uid'],
                        'date' => strftime('%Y-%m-$d', strtotime($dt)),
                        'n_doc' => '',
                        'id_sod' => $datum['id_j_dr'],
                        'summa' => (float)$summa,
                        'summa_orig' => (float)$summa,
                        'id_contra' => $_['id_contra'],
                        'tab_id' => 1
                    ];

                    if ($dt >= $args['d_beg'] & $dt <= $args['d_end']) {
                        parent::insert($values);
                    }
                }

                $ans = $this->calcExpense([
                    'uid' => $args['uid'],
                    'sbid' => $datum['price_id'],
                    'sum' => (float)$datum['summa'],
                    'prevyear' => strftime('%Y', strtotime($args['d_beg'])) - 1
                ]);

                if ($ans['summa'] > 0) {
                    $dt = max($datum['dat_ship'], $ans['dat']);

                    $values = [
                        'id_op' => 0,
                        'id_doc' => $datum['id'],
                        'auto' => 2,
                        'userid' => $args['uid'],
                        'date' => strftime('%Y-%m-$d', strtotime($dt)),
                        'n_doc' => '',
                        'id_sod' => $datum['id_j_dr'],
                        'summa' => (float)$ans['summa'],
                        'summa_orig' => (float)$ans['summa'],
                        'id_contra' => $datum['org_id'],
                        'tab_id' => 1
                    ];

                    if ($dt >= $args['d_beg'] & $dt <= $args['d_end']) {
                        parent::insert($values);
                    }
                }
            }
        }

    }

    /**
     * Method calcExpense
     * Подготовка суммы и даты расходной сделки.
     * @param array $args
     * @see Kudir::fillExpense()
     *
     */
    private function calcExpense($args)
    {
        $sql = "SELECT 
                    summav, 
                    dat, 
                    nazn, 
                    n_doc 
                FROM (
                    SELECT DISTINCT 
                        summav, 
                        dat, 
                        nazn, 
                        n_doc 
                    FROM tr_bank_pay_t
                    WHERE id IN (
                            SELECT 
                                id_pay AS id 
                            FROM tr_pay_trade_t
                            WHERE id_salesbook=:sbid AND 
                                (id_oper=3 OR id_oper=4 OR id_oper=15 OR id_oper=16) AND 
                                UserId=:uid
                            )
                    ) a
                    
                UNION ALL 
                
                SELECT 
                    summav, 
                    dat, 
                    nazn, 
                    n_doc 
                FROM (
                    SELECT DISTINCT 
                        summav, 
                        dat, 
                        nazn, 
                        n_doc 
                    FROM tr_kassa_pay_t 
                    WHERE id IN (
                            SELECT 
                                id_pay AS id 
                            FROM tr_pay_trade_t1
                            WHERE id_salesbook=:sbid AND 
                                (id_oper=5 OR id_oper=6) AND 
                                UserId=:uid
                        )
                    ) a
                    
                UNION ALL 
                
                SELECT 
                    summa, 
                    dat, 
                    '' AS nazn, 
                    n_doc 
                FROM tr_pay_trade_t2 
                WHERE id_salesbook=:sbid AND 
                    (id_oper=7 OR id_oper=8 OR id_oper=9) AND 
                    UserId=:uid";

        $data = $this->databaseOper->row($sql, [
            ['uid', $args['uid']],
            ['sbid', $args['sbid']]
        ]);

        $this->_log['Expense'][$args['sbid']]['data1'] = $data;

        if ($data['nazn'] == "Возврат аванса покупателю") {
            $summa = (float)$data['summav'];
        } else {
            // id_oper=9 исключили, чтобы все взаимозачеты формировались в одном месте. иначе идет дублирование
            $sql = "SELECT 
                        SUM(summav) AS summa, 
                        MAX(dat) AS dat, 
                        COUNT(*) AS kol 
                    FROM ( 
                        SELECT 
                            summav, 
                            dat 
                        FROM (
                              SELECT DISTINCT * 
                              FROM tr_bank_pay_t
                              WHERE id IN (
                                        SELECT 
                                            id_pay AS id 
                                        FROM tr_pay_trade_t
                                        WHERE id_salesbook=:sbid AND 
                                            (id_oper=3 OR id_oper=4 OR id_oper=15 OR id_oper=16) AND 
                                            UserId=:uid
                                    )
                                ) a
      
                        UNION ALL 
                        
                        SELECT 
                            summav, 
                            dat 
                        FROM (
                            SELECT DISTINCT * FROM tr_kassa_pay_t                         
                            WHERE id IN (
                                        SELECT 
                                            id_pay AS id 
                                        FROM tr_pay_trade_t1
                                        WHERE id_salesbook=:sbid AND 
                                            (id_oper=5 OR id_oper=6) AND 
                                            UserId=:uid
                                    )
                                ) a

                        UNION ALL 
                        
                        SELECT 
                            summa, 
                            dat 
                        FROM tr_pay_trade_t2                        
                        WHERE id_salesbook=:sbid AND 
                            (id_oper=7 OR id_oper=8 OR id_oper=9 OR 
                            ((id_oper=3 OR id_oper=4 OR id_oper=15 OR id_oper=16 OR id_oper=5 OR id_oper=6) AND 
                            year_doc=:year)) AND 
                            UserId=:uid) a";

            $data = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['sbid', $args['sbid']],
                ['year', $args['prevyear']]
            ]);

            $this->_log['Expense'][$args['sbid']]['data2'] = $data;
            $summa = min($args['sum'], (float)$data['summa']);
        }

        $this->_log['Expense'][$args['sbid']]['result'] = ['summa' => $summa, 'dat' => $data['dat']];
        return $this->_log['Expense'][$args['sbid']]['result'];
    }

    /**
     * Method fillExpense
     * Автоматическое заполнение Раздела 1 - расходы.
     *
     * @param array $args
     */
    private function fillExpense($args)
    {
        $this->_log['Expense'] = [];

        $sql = "SELECT 
                    a.id, 
                    ifnull(b.summa, 0) AS summa, 
                    id_j_dr, 
                    dat_ship, 
                    org_id 
                FROM tr_salesbook_t a                
                INNER JOIN (
                    SELECT id 
                    FROM tmp_tr_sp_sod_user 
                    WHERE (id_gr!=14 AND id_gr!=6 AND (id_orig!=113 OR id_orig IS NULL)) AND 
                        UserId=:uid) e ON id_j_dr=e.id
                LEFT JOIN (
                    SELECT 
                        SUM(suma) AS summa, 
                        id_oper 
                    FROM tr_salesitem_t 
                    GROUP BY id_oper) b ON a.id=b.id_oper
                    WHERE a.UserId=:uid AND 
                        a.typ_oper=1 AND 
                        (price_id*1)=0 AND 
                        id_j_dr NOT IN (
                                SELECT id 
                                FROM tmp_tr_sp_sod_user1 
                                WHERE (id_orig=38 OR id_orig=31) AND 
                                UserId=:uid) AND 
                                date(dat_ship) BETWEEN :d_beg AND :d_end";

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                $this->_log['Expense'][$datum['id']] = $datum;

                $ans = $this->calcExpense([
                    'uid' => $args['uid'],
                    'sbid' => $datum['id'],
                    'sum' => (float)$datum['summa'],
                    'prevyear' => strftime('%Y', strtotime($args['d_beg'])) - 1
                ]);

                $dt = max($datum['dat_ship'], $ans['dat']);
                $dt = strftime('%Y-%m-$d', strtotime($dt));

                if ($ans['summa'] > 0) {
                    $values = [
                        'id_op' => 1,
                        'id_doc' => $datum['id'],
                        'auto' => 2,
                        'userid' => $args['uid'],
                        'date' => $dt,
                        'n_doc' => '',
                        'id_sod' => $datum['id_j_dr'],
                        'summa' => (float)$ans['summa'],
                        'summa_orig' => (float)$ans['summa'],
                        'id_contra' => $datum['org_id'],
                        'tab_id' => 1
                    ];

                    parent::insert($values);
                }
            }
        }

    }

    /**
     * Method fillManJo
     * Автоматическое заполнение Раздела 1 из Журнала операций.
     *
     * @param array $args
     */
    private function fillManJo($args)
    {
        $sql = "SELECT 
                    a.* 
                FROM tr_journal a 
                WHERE a.UserId=:uid AND 
                    id_j_dr>0 AND 
                    a.dat BETWEEN :d_beg AND :d_end AND 
                    source_id=0 AND 
                    zpl=0 AND 
                    id_j_dr IN (
                            SELECT id 
                            FROM tmp_tr_sp_sod_user 
                            WHERE id_gr!=14 and id_gr!=6 AND 
                                id_orig!=119 AND id_orig!=120 AND 
                                (id_orig!=113 OR id_orig IS NULL)
                        )";

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                $values = [
                    'id_op' => 0,
                    'id_doc' => $datum['id'],
                    'auto' => 2,
                    'userid' => $args['uid'],
                    'date' => strftime('%Y-%m-$d', strtotime($datum['dat'])),
                    'n_doc' => '',
                    'id_sod' => $datum['id_j_dr'],
                    'summa' => (float)$datum['summa'],
                    'summa_orig' => (float)$datum['summa'],
                    'id_contra' => 0,
                    'tab_id' => 1
                ];

                parent::insert($values);
            }
        }

    }

    /**
     * Method fillComission
     * Автоматическое заполнение Раздела 1 в части сделок комиссии.
     *
     * @param array $args
     */
    private function fillComission($args)
    {
        // Сделки с автоматическим расчетом вознаграждения
        $_arr = $this->databaseOper->row("SELECT * FROM pu2014.tr_sp_sod_user WHERE userid=:uid AND id_orig=:origid",
            [
                ['uid', $args['uid']],
                ['origid', 113],
            ]);

        $year = strftime('%Y', strtotime($args['d_beg']));

        $sql = "SELECT 
                    a.*, 
                    b.id_j_dr, 
                    b.principal 
                FROM tr_salesbook_agent a
                INNER JOIN tr_salesbook_t b ON a.nakl_id=b.id               
                WHERE a.UserId=:uid AND 
                    b_type IN (1,3) AND 
                    way_calc_reward!=4 AND 
                    a.dat BETWEEN :d_beg AND :d_end";

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                $sb = new \sbManager($args['uid'], 'pu' . $year, $datum['nakl_id']);
                $sumRw = $sb->getRewardSumma();
                $sum = $sumRw['summa'];

                $values = [
                    'id_op' => 0,
                    'id_doc' => $datum['id'],
                    'auto' => 2,
                    'userid' => $args['uid'],
                    'date' => strftime('%Y-%m-$d', strtotime($datum['dat'])),
                    'n_doc' => '',
                    'id_sod' => $_arr['id'],
                    'summa' => (float)$sum,
                    'summa_orig' => (float)$sum,
                    'id_contra' => $datum['principal'],
                    'tab_id' => 1
                ];

                parent::insert($values);
            }
        }

        // Сделки с ручным расчетом вознаграждения
        $sql = "SELECT 
                    id, 
                    org_id, 
                    maker, 
                    dat_ship 
                FROM tr_salesbook_t
                WHERE UserId=:uid AND 
                    b_type IN (4, 5) AND 
                    dat_ship BETWEEN :d_beg AND :d_end";

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                $mediators = new \mediators('pu' . $year . '.tr_mediator_report', $this->databaseOper);
                $rewards = $mediators->getReportReward($datum['maker']);
                $sum = $rewards['summa'];

                $values = [
                    'id_op' => 0,
                    'id_doc' => $datum['id'],
                    'auto' => 2,
                    'userid' => $args['uid'],
                    'date' => strftime('%Y-%m-$d', strtotime($datum['dat'])),
                    'n_doc' => '',
                    'id_sod' => $_arr['id'],
                    'summa' => (float)$sum,
                    'summa_orig' => (float)$sum,
                    'id_contra' => $datum['org_id'],
                    'tab_id' => 1
                ];

                parent::insert($values);
            }
        }

    }

    /**
     * Method fillNetting
     * Автоматическое заполнение Раздела 1 в части сделок со взаимозачетом.
     *
     * @param array $args
     */
    private function fillNetting($args)
    {
        $sql = "SELECT DISTINCT 
                    a.*, 
                    b.id_j_dr AS dr 
                FROM tr_pay_trade_t a
                INNER JOIN tr_salesbook_t b ON a.id_salesbook=b.id
                WHERE a.UserId=:uid AND 
                    a.id_oper=9 AND 
                    b.id_j_dr IN (
                        SELECT id FROM tmp_tr_sp_sod_user WHERE (id_gr!=14 AND id_gr!=6 AND (id_orig!=113 OR id_orig IS NULL))
                        ) AND 
                    date(a.dat) BETWEEN :d_beg AND :d_end AND 
                    typ_oper=:typoper";


        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']],
            ['typoper', 2]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                $values = [
                    'id_op' => 0,
                    'id_doc' => $datum['id'],
                    'auto' => 2,
                    'userid' => $args['uid'],
                    'date' => strftime('%Y-%m-$d', strtotime($datum['dat'])),
                    'n_doc' => $datum['n_doc'],
                    'short_name' => to_utf('ПП'),
                    'id_sod' => $datum['dr'],
                    'summa' => (float)$datum['summa'],
                    'summa_orig' => (float)$datum['summa'],
                    'id_contra' => $datum['id_sot'],
                    'tab_id' => 1
                ];

                parent::insert($values);
            }
        }

    }

    /**
     * Method fillElectronicPayment
     * Автоматическое заполнение Раздела 1 в части сделок с электронными платежами.
     *
     * @param array $args
     */
    private function fillElectronicPayment($args)
    {
        $sql = "SELECT DISTINCT 
                    a.*, 
                    b.id_j_dr AS dr, 
                    b.org_id 
                FROM tr_pay_trade_t a
                INNER JOIN tr_salesbook_t b ON a.id_salesbook=b.id
                WHERE a.UserId=:uid AND 
                    a.id_oper=8 AND 
                    b.id_j_dr IN (
                        SELECT id FROM tmp_tr_sp_sod_user WHERE (id_gr!=14 AND id_gr!=6 AND (id_orig!=113 OR id_orig IS NULL))
                    ) AND 
                    date(a.dat) BETWEEN :d_beg AND :d_end";

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                $values = [
                    'id_op' => 0,
                    'id_doc' => $datum['id'],
                    'auto' => 2,
                    'userid' => $args['uid'],
                    'date' => strftime('%Y-%m-$d', strtotime($datum['dat'])),
                    'n_doc' => $datum['n_doc'],
                    'short_name' => to_utf('ПП'),
                    'id_sod' => $datum['dr'],
                    'summa' => (float)$datum['summa'],
                    'summa_orig' => (float)$datum['summa'],
                    'id_contra' => $datum['org_id'],
                    'tab_id' => 1
                ];

                parent::insert($values);
            }
        }
    }

    /**
     * Method fillBankIncomeDeal
     * Автоматическое заполнение Раздела 1 в части доходов, поступивших через банк и
     * привязанных к сделкам.
     *
     * @param array $args
     */
    private function fillBankIncomeDeal($args)
    {
        $sql = "SELECT DISTINCT 
                    a.*, 
                    c.id_j_dr as dr 
                FROM tr_bank_pay_t a
                INNER JOIN tr_pay_trade_t b ON a.id_oper=b.id_oper AND a.id=b.id_pay                
                INNER JOIN tr_salesbook_t c ON b.id_salesbook=c.id
                WHERE a.UserId=:uid AND 
                (a.id_oper=3 OR a.id_oper=15) AND 
                c.id_j_dr IN (
                        SELECT id FROM tmp_tr_sp_sod_user WHERE (id_gr!=14 AND id_gr!=6 AND (id_orig!=113 OR id_orig IS NULL))
                    ) AND 
                date(a.dat) BETWEEN :d_beg AND :d_end AND 
                read_only!=1";

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                $sum = $args['tax_mode'] == 0 ? $datum['summav'] : floatval($datum['summav']) - floatval($datum['summandsv']);

                $values = [
                    'id_op' => 0,
                    'id_doc' => $datum['id'],
                    'auto' => 2,
                    'userid' => $args['uid'],
                    'date' => strftime('%Y-%m-$d', strtotime($datum['dat'])),
                    'n_doc' => $datum['n_doc'],
                    'short_name' => to_utf('ПП'),
                    'id_sod' => $datum['dr'],
                    'summa' => (float)$sum,
                    'summa_orig' => (float)$sum,
                    'id_contra' => $datum['org_id'],
                    'tab_id' => 1
                ];

                parent::insert($values);
            }
        }
    }

    /**
     * Method fillCashIncomeDeal
     * Автоматическое заполнение Раздела 1 в части доходов, поступивших через кассу и
     * привязанных к сделкам.
     *
     * @param array $args
     */
    private function fillCashIncomeDeal($args)
    {
        $sql = "SELECT DISTINCT 
                    a.*, 
                    c.id_j_dr AS dr 
                FROM tr_kassa_pay_t a
                INNER JOIN tr_pay_trade_t b ON a.id_oper=b.id_oper AND a.id=b.id_pay                
                INNER JOIN tr_salesbook_t c ON b.id_salesbook=c.id
                WHERE a.UserId=:uid AND 
                    a.id_oper=5 AND 
                    c.id_j_dr IN (
                                SELECT id FROM tmp_tr_sp_sod_user WHERE id_gr!=14 AND id_gr!=6 AND (id_orig!=113 OR id_orig IS NULL)
                            ) AND 
                    date(a.dat) BETWEEN :d_beg AND :d_end AND 
                    read_only!=1";

        sav($sql);

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                $sum = $args['tax_mode'] == 0 ? $datum['summav'] : floatval($datum['summav']) - floatval($datum['summandsv']);

                $values = [
                    'id_op' => 0,
                    'id_doc' => $datum['id'],
                    'auto' => 2,
                    'userid' => $args['uid'],
                    'date' => strftime('%Y-%m-$d', strtotime($datum['dat'])),
                    'n_doc' => $datum['n_doc'],
                    'short_name' => to_utf('ПКО'),
                    'id_sod' => $datum['dr'],
                    'summa' => (float)$sum,
                    'summa_orig' => (float)$sum,
                    'id_contra' => $datum['org_id'],
                    'tab_id' => 1
                ];

                parent::insert($values);
            }
        }
    }

    /**
     * Method fillBankIncomeNoDeal
     * Автоматическое заполнение Раздела 1 в части непривязанных к сделкам доходов, поступивших через банк.
     *
     * @param array $args
     */
    private function fillBankIncomeNoDeal($args)
    {
        $sql = "SELECT * 
                FROM tr_bank_pay_t 
                WHERE id_j_dr IN (
                        SELECT id 
                        FROM tmp_tr_sp_sod_user 
                        WHERE id_gr!=14 AND id_gr!=6 AND (id_orig!=113 OR id_orig IS NULL)
                    ) AND 
                    id NOT IN (
                        SELECT 
                            a.id_pay AS id 
                        FROM tr_pay_trade_t a
                        INNER JOIN tr_salesbook_t b ON a.id_salesbook=b.id                        
                        WHERE (a.id_oper=3 OR a.id_oper=15) AND a.UserId=:uid AND a.id_pay IS NOT NULL 
                    ) AND 
                    UserId=:uid AND (id_oper=3 OR id_oper=15) AND 
                    reg_plt NOT IN (5, 6) AND 
                    date(dat) BETWEEN :d_beg AND :d_end AND
                    read_only!=1";

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                $sum = $args['tax_mode'] == 0 ? $datum['summav'] : floatval($datum['summav']) - floatval($datum['summandsv']);

                $values = [
                    'id_op' => 0,
                    'id_doc' => $datum['id'],
                    'auto' => 2,
                    'userid' => $args['uid'],
                    'date' => strftime('%Y-%m-$d', strtotime($datum['dat'])),
                    'n_doc' => $datum['n_doc'],
                    'short_name' => to_utf('ПП'),
                    'id_sod' => $datum['id_j_dr'],
                    'summa' => (float)$sum,
                    'summa_orig' => (float)$sum,
                    'id_contra' => $datum['org_id'],
                    'tab_id' => 1
                ];

                parent::insert($values);
            }
        }

    }

    /**
     * Method fillCashIncomeNoDeal
     * Автоматическое заполнение Раздела 1 в части непривязанных к сделкам доходов, поступивших через кассу.
     *
     * @param array $args
     */
    private function fillCashIncomeNoDeal($args)
    {
        $sql = "SELECT * 
                FROM tr_kassa_pay_t
                WHERE id_j_dr IN (
                        SELECT id 
                        FROM tmp_tr_sp_sod_user 
                        WHERE id_gr!=14 AND id_gr!=6 AND (id_orig!=113 OR id_orig IS NULL)
                    ) AND 
                    id NOT IN (
                        SELECT 
                            a.id_pay AS id 
                        FROM tr_pay_trade_t a 
                        INNER JOIN tr_salesbook_t b ON a.id_salesbook=b.id                        
                        WHERE a.id_oper=5 AND a.UserId=:uid AND a.id_pay IS NOT NULL 
                    ) AND 
                    UserId=:uid AND id_oper=5 AND reg_plt NOT IN (5, 6) AND 
                    date(dat) BETWEEN :d_beg AND :d_end AND 
                    read_only!=1";

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                $sum = $args['tax_mode'] == 0 ? $datum['summav'] : floatval($datum['summav']) - floatval($datum['summandsv']);

                $values = [
                    'id_op' => 0,
                    'id_doc' => $datum['id'],
                    'auto' => 2,
                    'userid' => $args['uid'],
                    'date' => strftime('%Y-%m-$d', strtotime($datum['dat'])),
                    'n_doc' => $datum['n_doc'],
                    'short_name' => to_utf('ПКО'),
                    'id_sod' => $datum['id_j_dr'],
                    'summa' => (float)$sum,
                    'summa_orig' => (float)$sum,
                    'id_contra' => $datum['org_id'],
                    'tab_id' => 1
                ];

                parent::insert($values);
            }
        }

    }

    /* Блок заполнения раздела 1 - Конец */

    /* Блок заполнения раздела 2 - Начало */

    /**
     * Метод fillSection2.
     * Заполнение 2 раздела КуДиР.
     *
     * @param $args
     */
    public function fillSection2($args)
    {
        $sql = "SELECT 
                    id,
                    name,
                    kat,
                    bu_beg_st,
                    nu_beg_st,
                    datvv,
                    bu_isp_m,
                    datvyb,
                    datgr
                FROM pu2014.tr_os
                WHERE userid=:uid AND date(datvv) BETWEEN :d_beg AND :d_end
                ORDER BY datvv";

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        if ($data) {
            foreach ($data as $datum) {
                $month = date("n", strtotime($datum['datvv']));
                $qrtBeg = ceil($month / 3);
                $qrtEnd = 4;

                if (!empty($datum['datvyb']) && $datum['datvyb'] != '0000-00-00') {
                    $month = date("n", strtotime($datum['datvyb']));
                    $qrtEnd = ceil($month / 3);
                }

                $qtExp = ($qrtEnd - $qrtBeg) + 1;
                $coefTotal = 100;
                $coefQrt = $coefTotal / $qtExp;
                $quarterFees = ($datum['bu_beg_st'] * $coefQrt) / 100;
                $taxFees = $qtExp * $quarterFees;

                $values = [
                    'id_op' => 0,
                    'id_doc' => 0,
                    'auto' => 2,
                    'userid' => $args['uid'],
                    'tab_id' => 2,
                    'base_cost' => $datum['bu_beg_st'],
                    'quarter_fees' => round($quarterFees, 2),
                    'tax_fees' => round($taxFees, 2),
                ];

                $id = parent::insert($values);

                if ($id) {
                    $values = [
                        'id' => $id,
                        'userid' => $args['uid'],
                        'rectype' => 0,
                        'name' => $datum['name'],
                        'kat' => $datum['kat'],
                        'datepayed' => null,
                        'datvv' => $datum['datvv'],
                        'yrexp' => null,
                        'ost' => null,
                        'qtexp' => $qtExp,
                        'datgr' => $datum['datgr'],
                        'datvyb' => $datum['datvyb']
                    ];

                    createScript('tr_kndr_os_nma', 1, $values);
                }
            }
        }

    }

    /* Блок заполнения раздела 2 - Конец */

    /* Блок заполнения раздела 4 - Начало */

    /**
     * Метод fillSection4.
     * Заполнение 4 раздела КуДиР.
     *
     * @param $args
     */
    private function fillSection4($args)
    {
    }

    /* Блок заполнения раздела 4 - Конец */

    /* Блок заполнения раздела 5 - Начало */

    /**
     * Метод fillSection5.
     * Заполнение 5 раздела КуДиР.
     *
     * @param $args
     */
    private function fillSection5($args)
    {
        $sql = "SELECT 
                    id, 
                    f14 as at_period, 
                    date_format(dat,'%Y-%m-%d') AS df, 
                    n_doc, 
                    summa,
                    id_j_dr AS id_sod  
                FROM tr_bank_pay 
                WHERE userid=:uid 
                    AND dat BETWEEN :d_beg AND :d_end 
                    AND id_j_dr IN (SELECT id FROM pu2014.tr_sp_sod_user WHERE userid=:uid AND name LIKE '%Торговый сбор%') 
                ORDER BY dat";

        $data = $this->databaseOper->rowset($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']],
            ($args['sum1'] ? ['sum1', $args['sum1']] : false),
            ($args['sum2'] ? ['sum2', $args['sum2']] : false)
        ]);

        if ($data) {
            $this->databaseOper->utf8();

            foreach ($data as $datum) {
                $values = [
                    'id_op' => 0,
                    'id_doc' => $datum['id'],
                    'auto' => 2,
                    'userid' => $args['uid'],
                    'date' => $datum['df'],
                    'n_doc' => $datum['n_doc'],
                    'short_name' => to_utf('ПП'),
                    'id_sod' => $datum['id_sod'],
                    'summa' => (float)$datum['summa'],
                    'summa_orig' => (float)$datum['summa'],
                    'at_period' => $datum['at_period'],
                    'tab_id' => 5
                ];
                parent::insert($values);
            }
        }
    }

    /* Блок заполнения раздела 5 - Конец */

    /**
     * Метод setLayout.
     * Расширение базового метода.
     * Выставляет метаданные таблицы.
     *
     * @param array $layout
     * @return Kudir|void
     */
    public function setLayout($layout = [])
    {
        if ($layout != []) {
            parent::setLayout($layout);
        } else {
            $tabStr = new \tabstructure($this->databaseOper);
            $this->layout = $tabStr->getLayout($this->tableName);
        }
    }

    /**
     * Метод getPaymentDocs.
     * Автономный метод для получения структуры, содержащей данные хранилища app/store/kudir/PaymentDocs.js:
     * 1. ID документа (pu2014.tr_sp_doc)
     * 2. Полное наименование документа
     * 3. Краткое наименование документа
     *
     * Ограничение выборки - кассовые (parent_id=7) и банковские (parent_id=9) документы.
     *
     * @return array|void Массив документов или пустой массив.
     */
    public function getPaymentDocs()
    {
        $this->databaseOper->utf8();

        $data = $this->databaseOper->rowset("
            SELECT 0 AS id, '" . iconv("Windows-1251", "UTF-8", 'Без документа') . "' AS name, '' AS short_name
            UNION ALL
            SELECT * 
            FROM (SELECT id, name, shortnm AS short_name
                FROM pu2014.tr_sp_doc
                WHERE  parent_id IN (7, 9)
                ORDER BY name) t");

        return $this->PaymentDocsNamesShortened($data);
    }

    public function saveRecord(...$args)
    {
        $args = $args ? $args[0] : $args;

        if (!empty($args['summa']) && !empty($args['doc_date'])) {
            $id = $args['id'];

            $this->databaseOper->utf8();

            if (!$id) {
                $values = [
                    ['userid', $args['uid']],
                    ['date', $args['doc_date']],
                    ['date_orig', $args['doc_date']],
                    ['n_doc', $args['n_doc']],
                    ['n_doc_orig', $args['n_doc']],
                    ['short_name', $args['short_name']],
                    ['short_name_orig', $args['short_name']],
                    ['id_op', $args['id_op']],
                    ['id_op_orig', $args['id_op']],
                    ['id_sod', $args['id_sod']],
                    ['id_sod_orig', $args['id_sod']],
                    ['id_os', $args['id_os']],
                    ['id_contra', $args['id_contra']],
                    ['id_contra_orig', $args['id_contra']],
                    ['id_analit', $args['id_analit']],
                    ['summa', $args['summa']],
                    ['summa_orig', $args['summa']],
                    ['auto', $args['auto']],
                    ['iskl', $args['iskl']],
                    ['is_dirty', 0],
                    ['at_period', $args['at_period']],
                    ['at_period_orig', $args['at_period']],
                    ['tab_id', $args['tab_id']],
                    ['details', $args['details']]
                ];

                save_log(58, 1, 'Добавление записи в КуДиР.');
                $ret = createScript($this->tableName, 1, $values, "");
                $id = $ret['new_id'];
                sav_log('tr_kn_dr', $id, 3, 'new tr_kn_dr', $args['doc_date']);
                save_log(58, 2, 'Запись добавлена в КуДиР.');
            } else {
                $values = [
                    ['userid', $args['uid']],
                    ['date', $args['doc_date']],
                    ['n_doc', $args['n_doc']],
                    ['short_name', $args['short_name']],
                    ['id_op', $args['id_op']],
                    ['id_sod', $args['id_sod']],
                    ['id_os', $args['id_os']],
                    ['id_contra', $args['id_contra']],
                    ['id_analit', $args['id_analit']],
                    ['summa', $args['summa']],
                    ['auto', $args['auto']],
                    ['iskl', $args['iskl']],
                    ['is_dirty', $args['is_dirty']],
                    ['at_period', $args['at_period']],
                    ['tab_id', $args['tab_id']],
                    ['details', $args['details']]
                ];

                save_log(59, 1, 'Обновление записи в КуДиР.');
                $conditions = [
                    ['userid', $args['uid']],
                    ['id', $id]
                ];

                $ret = createScript($this->tableName, 2, $values, $conditions);
                sav_log('tr_kn_dr', $id, 3, 'edit tr_kn_dr', $args['doc_date']);
                save_log(59, 2, 'Запись обновлена в КуДиР.');

                if ($args['tab_id'] == 1 && !empty($args['source']) && !empty($args['source_id'])) {
                    if ($args['source'] == 1000009) {
                        $sql = "SELECT id FROM {$this->tableName} 
                                WHERE userid=:uid AND tab_id=1 AND `source`=:src AND source_id=:sid";

                        $data = $this->databaseOper->rowset($sql, [
                            ['uid', $args['uid']],
                            ['src', $args['source']],
                            ['sid', $args['source_id']]
                        ]);

                        if ($data) {
                            $values = [
                                ['iskl', $args['iskl']],
                                ['is_dirty', $args['is_dirty']]
                            ];

                            foreach ($data as $datum) {
                                $conditions = [
                                    ['userid', $args['uid']],
                                    ['id', $datum['id']]
                                ];

                                $ret = createScript($this->tableName, 2, $values, $conditions);
                                sav_log('tr_kn_dr', $id, 3, 'edit tr_kn_dr', $args['doc_date']);
                                save_log(59, 2, 'Запись обновлена в КуДиР.');
                            }
                        }
                    }
                }
            }

            return ['id' => $id];
        }

        return false;
    }

    /**
     * Метод rollBackRecord
     * Полный откат исправлений указанной записи.
     *
     * @param array ...$args
     * @return array|false
     */
    public function rollBackRecord(...$args)
    {
        $args = $args ? $args[0] : $args;

        if (!empty($args['uid']) && !empty($args['id'])) {
            $id = $args['id'];

            $this->databaseOper->utf8();

            $sql = "SELECT * FROM {$this->tableName} 
                    WHERE userid=:uid AND id=:id";

            $data = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['id', $id]
            ]);

            if ($data) {
                $values = [
                    ['date', $data['date_orig']],
                    ['n_doc', $data['n_doc_orig']],
                    ['short_name', $data['short_name_orig']],
                    ['id_sod', $data['id_sod_orig']],
                    ['id_contra', $data['id_contra_orig']],
                    ['summa', $data['summa_orig']],
                    ['is_dirty', 0],
                    ['at_period', $data['at_period_orig']]
                ];

                save_log(59, 1, 'Обновление записи в КуДиР.');
                $conditions = [
                    ['userid', $args['uid']],
                    ['id', $id]
                ];

                $ret = createScript($this->tableName, 2, $values, $conditions);
                sav_log('tr_kn_dr', $id, 3, 'edit tr_kn_dr', $args['doc_date']);
                save_log(59, 2, 'Запись обновлена в КуДиР.');

                if ($args['tab_id'] == 1 && !empty($args['source']) && !empty($args['source_id'])) {
                    if ($args['source'] == 1000009) {
                        $sql = "SELECT * FROM {$this->tableName} 
                                WHERE userid=:uid AND tab_id=1 AND id!=:id AND
                                      `source`=:src AND source_id=:sid";

                        $data = $this->databaseOper->rowset($sql, [
                            ['uid', $args['uid']],
                            ['id', $id],
                            ['src', $args['source']],
                            ['sid', $args['source_id']]
                        ]);

                        if ($data) {
                            foreach ($data as $datum) {
                                $values = [
                                    ['date', $datum['date_orig']],
                                    ['n_doc', $datum['n_doc_orig']],
                                    ['short_name', $datum['short_name_orig']],
                                    ['id_sod', $datum['id_sod_orig']],
                                    ['id_contra', $datum['id_contra_orig']],
                                    ['summa', $datum['summa_orig']],
                                    ['is_dirty', $args['is_dirty']]
                                ];

                                save_log(59, 1, 'Обновление записи в КуДиР.');
                                $conditions = [
                                    ['userid', $args['uid']],
                                    ['id', $datum['id']]
                                ];

                                $ret = createScript($this->tableName, 2, $values, $conditions);
                                sav_log('tr_kn_dr', $id, 3, 'edit tr_kn_dr', $args['doc_date']);
                                save_log(59, 2, 'Запись обновлена в КуДиР.');
                            }
                        }
                    }
                }
                return ['id' => $id];
            }
        }
        return false;
    }

    public function updateSum(...$args)
    {
        $args = $args ? $args[0] : $args;

        if (!empty($args['uid']) && !empty($args['id'])) {
            $values = [
                ['summa', $args['summa']],
                ['is_dirty', $args['is_dirty']]
            ];

            $id = $args['id'];

            $this->databaseOper->utf8();

            save_log(59, 1, 'Обновление записи в КуДиР.');
            $conditions = [
                ['userid', $args['uid']],
                ['id', $id]
            ];

            $ret = createScript($this->tableName, 2, $values, $conditions);
            sav_log('tr_kn_dr', $id, 3, 'edit tr_kn_dr', $args['doc_date']);
            save_log(59, 2, 'Запись обновлена в КуДиР.');

            if ($args['tab_id'] == 1 && !empty($args['source']) && !empty($args['source_id'])) {
                if ($args['source'] == 1000009) {
                    $sql = "SELECT id FROM {$this->tableName} 
                                WHERE userid=:uid AND tab_id=1 AND id!=:id AND
                                      `source`=:src AND source_id=:sid";

                    $data = $this->databaseOper->rowset($sql, [
                        ['uid', $args['uid']],
                        ['id', $id],
                        ['src', $args['source']],
                        ['sid', $args['source_id']]
                    ]);

                    if ($data) {
                        $values = [
                            ['is_dirty', $args['is_dirty']]
                        ];

                        foreach ($data as $datum) {
                            save_log(59, 1, 'Обновление записи в КуДиР.');
                            $conditions = [
                                ['userid', $args['uid']],
                                ['id', $datum['id']]
                            ];

                            $ret = createScript($this->tableName, 2, $values, $conditions);
                            sav_log('tr_kn_dr', $id, 3, 'edit tr_kn_dr', $args['doc_date']);
                            save_log(59, 2, 'Запись обновлена в КуДиР.');
                        }
                    }
                }
            }

            return ['id' => $id];
        }

        return false;
    }

    /**
     * Метод processSumManual
     * Обработка данных Справки и Раздела 3.
     * Эти разделы КУДиР расчетные с большой долей данных, вводимых вручную.
     *
     * @param mixed ...$args
     * @return array|false
     */
    public function processSumManual(...$args)
    {
        $args = $args ? $args[0] : $args;

        if (!empty($args['uid']) && !empty($args['tab_id']) && !empty($args['store_id'])) {
            $id = $args['id'];

            $this->databaseOper->utf8();

            $sql = "DELETE FROM tr_kn_dr_manual
                    WHERE userid=:uid AND tab_id=3 AND store_id=:storeid AND at_year=:atyear";

            $conditions = [
                ['uid', $args['uid']],
                ['atyear', $args['at_year']],
                ['storeid', $args['store_id']]
            ];

            $this->databaseOper->exec($sql, $conditions);

            $sql = "INSERT INTO tr_kn_dr_manual (
                            userid,
                            at_year,
                            summa,
                            tab_id,
                            store_id
                        )
                        VALUES (
                            :uid,
                            :atyear,
                            :summa,
                            :tabid,
                            :storeid
                        )";

            $conditions = [
                ['uid', $args['uid']],
                ['atyear', $args['at_year']],
                ['summa', $args['summa'] ? $args['summa'] : 0],
                ['tabid', $args['tab_id']],
                ['storeid', $args['store_id']],
            ];

            $this->databaseOper->exec($sql, $conditions);
            $id = $this->databaseOper->lastInsertId();
        }

        return ['id' => $id];

    }

    public function update($args, $id, $idOp = 0, $source = 0, $sourceId = 0)
    {
        if (!empty($args['uid']) && $id && !empty($args['fields'])) {
            $values = $args['fields'];

            $this->databaseOper->utf8();

            if ($idOp == 4 && $sourceId > 0) {
                $sql = "SELECT id FROM {$this->tableName} 
                        WHERE userid=:uid AND tab_id=1 AND id_op=4 AND source_id=:sid";

                $data = $this->databaseOper->rowset($sql, [
                    ['uid', $args['uid']],
                    ['sid', $sourceId]
                ]);

                if ($data) {
                    foreach ($data as $datum) {
                        $conditions = [
                            ['userid', $args['uid']],
                            ['id', $datum['id']]
                        ];
                        save_log(59, 1, 'Обновление записи в КуДиР.');
                        $ret = createScript($this->tableName, 2, $values, $conditions);
                    }
                }
            } else if ($source == 1000009 && $sourceId > 0) {
                $sql = "SELECT id FROM {$this->tableName} 
                        WHERE userid=:uid AND tab_id=1 AND `source`=:src AND source_id=:sid";

                $data = $this->databaseOper->rowset($sql, [
                    ['uid', $args['uid']],
                    ['src', $source],
                    ['sid', $sourceId]
                ]);

                if ($data) {
                    foreach ($data as $datum) {
                        $conditions = [
                            ['userid', $args['uid']],
                            ['id', $datum['id']]
                        ];
                        save_log(59, 1, 'Обновление записи в КуДиР.');
                        $ret = createScript($this->tableName, 2, $values, $conditions);
                    }
                }
            } else {
                $conditions = [
                    ['userid', $args['uid']],
                    ['id', $id]
                ];
                save_log(59, 1, 'Обновление записи в КуДиР.');
                $ret = createScript($this->tableName, 2, $values, $conditions);
            }

//            sav_log('tr_kn_dr', $id, 3, 'edit tr_kn_dr', $args['doc_date']);
            save_log(59, 2, 'Запись обновлена в КуДиР.');
            return ['id' => $id];
        }

        return false;
    }

    public function delete(...$args)
    {
        $args = $args ? $args[0] : $args;

        if (!empty($args['uid']) && !empty($args['id'])) {
            parent::delete($args['id']);

            if ($args['tab'] && $args['tab'] == 2) {
                $sql = "DELETE FROM tr_kndr_os_nma WHERE userid=:uid AND id=:id";
                $this->databaseOper->exec($sql, [
                    ['uid', $args['uid']],
                    ['id', $args['id']]
                ]);
            }

            return ['deleted' => $args['id']];
        }

        return false;
    }

    public function copyRecord(...$args)
    {
        $args = $args ? $args[0] : $args;

        if (!empty($args['uid']) && !empty($args['id'])) {
            $sql = "INSERT INTO {$this->tableName} (
                        id_op,
                        id_op_orig,
                        id_doc,
                        iskl,
                        auto,
                        userid,
                        `date`,
                        date_orig,                   
                        short_name,
                        short_name_orig,
                        n_doc,
                        n_doc_orig,
                        at_period,
                        at_period_orig,
                        id_sod,
                        id_sod_orig,
                        summa, 
                        summa_orig,
                        crc,
                        id_os,
                        id_contra,
                        id_contra_orig,
                        id_analit,
                        tab_id,
                        details,
                        base_cost,
                        base_cost_orig,
                        quarter_fees,
                        quarter_fees_orig,
                        tax_fees,
                        tax_fees_orig,
                        previous_fees,
                        previous_fees_orig,
                        future_fees,                        
                        future_fees_orig                        
                    )
                SELECT
                        id_op,
                        id_op_orig,
                        id_doc,
                        0,
                        0,
                        userid,
                        `date`,
                        date_orig,
                        short_name,
                        short_name_orig,
                        n_doc,
                        n_doc_orig,
                        at_period,
                        at_period_orig,
                        id_sod,
                        id_sod_orig,
                        summa, 
                        summa_orig,
                        crc,
                        id_os,
                        id_contra,
                        id_contra_orig,
                        id_analit,
                        tab_id,
                        details,
                        base_cost,
                        base_cost_orig,
                        quarter_fees,
                        quarter_fees_orig,
                        tax_fees,
                        tax_fees_orig,
                        previous_fees,
                        previous_fees_orig,
                        future_fees,
                        future_fees_orig
                FROM {$this->tableName} 
                WHERE userid=:uid and id=:id
            ";

            $conditions = [
                ['uid', $args['uid']],
                ['id', $args['id']]
            ];

            $this->databaseOper->utf8();

            save_log(59, 1, 'Копирование записи в КуДиР.');
            $this->databaseOper->exec($sql, $conditions);
            $id = $this->databaseOper->lastInsertId();

            if ($id && !empty($args['tab']) && $args['tab'] == 2) {
                $sql = "INSERT INTO tr_kndr_os_nma (
                            id,
                            userid,
                            rectype,
                            `name`,
                            name_orig,
                            kat,
                            kat_orig,
                            datepayed,
                            datepayed_orig,
                            datvv,
                            datvv_orig,
                            yrexp,
                            yrexp_orig,
                            ost,
                            ost_orig,
                            qtexp,
                            qtexp_orig,
                            datgr,
                            datgr_orig,
                            datvyb,
                            datvyb_orig
                    )
                    SELECT
                            :newid, 
                            userid,
                            rectype,
                            `name`,
                            name_orig,
                            kat,
                            kat_orig,
                            datepayed,
                            datepayed_orig,
                            datvv,
                            datvv_orig,
                            yrexp,
                            yrexp_orig,
                            ost,
                            ost_orig,
                            qtexp,
                            qtexp_orig,
                            datgr,
                            datgr_orig,
                            datvyb,
                            datvyb_orig
                FROM tr_kndr_os_nma
                WHERE userid=:uid and id=:id
            ";

                $conditions = [
                    ['uid', $args['uid']],
                    ['id', $args['id']],
                    ['newid', $id]
                ];

                $this->databaseOper->exec($sql, $conditions);
            }

            save_log(59, 2, 'Запись обновлена в КуДиР.');
            return ['id' => $id];
        }

        return false;
    }

    /**
     * Метод paymentDocsMap.
     * Вспомогательный метод. Содержит фиксированный набор пар наименований документов (полное - краткое).
     * Ключ массива - "Полное наименование документа".
     * Возвращает найденную по ключу пару или пустую строку, если документ не найден.
     *
     * @param $name Полное наименование документа
     * @return string|void  Массив, пара значений "Полное наименование документа" - "Краткое наименование локумента"
     *                      или пустая строка.
     */
    private function paymentDocsMap($name)
    {
        if (!$name) return;

        $docsMap = [
            'Приходный кассовый ордер' => 'ПКО',
            'Расходный кассовый ордер' => 'РКО',
            'Платежное поручение' => 'ПП',
            'Платежное требование' => 'ПТ'
        ];

        return isset($docsMap[$name]) ? $docsMap[$name] : '';
    }

    /**
     * Метод PaymentDocsNamesShortened.
     * Поставщик данных для метода Kudir->getPaymentDocs() (classes/businessmodels/kudir.php).
     * Возвращает структуру документов, упорядоченную в части кратких наименований.
     *
     * @param array $docs Массив документов из справочника `pu2014.tr_sp_doc`.
     * @return array|void Массив документов или пустой массив.
     */
    public function PaymentDocsNamesShortened($docs = [])
    {
        if (!$docs) return;

        $data = $unique = [];

        foreach ($docs as $doc) {
            $shortName = $this->paymentDocsMap($doc['name']);
            if ($shortName && !in_array($doc['name'], $unique)) {
                $data[] = [
                    'id' => $doc['id'],
                    'name' => $doc['name'],
                    'short_name' => $shortName,
                ];
                $unique[] = $doc['name'];
            }
        }

        return $data;
    }

    public function getUserData($uid)
    {
        if (!$uid) return;

        $sql = "SELECT * FROM pu3.mysqlusers WHERE IdUser=:uid";
        return $this->databaseOper->row($sql, [['uid', $uid]]);
    }

    public function getCardData(...$args)
    {
        $args = $args ? $args[0] : $args;
        $data = [];

        if ($args['id']) {
            $sql = "SELECT 
                a.id,
                b.name,
                b.name_orig,
                a.id_op,                 
                a.id_op_orig,                 
                a.auto,
                a.iskl,
                a.is_dirty,
                a.tab_id,
                a.details,
                a.base_cost,
                a.base_cost_orig,
                a.quarter_fees,
                a.quarter_fees_orig,
                a.tax_fees,
                a.tax_fees_orig,
                a.previous_fees,
                a.previous_fees_orig,
                a.future_fees,
                a.future_fees_orig,
                b.rectype,
                b.kat,
                b.kat_orig,
                date_format(b.datepayed,'%d.%m.%Y') AS datepayed,
                date_format(b.datepayed_orig,'%d.%m.%Y') AS datepayed_orig,
                date_format(b.datvv,'%d.%m.%Y') AS datvv,
                date_format(b.datvv_orig,'%d.%m.%Y') AS datvv_orig,
                b.yrexp,
                b.yrexp_orig,
                b.ost,
                b.ost_orig,
                b.qtexp,
                b.qtexp_orig,
                date_format(b.datgr,'%d.%m.%Y') AS datgr,
                date_format(b.datgr_orig,'%d.%m.%Y') AS datgr_orig,
                date_format(b.datvyb,'%d.%m.%Y') AS datvyb,                
                date_format(b.datvyb_orig,'%d.%m.%Y') AS datvyb_orig                
        FROM {$this->tableName} a 
        INNER JOIN tr_kndr_os_nma b ON a.id=b.id
        WHERE a.UserId=:uid AND 
          a.tab_id=:tabid AND 
          a.id=:id 
        ORDER BY a.date";

            $this->databaseOper->utf8();

            $data = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['tabid', 2],
                ['id', $args['id']]
            ]);
        }

        return $data;
    }

    public function saveCardRecord(...$args)
    {
        $args = $args ? $args[0] : $args;

        if (!empty($args['name'])) {
            $id = $args['id'];

            $this->databaseOper->utf8();

            if (!$id) {
                save_log(58, 1, 'Добавление записи в КуДиР.');

                $values = [
                    ['userid', $args['uid']],
                    ['date', $args['date']],
                    ['date_orig', $args['date']],
                    ['id_op', 0],
                    ['id_op_orig', 0],
                    ['id_doc', 0],
                    ['id_sod', $args['id_sod']],
                    ['id_sod_orig', $args['id_sod']],
                    ['id_os', $args['id_os']],
                    ['auto', 0],
                    ['iskl', 0],
                    ['is_dirty', 0],
                    ['tab_id', $args['tab_id']],
                    ['details', $args['details']],
                    ['base_cost', $args['base_cost']],
                    ['base_cost_orig', $args['base_cost']],
                    ['tax_fees', $args['tax_fees']],
                    ['tax_fees_orig', $args['tax_fees']],
                    ['quarter_fees', $args['quarter_fees']],
                    ['quarter_fees_orig', $args['quarter_fees']],
                    ['previous_fees', $args['previous_fees']],
                    ['previous_fees_orig', $args['previous_fees']],
                    ['future_fees', $args['future_fees']],
                    ['future_fees_orig', $args['future_fees']]
                ];

                $ret = createScript($this->tableName, 1, $values, "");
                $id = $ret['new_id'];

                $auxValues = [
                    ['id', $id],
                    ['userid', $args['uid']],
                    ['rectype', $args['rectype']],
                    ['name', $args['name']],
                    ['name_orig', $args['name']],
                    ['kat', $args['kat']],
                    ['kat_orig', $args['kat']],
                    ['datepayed', $args['datepayed']],
                    ['datepayed_orig', $args['datepayed']],
                    ['datvv', $args['datvv']],
                    ['datvv_orig', $args['datvv']],
                    ['datvyb', $args['datvyb']],
                    ['datvyb_orig', $args['datvyb']],
                    ['datgr', $args['datgr']],
                    ['datgr_orig', $args['datgr']],
                    ['yrexp', $args['yrexp']],
                    ['yrexp_orig', $args['yrexp']],
                    ['ost', $args['ost']],
                    ['ost_orig', $args['ost']],
                    ['qtexp', $args['qtexp']],
                    ['qtexp_orig', $args['qtexp']]
                ];

                createScript('tr_kndr_os_nma', 1, $auxValues, "");

                sav_log('tr_kn_dr', $id, 3, 'new tr_kn_dr', date('d.m.Y'));
                save_log(58, 2, 'Запись добавлена в КуДиР.');
            } else {
                save_log(59, 1, 'Обновление записи в КуДиР.');
                $conditions = [
                    ['userid', $args['uid']],
                    ['id', $id]
                ];

                if ($args['mode'] == 'add') {
                    $values = [
                        ['date', $args['date']],
                        ['date_orig', $args['date']],
                        ['id_op', 0],
                        ['id_op_orig', 0],
                        ['id_doc', 0],
                        ['id_sod', $args['id_sod']],
                        ['id_sod_orig', $args['id_sod']],
                        ['id_os', $args['id_os']],
                        ['auto', 0],
                        ['iskl', 0],
                        ['is_dirty', 0],
                        ['tab_id', $args['tab_id']],
                        ['details', $args['details']],
                        ['base_cost', $args['base_cost']],
                        ['base_cost_orig', $args['base_cost']],
                        ['tax_fees', $args['tax_fees']],
                        ['tax_fees_orig', $args['tax_fees']],
                        ['quarter_fees', $args['quarter_fees']],
                        ['quarter_fees_orig', $args['quarter_fees']],
                        ['previous_fees', $args['previous_fees']],
                        ['previous_fees_orig', $args['previous_fees']],
                        ['future_fees', $args['future_fees']],
                        ['future_fees_orig', $args['future_fees']]
                    ];
                } else {
                    $values = [
                        ['date', $args['date']],
                        ['auto', $args['auto']],
                        ['is_dirty', $args['is_dirty']],
                        ['iskl', $args['iskl']],
                        ['details', $args['details']],
                        ['base_cost', $args['base_cost']],
                        ['tax_fees', $args['tax_fees']],
                        ['quarter_fees', $args['quarter_fees']],
                        ['previous_fees', $args['previous_fees']],
                        ['future_fees', $args['future_fees']]
                    ];
                }

                $this->databaseOper->utf8();

                createScript($this->tableName, 2, $values, $conditions);

                if ($args['mode'] == 'add') {
                    $auxValues = [
                        ['rectype', $args['rectype']],
                        ['name', $args['name']],
                        ['name_orig', $args['name']],
                        ['kat', $args['kat']],
                        ['kat_orig', $args['kat']],
                        ['datepayed', $args['datepayed']],
                        ['datepayed_orig', $args['datepayed']],
                        ['datvv', $args['datvv']],
                        ['datvv_orig', $args['datvv']],
                        ['datvyb', $args['datvyb']],
                        ['datvyb_orig', $args['datvyb']],
                        ['datgr', $args['datgr']],
                        ['datgr_orig', $args['datgr']],
                        ['yrexp', $args['yrexp']],
                        ['yrexp_orig', $args['yrexp']],
                        ['ost', $args['ost']],
                        ['ost_orig', $args['ost']],
                        ['qtexp', $args['qtexp']],
                        ['qtexp_orig', $args['qtexp']]
                    ];
                } else {
                    $auxValues = [
                        ['is_dirty', $args['is_dirty']],
                        ['rectype', $args['rectype']],
                        ['name', $args['name']],
                        ['kat', $args['kat']],
                        ['datepayed', $args['datepayed']],
                        ['datvv', $args['datvv']],
                        ['datvyb', $args['datvyb']],
                        ['datgr', $args['datgr']],
                        ['yrexp', $args['yrexp']],
                        ['ost', $args['ost']],
                        ['qtexp', $args['qtexp']]
                    ];
                }

                createScript('tr_kndr_os_nma', 2, $auxValues, $conditions);

                sav_log('tr_kn_dr', $id, 3, 'edit tr_kn_dr', date('d.m.Y'));
                save_log(59, 2, 'Запись обновлена в КуДиР.');
            }

            return ['id' => $id];
        }

        return false;
    }

    /**
     * Метод getFillPreset
     * Подготовка данных для настройки автозаполнения КУДиР.
     *
     * @param array ...$args
     */
    public function getFillPreset(...$args)
    {
        $args = $args ? $args[0] : $args;
        if (empty($args['uid']) || empty($args['d_beg']) || empty($args['d_end']) || !is_numeric($args['tax_mode'])) return;

        $sql = "DELETE FROM tr_kn_dr WHERE userid=:uid AND tab_id=2 AND id NOT IN (SELECT id FROM tr_kndr_os_nma)";
        PDO_exec($sql, [['uid', $args['uid']]]);

        $this->databaseOper->utf8();

        // Исключенные автозаписи 1 раздела.
        $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND tab_id=1 AND auto=2 AND iskl=1 AND date BETWEEN :d_beg AND :d_end";
        $_ = $this->databaseOper->row($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        $data['excl_section1'] = $_['cnt'];

        // Исправленные автозаписи 1 раздела.
        $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND tab_id=1 AND auto=2 AND is_dirty=1 AND date BETWEEN :d_beg AND :d_end";
        $_ = $this->databaseOper->row($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        $data['dirty_section1'] = $_['cnt'];

        // Записи 1 раздела, добавленные вручную.
        $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND auto=0 AND tab_id=1 AND date BETWEEN :d_beg AND :d_end";
        $_ = $this->databaseOper->row($sql, [
            ['uid', $args['uid']],
            ['d_beg', $args['d_beg']],
            ['d_end', $args['d_end']]
        ]);

        $data['manual_section1'] = $_['cnt'];

        /** Доходы и расходы. */
        if ($args['tax_mode'] == 0) {
            // Все исключенные автозаписи.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND tab_id IN (1,2) AND auto=2 AND iskl=1 AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['excl_all'] = $_['cnt'];

            // Исключенные автозаписи 2 раздела.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND tab_id=2 AND auto=2 AND iskl=1 AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['excl_section2'] = $_['cnt'];

            // Все исправленные автозаписи.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND tab_id IN (1,2) AND auto=2 AND is_dirty=1 AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['dirty_all'] = $_['cnt'];

            // Исправленные автозаписи 2 раздела.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND tab_id=2 AND auto=2 AND is_dirty=1 AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['dirty_section2'] = $_['cnt'];

            // Все записи, добавленные вручную.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND auto=0 AND tab_id IN (1,2) AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['manual_all'] = $_['cnt'];

            // Записи 2 раздела, добавленные вручную.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND auto=0 AND tab_id=2 AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['manual_section2'] = $_['cnt'];

        } else {
            /** Доходы */
            // Все исключенные автозаписи.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND tab_id IN (1,4,5) AND auto=2 AND iskl=1 AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['excl_all'] = $_['cnt'];

            // Исключенные автозаписи 4 раздела.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND tab_id=4 AND auto=2 AND iskl=1 AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['excl_section4'] = $_['cnt'];

            // Исключенные автозаписи 5 раздела.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND tab_id=5 AND auto=2 AND iskl=1 AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['excl_section5'] = $_['cnt'];

            // Все исправленные автозаписи.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND tab_id IN (1,4,5) AND auto=2 AND is_dirty=1 AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['dirty_all'] = $_['cnt'];

            // Исправленные автозаписи 4 раздела.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND tab_id=4 AND auto=2 AND is_dirty=1 AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['dirty_section4'] = $_['cnt'];

            // Исправленные автозаписи 5 раздела.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND tab_id=5 AND auto=2 AND is_dirty=1 AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['dirty_section5'] = $_['cnt'];

            // Все записи, добавленные вручную.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND auto=0 AND tab_id IN (1,4,5) AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['manual_all'] = $_['cnt'];

            // Записи 4 раздела, добавленные вручную.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND auto=0 AND tab_id=4 AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['manual_section4'] = $_['cnt'];

            // Записи 5 раздела, добавленные вручную.
            $sql = "SELECT COUNT(*) AS cnt FROM tr_kn_dr WHERE userid=:uid AND auto=0 AND tab_id=5 AND date BETWEEN :d_beg AND :d_end";
            $_ = $this->databaseOper->row($sql, [
                ['uid', $args['uid']],
                ['d_beg', $args['d_beg']],
                ['d_end', $args['d_end']]
            ]);

            $data['manual_section5'] = $_['cnt'];
        }

        return $data;
    }

}
