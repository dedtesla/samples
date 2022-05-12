Ext.define('Buh.controller.BookBuyEdit', {
    extend: 'Ext.app.Controller',
    callback: Ext.emptyFn,
    refs: [{
        ref: 'editWindow',
        selector: 'bookbuyEditWindow'
    },{
        ref: 'formPanel',
        selector: 'bookbuyEditWindow form'
    },{
        ref: 'tBar',
        selector: 'bookbuyEditWindow bookbuyedittbar'
    },{
        ref: 'saveBtn',
        selector: 'bookbuyEditWindow bookbuyedittbar button[action=save]'
    }],
    init: function () {
        let me = this;
        me.control({
            'bookbuyEditWindow': {
                fillData: me.fillData
            },
            'bookbuyEditWindow form button[action="add"]': {
                click: function(button) {
                    let me = this,
                        win = me.getEditWindow(),
                        rel = button.up('cont_vert').rel;

                    me.addItem(rel);
                    if(rel === 'bookbuyexplainitem') {
                        if(win.el && win.el.dom) {
                            Ext.fly(window).dom.scrollTo(0, win.el.dom.scrollHeight)
                        }
                    }
                }
            },
            'bookbuyEditWindow form button[action="remove"]': {
                click: me.removeItem
            },
            'bookbuyEditWindow bookbuyedittbar button[action=save]': {
                click: me.save
            },
            'bookbuyEditWindow bookbuyedittbar button[action=close]': {
                click: me.close
            },
            'bookbuyEditWindow bookbuyedittbar container[itemId=errordata] button': {
                click: me.focusField
            },
            'bookbuyEditWindow form cont_vert[name=cnt-nds] [itemId=sum]': {
                change: me.calcNdsSum
            },
            'bookbuyEditWindow form textfield[allowBlank=false], bookbuyEditWindow form numberfield[allowBlank=false], bookbuyEditWindow form gbs_combo[allowBlank=false]': {
                change: me.validate,
                blur: function(el, e) {
                    me.getEditWindow().fireEvent('onScroll')
                }
            }
        })
    },
    fillData: function(args) {
        let me = this,
            win = me.getEditWindow(),
            form = me.getFormPanel().getForm(),
            defaults = {
                //'Item[dat_doc]': new Date
            };
        Ext.apply(me, args);
        win.show();


        if(win.source_id) {
            setTimeout(() => {
                win.setLoading(true);
            _ajax(dir_start_buh_ + 'bookbuy/load',{
                    id: win.source_id,
                    type: me.type || win.type,
                    yearDatabase: currYear
                },
                function(result) {
                    let data = Ext.decode(result).data,
                        expandItems = {
                            all_pay_count: 'bookbuyallpayitem',
                            dates_accounting_count: 'bookbuydateaccitem',
                            explain_count: 'bookbuyexplainitem'
                        };

                    //добавляем контейнеры для повторяющихся элементов
                    Ext.Object.each(expandItems, (key, rel) => {
                        if(key in data && data[key] > 1) {
                        while(--data[key]) {
                            me.addItem(rel)
                        }
                    }
                });

                    form.setValues(data);
                    win.setLoading(false);
                });
        },100)
        } else {
            form.setValues(defaults);
        }

    },
    /**
     * Добавление контейнера для повторяющихся элементов
     *
     * @param rel
     */
    addItem: function(rel) {
        let me = this,
            formPanel = me.getFormPanel(),
            win = me.getEditWindow(),
            container = formPanel.down(`container[rel=${rel}]`),
            cntInner = container.getComponent('cnt-inner'),
            buttons;

        if((buttons = Ext.ComponentQuery.query('button[action="remove"]', container)).length === 1) {
            buttons[0].show()
        }

        container.index = container.index ? container.index + 1 : 1;
        cntInner.add({
            xtype: rel,
            index: container.index
        }).down('button').show();

        win.fireEvent('onScroll')
    },
    removeItem: function(button) {
        let me = this,
            win = me.getEditWindow(),
            parent = button.up('[cls=cnt-item]'),
            container = parent.up(),
            buttons;

        container.remove(parent);

        if((buttons = Ext.ComponentQuery.query('button[action="remove"]', container)).length === 1) {
            buttons[0].hide()
        }

        win.fireEvent('onScroll')
    },
    save: function() {
        let me = this,
            win = me.getEditWindow(),
            formPanel = me.getFormPanel(),
            form = formPanel.getForm(),
            formValues = form.getValues(false, false, false, true);

        if(me.validate()) {
            win.setLoading(true);
            formPanel.submit({
                clientValidation: true,
                url: dir_start_buh_ + 'bookbuy/save',
                submitEmptyText: false,
                params: {
                    type: me.type || win.type,
                    yearDatabase: currYear
                },
                success: function (form, action) {
                    win.setLoading(false);
                    win.close();
                    (me.callback || Ext.emptyFn).call(me, action.result, formValues);
                },
                failure: function (form, action) {
                    win.setLoading(false);
                    win.close();
                    (me.callback || Ext.emptyFn).call(me, action.result, formValues);
                }
            });
        }
    },
    validate: function() {
        let me = this,
            win = me.getEditWindow(),
            toolbar = me.getTBar(),
            formPanel = me.getFormPanel(),
            form = formPanel.getForm(),
            saveBtn = me.getSaveBtn(),
            invalidFields = [],
            errordata = toolbar.getComponent(0).getComponent('errordata'),
            isValid;

        form.getFields().findBy(function(c) {
            var a = c.preventMark;
            c.preventMark = true;
            if(!c.isValid()) {
                invalidFields.push(c);
            }
            c.preventMark = a;
        });
        isValid = !invalidFields.length;

        errordata.removeAll();

        if(!isValid) {
            errordata.show();
            errordata.add([{
                xtype: 'label',
                cls: 'btn-sel-blue color-orange',
                text: 'Не введено:'
            }, {
                xtype: 'tbspacer',
            }]);

            Ext.Array.each(invalidFields, function (fld, index) {
                errordata.add({
                    xtype: 'tbspacer',
                });
                errordata.add({
                    xtype: 'button',
                    componentCls: 'x-toolbar-item',
                    text: fld.errorText + (index !== invalidFields.length - 1 ? ',' : ''),
                    fname: fld.name,
                    cls: 'btn-sel-blue color-orange',
                });
            });
            saveBtn.disable();
        } else {
            errordata.hide();
        }

        saveBtn.setDisabled(!isValid);
        Ext.defer(function () {
            win.fireEvent('onScroll');
        }, 100);

        return isValid;
    },
    close: function() {
        let me = this,
            win = me.getEditWindow();
        win.close();
    },
    calcNdsSum: function(field) {
        let me = this,
            form = me.getFormPanel().getForm(),
            sumField = form.findField(field.rel);

        sumField.setValue(Math.round(field.getValue() * field.nds /100, 2))
    },
    focusField: function(field) {
        let me = this,
            win = me.getEditWindow(),
            formPanel = me.getFormPanel(),
            form = formPanel.getForm();
        form.findField(field.fname).focus();
    }
})
