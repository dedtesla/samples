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
				html: 'Прослеживаемый товар'
			},{
				xtype: 'tbfill'
			},{
				xtype: 'button',
				action: 'remove',
				hidden: true,
				textAlign: 'right',
				cls: 'btn-sel-blue color-grey',
				text: 'Удалить'
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-rnpt',
			title: 'ТД / РНПТ',
			itm: [{
				xtype: 'buttonask',
				text: 'По отслеживаемым импортным товарам укажите РНПТ. Он состоит из 4 блоков цифр, разделенных знаком "/".<br/>' +
					'Структура номера такая:<br/>' +
					'Код таможни/Дата ТД в формате ддммгггг/номер ТД/номер товарной позиции в ТД<br/>' +
					'По неотслеживаемым импортным товарам укажите номер Декларации на товары.<br/>' +
					'Он состоит из 3-4 блоков цифр, разделенных знаком "/".<br/>' +
					'Структура номера такая:<br/>' +
					'Код таможни/Дата ТД в формате ддммгг/номер ТД/номер товарной позиции в ТД<br/>' +
					'Если в гр.11 счета-фактуры данных нет, графу не заполняйте'
			},{
				xtype: 'textfield',
				name: `Explain[${this.index}][rnpt]`,
				selectOnFocus : true,
				emptyText: 'Введите значение',
				width: 520,
				maxLength: 29,
				enforceMaxLength: true
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-okei',
			title: 'ОКЕИ',
			itm: [{
				xtype: 'buttonask',
				text: 'Заполните только по прослеживаемым товарам. Значение соответствует гр.12 счета-фактуры.<br/>' +
					'Выберите единицу измерения из справочника, ее ОКЕИ подставится автоматически'
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
				emptyText: 'Выберите значение из справочника'
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-count',
			title: 'Количество',
			itm: [{
				xtype: 'buttonask',
				text: 'Заполните только по прослеживаемым товарам.<br/>' +
					'Значение соответствует гр.13 счета-фактуры.<br/>' +
					'Укажите количество прослеживаемого товара в его единице измерения'
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
			title: 'Стоимость без НДС',
			itm: [{
				xtype: 'buttonask',
				text: 'Заполните только по прослеживаемым товарам.<br/>' +
					'Укажите стоимость прослеживаемого товара без НДС и в рублях'
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
