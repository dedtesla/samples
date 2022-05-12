Ext.define('Buh.view.bookbuy.Grid', {
	extend: 'Buh.classes.grid.BufferedGrid',
	alias: 'widget.bookbuygrid',
	maxWidth: 2100,
	emptyText: "<center>Нет данных для отображения</center>",
	selModel: 'rowmodel',
	enableLocking: true,
	type: 'buy',
	filter: null,
	filterDefaults: null,
	requires:[
		'Buh.store.bookbuy.Buys','Buh.store.bookbuy.Sales',
		'Buh.model.bookbuy.Buy','Buh.model.bookbuy.Sale'
	],
	filterIgnore: ['dat_doc1', 'dat_doc2', 'org_name'],
	verticalScroller: {
		variableRowHeight: true
	},
	initComponent: function() {
		let me = this, store;

		switch(this.type) {
			case 'sale':
				store = Buh.store.bookbuy.Buys;
			default:
				store = Buh.store.bookbuy.Sales;
		}

		me.columns = me.columns.filter((item) => (!item.for || item.for === me.type));

		if(!me.store) {
			me.store = new store
		}
		me.tbar.type = me.type;

		this.callParent(arguments);
	},
	setDefaults: function(values) {
		let me = this;
		if(me.filterDefaults === null) {
			Ext.Array.each(me.filterIgnore || [], function (val) {
				if (val in values) {
					delete values[val];
				}
			});
			me.filterDefaults = values
		}
	},
	setFilterValue: function(obj, value = null) {
		let me = this,
			_obj;

		if(!me.filter) {
			me.filter = {};
		}
		if(typeof obj === 'object') {
			_obj = obj;
		} else {
			_obj = {};
			_obj[obj] = value;
		}

		Ext.Object.each(_obj, (key, _value) => me.filter[key] = _value);

		return me.filter;
	},
	getFilterValues: function() {
		return this.filter || {};
	},
	clearFilter: function(params) {
		return this.filter = Ext.apply({}, params);
	},
	getFilterCount: function(filterValues = null) {
		let me = this,
			filter = filterValues || me.filter,
			count = 0;

		if(filter && me.filterDefaults) {
			Ext.Object.each(filter, function(key, val) {
				if(key in me.filterDefaults) {
					if (val && val != me.filterDefaults[key]) {
						count++;
					}
				}
			}, this);
		}
		return count;
	},
	columns: [/*{
		xtype: 'actioncolumn',
		dataIndex: 'id',
		width: 30,
		sortable: false,
		locked: true,
		tdCls: 'drop-menu_btn',
		items: [{
			getClass: function (value, meta, record) {
				if(!record.get('have_rnpt')){
					return 'x-hidden';
				}
				return '';
			}
		}]
	},*/{
		xtype: 'actioncolumn',
		dataIndex: 'id',
		width: 40,
		sortable: false,
		locked: true,
		tdCls: 'vert-menu_btn',
		items: [{
			getClass: function (value, meta, record) {
				if(record.get('origin') && !record.get('have_rnpt')){
					return 'x-hidden';
				}
			}
		}]
	},{
		text: '№',
		width: 55,
		align: 'left',
		xtype: 'rownumberer',
		locked: true
	},{
		text: 'Код операции',
		width: 120,
		dataIndex: 'kod',
		locked: true
	},{
		text: 'Документ',
		width: 155,
		dataIndex: 'typ_doc',
		renderer: function(val) {
			let rec = Ext.getStore('bookbuyDocTypes').getById(val);
			return rec ? rec.get('name') : ''
		},
		locked: true
	},{
		text: '№ и дата счф.',
		width: 150,
		dataIndex: 'dat_doc_number',
		renderer: function(value, column, record) {
			let number = record.get('number') ? `№${record.get('number')}` : 'б/н';
			return `${number} от ${record.get('dat_doc') || record.get('dat_reg')}`;

		},
		locked: true
	},{
		text: 'Код тэнвэд',
		width: 110,
		dataIndex: 'tnved',
		for: 'sale',
		locked: true
	},{
		text: 'ТД / РНПТ',
		width: 120,
		dataIndex: 'have_rnpt',
		renderer: function(value) {
			if(value) {
				return `<a>Есть ТД / РНПТ</a>`;
			}
		},
		locked: true
	},{
		text: 'Номер и дата испр. счф.',
		width: 200,
	},{
		text: 'Номер и дата корр .счф.',
		width: 200,
        dataIndex: 'dat_doc_number',
        renderer: function(value, column, record) {
		    if ( record.get('typ_doc')==19) {
		        if (record.get('corr_date') != null && record.get('corr_date')!='0000-00-00') {
                    let number = record.get('corr_number') ? `№${record.get('corr_number')}` : 'б/н';
                    let dat = Ext.Date.format(new Date(record.get('corr_date')), 'd.m.Y');
                    return `${number} от ${dat}`;
                }
            }
        },
        locked: true
	},{
		text: 'Номер и дата испр. корр. счф.',
		width: 230,
	},{
		text: '№ и дата оплаты',
		dataIndex: 'all_pay',
		renderer: function(value) {
			let str = value.join("; ");
			return value.length > 1 ? `<span data-qtip="${str}">${str}</span>` : str;
		},
		width: 150,
	},{
		text: 'Дата принятия на учет',
		dataIndex: 'dates_accounting',
		for: 'buy',
		renderer: function(value) {
			let str = value.join("; ");
			return value.length > 2 ? `<span data-qtip="${str}">${str}</span>` : str;
		},
		width: 200,
	},{
		text: 'Продавец',
		width: 340,
		for: 'buy',
		renderer: function(value) {
			return textLength(value) > 320 ? `<span data-qtip="${value.replace('"', '')}">${value}</span>` : value;
		},
		dataIndex: 'nm_p'
	},{
		text: 'Покупатель',
		width: 340,
		for: 'sale',
		renderer: function(value) {
			return textLength(value) > 320 ? `<span data-qtip="${value.replace('"', '')}">${value}</span>` : value;
		},
		dataIndex: 'nm_p'
	},{
		text: 'ИНН/КПП продавца',
		width: 200,
		for: 'buy',
		dataIndex: 'org_inn_kpp'
	},{
		text: 'ИНН/КПП покупателя',
		width: 200,
		for: 'sale',
		dataIndex: 'org_inn_kpp'
	},{
		text: 'Посредник',
		dataIndex: 'mediator_name',
		width: 340,
	},{
		text: 'ИНН/КПП Посредника',
		dataIndex: 'mediator_inn_kpp',
		width: 200,
	},{
		text: 'Код валюты',
		dataIndex: 'curr_id',
		width: 110,
	},{
		text: 'Стоимость вкл. НДС в валюте',
		width: 230,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'summav',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: 'Стоимость вкл. НДС в руб. коп.',
		width: 240,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'summa',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: 'Стоимость вкл. НДС',
		width: 160,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'summa',
		for: 'buy',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: 'Стоимость 20, без НДС',
		width: 180,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sum20',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: 'Стоимость 18, без НДС',
		width: 180,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sum18',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: 'Стоимость 10, без НДС',
		width: 180,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sum10',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: 'Стоимость 0, без НДС',
		width: 180,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sum0',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: 'НДС 20',
		width: 140,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sumnds20',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: 'НДС 18',
		width: 140,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sumnds18',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: 'НДС 10',
		width: 140,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sumnds10',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: 'Сумма НДС',
		width: 110,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sumnds',
		for: 'buy',
		renderer: function(value) {
			return toLocaleDigits2(value)
		}
	},{
		text: 'Стоимость освобожден.',
		width: 190,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sumb',
		for: 'sale',
		renderer: function(value) {
			return toLocaleDigits2(value)
		}
	}],
	tbar: {
		xtype: 'bookbuytbar'
	}
});
