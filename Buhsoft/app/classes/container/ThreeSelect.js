Ext.define('Buh.classes.container.ThreeSelect',
    {

        constructor: function () {

            this.callParent(arguments);

            Ext.apply(this, arguments);

            var args = arguments[0],
                arBtn = [],
                b1 = args['b1'],
                b2 = args['b2'],
                b3 = args['b3'],
                nm = args['nm'];

            if (b1 != undefined) {
                Ext.apply(this.down('[name=btn1]'), {text: b1});
                Ext.apply(this.down('[name=btn2]'), {text: b2});
                Ext.apply(this.down('[name=btn3]'), {text: b3});
                Ext.apply(this.down('#fldValue'), {name: nm});
            }
            if (b1 != undefined) arBtn.push(1);
            if (b2 != undefined) arBtn.push(2);
            if (b3 != undefined) arBtn.push(3);
            this.showButtons(arBtn);

            this.addEvents(
                'switch',
                'change',
            );

        },


        extend: 'Ext.container.Container',
        alias: 'widget.threeselect',
        xtype: 'three_select',
        cls: 'block-btn-unite',
        layout: 'hbox',
        items: [
            {
                xtype: 'hidden', itemId: 'fldValue', 'name': 'vdr',
                listeners: {
                    'change': function (th, nv, ov, e) {
                        this.up('container').fireEvent('change', nv);
                        this.up('container').down('[name=btn1]').removeCls(cls_btn);
                        this.up('container').down('[name=btn2]').removeCls(cls_btn);
                        this.up('container').down('[name=btn3]').removeCls(cls_btn);
                        this.up('container').down('[name=btn' + nv + ']').addCls(cls_btn);
                    }

                }
            },
            {
                xtype: 'button',
                text: '',
                name: 'btn1',
                cls: 'btn-unite-start',
                listeners:
                    {
                        'click': function () {
                            this.up('container').down('#fldValue').setValue(1);
                            this.up('container').fireEvent('switch', 1);
                        }
                    }
            },
            {
                xtype: 'button',
                text: '',
                name: 'btn2',
                listeners:
                    {
                        'click': function () {
                            this.up('container').down('#fldValue').setValue(2);
                            this.up('container').fireEvent('switch', 2);
                        }
                    }
            },
            {
                xtype: 'button',
                text: '',
                name: 'btn3',
                cls: 'btn-unite-end',
                listeners:
                    {
                        'click': function () {
                            this.up('container').down('#fldValue').setValue(3);
                            this.up('container').fireEvent('switch', 3);
                        }
                    }
            },
        ],
        setValue: function (_val) {
            this.down('#fldValue').setValue(_val);
        },

        getValue: function () {
            return this.down('#fldValue').getValue();
        },

        showButtons: function (_btns) {
            var firstBtn = 0,
                lastBtn = 0;
            for (var i = 1; i <= 3; i++) {
                if (_btns.indexOf(i) == -1) {
                    this.down('[name=btn' + i + ']').hide();
                }
                else {
                    this.down('[name=btn' + i + ']').show();
                    lastBtn = i;
                    if (firstBtn == 0) {
                        firstBtn = i;
                    }
                }
            }
            this.down('[name=btn' + firstBtn + ']').addCls('btn-unite-start');
            this.down('[name=btn' + lastBtn + ']').addCls('btn-unite-end');
        }

    });
