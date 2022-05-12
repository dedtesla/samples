Ext.define('Buh.view.bookbuy.Grid', {
	extend: 'Buh.classes.grid.BufferedGrid',
	alias: 'widget.bookbuygrid',
	maxWidth: 2100,
	emptyText: "<center>��� ������ ��� �����������</center>",
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
		text: '�',
		width: 55,
		align: 'left',
		xtype: 'rownumberer',
		locked: true
	},{
		text: '��� ��������',
		width: 120,
		dataIndex: 'kod',
		locked: true
	},{
		text: '��������',
		width: 155,
		dataIndex: 'typ_doc',
		renderer: function(val) {
			let rec = Ext.getStore('bookbuyDocTypes').getById(val);
			return rec ? rec.get('name') : ''
		},
		locked: true
	},{
		text: '� � ���� ���.',
		width: 150,
		dataIndex: 'dat_doc_number',
		renderer: function(value, column, record) {
			let number = record.get('number') ? `�${record.get('number')}` : '�/�';
			return `${number} �� ${record.get('dat_doc') || record.get('dat_reg')}`;

		},
		locked: true
	},{
		text: '��� ������',
		width: 110,
		dataIndex: 'tnved',
		for: 'sale',
		locked: true
	},{
		text: '�� / ����',
		width: 120,
		dataIndex: 'have_rnpt',
		renderer: function(value) {
			if(value) {
				return `<a>���� �� / ����</a>`;
			}
		},
		locked: true
	},{
		text: '����� � ���� ����. ���.',
		width: 200,
	},{
		text: '����� � ���� ���� .���.',
		width: 200,
        dataIndex: 'dat_doc_number',
        renderer: function(value, column, record) {
		    if ( record.get('typ_doc')==19) {
		        if (record.get('corr_date') != null && record.get('corr_date')!='0000-00-00') {
                    let number = record.get('corr_number') ? `�${record.get('corr_number')}` : '�/�';
                    let dat = Ext.Date.format(new Date(record.get('corr_date')), 'd.m.Y');
                    return `${number} �� ${dat}`;
                }
            }
        },
        locked: true
	},{
		text: '����� � ���� ����. ����. ���.',
		width: 230,
	},{
		text: '� � ���� ������',
		dataIndex: 'all_pay',
		renderer: function(value) {
			let str = value.join("; ");
			return value.length > 1 ? `<span data-qtip="${str}">${str}</span>` : str;
		},
		width: 150,
	},{
		text: '���� �������� �� ����',
		dataIndex: 'dates_accounting',
		for: 'buy',
		renderer: function(value) {
			let str = value.join("; ");
			return value.length > 2 ? `<span data-qtip="${str}">${str}</span>` : str;
		},
		width: 200,
	},{
		text: '��������',
		width: 340,
		for: 'buy',
		renderer: function(value) {
			return textLength(value) > 320 ? `<span data-qtip="${value.replace('"', '')}">${value}</span>` : value;
		},
		dataIndex: 'nm_p'
	},{
		text: '����������',
		width: 340,
		for: 'sale',
		renderer: function(value) {
			return textLength(value) > 320 ? `<span data-qtip="${value.replace('"', '')}">${value}</span>` : value;
		},
		dataIndex: 'nm_p'
	},{
		text: '���/��� ��������',
		width: 200,
		for: 'buy',
		dataIndex: 'org_inn_kpp'
	},{
		text: '���/��� ����������',
		width: 200,
		for: 'sale',
		dataIndex: 'org_inn_kpp'
	},{
		text: '���������',
		dataIndex: 'mediator_name',
		width: 340,
	},{
		text: '���/��� ����������',
		dataIndex: 'mediator_inn_kpp',
		width: 200,
	},{
		text: '��� ������',
		dataIndex: 'curr_id',
		width: 110,
	},{
		text: '��������� ���. ��� � ������',
		width: 230,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'summav',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: '��������� ���. ��� � ���. ���.',
		width: 240,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'summa',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: '��������� ���. ���',
		width: 160,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'summa',
		for: 'buy',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: '��������� 20, ��� ���',
		width: 180,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sum20',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: '��������� 18, ��� ���',
		width: 180,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sum18',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: '��������� 10, ��� ���',
		width: 180,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sum10',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: '��������� 0, ��� ���',
		width: 180,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sum0',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: '��� 20',
		width: 140,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sumnds20',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: '��� 18',
		width: 140,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sumnds18',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: '��� 10',
		width: 140,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sumnds10',
		for: 'sale',
		renderer: function(value) {
			return value ? toLocaleDigits2(value) : '&mdash;'
		}
	},{
		text: '����� ���',
		width: 110,
		align: 'right',
		tdCls: 'txt-blue2-bold',
		dataIndex: 'sumnds',
		for: 'buy',
		renderer: function(value) {
			return toLocaleDigits2(value)
		}
	},{
		text: '��������� ����������.',
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
