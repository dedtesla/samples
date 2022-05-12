Ext.define('Buh.classes.container.ContAling',
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
        xtype: 'cont_align',

        cls: 'container-align',

        items: [
            {
                xtype: 'label',
                hidden: true
            }
        ],

        thisTitle: function (_t) {
            this.down('label').setText(_t);
        },

    });
