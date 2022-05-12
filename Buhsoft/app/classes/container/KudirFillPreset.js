Ext.define('Buh.classes.container.KudirFillPreset',
    {
        extend: 'Ext.container.Container',
        xtype: 'kudirfillpreset',
        alias: 'widget.kudirfillpreset',
        requires: ['Buh.classes.container.Vertical'],
        cls: 'container-align-small',
        presetCache: null,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [
            {
                xtype: 'cont_vert',
                cls: 'container-align-small',
                name: 'cnt-exclusions',
                hidden: true,
                itm: [
                    {
                        xtype: 'checkbox',
                        name: 'exclusionsAll',
                        boxLabelAlign: 'after',
                        checked: false,
                        boxLabel: 'Отменить исключения автозаполненных записей',
                        listeners: {
                            change: function () {
                                let me = this, chkbox = me.up('container').down('[name=exclusions-section1]');

                                me.up('container').down('[name=cnt-exclusions-sections]').preventEvents = true;

                                if (me.getValue()) {
                                    me.up('container').down('[name=cnt-exclusions-sections]').show();
                                    me.up('container').down('[name=exclusions-section1]').setValue(true);
                                    me.up('container').down('[name=exclusions-section2]').setValue(true);
                                    me.up('container').down('[name=exclusions-section4]').setValue(true);
                                    me.up('container').down('[name=exclusions-section5]').setValue(true);
                                } else {
                                    me.up('container').down('[name=exclusions-section1]').setValue(false);
                                    me.up('container').down('[name=exclusions-section2]').setValue(false);
                                    me.up('container').down('[name=exclusions-section4]').setValue(false);
                                    me.up('container').down('[name=exclusions-section5]').setValue(false);
                                    me.up('container').down('[name=cnt-exclusions-sections]').hide();
                                }

                                me.up('container').down('[name=cnt-exclusions-sections]').preventEvents = false;
                                me.up('container').up('container').bookFillPreset();
                            }
                        }
                    },
                    {
                        xtype: 'cont_vert',
                        margin: '6 0 6 25',
                        name: 'cnt-exclusions-sections',
                        hidden: true,
                        preventEvents: false,
                        itm: [
                            {
                                xtype: 'checkbox',
                                name: 'exclusions-section1',
                                boxLabelAlign: 'after',
                                checked: false,
                                hidden: true,
                                boxLabel: 'В разделе 1',
                                listeners: {
                                    change: function () {
                                        let me = this, _topContainer = me.up('container').up('container').up('container');
                                        if (!me.up('container').preventEvents) {
                                            _topContainer.bookFillPreset();
                                            _topContainer.validateParentCheckBox();
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'checkbox',
                                name: 'exclusions-section2',
                                boxLabelAlign: 'after',
                                checked: false,
                                hidden: true,
                                boxLabel: 'В разделе 2',
                                listeners: {
                                    change: function () {
                                        let me = this, _topContainer = me.up('container').up('container').up('container');
                                        if (!me.up('container').preventEvents) {
                                            _topContainer.bookFillPreset();
                                            _topContainer.validateParentCheckBox();
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'checkbox',
                                name: 'exclusions-section4',
                                boxLabelAlign: 'after',
                                checked: false,
                                hidden: true,
                                boxLabel: 'В разделе 4',
                                listeners: {
                                    change: function () {
                                        let me = this, _topContainer = me.up('container').up('container').up('container');
                                        if (!me.up('container').preventEvents) {
                                            _topContainer.bookFillPreset();
                                            _topContainer.validateParentCheckBox();
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'checkbox',
                                name: 'exclusions-section5',
                                boxLabelAlign: 'after',
                                checked: false,
                                hidden: true,
                                boxLabel: 'В разделе 5',
                                listeners: {
                                    change: function () {
                                        let me = this, _topContainer = me.up('container').up('container').up('container');
                                        if (!me.up('container').preventEvents) {
                                            _topContainer.bookFillPreset();
                                            _topContainer.validateParentCheckBox();
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'cont_vert',
                cls: 'container-align-small',
                name: 'cnt-dirties',
                hidden: true,
                preventEvents: false,
                itm: [
                    {
                        xtype: 'checkbox',
                        name: 'dirtiesAll',
                        boxLabelAlign: 'after',
                        checked: false,
                        boxLabel: 'Отменить изменения автозаполненных записей',
                        listeners: {
                            change: function () {
                                let me = this;

                                me.up('container').down('[name=cnt-dirties-sections]').preventEvents = true;

                                if (me.getValue()) {
                                    me.up('container').down('[name=cnt-dirties-sections]').show();
                                    me.up('container').down('[name=dirties-section1]').setValue(true);
                                    me.up('container').down('[name=dirties-section2]').setValue(true);
                                    me.up('container').down('[name=dirties-section4]').setValue(true);
                                    me.up('container').down('[name=dirties-section5]').setValue(true);
                                } else {
                                    me.up('container').down('[name=cnt-dirties-sections]').hide();
                                    me.up('container').down('[name=dirties-section1]').setValue(false);
                                    me.up('container').down('[name=dirties-section2]').setValue(false);
                                    me.up('container').down('[name=dirties-section4]').setValue(false);
                                    me.up('container').down('[name=dirties-section5]').setValue(false);
                                }

                                me.up('container').down('[name=cnt-dirties-sections]').preventEvents = false;
                                me.up('container').up('container').bookFillPreset();
                            }
                        }
                    },
                    {
                        xtype: 'cont_vert',
                        margin: '6 0 6 25',
                        name: 'cnt-dirties-sections',
                        hidden: true,
                        preventEvents: false,
                        itm: [
                            {
                                xtype: 'checkbox',
                                name: 'dirties-section1',
                                boxLabelAlign: 'after',
                                checked: false,
                                hidden: true,
                                boxLabel: 'В разделе 1',
                                listeners: {
                                    change: function () {
                                        let me = this, _topContainer = me.up('container').up('container').up('container');
                                        if (!me.up('container').preventEvents) {
                                            _topContainer.bookFillPreset();
                                            _topContainer.validateParentCheckBox();
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'checkbox',
                                name: 'dirties-section2',
                                boxLabelAlign: 'after',
                                checked: false,
                                hidden: true,
                                boxLabel: 'В разделе 2',
                                listeners: {
                                    change: function () {
                                        let me = this, _topContainer = me.up('container').up('container').up('container');
                                        if (!me.up('container').preventEvents) {
                                            _topContainer.bookFillPreset();
                                            _topContainer.validateParentCheckBox();
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'checkbox',
                                name: 'dirties-section4',
                                boxLabelAlign: 'after',
                                checked: false,
                                hidden: true,
                                boxLabel: 'В разделе 4',
                                listeners: {
                                    change: function () {
                                        let me = this, _topContainer = me.up('container').up('container').up('container');
                                        if (!me.up('container').preventEvents) {
                                            _topContainer.bookFillPreset();
                                            _topContainer.validateParentCheckBox();
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'checkbox',
                                name: 'dirties-section5',
                                boxLabelAlign: 'after',
                                checked: false,
                                hidden: true,
                                boxLabel: 'В разделе 5',
                                listeners: {
                                    change: function () {
                                        let me = this, _topContainer = me.up('container').up('container').up('container');
                                        if (!me.up('container').preventEvents) {
                                            _topContainer.bookFillPreset();
                                            _topContainer.validateParentCheckBox();
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'cont_vert',
                cls: 'container-align-small',
                name: 'cnt-manuals',
                hidden: true,
                itm: [
                    {
                        xtype: 'checkbox',
                        name: 'manualsAll',
                        boxLabelAlign: 'after',
                        checked: false,
                        boxLabel: 'Удалить ручные записи',
                        listeners: {
                            change: function () {
                                let me = this;

                                me.up('container').down('[name=cnt-manuals-sections]').preventEvents = true;

                                if (me.getValue()) {
                                    me.up('container').down('[name=cnt-manuals-sections]').show();
                                    me.up('container').down('[name=manuals-section1]').setValue(true);
                                    me.up('container').down('[name=manuals-section2]').setValue(true);
                                    me.up('container').down('[name=manuals-section4]').setValue(true);
                                    me.up('container').down('[name=manuals-section5]').setValue(true);
                                } else {
                                    me.up('container').down('[name=cnt-manuals-sections]').hide();
                                    me.up('container').down('[name=manuals-section1]').setValue(false);
                                    me.up('container').down('[name=manuals-section2]').setValue(false);
                                    me.up('container').down('[name=manuals-section4]').setValue(false);
                                    me.up('container').down('[name=manuals-section5]').setValue(false);
                                }

                                me.up('container').down('[name=cnt-manuals-sections]').preventEvents = false;
                                me.up('container').up('container').bookFillPreset();
                            }
                        }
                    },
                    {
                        xtype: 'cont_vert',
                        margin: '6 0 6 25',
                        name: 'cnt-manuals-sections',
                        hidden: true,
                        preventEvents: false,
                        itm: [
                            {
                                xtype: 'checkbox',
                                name: 'manuals-section1',
                                boxLabelAlign: 'after',
                                checked: false,
                                hidden: true,
                                boxLabel: 'В разделе 1',
                                listeners: {
                                    change: function () {
                                        let me = this, _topContainer = me.up('container').up('container').up('container');
                                        if (!me.up('container').preventEvents) {
                                            _topContainer.bookFillPreset();
                                            _topContainer.validateParentCheckBox();
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'checkbox',
                                name: 'manuals-section2',
                                boxLabelAlign: 'after',
                                checked: false,
                                hidden: true,
                                boxLabel: 'В разделе 2',
                                listeners: {
                                    change: function () {
                                        let me = this, _topContainer = me.up('container').up('container').up('container');
                                        if (!me.up('container').preventEvents) {
                                            _topContainer.bookFillPreset();
                                            _topContainer.validateParentCheckBox();
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'checkbox',
                                name: 'manuals-section4',
                                boxLabelAlign: 'after',
                                checked: false,
                                hidden: true,
                                boxLabel: 'В разделе 4',
                                listeners: {
                                    change: function () {
                                        let me = this, _topContainer = me.up('container').up('container').up('container');
                                        if (!me.up('container').preventEvents) {
                                            _topContainer.bookFillPreset();
                                            _topContainer.validateParentCheckBox();
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'checkbox',
                                name: 'manuals-section5',
                                boxLabelAlign: 'after',
                                checked: false,
                                hidden: true,
                                boxLabel: 'В разделе 5',
                                listeners: {
                                    change: function () {
                                        let me = this, _topContainer = me.up('container').up('container').up('container');
                                        if (!me.up('container').preventEvents) {
                                            _topContainer.bookFillPreset();
                                            _topContainer.validateParentCheckBox();
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        ],
        listeners: {
            afterrender: function () {
                let me = this;

                me.presetCache = {
                    excl1: 0,
                    excl2: 0,
                    excl4: 0,
                    excl5: 0,
                    dirt1: 0,
                    dirt2: 0,
                    dirt4: 0,
                    dirt5: 0,
                    manl1: 0,
                    manl2: 0,
                    manl4: 0,
                    manl5: 0
                };
            }
        },
        bookFillPreset: function() {
            let me = this, chkbox = me.down('[name=exclusions-section1]');

            me.presetCache.excl1 = iif((chkbox.isVisible() && chkbox.getValue()), 1, 0);

            chkbox = me.down('[name=exclusions-section2]');
            me.presetCache.excl2 = iif((chkbox.isVisible() && chkbox.getValue()), 1, 0);

            chkbox = me.down('[name=exclusions-section4]');
            me.presetCache.excl4 = iif((chkbox.isVisible() && chkbox.getValue()), 1, 0);

            chkbox = me.down('[name=exclusions-section5]');
            me.presetCache.excl5 = iif((chkbox.isVisible() && chkbox.getValue()), 1, 0);

            chkbox = me.down('[name=dirties-section1]');
            me.presetCache.dirt1 = iif((chkbox.isVisible() && chkbox.getValue()), 1, 0);

            chkbox = me.down('[name=dirties-section2]');
            me.presetCache.dirt2 = iif((chkbox.isVisible() && chkbox.getValue()), 1, 0);

            chkbox = me.down('[name=dirties-section4]');
            me.presetCache.dirt4 = iif((chkbox.isVisible() && chkbox.getValue()), 1, 0);

            chkbox = me.down('[name=dirties-section5]');
            me.presetCache.dirt5 = iif((chkbox.isVisible() && chkbox.getValue()), 1, 0);

            chkbox = me.down('[name=manuals-section1]');
            me.presetCache.manl1 = iif((chkbox.isVisible() && chkbox.getValue()), 1, 0);

            chkbox = me.down('[name=manuals-section2]');
            me.presetCache.manl2 = iif((chkbox.isVisible() && chkbox.getValue()), 1, 0);

            chkbox = me.down('[name=manuals-section4]');
            me.presetCache.manl4 = iif((chkbox.isVisible() && chkbox.getValue()), 1, 0);

            chkbox = me.down('[name=manuals-section5]');
            me.presetCache.manl5 = iif((chkbox.isVisible() && chkbox.getValue()), 1, 0);
        },
        validateParentCheckBox: function (extEvent = false) {
            let me = this, checkSum = 0, chkbox;

            if (extEvent === true) {
                if (parseInt(me.presetCache.excl_all) > 0) {
                    me.down('[name=cnt-exclusions]').show();
                    me.down('[name=exclusionsAll]').show();

                    if (me.presetCache.excl_section1 != undefined && parseInt(me.presetCache.excl_section1) > 0) {
                        me.down('[name=exclusions-section1]').show();
                    }

                    if (me.presetCache.excl_section2 != undefined && parseInt(me.presetCache.excl_section2) > 0) {
                        me.down('[name=exclusions-section2]').show();
                    }

                    if (me.presetCache.excl_section4 != undefined && parseInt(me.presetCache.excl_section4) > 0) {
                        me.down('[name=exclusions-section4]').show();
                    }

                    if (me.presetCache.excl_section5 != undefined && parseInt(me.presetCache.excl_section5) > 0) {
                        me.down('[name=exclusions-section5]').show();
                    }
                } else {
                    me.down('[name=exclusions-section1]').hide();
                    me.down('[name=exclusions-section2]').hide();
                    me.down('[name=exclusions-section4]').hide();
                    me.down('[name=exclusions-section5]').hide();
                    me.down('[name=exclusionsAll]').hide();
                    me.down('[name=cnt-exclusions]').hide();
                }
            } else {
                chkbox = me.down('[name=exclusionsAll]')
                checkSum = me.presetCache.excl1 + me.presetCache.excl2 + me.presetCache.excl4 + me.presetCache.excl5;
                chkbox.setValue(iif(checkSum > 0, true, false));
            }

            if (extEvent === true) {
                if (parseInt(me.presetCache.dirty_all) > 0) {
                    me.down('[name=cnt-dirties]').show();
                    me.down('[name=dirtiesAll]').show();

                    if (me.presetCache.dirty_section1 != undefined && parseInt(me.presetCache.dirty_section1) > 0) {
                        me.down('[name=dirties-section1]').show();
                    }

                    if (me.presetCache.dirty_section2 != undefined && parseInt(me.presetCache.dirty_section2) > 0) {
                        me.down('[name=dirties-section2]').show();
                    }

                    if (me.presetCache.dirty_section4 != undefined && parseInt(me.presetCache.dirty_section4) > 0) {
                        me.down('[name=dirties-section4]').show();
                    }

                    if (me.presetCache.dirty_section5 != undefined && parseInt(me.presetCache.dirty_section5) > 0) {
                        me.down('[name=dirties-section5]').show();
                    }
                } else {
                    me.down('[name=dirties-section1]').hide();
                    me.down('[name=dirties-section2]').hide();
                    me.down('[name=dirties-section4]').hide();
                    me.down('[name=dirties-section5]').hide();
                    me.down('[name=dirtiesAll]').hide();
                    me.down('[name=cnt-dirties]').hide();
                }
            } else {
                chkbox = me.down('[name=dirtiesAll]');
                checkSum = me.presetCache.dirt1 + me.presetCache.dirt2 + me.presetCache.dirt4 + me.presetCache.dirt5;
                chkbox.setValue(iif(checkSum > 0, true, false));
            }

            if (extEvent === true) {
                if (parseInt(me.presetCache.manual_all) > 0) {
                    me.down('[name=cnt-manuals]').show();
                    me.down('[name=manualsAll]').show();

                    if (me.presetCache.manual_section1 != undefined && parseInt(me.presetCache.manual_section1) > 0) {
                        me.down('[name=manuals-section1]').show();
                    }

                    if (me.presetCache.manual_section2 != undefined && parseInt(me.presetCache.manual_section2) > 0) {
                        me.down('[name=manuals-section2]').show();
                    }

                    if (me.presetCache.manual_section4 != undefined && parseInt(me.presetCache.manual_section4) > 0) {
                        me.down('[name=manuals-section4]').show();
                    }

                    if (me.presetCache.manual_section5 != undefined && parseInt(me.presetCache.manual_section5) > 0) {
                        me.down('[name=manuals-section5]').show();
                    }
                } else {
                    me.down('[name=manuals-section1]').hide();
                    me.down('[name=manuals-section2]').hide();
                    me.down('[name=manuals-section4]').hide();
                    me.down('[name=manuals-section5]').hide();
                    me.down('[name=manualsAll]').hide();
                    me.down('[name=cnt-manuals]').hide();
                }
            } else {
                chkbox = me.down('[name=manualsAll]');
                checkSum = me.presetCache.manl1 + me.presetCache.manl2 + me.presetCache.manl4 + me.presetCache.manl5;
                chkbox.setValue(iif(checkSum > 0, true, false));
            }
        }

    });
