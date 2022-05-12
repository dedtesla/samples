Ext.define('Buh.classes.help.ButtonAskClick', {
    constructor: function () {
        let tipText = '';
        let args = arguments[0];
        this.callParent(arguments);
        this.tipText = args.text || '';
    },
    extend: 'Ext.Component',
    xtype: 'buttonaskclick',
    alias: 'widget.buttonaskclick',
    autoEl: {
        html: '',
        href: '',
        tag: 'a',
        cls: 'ico-faq-small tooltip-auto-container'
    },
    listeners: {
        render: function (cmp) {

            let me = this;
            cmp.getEl().on('click', function (e) {
                if (e.getTarget('div.tooltip-auto') == null) {
                    let cssClass = 'tooltip-auto';
                    if (window.innerHeight - cmp.getEl().getBottom() + window.pageYOffset < 210) {
                        cssClass += ' tooltip-top';
                    }
                    cmp.getEl().update('<div class="' + cssClass + '">' + me.tipText + '</div>');
                }
            });

            cmp.getEl().on('click', function (e) {
                e.preventDefault();
            });

        }
    }
});
