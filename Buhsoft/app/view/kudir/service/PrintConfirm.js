Ext.define('Buh.view.kudir.service.PrintConfirm', {
    extend: 'winEditDoc',
    modal: true,
    width: 600,
    btn1: 'Распечатать',
    btn2: 'Скачать XLS',
    btn3: 'Отмена',
    title: 'Печать книги доходов и расходов',
    msg: '',
    fn1: '',
    _period: 0,
    initComponent: function () {
        let me = this;

        Ext.define('msg.Form', {
            extend: 'gbs.window.Form',

            initComponent: function () {
                Ext.apply(this, {
                    title: me.title,
                    yearFix: Ext.getCmp('mainPanelKudir').down('toolbar').down('gbs_combo_year').getValue(),
                    dockedItems: [{
                        xtype: 'toolbar',
                        dock: 'bottom',
                        ui: 'footer',
                        items: [
                            {
                                text: me.btn1,
                                xtype: 'greenbuttonsimple',
                                scope: this,
                                handler: this.onBtn1
                            },
                            {
                                text: me.btn2,
                                cls: 'grey-btn',
                                scope: this,
                                handler: this.onBtn2
                            },
                            {
                                text: me.btn3,
                                scope: this,
                                handler: this.onCancel
                            }
                        ]
                    }]
                });

                this.callParent();
            },
            onBtn1: function () {
                let me = this;
                if (isPayed()) {
                    if (Ext.get('iFramePrintDirect') != _dummy) {
                        Ext.get('iFramePrintDirect').remove();
                    }

                    crmEvent('buh', 'D2487E1C-C1FB-4295-B1E2-046F83A69EF2', false, false);

                    let printFrame = Ext.create('Buh.classes.container.IFramePrintDirect', {
                        src: dir_start_buh_ + "frm_kndr21.php?type_doc_convert=pdf&directprint=true&year=" + me.yearFix
                    });

                    let iFrame = printFrame.el.dom.firstChild.contentWindow;

                    iFrame.focus();
                    iFrame.print();
                }
                me.up('window').close();
            },
            onBtn2: function () {
                let me = this;
                if (isPayed()) {
                    crmEvent('buh', 'E8240D66-A172-421B-8BF9-223568B08375', false, false);
                    window.location.href = dir_start_buh_ + "frm_kndr21.php?year=" + me.yearFix;
                }
                me.up('window').close();
            },
            onCancel: function () {
                this.up('window').close();
            }
        });

        Ext.apply(me, {
            items: Ext.create('msg.Form')
        });

        me.callParent();
    }
});
