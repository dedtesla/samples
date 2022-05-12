Ext.define('Buh.classes.help.ButtonAsk', {
    constructor: function () {
        let tipText = '';
        let args = arguments[0];
        this.callParent(arguments);
        this.tipText = args.text || '';
        this._width = 'style="width:' + args._width + '"' || '';
    },
    extend: 'Ext.Component',
    xtype: 'buttonask',
    alias: 'widget.buttonask',
    autoEl: {
        html: '',
        href: '',
        tag: 'a',
        cls: 'ico-faq-small tooltip-container'
    },
    listeners: {
        render: function (cmp) {
            let me = this;
            cmp.getEl().on('click', function (e) {
                e.preventDefault();
                if (e.getTarget('a.tooltip-open')) {
                    cmp.removeCls('tooltip-open');
                } else if (e.getTarget('div.tooltip-white') == null) {
                    cmp.addClass('tooltip-open');
                    let cssClass = 'tooltip-white';
                    if (window.innerHeight - cmp.getEl().getBottom() + window.pageYOffset < 210) {
                        cssClass += ' tooltip-top';
                    }
                    cmp.getEl().update('<div class="' + cssClass + '" ' + me._width + '>' + me.tipText + '</div>');
                }
            });
        }
    }
});
