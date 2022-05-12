Ext.define('Buh.classes.container.Vertical',
    {

        constructor: function () {
            var args = arguments[0],
                _title = args.title || "",
                _items = args.itm || {};
            this.callParent(arguments);
            if (_title != "") {
                this.down('#title').update(_title);
                this.down('#title').show();
            }
            this.add(_items);
        },

        extend: 'Ext.container.Container',
        xtype: 'cont_vert',
        items: [{
            xtype: 'label',
            itemId: 'title',
            hidden: true
        }],

        thisTitle: function (_ttl) {
            this.down('#title').setText(_ttl);
        },
        setTitle: function (_ttl) {
            this.thisTitle(_ttl);

        }
    });
