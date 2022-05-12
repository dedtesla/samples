Ext.define('Buh.classes.bookbuy.DocTypesEdit', {
    extend: 'Ext.data.ArrayStore',
    fields: ['id', 'name'],
    storeId: 'bookbuyDocTypesEdit',
    batchUpdateMode: 'complete',
    data: [
        ["9", "����� ��-� �� �����"],
        ["8", "��-� �� �����"],
        ["4", "��-�������"],
        ["18", "���"],
        //["19", "���� �-�"]
    ],
    proxy: {
        type: 'memory'
    }
});
new Buh.classes.bookbuy.DocTypesEdit();
