Ext.define('Buh.view.bookbuy.edit.Form', {
	extend: 'Ext.form.FormPanel',
	xtype: 'bookbuyeditform',
	name: 'main_panel',
	bodyCls: 'panel-pad',
	layout: 'form',
	initComponent: function () {
		let me = this;
		me.items = me.items.filter((item) => (!item.for || item.for === me.type));
		this.callParent(arguments)
	},
	items: [
		{
			xtype: 'hidden',
			name: 'id',
			value: 0
		},
		{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			name: 'cnt-kod',
			title: '��� ��������',
			itm: {
				xtype: 'gbs_combo',
				editable: false,
				name: 'Item[kod]',
				errorText: '��� ��������',
				forceSelection: true,
				allowBlank: false,
				store: store_kvo,
				emptyText: '�������� ��� �� ������',
				width: 520
			}
		},{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			name: 'cnt-typ-doc',
			title: '��������',
			itm: [{
				xtype: 'buttonask',
				text: '�������� ��� ��������� �� ������'
			},{
				xtype: 'gbs_combo',
				editable: false,
                itemId: 'typ_doc',
				name: 'Item[typ_doc]',
				errorText: '��������',
				allowBlank: false,
				vtype: 'notempty',
				forceSelection: true,
				store: Ext.getStore('bookbuyDocTypesEdit'),
				displayField: 'name',
				valueField: 'id',
				value: '4',
				width: 520
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-n-doc',
			itm: {
				xtype: 'container',
				layout: 'hbox',
				items: [
					{
						xtype: 'textfield',
						cls: 'input-number',
						name: 'Item[number]',
						errorText: '����� ���������',
						allowBlank: false,
						vtype: 'notempty',
						preventMark: true,
						width: 170
					},
					{
						xtype: 'gbs_date',
						submitFormat: 'Y-m-d',
						errorText: '���� ���������',
						name: 'Item[dat_doc]',
						allowBlank: false,
						preventMark: true,
						width: 170
					}],
			}
		},{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			name: 'cnt-all-pay',
			title: '����� � ���� ������',
			rel: 'bookbuyallpayitem',
			itm: [{
				xtype: 'buttonask',
				text: '������� ����� � ���� ���������.'
			},{
				xtype: 'container',
				itemId: 'cnt-inner',
				layout: {
					type: 'vbox',
					defaultMargins: {
						bottom: 4
					}
				},
				items: {
					xtype: 'bookbuyallpayitem'
				}
			},{
				xtype: 'button',
				action: 'add',
				cls: 'btn-sel-blue',
				textAlign: 'left',
				text: '�������� ��� ��������',
				width: 160
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			name: 'cnt-dates-accounting',
			for: 'buy',
			title: '���� �������� �� ����',
			rel: 'bookbuydateaccitem',
			itm: [{
				xtype: 'buttonask',
				text: '������� ���� ������������� ��������� ��� �������� ���� ������, ���� ������������� �� ����'
			},{
				xtype: 'container',
				itemId: 'cnt-inner',
				layout: {
					type: 'vbox',
					defaultMargins: {
						bottom: 4
					}
				},
				items: {
					xtype: 'bookbuydateaccitem'
				}
			},{
				xtype: 'button',
				action: 'add',
				cls: 'btn-sel-blue',
				textAlign: 'left',
				text: '�������� ��� ����',
				width: 170
			}]
		}, {
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-tnved',
			for: 'sale',
			title: '��� �����',
			itm: [{
				xtype: 'buttonask',
				text: '���������� ������ �� �������, ���������� �� �� � ����. ������� ��� ������ � ������������ � ����� ����'
			},{
				xtype: 'textfield',
				name: 'Item[tnved]',
				selectOnFocus : true,
				emptyText: '������� ���',
				width: 170
			}]
		}, {
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-nm-p',
			for: 'sale',
			title: '����������',
			itm: {
				xtype: 'bookbuyeditcontra',
				name: 'org_id',
				emptyText: '������� �������� ��� ������',
				id_sprav: 6,
				fid: 'Item[org_id]',
				fnm: 'Item[org_name]',
				innFieldName: 'Item[inn_p]',
				kppFieldName: 'Item[kpp_p]',
				width: 520,
				listWidth: 460
			}
		}, {
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-nm-p',
			for: 'buy',
			title: '��������',
			itm: {
				xtype: 'bookbuyeditcontra',
				name: 'org_id',
				emptyText: '������� �������� ��� ������',
				id_sprav: 6,
				fid: 'Item[org_id]',
				fnm: 'Item[org_name]',
				innFieldName: 'Item[inn_p]',
				kppFieldName: 'Item[kpp_p]',
				width: 520,
				listWidth: 460
			}
		}, {
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-mediator',
			title: '���������',
			itm: {
				xtype: 'bookbuyeditcontra',
				name: 'mediator_id',
				emptyText: '������� �������� ��� ������',
				id_sprav: 6,
				fid: 'Item[mediator_id]',
				fnm: 'Item[mediator_name]',
				innFieldName: 'Item[mediator_inn]',
				kppFieldName: 'Item[mediator_kpp]',
				width: 520,
				listWidth: 460
			}
		},{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			name: 'cnt-curr-id',
			title: '��� ������',
			itm: [{
				xtype: 'buttonask',
				text: '��������� ������ ���� ����������� ������ (������, ������) � ����������� ������.<br/>' +
					  '������� ����������� ��� ������ �� ���.'
			},{
				xtype: 'textfield',
				name: 'Item[curr_id]',
				emptyText: 'XXX',
				width: 70
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			name: 'cnt-summav',
			for: 'sale',
			title: '��������� ������� ��� � ������',
			itm: [{
				xtype: 'buttonask',
				text: '��������� ������ � ������ ���������� (������) � ����������� ������.<br/>' +
					'������� ��������� � ��� � ������ ������� (������)'
			},{
				xtype: 'container',
				cls: 'input-summa',
				layout: 'hbox',
				items: [
					{
						xtype: 'numberfield',
						name: 'Item[summav]',
						emptyText: '0,00',
						width: 170
					}
				]
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			name: 'cnt-summa',
			for: 'buy',
			title: '��������� ������� ���',
			itm: [{
				xtype: 'buttonask',
				text: '������� ��������� � ��� � ������ ������� (������)'
			},{
				xtype: 'container',
				cls: 'input-summa',
				layout: 'hbox',
				items: [
					{
						xtype: 'numberfield',
						name: 'Item[summa]',
						itemId: 'summa',
						emptyText: '0,00',
						width: 170
					}
				]
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			name: 'cnt-summa',
			for: 'sale',
			title: '��������� ������� ��� � ���. ���.',
			itm: [{
				xtype: 'buttonask',
				text: '���������� � ������ ���������� (������) ��� � ����������� ������, ��� � � ������.<br/>'+
					  '������� ��������� ������� (������) � ��� � ������'
			},{
				xtype: 'container',
				cls: 'input-summa',
				layout: 'hbox',
				items: [
					{
						xtype: 'numberfield',
						name: 'Item[summa]',
						itemId: 'summa',
						emptyText: '0,00',
						width: 170
					}
				]
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			name: 'cnt-nds',
			layout: 'hbox',
			for: 'sale',
			items: [{
				xtype: 'cont_vert',
				name: 'cnt-summa',
				title: '��������� 20, ��� ���',
				itm: [{
					xtype: 'buttonask',
					text: '������� ��������� ������ (��������� ����) ��� ���, ������� ���������� �� ������ 20 %'
				},{
					xtype: 'container',
					cls: 'input-summa',
					layout: 'hbox',
					items: [
						{
							xtype: 'numberfield',
							name: 'Item[sum20]',
							itemId: 'sum',
							emptyText: '0,00',
							nds: 20,
							rel: 'Item[sumnds20]',
							width: 170
						}
					]
				}]
			},{
				xtype: 'tbspacer',
				width: 10
			},{
				xtype: 'cont_vert',
				name: 'cnt-summa',
				title: '��� 20',
				itm: [{
					xtype: 'container',
					cls: 'input-summa',
					layout: 'hbox',
					items: [
						{
							xtype: 'numberfield',
							name: 'Item[sumnds20]',
							itemId: 'sumnds',
							emptyText: '0,00',
							width: 170
						}
					]
				}]
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			name: 'cnt-nds',
			layout: 'hbox',
			for: 'sale',
			items: [{
				xtype: 'cont_vert',
				title: '��������� 18, ��� ���',
				itm: [{
					xtype: 'buttonask',
					text: '������� ��������� ������ (��������� ����) ��� ���, ������� ���������� �� ������ 18 %'
				},{
					xtype: 'container',
					cls: 'input-summa',
					layout: 'hbox',
					items: [
						{
							xtype: 'numberfield',
							name: 'Item[sum18]',
							itemId: 'sum',
							nds: 18,
							rel: 'Item[sumnds18]',
							emptyText: '0,00',
							width: 170
						}
					]
				}]
			},{
				xtype: 'tbspacer',
				width: 10
			},{
				xtype: 'cont_vert',
				name: 'cnt-summa',
				title: '��� 18',
				itm: [{
					xtype: 'container',
					cls: 'input-summa',
					layout: 'hbox',
					items: [
						{
							xtype: 'numberfield',
							name: 'Item[sumnds18]',
							itemId: 'sumnds',
							emptyText: '0,00',
							width: 170
						}
					]
				}]
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			name: 'cnt-nds',
			layout: 'hbox',
			for: 'sale',
			items: [{
				xtype: 'cont_vert',
				title: '��������� 10, ��� ���',
				itm: [{
					xtype: 'buttonask',
					text: '������� ��������� ������ (��������� ����) ��� ���, ������� ���������� �� ������ 10 %'
				},{
					xtype: 'container',
					cls: 'input-summa',
					layout: 'hbox',
					items: [
						{
							xtype: 'numberfield',
							name: 'Item[sum10]',
							itemId: 'sum',
							nds: 10,
							rel: 'Item[sumnds10]',
							emptyText: '0,00',
							width: 170
						}
					]
				}]
			},{
				xtype: 'tbspacer',
				width: 10
			},{
				xtype: 'cont_vert',
				title: '��� 10',
				itm: [{
					xtype: 'container',
					cls: 'input-summa',
					layout: 'hbox',
					items: [
						{
							xtype: 'numberfield',
							name: 'Item[sumnds10]',
							itemId: 'sumnds',
							emptyText: '0,00',
							width: 170
						}
					]
				}]
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			name: 'cnt-nds0',
			for: 'sale',
			title: '��������� 0, ��� ���',
			itm: [{
				xtype: 'buttonask',
				text: '������� ��������� ������ ��� ���, ������� ���������� �� ������ 0 %'
			},{
				xtype: 'container',
				cls: 'input-summa',
				layout: 'hbox',
				items: [
					{
						xtype: 'numberfield',
						name: 'Item[sum0]',
						itemId: 'sum0',
						emptyText: '0,00',
						width: 170
					}
				]
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-sumnds',
			title: '����� ���',
			for: 'buy',
			itm: [{
				xtype: 'buttonask',
				text: '������� ����� ��� � ������ �������'
			},{
				xtype: 'container',
				cls: 'input-summa',
				layout: 'hbox',
				items: [
					{
						xtype: 'numberfield',
						name: 'Item[sumnds]',
						itemId: 'sumnds',
						selectOnFocus : true,
						emptyText: '0,00',
						width: 170
					}
				]
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-sumb',
			for: 'sale',
			title: '��������� ������, ������������� �� ������',
			itm: [{
				xtype: 'buttonask',
				text: '������� ��������� ������, ������������� �� ������'
			},{
				xtype: 'container',
				cls: 'input-summa',
				layout: 'hbox',
				items: [
					{
						xtype: 'numberfield',
						name: 'Item[sumb]',
						selectOnFocus : true,
						emptyText: '0,00',
						width: 170
					}
				]
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			rel: 'bookbuyexplainitem',
			name: 'cnt-all-pay',
			itm: [{
				xtype: 'container',
				itemId: 'cnt-inner',
				layout: {
					type: 'vbox',
					defaultMargins: {
						bottom: 4
					}
				},
				items: {
					xtype: 'bookbuyexplainitem'
				}
			},{
				xtype: 'container',
				cls: 'hr-line'
			},{
				xtype: 'button',
				action: 'add',
				cls: 'btn-sel-blue',
				textAlign: 'left',
				text: '�������� ��� ���������',
				width: 180
			}]
		}
	]
});
