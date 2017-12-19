/**
 * Created by Yatagaras on 2015/12/7.
 */

/**
 *模型
 */
var customer = {
    createnew: function(){
        var info = {
            /**
             *主键ID
             */
            id: null,
            /**
             *编号
             */
            code:null,
            /**
             *父级编号
             */
            parentCode:null,
            /**
             *城市名称
             */
            name:'',
            /**
             *城市级别
             */
            level: 1,
            /**
             * 完整城市名称（包含上级行政单位）
             */
            full: ''
        }
        return info;
    }
};
module.exports = customer;
