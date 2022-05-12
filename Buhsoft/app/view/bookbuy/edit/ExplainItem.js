Ext.define('Buh.view.bookbuy.edit.ExplainItem', {
	extend: 'Ext.container.Container',
	cls: 'cnt-item',
	xtype: 'bookbuyexplainitem',
	index: 0,
	initComponent: function () {
		this.items = [{
			xtype: 'container',
			layout: 'hbox',
			items: [{
				xtype: 'box',
				cls: 'sub-title-doc',
				width : 450,
				html: '�������������� �����'
			},{
				xtype: 'tbfill'
			},{
				xtype: 'button',
				action: 'remove',
				hidden: true,
				textAlign: 'right',
				cls: 'btn-sel-blue color-grey',
				text: '�������'
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-rnpt',
			title: '�� / ����',
			itm: [{
				xtype: 'buttonask',
				text: '�� ������������� ��������� ������� ������� ����. �� ������� �� 4 ������ ����, ����������� ������ "/".<br/>' +
					'��������� ������ �����:<br/>' +
					'��� �������/���� �� � ������� ��������/����� ��/����� �������� ������� � ��<br/>' +
					'�� ��������������� ��������� ������� ������� ����� ���������� �� ������.<br/>' +
					'�� ������� �� 3-4 ������ ����, ����������� ������ "/".<br/>' +
					'��������� ������ �����:<br/>' +
					'��� �������/���� �� � ������� ������/����� ��/����� �������� ������� � ��<br/>' +
					'���� � ��.11 �����-������� ������ ���, ����� �� ����������'
			},{
				xtype: 'textfield',
				name: `Explain[${this.index}][rnpt]`,
				selectOnFocus : true,
				emptyText: '������� ��������',
				width: 520,
				maxLength: 29,
				enforceMaxLength: true
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-okei',
			title: '����',
			itm: [{
				xtype: 'buttonask',
				text: '��������� ������ �� �������������� �������. �������� ������������� ��.12 �����-�������.<br/>' +
					'�������� ������� ��������� �� �����������, �� ���� ����������� �������������'
			},{
				xtype: 'combo',
				name: `Explain[${this.index}][okei]`,
				displayField: 'name',
				listConfig: {'minWidth': 460},
				valueField: 'kod',
				width: 520,
				store: 'storeOKEI',
				minChars: 0,
				queryMode: 'remote',
				typeAhead: true,
				cls: 'field-combo-button',
				defaultListConfig: {
					'cls': 'style2018'
				},
				labelSeparator: '',
				msgTarget: 'none',
				enableKeyEvents: true,
				editable: true,
				typeAheadDelay: 500,
				emptyText: '�������� �������� �� �����������'
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-count',
			title: '����������',
			itm: [{
				xtype: 'buttonask',
				text: '��������� ������ �� �������������� �������.<br/>' +
					'�������� ������������� ��.13 �����-�������.<br/>' +
					'������� ���������� ��������������� ������ � ��� ������� ���������'
			},{
				xtype: 'numberfield',
				name: `Explain[${this.index}][count]`,
				selectOnFocus : true,
				emptyText: '0,00000',
				width: 170
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-summa-explain',
			title: '��������� ��� ���',
			itm: [{
				xtype: 'buttonask',
				text: '��������� ������ �� �������������� �������.<br/>' +
					'������� ��������� ��������������� ������ ��� ��� � � ������'
			},{
				xtype: 'container',
				cls: 'input-summa',
				layout: 'hbox',
				items: [
					{
						xtype: 'numberfield',
						name: `Explain[${this.index}][summa_explain]`,
						selectOnFocus : true,
						emptyText: '0,00',
						width: 170
					}
				]
			}]
		}];
		this.callParent(arguments);
	}
});
