Ext.define('Buh.classes.grid.BufferedGrid', {
	extend: 'Ext.grid.Panel',
	initComponent: function () {
		Ext.applyIf(this, {
			viewConfig: {
				trackOver: false,
				markDirty:false,
				preserveScrollOnRefresh: true
			}
		});
		this.callParent(arguments);
	},
	getCountAll: function(params, callback, url = null) {
		let me = this,
			proxy = me.store.proxy,
			_params = Ext.merge({},
				proxy.extraParams,
				params,
				{
					action: 'countall'
				}
			);
		_ajax(url || proxy.api.countall || proxy.api.read, _params, function(ret) {
			let response = Ext.decode(ret), totalCount;
			if(response.success) {
				totalCount = response.totalCount;
			}
			callback.call(me, response, totalCount);
		});
	},
	getPosition: function(id, params, callback, url = null) {
		let me = this,
			proxy = me.store.proxy,
			_params = Ext.merge({},
				proxy.extraParams,
				params,
				{
					source_id: id,
					setfilt: 1,
					action: 'position'
				}
			);
		_ajax(url || proxy.api.position || proxy.api.read, _params, function(ret) {
			let response = Ext.decode(ret), position;
			if(response.success) {
				position = response.position;
			}
			callback.call(me, response, position);
		});
	},
	scrollTo: function(id) {
		let me = this,
			store = me.store,
			selModel = me.getSelectionModel(),
			record = store.getById(id),
			vScroller;

		if(me.enableLocking || !(vScroller = me.verticalScroller)) {
			Ext.Array.each(me.items.items, (item) => {
				if(item.verticalScroller) {
					vScroller = item.verticalScroller;
					return false;
				}
			});
		}

		if(vScroller) {
			if (record) {
				vScroller.scrollTo(store.indexOf(record) + 6, false,
					() => (selModel.selectView || selModel.select).call(selModel, record));
			} else {
				me.getPosition(id, null, function (response, index) {
					if (index !== undefined) {
						vScroller.scrollTo(index + 6,
							false,
							() => setTimeout(() => (selModel.selectView || selModel.select).call(selModel, store.getById(id)), 200),
							this)
					}
				})
			}
		}
	}
});
