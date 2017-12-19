/**
 * Created by Erathink on 2016/12/13.
 */


var merchandise = {
    createnew: function(){
        var info = {
            mcdid:'',
            mcdname: '',
            categoryid: '',
            categoryname: '',
            entid: '',
            price:0.0,
            point:0,
            mcdbrand:'',
            creator:'',
            createtime:null,
            updater:'',
            updatetime:null,
            mcddesc:'',
            state:''
        }
        return info;
    }
};
module.exports = merchandise;
