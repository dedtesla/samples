Ext.define('Buh.view.bookbuy.edit.Contra', {
	extend: 'Buh.classes.sprav.Tool',
	xtype: 'bookbuyeditcontra',
	layout: 'vbox',
	inn: null,
	kpp: null,
	margin: '0 0 0 0',
	innFieldName: null,
	kppFieldName: null,
	constructor: function() {
		let me = this;

		me.callParent(arguments);

		me.add({
			xtype: 'container',
			itemId: 'desc',
			hidden: true,
			layout: 'hbox',
			items: [{
				xtype: 'displayfield',
				itemId: 'inn',
				name: me.innFieldName,
				renderer: (v) => colGrey(`»ÕÕ: ${v || "&mdash;"}`)
			},{
				xtype: 'displayfield',
				itemId: 'kpp',
				name: me.kppFieldName,
				renderer: (v) => colGrey(` œœ: ${v || "&mdash;"}`)
			},]
		});

		me.getComponent('id').on('change', function(field) {
			me.fillData(field.getValue())
		});
	},
	fillData: function(id) {
		let me = this,
			record = me.store.getById(id),
			desc = me.getComponent('desc'),
			inn = desc.getComponent('inn'),
			kpp = desc.getComponent('kpp');
		if(record) {
			inn.setValue(parseInt(record.raw.inn, 10));
			kpp.setValue(record.raw.kpp && record.raw.kpp != '0' ? parseInt(record.raw.kpp, 10) : null);
			desc.show();
		} else if(id) {
			desc.show();
		} else {
			inn.setValue('');
			kpp.setValue('');
			desc.hide()
		}
	}
});