/**
 * Created by taoj on 2015/11/30.
 */
var verifier = require('../../common/tool').verifier;

/**
 * list 查询条件参数对象及验证定义
 * @type {{createNew: Function, verify: {begdate: (*|boolean), enddate: (*|boolean), state: (*|boolean)}}}
 */
var list = {
    createNew: function () {
        var info = {
            query: {
                begdate: '',
                enddate: '',
                key: '',
                state: '',
                type: ''
            },
            page: '1',
            size: '10'
        };
        return info;
    },
    verify: {
        page: verifier.isPage,
        size: verifier.isSize
    }
};
/**
 * 获取单个活动参数对象及验证定义
 * @type {{createNew: Function, verify: {id: (verifier.isNotAllowEmpty|Function)}}}
 */
var get = {
    createNew: function () {
        var info = {
            projectid: 'string'
        };
        return info;
    },
    verify: {
        projectid: verifier.isNotAllowEmpty
    }
};

/**
 * 获取单个活动参数对象及验证定义
 * @type {{createNew: Function, verify: {id: (verifier.isNotAllowEmpty|Function)}}}
 */
var lotteryget = {
    createNew: function () {
        var info = {
            type:'',
            projectid: 'string'
        };
        return info;
    },
    verify: {
        type: verifier.isNotAllowEmpty,
        projectid: verifier.isNotAllowEmpty
    }
};

var lotteryupdate = {
    createNew: function () {
        var info = {
            "lottery": {
                "projectid": "",
                "type": "",
                "enable":"",
                "config": {
                    "lotteryitems": [],
                    "saleitems": {},
                    "pointitems": {},                    
                    "qaitems": [],
                    "giftitems": {}
                }
            }
        }
        return info;
    },
    verify: {

    }
};

/**
 * 更新活动参数对象及验证定义
 * @type {{createNew: Function, verify: {name: (verifier.isNotAllowEmpty|Function)}}}
 */
var update = {
    createNew: function () {
        var info = {
            "project": {
                "projectid": "",
                "name": "",
                "shortname":"",
                "description": "",
                "begdate": "",
                "enddate": "",
                "customertype":"",
                "percent": 1,
                "qramounts": 0,
                config: {
                    rpitems: [],
                    qaitems: [],
                    pointitems: []
                },
                "type": "",
                "content": ""
            }
        }
        return info;
    },
    verify: {

    }
};
/**
 * 删除活动参数对象及验证定义
 * @type {{createNew: Function, verify: {id: (verifier.isNotAllowEmpty|Function)}}}
 */
var del = {
    createNew: function () {
        var info = {
            projectid: ''
        };
        return info;
    },
    verify: {
        projectid: verifier.isNotAllowEmpty
    }
};
/**
 * 开启活动参数对象及验证定义
 * @type {{createNew: Function, verify: {id: (verifier.isNotAllowEmpty|Function)}}}
 */
var start = {
    createNew: function () {
        var info = {
            projectid: ''
        };
        return info;
    },
    verify: {
        projectid: verifier.isNotAllowEmpty
    }
};
/**
 * 停止活动参数对象及验证定义
 * @type {{createNew: Function, verify: {id: (verifier.isNotAllowEmpty|Function)}}}
 */
var stop = {
    createNew: function () {
        var info = {
            projectid: ''
        };
        return info;
    },
    verify: {
        projectid: verifier.isNotAllowEmpty
    }
};
var preview ={
    createNew:function(){
        var info ={
            qrid:''
        };
        return info;
    },
    verify:{
        qrid:verifier.isNotAllowEmpty
    }
}
var reqcode={
    createNew:function(){
        var info ={
            projectid:''
            //type:''
        };
        return info;
    },
    verify:{
        projectid:verifier.isNotAllowEmpty
        //type:verifier.isNotAllowEmpty
    }
}
module.exports = {
    list: list,
    get: get,
    lotteryget: lotteryget,
    lotteryupdate: lotteryupdate,    
    update: update,
    delete: del,
    start: start,
    stop: stop,
    preview:preview,
    reqcode:reqcode
}