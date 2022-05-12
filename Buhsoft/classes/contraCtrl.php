<?php

namespace controller;

class contraCtrl extends \controller\baseUseridController implements \controller\taskTemplate
{
    public $userid = 0;

    private $_limit = 5;
    private $_groupRepo;
    private $_rReportModel;

    public function execute($order, $recordData)
    {
        $task = $this->getTask($order);

/*        $this->dbEntity = new \repo\contra($this->dbOper);
        $this->dbEntity->userid = $recordData->userid;*/

        $this->dbEntity = new \repo\contrahistory($this->dbOper, $recordData->userid);

        $this->_rReportModel = new \repo\reconciliationreport($this->dbOper);
        $this->_rReportModel->userid = $recordData->userid;
        $this->_rReportModel->yearDatabase = $recordData->yearDatabase;
        $this->_rReportModel->schema = 'pu' . $recordData->yearDatabase;

        $this->$task($order->stream, $recordData);
    }

    public function readContragent($stream, $params)
    {
        if (empty($params->id)) {
            if (isset($params->echo) && $params->echo == true) {
                echo json_encode([
                    'success' => false,
                    'data' => false
                ]);
            } else {
                return null;
            }
        } else {
            if (isset($params->echo) && $params->echo == true) {
                echo json_encode([
                    'success' => true,
                    'data' => $this->dbEntity->readById([
                        'id' => $params->id
                    ])
                ]);
            } else {
                return $this->dbEntity->readById([
                    'id' => $params->id
                ]);
            }
        }
    }

    public function readContragentsByGroup($stream, $params)
    {
        if (empty($params->grp)) {
            echo json_encode([
                'success' => false,
                'data' => false
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'data' => $this->dbEntity->listByGroup([
                    'grp' => $params->grp,
                    'idOnly' => $params->idOnly,
                    'yearDatabase' => strftime('%Y', strtotime($params->date))
                ])
            ]);
        }
    }

    /**
     * ����� readListForComboMixed
     * ������ � ���������� ����� "���������� ��� ������ ������������" ���� ������
     * � �������������.
     * �������� �������:
     * 1. ����� � {�������_����_������}.tr_states �� ����� 'rrLastContragents'.
     *    ����������� ����� ������ \controller\yearly\statesCtrl->read.
     * 1.1. ������ ������� (json-������ c ������ {id, grp} - id �����������/������ � �������, �������� ��
     *      �� ������� [0 - ���, 1 - ��]).
     * 1.1.1. ����� ������������/����� ����� 5. ����������� ����� ������ ������ \repo\contra->listForComboMixed.
     *        � ���������� ���������� ��������� ���� 1.1. ���������� ����� ������ ������������ � ���������� ������.
     * 1.1.2. ����� ������������/����� ����� 5. ����������� ����� ������ ������ \repo\contra->listForComboMixed.
     *        � ���������� ���������� ��������� ���� 1.1. � ������ ������ ����������� �� 5 �� ���� �������
     *        ��������� ����������� � ���� ������������. ���������� ����� ������ ������������ � ���������� ������.
     * 2.1. ������ �����������. ����������� ����� ������ ������ \repo\contra->listForComboMixed.
     *      ����������� ������� ��������� ����������� � ���� ������������ (�� ����� 5).
     *      ���������� ����� ������ ������������ � ���������� ������.
     *
     * @param $stream
     * @param $params
     */
    public function readListForComboMixed($stream, $params)
    {
        echo json_encode([
            'success' => true,
            'data' => $this->dbEntity->listForComboMixed([
                'limit' => isset($params->limit) ? $params->limit : $this->_limit,
                'query' => isset($params->query) ? $params->query : '',
                'id' => isset($params->id) ? $params->id : null,
                'lastSaved' => isset($params->lastSaved) ? $params->lastSaved : null
            ])
        ]);
    }

    /**
     * ����� createRReport
     * ��������� ������������ ���� ������.
     *
     */
    public function createRReport($stream, $params)
    {
        if (empty($params->id)) return;

        $contragents = [];

        if (!empty($params->grp)) {
            $contragents = $this->readContragentsByGroup($stream, $params);
        } else {
            $contragents[] = $params->id;
        }

        $this->_rReportModel->processReport([
            'contragent' => $this->readContragent($stream, $params),
            'contragents' => $contragents,
            'agreements' => $params->agreements,
            'datebegin' => $params->datebegin,
            'dateend' => $params->dateend,
            'filetype' => $params->filetype
        ]);
    }

}
