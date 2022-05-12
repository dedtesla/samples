Ext.define('Buh.view.bookbuy.filter.Line', {
	extend: 'Ext.container.Container',
	xtype: 'bookbuyfilterline',
	name: 'top-cnt',
	control: null,
	title: '',
	layout: {
		type: 'hbox',
		align: 'middle'
	},
	initComponent: function() {
		let me = this,
			controlEl,
			controls,
			controlChange = function(item) {
				let isNotDefault = false,
					val = item.getValue(),
					btnCancel = me.down('[name=btn-cancel]'),
					defaultValue = item.defaultValue || '0';

				if(me.reset) {
					if (val && val != defaultValue) {
						me.addCls('input-blue');
						isNotDefault = true;
					} else {
						me.removeCls('input-blue');
					}
					btnCancel.setVisible(isNotDefault);
				}

				me.fireEvent('controlchange', this)
			};

		this.addEvents('controlchange');
		this.callParent(arguments);

		if(me.title) {
			me.add({
				xtype: 'container',
				width: 165,
				height: 20,
				html: this.title
			});
		}
		if(me.reset) {
			me.add({
				xtype: 'container',
				width: 25,
				items: {
					xtype: 'button',
					name: 'btn-cancel',
					text: 'x',
					cls: 'x-reset_button',
					align: 'right',
					hidden: true,
					handler: function() {
						me.reset.call(me);
					}
				}
			});
		}

		controlEl = me.add(me.control);
		controls = controlEl.getValue ? [controlEl] : controlEl.query('textfield');

		controls.map((el) => {
			if(el.callBack !== undefined) {
				el.callBack = function() {
					el.fireEvent('change', el);
				};
			}
			el.on('change', controlChange);
		})
	},
	reset: function() {
		let me = this,
			container = me.getComponent(2),
			controls = container.getValue ? [container] : container.query('textfield');
		Ext.Array.each(controls, function(control) {
			if(control.defaultValue !== undefined) {
				control.setValue(control.defaultValue);
			} else {
				control.reset();
			}
		})
	}
})