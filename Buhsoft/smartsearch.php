<?php

include "auth.php";
require_once("./php_func.php");

defined('SEARCH_SEPARATOR') || define('SEARCH_SEPARATOR', '<svg class="arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7 17.8802V6.11981C7 5.25685 7.83605 4.71918 8.50177 5.154L17.5046 11.0342C18.1651 11.4656 18.1651 12.5344 17.5046 12.9658L8.50177 18.846C7.83605 19.2808 7 18.7431 7 17.8802Z" fill="black"/>
</svg>');

$_args = $_REQUEST;
$storage = isset($_args['storage']) ? $_args['storage'] : '' ;
$id = isset($_args['id']) ? $_args['id'] : 0 ;
$year = isset($_args['year']) ? (int)$_args['year'] : 0 ;

$responce = [];

switch ($storage){
  case  'contractors':
    $responce = tr_contra($_auid, $id);
  break;

  case  'fixedassets':
    $responce = tr_os($_auid, $id);
  break;

  case  'intangibleassets':
    $responce = tr_nma($_auid, $id);
  break;

  case  'matherials':
    $responce = tr_mat($_auid, $id);
  break;

  case  'products':
    $responce = tr_prod($_auid, $id);
  break;

  case  'goods':
    $responce = tr_tovar($_auid, $id);
  break;

  case  'docs_sales':
    $responce = tr_doc_salesbook($_auid, $id, $year);
  break;

  case  'docs_upd':
    $responce = tr_doc_upd($_auid, $id, $year);
  break;

  case  'docs_transport':
    $responce = tr_doc_ttn($_auid, $id, $year);
  break;

  case  'docs_templates':
    $responce = tr_doc_dogovor($_auid, $id, $year);
  break;

  case  'docs_ao':
    $responce = tr_ao($_auid, $id, $year);
  break;

  case  'docs_acts':
    $responce = tr_acts($_auid, $id, $year);
  break;

  case  'actions':
    $responce = actions($id, $year);
  break;

  case  'folders':
    $responce = folders($id, $year, intval($user['nalog_mode']));
  break;

  case 'services_math':
    $responce = services_mat($_auid, $id);
  break;

  case 'services_prod':
    $responce = services_prod($_auid, $id);
  break;

  case 'deferexpenses':
    $responce = rbp($_auid, $id);
  break;

  case 'bank_order':
    $responce = tr_bank_pay($_auid, $id, $year);
  break;

  case 'cash_order':
    $responce = tr_kassa_pay($_auid, $id, $year);
  break;

  default:
    $responce['success'] = false;

  break;
}

echo json_encode($responce, 512);
die();

function tr_os($_auid, $id)
{
    PDO_utf8();

    $_row_data = PDO_row("SELECT id, name, invnom, datvv
                        FROM pu2014.tr_os
                        WHERE userid=:userid AND id=:id",
        [$_auid, ['id', $id]]);

    $nm = $_row_data['name'];
    $datvv = $_row_data['datvv'] && $_row_data['datvv'] != '0000-00-00' ?
        strftime('%d.%m.%Y', strtotime($_row_data['datvv'])) :
        'нет';

    $_buyDeals = PDO_row("SELECT COUNT(t1.ID) AS qty 
                             FROM {$maindbname}.tr_salesbook t1
                             JOIN {$maindbname}.tr_salesitem t2 ON t1.ID=t2.id_oper
                             WHERE t1.UserId=:userid AND t1.TYP_OPER=1 AND t2.ITEMS_ID=:id",
        [$_auid, ['id', $id]]);

    $_sellDeals = PDO_row("SELECT COUNT(t1.ID) AS qty 
                             FROM {$maindbname}.tr_salesbook t1
                             JOIN {$maindbname}.tr_salesitem t2 ON t1.ID=t2.id_oper
                             WHERE t1.UserId=:userid AND t1.TYP_OPER=2 AND t2.ITEMS_ID=:id",
        [$_auid, ['id', $id]]);

    $responce['success'] = true;

    $responce['card'] = "<table><tr>";
    $responce['card'] .= "<td><span class='strong'>{$nm}</span><br>";
    $responce['card'] .= "<span><strong>ОС</strong>&nbsp;&middot;&nbsp;";
    $responce['card'] .= "Инв.№ " . ($_row_data['invnom'] ? $_row_data['invnom'] : "нет") . ".&nbsp;&nbsp;";
    $responce['card'] .= "Дата ввода в экспл. {$datvv}";
    $responce['card'] .= "</span></td><td class='img'></td></tr></table>";

    $responce['interactive'] = [
        'buttons' => [
            [
                'title' => 'Открыть в справочнике',
                'eval' => "buhManager.openSprav(args)",
                'args' => [
                    'source' => 1,
                    'source_id' => $id,
                    'searchName' => $nm
                ]
            ]
        ],
        'links' => [
            [
                'title' => "Расчет амортизации",
                'eval' => "buhManager.openTab(args)",
                'args' => [
                    'source' => 7,
                    'source_id' => null,
                    'task' => 'filter',
                    'taskData' => [
                        'month' => date('n'),
                        'find' => $nm
                    ]
                ]
            ],
            [
                'title' => "Покупки",
                'eval' => ($_buyDeals['qty'] == 0 ? null : "buhManager.openTab(args)"),
                'args' => [
                    'source' => 1,
                    'source_id' => null,
                    'task' => 'filter',
                    'taskAction' => [
                        [
                            'name' => 'cbIdAnalit',
                            'value' => '1',
                            'init' => '1',
                            'id' => '',
                            'xtraParam' => 'id_sprav'
                        ],
                        [
                            'name' => 'items_id',
                            'value' => $id,
                            'init' => $id,
                            'id' => '',
                            'xtraParam' => 'id_analit'
                        ]
                    ]
                ]
            ],
            [
                'title' => "Продажи",
                'eval' => ($_sellDeals['qty'] == 0 ? null : "buhManager.openTab(args)"),
                'args' => [
                    'source' => 2,
                    'source_id' => null,
                    'task' => 'filter',
                    'taskAction' => [
                        [
                            'name' => 'cbIdAnalit',
                            'value' => '1',
                            'init' => '0',
                            'id' => '',
                            'xtraParam' => 'id_sprav'
                        ],
                        [
                            'name' => 'items_id',
                            'value' => $id,
                            'init' => $id,
                            'id' => '',
                            'xtraParam' => 'id_analit'
                        ]
                    ]
                ]
            ],
            [
                'title' => "Журнал операций",
                'eval' => "buhManager.openTab(args)",
                'args' => [
                    'source' => 9,
                    'source_id' => null,
                    'task' => 'filter',
                    'taskAction' => 90,
                    'taskData' => [
                        'sc_d1' => null,
                        'an_d11' => $id,
                        'sc_c1' => null,
                        'an_c11' => $id
                    ]
                ]
            ]
        ]
    ];

    return $responce;
}


function tr_nma($_auid, $id)
{
    PDO_utf8();

    $_row_data = PDO_row("SELECT id, name 
                        FROM pu2014.tr_nma 
                        WHERE userid=:userid AND id=:id",
        [$_auid, ['id', $id]]);

    $nm = $_row_data['name'];

    $sc_d1 = PDO_row("SELECT sc_d 
                        FROM tr_journal
                        WHERE userid=:userid and an_d1=:id",
        [$_auid, ['id', $id]]);

    $sc_c1 = PDO_row("SELECT sc_c 
                        FROM tr_journal
                        WHERE userid=:userid and an_c1=:id",
        [$_auid, ['id', $id]]);

    $responce['success'] = true;

    $responce['card'] = "<table><tr>
                        <td><span class='strong'>{$nm}</span></td>
                        <td class='img'></td></tr></table>";

    $responce['interactive'] = [
        'buttons' => [
            ['title' => 'Открыть в справочнике',
                'eval' => "buhManager.openSprav(args)",
                'args' => [
                    'source' => 2,
                    'source_id' => $id,
                    'searchName' => $nm
                ]
            ]
        ],
        'links' => [
            [
                'title' => "Журнал операций",
                'eval' => "buhManager.openTab(args)",
                'args' => [
                    'source' => 9,
                    'source_id' => null,
                    'task' => 'filter',
                    'taskAction' => 90,
                    'taskData' => [
                         'sc_d1' => $sc_d1['sc_d'],
                         'an_d11' => $id,
                         'sc_c1' => $sc_c1['sc_c'],
                         'an_c11' => $id
                    ]
                ]
            ]
        ]
    ];

    return $responce;
}

function tr_mat($_auid, $id)
{
    global $maindbname;

    PDO_utf8();

    $_row_data = PDO_row("SELECT id, name, vid, pu2014.get_z_analit_t(userid, 29, edizm_id) AS edizm_na 
                        FROM pu2014.tr_mat 
                        WHERE userid=:userid AND id=:id",
        [$_auid, ['id', $id]]);

    $nm = ($_row_data['name'] . ($_row_data['edizm_na'] ? ", " . $_row_data['edizm_na'] : ""));
    $nmExact = $_row_data['name'];

    $_row_count = PDO_row("SELECT {$maindbname}.getosttotal(:userid, 3, :id, now()) AS kol", [$_auid, ['id', $id]]);
    $kol = $_row_count['kol'] * 1;

    $_buyDeals = PDO_row("SELECT COUNT(t1.ID) AS qty 
                                FROM {$maindbname}.tr_salesbook t1
                                JOIN {$maindbname}.tr_salesitem t2 ON t1.ID=t2.id_oper
                                WHERE t1.UserId=:userid AND t1.TYP_OPER=1 AND t2.ITEMS_ID=:id",
        [$_auid, ['id', $id]]);

    $responce['success'] = true;

    $responce['card'] = "<table><tr>
                        <td><span class='strong'>{$nm}</span><br>
                        <span><strong>Материал</strong>&nbsp;&middot;&nbsp;Остаток: {$kol}</span></td>
                        </td><td class='img'></td></tr></table>";

    $responce['interactive'] = [
        'buttons' => [
            ['title' => 'Открыть в справочнике',
                'eval' => "buhManager.openSprav(args)",
                'args' => ['source' => 3, 'source_id' => $id, 'searchName' => $nmExact]
            ]
        ],
        'links' => [
            [
                'title' => "Покупки",
                'eval' => ($_buyDeals['qty'] == 0 ? null : "buhManager.openTab(args)"),
                'args' => [
                    'source' => 1,
                    'source_id' => null,
                    'task' => 'filter',
                    'taskAction' => [
                        [
                            'name' => 'cbIdAnalit',
                            'value' => '3',
                            'init' => '0',
                            'id' => '',
                            'xtraParam' => 'id_sprav'
                        ],
                        [
                            'name' => 'items_id',
                            'value' => $id,
                            'init' => $id,
                            'id' => '',
                            'xtraParam' => 'id_analit'
                        ]
                    ]
                ]
            ],
            [
                'title' => "Списание материала",
                'eval' => "buhManager.openTab(args)",
                'args' => [
                    'source' => 6,
                    'source_id' => null,
                    'task' => 'filter',
                    'taskAction' => 20,
                    'taskData' => [
                        'analit' => 'tr_mat',
                        'find' => $id
                    ]
                ]
            ],
            [
                'title' => "Обороты",
                'eval' => "buhManager.openTab(args)",
                'args' => [
                    'source' => 17,
                    'source_id' => $id,
                    'task' => 'filter',
                    'taskAction' => 20,
                    'taskData' => [
                        'id_sprav' => 3,
                        'find' => $nmExact
                    ]
                ]
            ],
            [
                'title' => "Карточка номенклатуры",
                'eval' => "buhManager.openTab(args)",
                'args' => [
                    'source' => 17,
                    'source_id' => $id,
                    'task' => 'edit',
                    'taskAction' => 20,
                    'taskData' => [
                        'id_sprav' => 3,
                        'find' => $nmExact
                    ]
                ]
            ]
        ]
    ];

    return $responce;
}

function tr_prod($_auid, $id)
{
    global $maindbname;

    PDO_utf8();

    $_row_data = PDO_row("SELECT id, name, vid, pu2014.get_z_analit_t(userid, 29, edizm_id) AS edizm_na 
                        FROM pu2014.tr_prod 
                        WHERE userid=:userid AND id=:id",
        [$_auid, ['id', $id]]);

    $nm = ($_row_data['name'] . ($_row_data['edizm_na'] ? ", " . $_row_data['edizm_na'] : ""));
    $nmExact = $_row_data['name'];

    $_row_count = PDO_row("SELECT {$maindbname}.getosttotal(:userid, 4, :id, now()) AS kol", [$_auid, ['id', $id]]);
    $kol = $_row_count['kol'] * 1;

    $_sellDeals = PDO_row("SELECT COUNT(t1.ID) AS qty 
                             FROM {$maindbname}.tr_salesbook t1
                             JOIN {$maindbname}.tr_salesitem t2 ON t1.ID=t2.id_oper
                             WHERE t1.UserId=:userid AND t1.TYP_OPER=2 AND t2.ITEMS_ID=:id",
        [$_auid, ['id', $id]]);

    $responce['success'] = true;
    $responce['card'] = "<table><tr>
                        <td><span class='strong'>{$nm}</span><br>
                        <span><strong>Продукция</strong>&nbsp;&middot;&nbsp;Остаток: {$kol}</span></td>
                        <td class='img'></td></tr></table>";

    $responce['interactive'] = [
        'buttons' => [
            ['title' => 'Открыть в справочнике',
                'eval' => "buhManager.openSprav(args)",
                'args' => ['source' => 4, 'source_id' => $id, 'vid' => $_row_data['vid'], 'searchName' => $nmExact],
            ]
        ],
        'links' => [
            [
                'title' => "Продажи",
                'eval' => ($_sellDeals['qty'] == 0 ? null : "buhManager.openTab(args)"),
                'args' => [
                    'source' => 2,
                    'source_id' => null,
                    'task' => 'filter',
                    'taskAction' => [
                        [
                            'name' => 'cbIdAnalit',
                            'value' => '4',
                            'init' => '0',
                            'id' => "",
                            'xtraParam' => 'id_sprav'
                        ],
                        [
                            'name' => 'items_id',
                            'value' => $id,
                            'init' => $id,
                            'id' => '',
                            'xtraParam' => 'id_analit'
                        ]
                    ]
                ]
            ],
            [
                'title' => "Выпуск продукции",
                'eval' => "buhManager.openTab(args)",
                'args' => [
                    'source' => 6,
                    'source_id' => null,
                    'task' => 'filter',
                    'taskAction' => 30,
                    'taskData' => [
                        'analit' => 'tr_mat',
                        'find' => $id
                    ]
                ]

            ],
            [
                'title' => "Обороты",
                'eval' => "buhManager.openTab(args)",
                'args' => [
                    'source' => 17,
                    'source_id' => $id,
                    'task' => 'filter',
                    'taskAction' => 20,
                    'taskData' => [
                        'id_sprav' => 4,
                        'find' => $nmExact
                    ]
                ]
            ],
            [
                'title' => "Карточка номенклатуры",
                'eval' => "buhManager.openTab(args)",
                'args' => [
                    'source' => 17,
                    'source_id' => $id,
                    'task' => 'edit',
                    'taskAction' => 20,
                    'taskData' => [
                        'id_sprav' => 4,
                        'find' => $nmExact
                    ]
                ]
            ]
        ]
    ];

    return $responce;
}

function services_mat($_auid, $id)
{
    PDO_utf8();

    $_row_data = PDO_row("SELECT 
                            id, 
                            name, 
                            vid, 
                            pu2014.get_z_analit_t(userid, 29, edizm_id) as edizm_na 
                        FROM pu2014.tr_mat 
                        WHERE userid=:userid AND id=:id AND vid=1",
        [$_auid, ['id', $id]]);

    $nm = $_row_data['name'];

    $responce['success'] = true;
    $responce['card'] = "<table><tr>
                        <td><span class='strong'>{$nm}</span><br>
                        <span><strong>Услуга полученная</strong></span></td>
                        </td><td class='img'></td></tr></table>";

    $responce['interactive'] = [
        'buttons' => [
            ['title' => 'Открыть в справочнике',
                'eval' => "buhManager.openSprav(args)",
                'args' => [
                    'source' => 3,
                    'source_id' => $id,
                    'vid' => $_row_data['vid'],
                    'searchName' => $nm
                ],
            ]
        ]
    ];

    return $responce;
}

function services_prod($_auid, $id)
{
    PDO_utf8();

    $_row_data = PDO_row("SELECT 
                            id, 
                            name, 
                            vid, 
                            pu2014.get_z_analit_t(userid, 29, edizm_id) AS edizm_na 
                        FROM pu2014.tr_prod 
                        WHERE userid=:userid AND id=:id AND vid=1",
        [$_auid, ['id', $id]]);

    $nm = $_row_data['name'];

    $responce['success'] = true;

    $responce['card'] = "<table><tr>
                        <td><span class='strong'>{$nm}</span><br>
                        <span><strong>Услуга оказанная</strong></span></td>
                        <td class='img'></td></tr></table>";

    $responce['interactive'] = [
        'buttons' => [
            ['title' => 'Открыть в справочнике',
                'eval' => "buhManager.openSprav(args)",
                'args' => [
                    'source' => 4,
                    'source_id' => $id,
                    'vid' => $_row_data['vid'],
                    'searchName' => $nm
                ],
            ]
        ]
    ];

    return $responce;
}


function tr_tovar($_auid, $id)
{
    global $maindbname;

    PDO_utf8();

    $_row_data = PDO_row("SELECT id, name, pu2014.get_z_analit_t(userid, 29, edizm_id) AS edizm_na 
                        FROM pu2014.tr_tovar 
                        WHERE userid=:userid AND id=:id",
        [$_auid, ['id', $id]]);

    $nmExact = $_row_data['name'];
    $nm = ($_row_data['name'] . ", " . $_row_data['edizm_na']);

    $_row_count = PDO_row("SELECT {$maindbname}.getosttotal(:userid, 5, :id, now()) AS kol", [$_auid, ['id', $id]]);
    $kol = $_row_count['kol'] * 1;

    $_buyDeals = PDO_row("SELECT COUNT(t1.ID) AS qty 
                             FROM {$maindbname}.tr_salesbook t1
                             JOIN {$maindbname}.tr_salesitem t2 ON t1.ID=t2.id_oper
                             WHERE t1.UserId=:userid AND t1.TYP_OPER=1 AND t2.ITEMS_ID=:id",
        [$_auid, ['id', $id]]);

    $_sellDeals = PDO_row("SELECT COUNT(t1.ID) AS qty 
                             FROM {$maindbname}.tr_salesbook t1
                             JOIN {$maindbname}.tr_salesitem t2 ON t1.ID=t2.id_oper
                             WHERE t1.UserId=:userid AND t1.TYP_OPER=2 AND t2.ITEMS_ID=:id",
        [$_auid, ['id', $id]]);

    $responce['success'] = true;

    $responce['card'] = "<table><tr>
                        <td><span class='strong'>{$nm}</span>
                        <span><strong>Товар</strong>&nbsp;&middot;&nbsp;Остаток: {$kol}</span></td>
                        <td class='img'></td></tr></table>";

    $responce['interactive'] = [
        'buttons' => [
            ['title' => 'Открыть в справочнике',
                'eval' => "buhManager.openSprav(args)",
                'args' => ['source' => 5, 'source_id' => $id, 'searchName' => $nmExact],
            ]
        ],
        'links' => [
            [
                'title' => "Покупки",
                'eval' => ($_buyDeals['qty'] == 0 ? null : "buhManager.openTab(args)"),
                'args' => [
                    'source' => 1,
                    'source_id' => null,
                    'task' => 'filter',
                    'taskAction' => [
                        [
                            'name' => 'cbIdAnalit',
                            'value' => '5',
                            'init' => '5',
                            'id' => '',
                            'xtraParam' => 'id_sprav'
                        ],
                        [
                            'name' => 'items_id',
                            'value' => $id,
                            'init' => $id,
                            'id' => '',
                            'xtraParam' => 'id_analit'
                        ]
                    ]
                ]
            ],
            [
                'title' => "Продажи",
                'eval' => ($_sellDeals['qty'] == 0 ? null : "buhManager.openTab(args)"),
                'args' => [
                    'source' => 2,
                    'source_id' => null,
                    'task' => 'filter',
                    'taskAction' => [
                        [
                            'name' => 'cbIdAnalit',
                            'value' => '5',
                            'init' => '0',
                            'id' => '',
                            'xtraParam' => 'id_sprav'
                        ],
                        [
                            'name' => 'items_id',
                            'value' => $id,
                            'init' => $id,
                            'id' => '',
                            'xtraParam' => 'id_analit'
                        ]
                    ]
                ]
            ],
            [
                'title' => "Обороты",
                'eval' => "buhManager.openTab(args)",
                'args' => [
                    'source' => 17,
                    'source_id' => $id,
                    'task' => 'filter',
                    'taskAction' => 20,
                    'taskData' => [
                        'id_sprav' => 5,
                        'find' => $nmExact
                    ]
                ]
            ],
            [
                'title' => "Карточка номенклатуры",
                'eval' => "buhManager.openTab(args)",
                'args' => [
                    'source' => 17,
                    'source_id' => $id,
                    'task' => 'edit',
                    'taskAction' => 20,
                    'taskData' => [
                        'id_sprav' => 5,
                        'find' => $nmExact
                    ]
                ]
            ]
        ]
    ];

    return $responce;
}

function tr_contra($_auid, $id)
{
    PDO_utf8();

    $_row_data = PDO_row("SELECT * FROM pu2014.tr_contra WHERE userid=:userid AND id=:id",
        [$_auid, ['id', $id]]);

    $data = PDO_row("SELECT MIN(rsmy_id) AS rsmy_id 
                    FROM tr_bank_pay 
                    WHERE userid=:userid AND rsmy_id>0 AND org_id=:org_id",
        [$_auid, ['org_id', $id]]);

    $rsmyId = $data['rsmy_id'];

    switch ($_row_data['state']) {
        case 'R':
            $pic = "../../img/red-hand.svg";
            break;
        case 'Y':
            $pic = "../../img/yellow-hand.svg";
            break;
        case 'G':
            $pic = "../../img/green-hand.svg";
            break;
        case 'N':
            $pic = "../../img/contractor-state-taboo.svg";
            break;
        default :
            $pic = "";
            break;
    }

    $responce['success'] = true;
    $responce['card'] = "<table><tr>
                        <td><span class='strong'>{$_row_data['naim']}</span>
                        <br><span class='gray'>ИНН {$_row_data['inn']}</span></td>
                        <td class='img'>" . ($pic ? "<img src='{$pic}' width='50' height='50' />" : "") . "</td>
            </tr></table>";


    $responce['interactive'] = [
        'buttons' => [
            ['title' => 'Открыть в справочнике',
                'eval' => "buhManager.openSprav(args)",
                'args' => ['source' => 6, 'source_id' => $id, 'typ_contra' => $_row_data['typ_contra']],
            ]
        ],
        'links' => [
            [
                "title" => "Покупки",
                "eval" => "buhManager.openTab(args)",
                "args" => [
                    'source' => 1,
                    'source_id' => $id,
                    'name' => $_row_data['naim'],
                    'task' => 'filter',
                    'taskData' => [
                        'find' => $_row_data['naim']
                    ]
                ]
            ],
            [
                "title" => "Продажи",
                "eval" => "buhManager.openTab(args)",
                "args" => [
                    'source' => 2,
                    'source_id' => $id,
                    'name' => $_row_data['naim'],
                    'task' => 'filter',
                    'taskData' => [
                        'find' => $_row_data['naim']
                    ]
                ],
            ],
            [
                "title" => "Акт сверки",
                "eval" => "buhManager.otherWindows(args)",
                "args" => [
                    'source' => 1,
                    'source_id' => $id,
                    'name' => $_row_data['naim'],
                    'task' => 'filter',
                    'taskData' => [
                        'find' => $_row_data['naim']
                    ]
                ],
            ],
            [
                "title" => "Добавить покупку",
                "eval" => "buhManager.openTab(args)",
                "args" => ['source' => 1, 'source_id' => $id, 'name' => $_row_data['naim'], 'task' => 'add'],
            ],
            [
                "title" => "Добавить продажу",
                "eval" => "buhManager.openTab(args)",
                "args" => ['source' => 2, 'source_id' => $id, 'name' => $_row_data['naim'], 'task' => 'add'],
            ],
            [
                "title" => "Банк",
                "eval" => "buhManager.openTab(args)",
                "args" => ['source' => 3, 'source_id' => $id, 'name' => $_row_data['naim']],
            ],
            [
                "title" => "Добавить безналичный платеж",
                "eval" => "buhManager.openTab(args)",
                "args" => [
                    'source' => 3,
                    'source_id' => $id,
                    'task' => 'add',
                    'rsmy_id' => $rsmyId,
                    'searchCname' => $_row_data['naim']
                ]
            ],
            [
                "title" => "Касса",
                "eval" => "buhManager.openTab(args)",
                "args" => ['source' => 4, 'source_id' => $id, 'name' => $_row_data['naim']],
            ],
            [
                "title" => "Добавить наличный платеж",
                "eval" => "buhManager.openTab(args)",
                "args" => ['source' => 4, 'source_id' => $id, 'name' => $_row_data['naim'], 'task' => 'add'],
            ],
        ]
    ];

    //{"title": "Текст ссылки", "href": "Ссылка", "target": "таргет ссылки", "eval": "строка", "args": "json", "description": "описание ссылки, не обязательно"},
    return $responce;
}

function tr_doc_salesbook($_auid, $id, $year)
{
    $_row_data = PDO_row("SELECT 
                            a.id, 
                            a.nakl_id AS owner, 
                            b.typ_oper, 
                            date_format(facturadat,'%Y-%m-%d') AS deal_dat, 
                            a.typ_doc
                        FROM pu{$year}.tr_doc_salesbook a
                        INNER JOIN pu{$year}.tr_salesbook b ON a.nakl_id=b.id
                        WHERE a.userid=:userid AND a.id=:id",
        [$_auid, ['id', $id]]);

    $responce['success'] = true;
    $responce['card'] = "<table><tr>
                        <td><span class='strong'>Документ</span></td>
                        <td class='img'></td></tr></table>";

    $_args = [
        'source' => 1,
        'source_id' => $id,
        'owner' => $_row_data['owner'],
        'typ_oper' => $_row_data['typ_oper'],
        'deal_dat' => $_row_data['deal_dat'],
        'typ_doc' => $_row_data['typ_doc']
    ];

    $responce['interactive'] = [
        'buttons' => [
            [
                "title" => "Перейти к документу",
                'eval' => "buhManager.openDocInDeal(args)",
                'args' => $_args
            ],
        ],
        'links' => [
            [
                'title' => 'Распечатать',
                'eval' => "buhManager.printDoc(args, true)",
                'args' => $_args
            ],
            [
                'title' => 'Скачать документ (XLS)',
                'eval' => "buhManager.printDoc(args, false)",
                'args' => $_args
            ]
        ]
    ];

    return $responce;
}

function tr_doc_upd($_auid, $id, $year)
{
    PDO_utf8();

    $_row_data = PDO_row("SELECT 
                            a.id, 
                            a.owner_id AS owner, 
                            a.number,
                            a.date,
                            pu2014.get_z_analit_t(a.userid, 6, a.seller) AS seller_name,
                            pu2014.get_z_analit_t(a.userid, 6, a.buyer) AS buyer_name,                            
                            b.typ_oper, 
                            date_format(facturadat,'%Y-%m-%d') AS deal_dat                    
                        FROM pu{$year}.tr_doc_upd a
                        INNER JOIN pu{$year}.tr_salesbook b ON a.owner_id=b.id
                        WHERE a.userid=:userid AND a.id=:id",
        [$_auid, ['id', $id]]);

    $responce['success'] = true;

    $responce['card'] = "<table><tr>";

    $_month = mapMonthAbbr(ltrim(strftime('%m', strtotime($_row_data['date'])), '0') * 1);
    $_date = strftime('%e', strtotime($_row_data['date'])) . " " .
        $_month .  " " .
        strftime('%Y', strtotime($_row_data['date']));

    $responce['card'] .= "<td><span class='strong'>УПД №" . ($_row_data['number']) . " от " . $_date . "</span>";
    $responce['card'] .= "<span>" . ($_row_data['typ_oper'] == 1 ? $_row_data['seller_name'] : $_row_data['buyer_name']) . "</span>";
    $responce['card'] .= "<span>" . ($_row_data['typ_oper'] == 1 ? "Покупка" : "Продажа") . "</span>";
    $responce['card'] .= "</td><td class='img'></td></tr></table>";

    $_args = [
        'source' => 2,
        'source_id' => $id,
        'owner' => $_row_data['owner'],
        'typ_oper' => $_row_data['typ_oper'],
        'deal_dat' => $_row_data['deal_dat'],
        'typ_doc' => '18'
    ];

    $responce['interactive'] = [
        'buttons' => [
            [
                "title" => "Перейти к документу",
                'eval' => "buhManager.openDocInDeal(args)",
                'args' => $_args,
            ]
        ],
        'links' => [
            [
                'title' => 'Распечатать',
                'eval' => "buhManager.printDoc(args, true)",
                'args' => $_args
            ],
            [
                'title' => 'Скачать документ (XLS)',
                'eval' => "buhManager.printDoc(args, false)",
                'args' => $_args
            ]
        ],
    ];

    return $responce;
}

function tr_doc_ttn($_auid, $id, $year)
{
    PDO_utf8();

    $_row_data = PDO_row("SELECT 
                            a.id, 
                            a.owner_id AS owner, 
                            a.number,
                            a.dat,
                            go_name,
                            gp_name,                            
                            b.typ_oper, 
                            date_format(facturadat,'%Y-%m-%d') AS deal_dat                            
                        FROM pu{$year}.tr_doc_ttn a
                        INNER JOIN pu{$year}.tr_salesbook b ON a.owner_id=b.id
                        WHERE a.userid=:userid AND a.id=:id",
        [$_auid, ['id', $id]]);

    $responce['success'] = true;

    $_month = mapMonthAbbr(ltrim(strftime('%m', strtotime($_row_data['dat'])), '0') * 1);
    $_date = strftime('%e', strtotime($_row_data['dat'])) . " " .
        $_month .  " " .
        strftime('%Y', strtotime($_row_data['dat']));

    $responce['card'] = "<table><tr>";
    $responce['card'] .= "<td><span class='strong'>ТТН №" . ($_row_data['number']) . " от " . $_date . "</span>";
    $responce['card'] .= "<span>" . ($_row_data['typ_oper'] == 1 ? $_row_data['go_name'] : $_row_data['gp_name']) . "</span>";
    $responce['card'] .= "<span>" . ($_row_data['typ_oper'] == 1 ? "Покупка" : "Продажа") . "</span>";
    $responce['card'] .= "</td><td class='img'></td></tr></table>";

    $_args = [
        'source' => 3,
        'source_id' => $id,
        'owner' => $_row_data['owner'],
        'typ_oper' => $_row_data['typ_oper'],
        'deal_dat' => $_row_data['deal_dat'],
        'typ_doc' => '15'
    ];

    $responce['interactive'] = [
        'buttons' => [
            [
                "title" => "Перейти к документу",
                'eval' => "buhManager.openDocInDeal(args)",
                'args' => $_args,
            ]
        ],
        'links' => [
            [
                'title' => 'Распечатать',
                'eval' => "buhManager.printDoc(args, true)",
                'args' => $_args
            ],
            [
                'title' => 'Скачать документ (XLS)',
                'eval' => "buhManager.printDoc(args, false)",
                'args' => $_args
            ]
        ],
    ];

    return $responce;
}

function tr_doc_dogovor($_auid, $id, $year)
{
    PDO_utf8();

    $_row_data = PDO_row("SELECT 
                            a.id, 
                            a.id_oper AS owner, 
                            a.dog_number,
                            a.dog_date,
                            a.isp,
                            a.zak,                            
                            b.typ_oper, 
                            date_format(facturadat,'%Y-%m-%d') AS deal_dat                            
                        FROM pu{$year}.tr_doc_dogovor a
                        INNER JOIN pu{$year}.tr_salesbook b ON a.id_oper=b.id
                        WHERE a.userid=:userid AND a.id=:id",
        [$_auid, ['id', $id]]);

    $responce['success'] = true;

    $_month = mapMonthAbbr(ltrim(strftime('%m', strtotime($_row_data['dog_date'])), '0') * 1);
    $_date = strftime('%e', strtotime($_row_data['dog_date'])) . " " .
        $_month .  " " .
        strftime('%Y', strtotime($_row_data['dog_date']));

    $responce['card'] = "<table><tr>";
    $responce['card'] .= "<td><span class='strong'>Договор №" . ($_row_data['dog_number']) . " от " . $_date . "</span>";
    $responce['card'] .= "<span>" . ($_row_data['typ_oper'] == 1 ? $_row_data['isp'] : $_row_data['zak']) . "</span>";
    $responce['card'] .= "<span>" . ($_row_data['typ_oper'] == 1 ? "Покупка" : "Продажа") . "</span>";
    $responce['card'] .= "</td><td class='img'></td></tr></table>";

    $_args = [
        'source' => 4,
        'source_id' => $id,
        'owner' => $_row_data['owner'],
        'typ_oper' => $_row_data['typ_oper'],
        'deal_dat' => $_row_data['deal_dat'],
        'typ_doc' => '22'
    ];

    $responce['interactive'] = [
        'buttons' => [
            [
                "title" => "Перейти к документу",
                'eval' => "buhManager.openDocInDeal(args)",
                'args' => $_args,
            ]
        ],
        'links' => [
            [
                'title' => 'Распечатать',
                'eval' => "buhManager.printDoc(args, true)",
                'args' => $_args
            ],
            [
                'title' => 'Скачать документ (DOC)',
                'eval' => "buhManager.printDoc(args, false)",
                'args' => $_args
            ]
        ],
    ];

    return $responce;
}

function tr_acts($_auid, $id, $year)
{
    PDO_utf8();

    $_row_data = PDO_row("SELECT 
                            a.id, 
                            a.owner_id AS owner, 
                            a.number,
                            a.dat,
                            a.zak_name,
                            a.pod_name,                            
                            b.typ_oper, 
                            date_format(facturadat,'%Y-%m-%d') AS deal_dat                    
                        FROM pu{$year}.tr_doc_ks a
                        INNER JOIN pu{$year}.tr_salesbook b ON a.owner_id=b.id
                        WHERE a.userid=:userid AND a.id=:id",
        [$_auid, ['id', $id]]);

    $responce['success'] = true;

    $responce['card'] = "<table><tr>";

    $_month = mapMonthAbbr(ltrim(strftime('%m', strtotime($_row_data['dat'])), '0') * 1);
    $_date = strftime('%e', strtotime($_row_data['dat'])) . " " .
        $_month .  " " .
        strftime('%Y', strtotime($_row_data['dat']));

    $responce['card'] .= "<td><span class='strong'>Акт КС-2 и КС-3 №" . ($_row_data['number']) . " от " . $_date . "</span>";
//    $responce['card'] .= "<span>" . ($_row_data['typ_oper'] == 1 ? $_row_data['pod_name'] : $_row_data['zak_name']) . "</span>";
//    $responce['card'] .= "<span>" . ($_row_data['typ_oper'] == 1 ? "Покупка" : "Продажа") . "</span>";
    $responce['card'] .= "</td><td class='img'></td></tr></table>";

    $_args = [
        'source' => $_row_data['typ_oper'],
        'source_id' => $id,
        'owner' => $_row_data['owner'],
        'typ_oper' => $_row_data['typ_oper'],
        'deal_dat' => $_row_data['deal_dat'],
        'typ_doc' => '16'
    ];

    $responce['interactive'] = [
        'buttons' => [
            [
                "title" => "Перейти к документу",
                'eval' => "buhManager.openDocInDeal(args)",
                'args' => $_args,
            ]
        ],
        'links' => [
            [
                'title' => 'Распечатать',
                'eval' => "buhManager.printDoc(args, true)",
                'args' => $_args
            ],
            [
                'title' => 'Скачать документ (XLS)',
                'eval' => "buhManager.printDoc(args, false)",
                'args' => $_args
            ]
        ],
    ];

    return $responce;
}

function tr_bank_pay($_auid, $id, $year)
{
    PDO_utf8();

    $_row_data = PDO_row("SELECT 
                            id, 
                            id_oper, 
                            n_doc,
                            dat,                            
                            pu2014.get_z_analit_t(UserId, 6, org_id) AS org_name
                        FROM pu{$year}.tr_bank_pay
                        WHERE UserId=:userid AND id=:id",
        [$_auid, ['id', $id]]);

    $responce['success'] = true;

    $responce['card'] = "<table><tr>";

    $_month = mapMonthAbbr(ltrim(strftime('%m', strtotime($_row_data['dat'])), '0') * 1);
    $_date = strftime('%e', strtotime($_row_data['dat'])) . " " .
        $_month . " " .
        strftime('%Y', strtotime($_row_data['dat']));

    $responce['card'] .= "<td><span class='strong'>ПП №" . $_row_data['n_doc'] . " от " . $_date . "</span>";
    $responce['card'] .= "<span>" . $_row_data['org_name'] . "</span>";
    $responce['card'] .= "</td><td class='img'></td></tr></table>";

    $responce['interactive'] = [
        'buttons' => [
            [
                "title" => "Перейти к документу",
                "eval" => "buhManager.openTab(args)",
                "args" => [
                    "source" => 3,
                    "source_id" => $id,
                    "task" => "edit"
                ]
            ]
        ],
        'links' => [
            [
                'title' => 'Распечатать',
                'eval' => "buhManager.printBankOrder(args, true)",
                "args" => [
                    "source_id" => $id,
                ]
            ],
            [
                'title' => 'Скачать документ (XLS)',
                'eval' => "buhManager.printBankOrder(args, false)",
                "args" => [
                    "source_id" => $id
                ]
            ]
        ]
    ];

    return $responce;
}

function tr_kassa_pay($_auid, $id, $year)
{
    PDO_utf8();

    $_row_data = PDO_row("SELECT 
                            id, 
                            id_oper, 
                            n_doc,
                            dat,                            
                            pu2014.get_z_analit_t(UserId, 6, orgmy_id) AS payer,
                            pu2014.get_z_analit_t(UserId, 6, org_id) AS payee
                        FROM pu{$year}.tr_kassa_pay
                        WHERE UserId=:userid AND id=:id",
        [$_auid, ['id', $id]]);

    $responce['success'] = true;

    $responce['card'] = "<table><tr>";

    $_month = mapMonthAbbr(ltrim(strftime('%m', strtotime($_row_data['dat'])), '0') * 1);
    $_date = strftime('%e', strtotime($_row_data['dat'])) . " " .
        $_month . " " .
        strftime('%Y', strtotime($_row_data['dat']));

    $responce['card'] .= "<td><span class='strong'>" . ($_row_data['id_oper'] == 5 ? "ПКО " : "РКО ") . "№" . $_row_data['n_doc'] . " от " . $_date . "</span>";
    $responce['card'] .= "<span>" . ($_row_data['id_oper'] == 5 ? $_row_data['payee'] : $_row_data['payer']) . "</span>";
    $responce['card'] .= "</td><td class='img'></td></tr></table>";

    $responce['interactive'] = [
        'buttons' => [
            [
                "title" => "Перейти к документу",
                "eval" => "buhManager.openTab(args)",
                "args" => [
                    "source" => 4,
                    "source_id" => $id,
                    "task" => "edit"
                ]
            ]
        ],
        'links' => [
            [
                'title' => 'Скачать документ (XLS)',
                'eval' => "buhManager.printCashOrder(args, false)",
                "args" => [
                    "source_id" => $id,
                    "id_oper" => $_row_data['id_oper']
                ]
            ]
        ]
    ];

    return $responce;
}

function tr_ao($_auid, $id, $year)
{
    PDO_utf8();

    $_row_data = PDO_row("SELECT 
                            a.id, 
                            date_format(dat,'%Y-%m-%d') AS dat
                        FROM pu{$year}.tr_ao a
                        WHERE a.userid=:userid AND a.id=:id",
        [$_auid, ['id', $id]]);

    $responce['success'] = true;
    $responce['card'] = "<table><tr>
                        <td><span class='strong'>Авансовый отчет</span></td>
                        <td class='img'></td></tr></table>";

    $_args = [
        'source' => 5,
        'source_id' => $id,
        'dat' => $_row_data['dat']
    ];

    $responce['interactive'] = [
        'buttons' => [
            ['title' => 'Открыть',
                'eval' => "buhManager.printDoc(args)",
                'args' => $_args,
            ]
        ]
    ];

    return $responce;
}

function actions($id, $year)
{
    $responce['success'] = false;

    PDO_utf8();

    $data = PDO_row("SELECT 
                        t1.id, 
                        t1.id_folder, 
                        t1.action, 
                        t1.href,
                        t2.folder,                         
                        t2.group,                         
                        t2.name                         
                    FROM subdata.actions t1
                    LEFT JOIN subdata.folders t2 ON t1.id_folder=t2.id                      
                    WHERE t1.id=:id",
        [['id', $id]]);

    $responce['success'] = true;

    $auxData = json_decode($data['href']);

    $responce['card'] = "<table><tr><td><span class='strong'>";

    if (isset($auxData->path)) {
        if (!empty($auxData->path->folder)) {
            $responce['card'] .= $auxData->path->folder . " " . SEARCH_SEPARATOR . " ";
        }

        if (!empty($auxData->path->group)) {
            $responce['card'] .= $auxData->path->group;
        }

        if (!empty($auxData->path->name)) {
            $responce['card'] .= " " . SEARCH_SEPARATOR . " " . $auxData->path->name;
        }
    } else {
        if ($data['folder']) {
            $responce['card'] .= $data['folder'] . " " . SEARCH_SEPARATOR . " ";
        }

        if ($data['group']) {
            $responce['card'] .= $data['group'];
        }

        if ($data['name']) {
            $responce['card'] .= " " . SEARCH_SEPARATOR . " " . $data['name'];
        }
    }

    $responce['card'] .= "</span></td><td class='img'></td></table>";

    $responce['interactive']['links'] = [];

    if ($auxData->links) {
        foreach ($auxData->links as $link) {
            $responce['interactive']['links'][] = [
                'title' => $link->title ? $link->title : $data['action'],
                'eval' => $link->eval,
                'args' => $link->args
            ];
        }
    }

    return $responce;
}

function folders($id, $year, $taxMode)
{

    $responce['success'] = false;

    $data = PDO_row("SELECT *                         
                    FROM subdata.folders                      
                    WHERE id=:id",
        [['id', $id]]);

    if ($data) {
        $responce['success'] = true;

        $responce['card'] = "<table><tr><td><span class='strong'>";
        $responce['card'] .= to_utf($data['folder'] . " " . SEARCH_SEPARATOR . " " .
            $data['group'] . " " . SEARCH_SEPARATOR . " " . $data['name']);
        $responce['card'] .= "</span></td><td class='img'></td></tr></table>";

        $auxData = to_utf($data['href']);
        $auxData = json_decode($auxData);

        $responce['interactive']['buttons'] = [];
        if ($auxData->buttons) {
            foreach ($auxData->buttons as $button) {
                $responce['interactive']['buttons'][] = [
                    'title' => $button->title,
                    'eval' => $button->eval,
                    'args' => [
                        'source' => $button->args->source,
                        'source_id' => $button->args->source_id,
                        'subTab' => !empty($button->args->subTab) ? $button->args->subTab : null,
                        'task' => $button->args->task,
                        'period' => $button->args->period,
                        'periodVal' => $button->args->periodVal,
                        'callback' => $button->args->callback,
                        'taskAction' => $button->args->taskAction
                    ]
                ];
            }
        }

        $responce['interactive']['links'] = [];
        if ($auxData->links) {
            foreach ($auxData->links as $link) {
                if (eval($link->hidden) == false) {
                    $responce['interactive']['links'][] = [
                        'title' => $link->title,
                        'eval' => $link->eval,
                        'hidden' => eval($link->hidden),
                        'args' => [
                            'source' => $link->args->source,
                            'source_id' => $link->args->source_id,
                            'task' => $link->args->task,
                            'period' => $link->args->period,
                            'periodVal' => $link->args->periodVal,
                            'callback' => $link->args->callback,
                            'taskAction' => $link->args->taskAction
                        ]
                    ];
                }
            }
        }
    }

    return $responce;
}

function rbp ($_auid, $id)
{
    global $maindbname;

    PDO_utf8();

    $_row_data = PDO_row("SELECT id, name, vid, rbp_nachmes, rbp_nachgod, rbp_srok 
                        FROM pu2014.tr_mat 
                        WHERE userid=:userid AND id=:id AND vid=2",
        [$_auid, ['id', $id]]);

    $nm = $_row_data['name'];
    $startDate = mapMonthFull($_row_data['rbp_nachmes']) . ' ' . ($_row_data['rbp_nachgod'] + 2019);
    $monthQty = $_row_data['rbp_srok'] > 0 ? $_row_data['rbp_srok'] : null;

    $_buyDeals = PDO_row("SELECT COUNT(t1.ID) AS qty 
                                FROM {$maindbname}.tr_salesbook t1
                                JOIN {$maindbname}.tr_salesitem t2 ON t1.ID=t2.id_oper
                                WHERE t1.UserId=:userid AND t1.TYP_OPER=1 AND t2.ITEMS_ID=:id",
        [$_auid, ['id', $id]]);

    $responce['success'] = true;

    $responce['card'] = "<table><tr>
                        <td><span class='strong'>{$nm}</span><br>
                        <span><strong>РБП</strong>&nbsp;&middot;&nbsp;";
    $responce['card'] .= $startDate ? "Начало списания: " . $startDate . "&nbsp;&nbsp;" : "";
    $responce['card'] .= $monthQty ? "Срок списания: " . $monthQty : "";
    $responce['card'] .= "</span></td></td><td class='img'></td></tr></table>";

    $responce['interactive'] = [
        'buttons' => [
            ['title' => 'Открыть в справочнике',
                'eval' => "buhManager.openSprav(args)",
                'args' => [
                    'source' => 3,
                    'source_id' => $id,
                    'vid' => $_row_data['vid'],
                    'searchName' => $nm
                ],
            ]
        ],
        'links' => [
            [
                'title' => "Покупки",
                'eval' => ($_buyDeals['qty'] == 0 ? null : "buhManager.openTab(args)"),
                'args' => [
                    'source' => 1,
                    'source_id' => null,
                    'task' => 'filter',
                    'taskAction' => [
                        [
                            'name' => 'cbIdAnalit',
                            'value' => '3',
                            'init' => '0',
                            'id' => '',
                            'xtraParam' => 'id_sprav'
                        ],
                        [
                            'name' => 'items_id',
                            'value' => $id,
                            'init' => $id,
                            'id' => '',
                            'xtraParam' => 'id_analit'
                        ]
                    ]
                ]
            ],
            [
                'title' => "Списание",
                'eval' => "buhManager.openTab(args)",
                'args' => [
                    'source' => 71,
                    'source_id' => null,
                    'task' => 'filter',
                    'taskData' => [
                        'month' => date('n'),
                        'an_d1' => $id
                    ]
                ]
            ],
            [
                'title' => "Обороты",
                'eval' => "buhManager.openTab(args)",
                'args' => [
                    'source' => 9,
                    'source_id' => $id,
                    'task' => 'filter',
                    'taskAction' => 20,
                    'taskData' => [
                        'sc' => '97 Расходы будущих периодов',
                        'sc_ssc' => 97
                    ]
                ]
            ],
            [
                'title' => "Карточка номенклатуры",
                'eval' => "buhManager.openTab(args)",
                'args' => [
                    'source' => 9,
                    'source_id' => $id,
                    'task' => 'edit',
                    'taskAction' => 30,
                    'taskData' => [
                        'sc' => '97 Расходы будущих периодов',
                        'sc_ssc' => 97
                    ]
                ]
            ]
        ]
    ];

    return $responce;
}

function mapMonthFull($num)
{
    $_ = [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь'
    ];

    return $_[$num - 1];
}

function mapMonthAbbr($num)
{
    $_ = [
        'янв',
        'фев',
        'мар',
        'апр',
        'мая',
        'июн',
        'июл',
        'авг',
        'сен',
        'окт',
        'ноя',
        'дек'
    ];

    return $_[$num - 1];
}