/**
 * Окно мастера отправки e-mail.
 * Автономная реализация с вызовом из любого блока ПО.
 *
 * @since 04.21
 */
Ext.define('Buh.classes.window.EmailWindow', {
    constructor: function () {
        let args = arguments[0];
        this.callParent(arguments);
        if (args.data) {
            this.config.data = args.data;
        }
    },
    extend: 'winEditDoc',
    requires: ['Buh.classes.window.email.Form'],
    width: 700,
    layout: 'fit',
    cls: 'style2018 init_window toolbar-highlight',
    alias: 'widget.gbsemailwindow',
    shadow: false,
    closable: false,
    modal: true,
    config: {
        btnOk : 'Отправить',
        btnCancel : 'Отмена',
        formTitle : 'Отправить по электронной почте',
        data: {
            recipient: '',
            recipientEmail: '',
            lastName: '',
            middleName: '',
            firstName: '',
            sender: '',
            senderEmail: '',
            subject: '',
            message: '',
            messageTpl: '',
            fileName: '',
            file: '',
            action: '',
            fileTypes: {
                pdf: true,
                xls: true,
                doc: false
            },
        },
    },
    items: [{
        xtype: 'gbsemailform'
    }],
    initComponent: function () {
        this.callParent();

        let task = function() {
            this.fireEvent('onScroll');
        };

        Ext.apply(this, {
            listeners: {
                'close' : function (th, en) {
                    this.caller = null;
                    winBuhManager.unmaskTop(this);
                    let viewport = Ext.ComponentQuery.query('viewport');
                    if(viewport.length) {
                        viewport[0].un('resize', task, this);
                    }
                    Ext.fly(window.document).un('scroll', task, this);
                },
                onScroll: function() {
                    if (!this.rendered) return;

                    let win = this,
                        toolbar = win.getDockedComponent(0) || win.down('toolbar'),
                        body = Ext.getBody(),
                        bodyHeight = body.getViewSize().height,
                        scrollPosition = body.getScroll(),
                        parent = toolbar.ownerCt,
                        pos = parent.getPosition(),
                        height = parent.getHeight(),
                        tbheight = toolbar.getHeight() - 1,
                        maxtop = height - tbheight,
                        top = bodyHeight - pos[1] + scrollPosition.top - tbheight,
                        y = Math.min(top, maxtop);

                    toolbar.setPosition({x: null, y: y});
                },
                show: function() {
                    winBuhManager.maskTop(this);
                    let viewport = Ext.ComponentQuery.query('viewport');
                    if(viewport.length) {
                        viewport[0].on('resize', task, this);
                    }
                    Ext.fly(window.document).on('scroll', task, this);
                    this.fireEvent('onScroll');
                },
                afterrender: function() {
                    this.addEvents('onScroll');
                }
            }
        });
    }

});
