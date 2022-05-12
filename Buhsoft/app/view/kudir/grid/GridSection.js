Ext.define('Buh.view.kudir.grid.GridSection', {
    extend: 'Ext.grid.Panel',
    requires: ['Buh.classes.dir.tovarDetail'],
    alias: 'widget.kudirsectiongrid',
    scroll: 'vertical',
    viewConfig: {
        trackOver: false,
        deferEmptyText: false,
        emptyText: "<div class='x-grid-empty'>Нет данных.<br>Нажмите &laquo;Заполнить&raquo; для загрузки информации из программы<br>или добавьте записи вручную.</div>",
        markDirty: false,
        preserveScrollOnRefresh: true,
        style: {overflow: 'auto', overflowX: 'hidden'}
    },
    store: null,
    maxWidth: 1300,
    cls: 'grid-multi-line dop_margin-top twoline_header',
    flex: 1,
    menu: Ext.create('Ext.menu.Menu', {
            cls: 'style2018 menu-gray',
            rec: null,
            grd: null,
            items: [
                {
                    text: 'Расшифровка',
                    name: 'menuExplain',
                    icon: _icons.calc,
                    handler: function () {
                        this.up('menu').grd.fireEvent('goExplain', this.up('menu').rec);
                    }
                }, {
                    text: 'Перейти к документу',
                    name: 'menuGoToDoc',
                    icon: _icons.doc,
                    handler: function () {
                        this.up('menu').grd.fireEvent('gotoDoc', this.up('menu').rec);
                    }
                }, {
                    text: 'Открыть карточку',
                    name: 'menuGoToCard',
                    icon: _icons.doc,
                    handler: function () {
                        this.up('menu').grd.fireEvent('goEditor', this.up('menu').rec);
                    }
                }, {
                    text: 'Перейти в справочник',
                    name: 'menuGoToRef',
                    icon: _icons.doc,
                    handler: function () {
                        this.up('menu').grd.fireEvent('gotoReference', this.up('menu').rec);
                    }
                }, {
                    text: 'Отменить исправления',
                    name: 'menuRollback',
                    icon: _icons.refresh,
                    handler: function () {
                        this.up('menu').grd.fireEvent('rollback', this.up('menu').rec);
                    }
                }, {
                    text: 'Копировать',
                    name: 'menuCopy',
                    icon: _icons.copy,
                    handler: function () {
                        this.up('menu').grd.fireEvent('copy', this.up('menu').rec);
                    }
                }, {
                    text: 'Изменить',
                    name: 'menuGoEditor',
                    icon: _icons.edit,
                    handler: function () {
                        this.up('menu').grd.fireEvent('goEditor', this.up('menu').rec);
                    }
                }, {
                    text: 'Исключить',
                    name: 'menuExclude',
                    icon: _icons.off,
                    handler: function () {
                        this.up('menu').grd.fireEvent('exclude', this.up('menu').rec);
                    }
                }, {
                    text: 'Вернуть запись',
                    name: 'menuInclude',
                    icon: _icons.refresh,
                    handler: function () {
                        this.up('menu').grd.fireEvent('include', this.up('menu').rec);
                    }
                }, {
                    text: 'Удалить',
                    name: 'menuDelete',
                    icon: _icons.del,
                    handler: function () {
                        this.up('menu').grd.fireEvent('delete', this.up('menu').rec);
                    }
                }
            ]
        }
    )
});
