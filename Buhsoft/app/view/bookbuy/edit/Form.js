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
			title: 'Код операции',
			itm: {
				xtype: 'gbs_combo',
				editable: false,
				name: 'Item[kod]',
				errorText: 'Код операции',
				forceSelection: true,
				allowBlank: false,
				store: store_kvo,
				emptyText: 'Выберите код из списка',
				width: 520
			}
		},{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			name: 'cnt-typ-doc',
			title: 'Документ',
			itm: [{
				xtype: 'buttonask',
				text: 'Выберите тип документа из списка'
			},{
				xtype: 'gbs_combo',
				editable: false,
                itemId: 'typ_doc',
				name: 'Item[typ_doc]',
				errorText: 'Документ',
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
						errorText: 'Номер документа',
						allowBlank: false,
						vtype: 'notempty',
						preventMark: true,
						width: 170
					},
					{
						xtype: 'gbs_date',
						submitFormat: 'Y-m-d',
						errorText: 'Дата документа',
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
			title: 'Номер и дата оплаты',
			rel: 'bookbuyallpayitem',
			itm: [{
				xtype: 'buttonask',
				text: 'Укажите номер и дату документа.'
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
				text: 'Добавить еще документ',
				width: 160
			}]
		},{
			xtype: 'cont_vert',
			cls: 'container-align-middle',
			name: 'cnt-dates-accounting',
			for: 'buy',
			title: 'Дата принятия на учет',
			rel: 'bookbuydateaccitem',
			itm: [{
				xtype: 'buttonask',
				text: 'Укажите дату оприходования ценностей или оставьте поле пустым, если оприходования не было'
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
				text: 'Добавить еще дату',
				width: 170
			}]
		}, {
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-tnved',
			for: 'sale',
			title: 'Код ТНВЭД',
			itm: [{
				xtype: 'buttonask',
				text: 'Заполняйте только по товарам, вывезенным из РФ в ЕАЭС. Укажите код товара в соответствии с ТНВЭД ЕАЭС'
			},{
				xtype: 'textfield',
				name: 'Item[tnved]',
				selectOnFocus : true,
				emptyText: 'Введите код',
				width: 170
			}]
		}, {
			xtype: 'cont_vert',
			cls: 'container-align',
			name: 'cnt-nm-p',
			for: 'sale',
			title: 'Покупатель',
			itm: {
				xtype: 'bookbuyeditcontra',
				name: 'org_id',
				emptyText: 'Введите название для поиска',
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
			title: 'Продавец',
			itm: {
				xtype: 'bookbuyeditcontra',
				name: 'org_id',
				emptyText: 'Введите название для поиска',
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
			title: 'Посредник',
			itm: {
				xtype: 'bookbuyeditcontra',
				name: 'mediator_id',
				emptyText: 'Введите название для поиска',
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
			title: 'Код валюты',
			itm: [{
				xtype: 'buttonask',
				text: 'Заполните только если реализовали товары (работы, услуги) в иностранной валюте.<br/>' +
					  'Введите трехзначный код валюты из ОКВ.'
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
			title: 'Стоимость включая НДС в валюте',
			itm: [{
				xtype: 'buttonask',
				text: 'Заполните только в случае реализации (аванса) в иностранной валюте.<br/>' +
					'Укажите стоимость с НДС в валюте продажи (аванса)'
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
			title: 'Стоимость включая НДС',
			itm: [{
				xtype: 'buttonask',
				text: 'Укажите стоимость с НДС в валюте покупки (аванса)'
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
			title: 'Стоимость включая НДС в руб. коп.',
			itm: [{
				xtype: 'buttonask',
				text: 'Заполняйте в случае реализации (аванса) как в иностранной валюте, так и в рублях.<br/>'+
					  'Укажите стоимость продажи (аванса) с НДС в рублях'
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
				title: 'Стоимость 20, без НДС',
				itm: [{
					xtype: 'buttonask',
					text: 'Укажите стоимость продаж (налоговой базы) без НДС, которые облагаются по ставке 20 %'
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
				title: 'НДС 20',
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
				title: 'Стоимость 18, без НДС',
				itm: [{
					xtype: 'buttonask',
					text: 'Укажите стоимость продаж (налоговой базы) без НДС, которые облагаются по ставке 18 %'
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
				title: 'НДС 18',
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
				title: 'Стоимость 10, без НДС',
				itm: [{
					xtype: 'buttonask',
					text: 'Укажите стоимость продаж (налоговой базы) без НДС, которые облагаются по ставке 10 %'
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
				title: 'НДС 10',
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
			title: 'Стоимость 0, без НДС',
			itm: [{
				xtype: 'buttonask',
				text: 'Укажите стоимость продаж без НДС, которые облагаются по ставке 0 %'
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
			title: 'Сумма НДС',
			for: 'buy',
			itm: [{
				xtype: 'buttonask',
				text: 'Укажите сумму НДС в валюте покупки'
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
			title: 'Стоимость продаж, освобожденных от налога',
			itm: [{
				xtype: 'buttonask',
				text: 'Укажите стоимость продаж, освобожденных от налога'
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
				text: 'Добавить еще реквизиты',
				width: 180
			}]
		}
	]
});
