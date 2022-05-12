Ext.define('Buh.classes.closesc.Tree20', {


    extend: 'Ext.tree.Panel',
    xtype: 'tree20',
    draggable: false,
    //height: 300,

    /**********
     *    store
     *************/

    root: {
        expanded: false,
        children: [],
    },
    rootVisible: false,


    /**********
     *    columns
     **********/
    columns: [
        {
            xtype: 'treecolumn',
            text: 'Счета',
            dataIndex: 'sc',
            width: 200,
            renderer: function (grid, column, record) {
                let cls = record.get('error') ? "txt-red" : "";
                if (record.get('error') && arguments[2].data.children == null)
                    column.tdAttr = 'data-qtip="Остаток может быть только ' + (record.get('ost') < 0 ? "дебетовым" : "кредитовым") + '"';
                return "<span class='" + cls + "'>" + record.get('sc') + "</span>";

            },
        }, {
            flex: 1,
            text: 'Наименование',
            dataIndex: 'name',
            renderer: function (grid, column, record) {
                let cls = record.get('error') ? "txt-red" : "";
                if (record.get('error') && arguments[2].data.children == null)
                    column.tdAttr = 'data-qtip="Остаток может быть только ' + (record.get('ost') < 0 ? "дебетовым" : "кредитовым") + '"';
                return "<span class='" + cls + "'>" + record.get('name') + "</span>";

            },
        }, {
            flex: 1,
            text: 'Аналитика',
            dataIndex: 'analit_name',
            renderer: function (grid, column, record) {
                let cls = record.get('error') ? "txt-red" : "",
                    an_name = record.get('analit_name');
                if (record.get('error') && arguments[2].data.children == null)
                    column.tdAttr = 'data-qtip="Остаток может быть только ' + (record.get('ost') < 0 ? "дебетовым" : "кредитовым") + '"';
                if (an_name == "") an_name = "Без аналитики";
                return "<span class='" + cls + "'>" + an_name + "</span>";

            },
        }, {
            xtype: 'numbercolumn',
            format: '0.00',
            flex: 1,
            text: 'Остаток',
            align: 'right',
            dataIndex: 'ost',
            renderer: function (grid, column, record) {
                let cls = record.get('error') ? "txt-red" : "";
                if (record.get('error') && arguments[2].data.children == null)
                    column.tdAttr = 'data-qtip="Остаток может быть только ' + (record.get('ost') < 0 ? "дебетовым" : "кредитовым") + '"';
                return "<span class='" + cls + "'>" + Math.abs(record.data.ost).toFixed(2) + "</span>";
            }
        }, {
            dataIndex: 'sc',
            width: 50,
            renderer: function (grid, column, record) {
                let cls = record.get('error') ? "txt-red" : "";
                if (record.get('error') && arguments[2].data.children == null)
                    column.tdAttr = 'data-qtip="Остаток может быть только ' + (record.get('ost') < 0 ? "дебетовым" : "кредитовым") + '"';
                return "<span class='" + cls + "'>" + (record.data.ost > 0 ? "Дт" : "Кт") + "</span>";
            }
        }
    ],

    bbar: {
        xtype: 'toolbar',
        name: 'unused-20',
        hidden: true,
        items:
            [
                {
                    xtype: "box",
                    name: 'footer',
                    width: 706,
                    minWidth: 706,
                    html: "тут неиспользованные счета 2х"
                }
            ]
    },

    selModel: Ext.create('Ext.selection.CheckboxModel', {
        checkOnly: true,
        showHeaderCheckbox: false
    }),

    viewConfig: {
        getRowClass: function (record, index) {
            var ssc = record.get('ssc');
            return ssc != "" ? 'check_box_off' : '';
        }
    },
    listeners: {
        selectionchange: function (sm, record) {
            let win = this.up('window');
            win.fireEvent('checkTreeSelection');
        }

    }


});
