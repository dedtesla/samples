/**
 * Верхняя панель инструментов Книги покупок и продаж
 *
 *
 */
Ext.define('Buh.view.bookbuy.TBar', {
	extend: 'Ext.toolbar.Toolbar',
	requires: ['Buh.classes.container.Period', 'Buh.classes.field.Find'],
	alias: 'widget.bookbuytbar',
	xtype: 'bookbuytbar',
	dock: 'top',
	cls: 'container-align-small',
	type: 'buy',
	initComponent: function(){
		this.callParent(arguments);

		let me = this,
			gridSwitcher = me.getComponent('gridSwitcher');

		switch(me.type) {
			case 'sale':
				gridSwitcher.getComponent('btnSale').addCls('blue-btn');
				break;
			default:
				gridSwitcher.getComponent('btnBuy').addCls('blue-btn');
		}
	},
	items: [{
		xtype: 'button',
		cls: 'grey-btn',
		text: "Заполнить",
		width: 98,
		itemId: 'btnFill'
	}, {
		xtype: 'container',
		cls: 'block-btn-unite',
		layout: 'hbox',
		action: 'grid',
		itemId: 'gridSwitcher',
		items: [{
			xtype: 'button',
			text: 'Покупки',
			name: 'btnBuy',
			itemId: 'btnBuy',
			width: 86,
			cls: 'btn-unite-start',
			rel: 'buy'
		}, {
			xtype: 'button',
			text: 'Продажи',
			name: 'btnSale',
			itemId: 'btnSale',
			width: 86,
			rel: 'sale'
		}]
	}, {
		xtype: 'c_period',
		//width: 250,
		name: 'fldPeriod'
	}, {
		xtype: 'fld_find',
		width: 174,
		typeAheadDelay: 750,
		emptyText: 'Поиск',
		name: 'search'
	}, {
		text: 'Фильтр',
		xtype: 'button',
		itemId: 'btnFilter',
		icon: _icons.filt,
		filterData: {},
		filterCount: 0,
		minWidth: 93,
		filterChange: function(active) {
			let me = this;
			if(active) {
				me.addCls('is_active');
				me.setIcon(_icons.filt_w);
			} else {
				me.removeCls('is_active');
				me.setIcon(_icons.filt);
			}
		}
	}, {
		text: 'Печать',
		xtype: 'button',
		itemId: 'btnForPrint',
		icon: _icons.print,
		width: 93,
		scope: this,
		menu:
			mkMenu([
				{
					'text': 'Распечатать',
					'handler': function () {
						let me = this, dt1 = dtoc(me.up('bookbuytbar').down('c_period').down('#dat1_ap').getValue()),
							dt2 = dtoc(me.up('bookbuytbar').down('c_period').down('#dat2_ap').getValue());

						if (me.up('bookbuytbar').type === 'buy') {
							makeBook('buy', dt1, dt2, true);
							// gbsPrintDirect(dir_start_buh_ + "frm_bbk_07_21.php?type_doc_convert=pdf&d_beg=" + dt1 + "&d_end=" + dt2 + "&directprint=true");
						} else {
							makeBook('sell', dt1, dt2, true);
							// gbsPrintDirect(dir_start_buh_ + "frm_sbk_07_21.php?type_doc_convert=pdf&d_beg=" + dt1 + "&d_end=" + dt2 + "&directprint=true");
						}
					}
				},
				{
					'text': 'Скачать XLS',
					'handler': function () {
						let me = this, dt1 = dtoc(me.up('bookbuytbar').down('c_period').down('#dat1_ap').getValue()),
						dt2 = dtoc(me.up('bookbuytbar').down('c_period').down('#dat2_ap').getValue());
						if (me.up('bookbuytbar').type === 'buy') {
							makeBook('buy', dt1, dt2);
							//window.location.href = dir_start_buh_ + "frm_bbk_07_21.php?d_beg=" + dt1 + "&d_end=" + dt2;
						} else {
							makeBook('sell', dt1, dt2);
							// window.location.href = dir_start_buh_ + "frm_sbk_07_21.php?d_beg=" + dt1 + "&d_end=" + dt2;
						}
					}
				}
			])
	}, {
		text: 'Добавить запись',
		itemId: 'btnAdd',
		xtype: 'button',
		icon: _icons.plus_grey,
		width: 155,
		handler: function () {
		}
	}]
});

var makeBook = function(tab, dt1, dt2, _print = false) {
	let id = null,
		job = 'sellBook',
		bookname = ' продаж',
		print = _print,
		filename = 'frm_sbk_21_thread.php';

	if (tab == 'buy') {
		job = 'buyBook';
		bookname = ' покупок';
		filename = 'frm_bbk_21_thread.php';
	}
	_ajax( dir_start_buh_ + "./fill_thread.php",
		{
			job: job,
			status: 'start',
			title: 'Формирование книги'+bookname,
			year: currYear,
			d_beg: dt1,
			d_end: dt2,
		},
		function (_ans) {
			let ans = Ext.JSON.decode(_ans);
			id = ans.id;
			let _fn = function(ans) {
				if ( !print) {
					window.location.href = dir_start_buh_ + filename + "?status=send&d_beg=" + dt1 + "&d_end=" + dt2;
					_alert_win('Формирование книги'+bookname, 'Формирование книги завершено');
				}
				else {
					gbsPrintDirect(dir_start_buh_ + filename + "?type_doc_convert=pdf&d_beg=" + dt1 + "&d_end=" + dt2 + "&directprint=true&status=send");
				}
			}
			win2.close();
			makeThreadWindow_2({
				title: 'Формирование книги'+bookname,
				threadFile: dir_start_buh_ + 'fill_thread.php ',
				process: id,
				interval: 2000,
				d_beg: dt1,
				d_end: dt2,
				fn: _fn
			});
		}
	);
}
