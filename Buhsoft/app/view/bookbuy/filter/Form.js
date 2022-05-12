Ext.define('Buh.view.bookbuy.filter.Form', {
	extend: 'gbs.window.Form',
	xtype: 'bookbuyfilterform',
	title: 'Фильтр',
	layout: {
		type: 'vbox'
	},
	type: 'buy',
	initComponent: function () {
		let me = this,
			hr = function (config) {
				return Ext.apply({
					xtype: 'container',
					width: '100%',
					cls: 'hr-line12'
				}, config)
			};
		me.items = [{
				xtype: 'bookbuyfilterline',
				control: {
					xtype: 'c_period',
					width: 250,
					margin: '0 0 0 25'
				},
				reset: null,
				title: 'Дата'
			},
			hr(),
			{
				xtype: 'bookbuyfilterline',
				control: {
					xtype: 'sprav_tool',
					name: 'org_id',
					emptyText: 'Введите название для поиска',
					id_sprav: 6,
					fid: 'org_id',
					fnm: 'org_name',
					defaultValue: '0',
					width: 450,
					listWidth: 450
				},
				title: 'Контрагент'
			},
			hr(),
			{
				xtype: 'bookbuyfilterline',
				control: {
					xtype: 'gbs_combo',
					editable: false,
					name: 'a.kod',
					forceSelection: true,
					store: store_kvo,
					allowBlank: false,
					defaultValue: '0',
					width: 450,
					listeners: {
						beforerender: function(combo) {
							combo.store.insert(0, [['0', 'Все коды']]);
							combo.setValue('0')
						}
					}
				},
				title: 'Код вида операции'
			},
			hr(),
			{
				xtype: 'bookbuyfilterline',
				for: 'sale',
				control: {
					xtype: 'comboNDS',
					width: 450,
					name: 'stav',
					allowBlank: false,
					defaultValue: '0',
					itemId: 'stav',
					listeners: {
						beforerender: function(combo) {
							combo.store.insert(0, [['0', 'Все ставки']]);
							combo.setValue('0')
						}
					}
				},
				title: 'Ставка НДС'
			},
			hr({for: 'sale'}),
			{
				xtype: 'bookbuyfilterline',
				control: {
					xtype: 'gbs_combo',
					editable: false,
					name: 'typ_doc',
					forceSelection: true,
					store: Ext.getStore('bookbuyDocTypes').proxy.data,
					displayField: 'name',
					valueField: 'id',
					allowBlank: true,
					defaultValue: '0',
					width: 450,
					listeners: {
						beforerender: function(combo) {
							combo.store.insert(0, [['0', 'Все документы']]);
							combo.setValue('0')
						}
					}
				},
				title: 'Документ'
			},{
				xtype: 'bookbuyfilterline',
				reset: null,
				margin: '10 0 0 190',
				control: {
					xtype: 'checkbox',
					name: 'have_rnpt',
					boxLabel: 'Только с ТД / РНПТ'
				}
			},
			hr(),
			{
				xtype: 'bookbuyfilterline',
				control: {
					xtype: 'combo',
					cls: 'field-combo-button',
					defaultListConfig: {
						cls: 'style2018'
					},
					listConfig: {
						minWidth: 450
					},
					editable: true,
					name: 'tdrnpt',
					forceSelection: false,
					store: {
						fields: ['name'],
						autoLoad: true,
						proxy: {
							type: 'ajax',
							api: {
								read: dir_start_buh_ + 'bookbuy/getTdRnptList',
							},
							reader: {
								type: 'json',
								root: 'data'
							},
							extraParams: {
								yearDatabase: currYear,
								type: me.type
							}
						}
					},
					allowBlank: false,
					valueField: 'name',
					displayField: 'name',
					defaultValue: '',
					emptyText: 'Введите код для поиска',
					width: 450,
					minChars: 0,
					queryMode: 'remote',
					typeAhead: false,
					labelSeparator: '',
					msgTarget: 'none',
					typeAheadDelay: 500,
					enableKeyEvents: true
				},
				title: 'ТД / РНПТ'
			}
		];

		me.items = me.items.filter((item) => (!item.for || item.for === me.type));
		this.callParent(arguments)
	},
	isDirty: function() {
		let dirty = false,
			panel = win.getComponent('panel'),
			buttonsAll = panel ? panel.query('[name=btn-cancel]') : null;
		if(buttonsAll) {
			Ext.Array.each(buttonsAll, (button) => {
				dirty = button.isVisible();
				if (dirty) {
					return false;
				}
			}, this);
		}
		return dirty;
	}
});
