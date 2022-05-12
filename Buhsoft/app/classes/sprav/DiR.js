Ext.define('Buh.classes.sprav.DiR', {

    getArrFilter: function (_inp) {
        var _pr_ras = 1;
        switch (_inp * 1) {
            case 1:
                _pr_ras = 1;
                break
            case 2:
                _pr_ras = 2;
                break
            case 100:
                _pr_ras = 1;
                break
            case 110:
                _pr_ras = 2;
                break
        }
        var arrFiltVid = ['1', '2', '3', '30', '31', '32', '4', '40', '41', '5'];
        if (_pr_ras == 1) {
            arrFiltVid['1'] = ['31', '63', '119'];
            arrFiltVid['2'] = ['32', '119'];
            arrFiltVid['3'] = ['85', '105', '80', '37', '63', '119'];
            arrFiltVid['30'] = ['85', '105', '80', '37', '63', '119'];
            arrFiltVid['31'] = ['33', '34', '36', '46', '47', '48', '50', '51', '52', '55', '56', '57', '61', '62', '86', '63', '119', '123'];
            arrFiltVid['32'] = ['49', '96', '63', '119'];
            arrFiltVid['5'] = ['38', '93', '84', '103', '89', '75', '63', '119'];
        }
        else {
            arrFiltVid['1'] = ['7', '120'];
            arrFiltVid['2'] = ['11', '12', '13', '120'];
            arrFiltVid['3'] = ['106', '8', '120'];
            arrFiltVid['30'] = ['106', '8', '120'];
            arrFiltVid['4'] = ['2', '120'];
            arrFiltVid['40'] = ['2', '120'];
            arrFiltVid['41'] = ['83', '4', '5', '77', '95', '15', '16', '20', '21', '120', '113'];
            arrFiltVid['5'] = ['3', '90', '94', '76', '92', '97', '104', '82', '120'];
        }

        return arrFiltVid;
    }
});




