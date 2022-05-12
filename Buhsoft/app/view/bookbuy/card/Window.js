Ext.define('Buh.view.bookbuy.card.Window', {
	extend: 'Gbs.window',
	width: 1100,
	height: 600,
	xtype: 'bookbuycardwindow',
	requires: ['Buh.view.bookbuy.card.GridExplain'],
	alias: 'widget.bookbuyCardWindow',
	cls: 'style2018 new-window-card',
	modal : false,
	x: 248,
	y: 0,
	draggable: false,
	header: false,
	customclosable: false,
	title: 'Реквизиты импортных товаров',
	initComponent: function () {
		let me = this;
		me.callParent();
		Ext.apply(this, {
			listeners: {
				render: function (th, eo) {
					Ext.EventManager.onWindowResize(th.fireResize, th);
					//me.getHeader().addCls('block_card-header');
				},
				activate: function (el) {
					el.fireResize();
				}
			}
		})
	},
	fireResize: function (w, h) {  // window resize
		var me = this,
			size = Ext.getBody().getViewSize(),
			needheight = size.height - this.y - 101,
			needwidth = size.width - this.x;

		var owner = Ext.get(me.renderTo);
		if (owner != null && owner.isVisible()) {
			me.setWidth(needwidth);
			me.setHeight(needheight);
			me.doLayout();
		}
	},
	layout: 'border',
	items: [{
		region: 'north',
		xtype: 'panel',
		cls: 'window-header',
		items: [{
			xtype: 'box',
			cls: 'header-title',
			name: 'ttl1',
			//width: 500,
			html: 'Реквизиты импортных товаров'
		},{
			xtype: 'button',
			cls: 'close_btn',
			text: "X",
			handler: function () {
				this.up('window').close();
			}
		}]
	},{
		region: 'center',
		layout: 'fit',
		cls: "window-body tab-joint-header",
		items: {
			xtype: 'bookbuygridexplain'
		}
	}]
})