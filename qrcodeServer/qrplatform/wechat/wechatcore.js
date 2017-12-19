/**
 * Created by shane on 2015/12/10.
 */
var xml2js = require('xml2js');
var returnData =require('../common/returnData');
var logger = require('../common/logger');

var errinfo={
    e1:{code:'wechat_sysbusy',message:'系统繁忙，请稍候再试'},
    40001:{code:'wechat_appSecreterror',message:'获取access_token时AppSecret错误，或者access_token无效。'},
    40002:{code:'wechat_cererror',message:'不合法的凭证类型。'},
    40003:{code:'wechat_openiderror',message:'不合法的OpenID。'},
    40004:{code:'wechat_mediatypeerror',message:'不合法的媒体文件类型。'},
    40005:{code:'wechat_filetypeerror',message:'不合法的文件类型'},
    40006:{code:'wechat_filesizeerror',message:'不合法的文件大小'},
    40007:{code:'wechat_mediaiderror',message:'不合法的媒体文件id'},
    40008:{code:'wechat_messagetypeerror',message:'不合法的消息类型'},
    40009:{code:'wechat_imagesizeerror',message:'不合法的图片文件大小'},
    40010:{code:'wechat_wavesizeerror',message:'不合法的语音文件大小'},
    40011:{code:'wechat_videosizeerror',message:'不合法的视频文件大小'},
    40012:{code:'wechat_viewsizeerror',message:'不合法的缩略图文件大小'},
    40013:{code:'wechat_appiderror',message:'不合法的AppID'},
    40014:{code:'wechat_accesstokenerror',message:'不合法的access_token'},
    40015:{code:'wechat_menutypeerror',message:'不合法的菜单类型'},
    40016:{code:'wechat_buttonnumbererror',message:'不合法的按钮个数'},
    40017:{code:'wechat_buttonnumbererror',message:'不合法的按钮个数'},
    40018:{code:'wechat_buttonnameerror',message:'不合法的按钮名字长度'},
    40019:{code:'wechat_buttonkeyerror',message:'不合法的按钮KEY长度'},
    40020:{code:'wechat_buttonurlerror',message:'不合法的按钮URL长度'},
    40021:{code:'wechat_menuvererror',message:'不合法的菜单版本号'},
    40022:{code:'wechat_submenuleveerror',message:'不合法的子菜单级数'},
    40023:{code:'wechat_submenucounterr',message:'不合法的子菜单按钮个数'},
    40024:{code:'wechat_submenubuttonerr',message:'不合法的子菜单按钮类型'},
    40025:{code:'wechat_submenunameerr',message:'不合法的子菜单按钮名字长度'},
    40026:{code:'wechat_submenukeyerr',message:'不合法的子菜单按钮KEY长度'},
    40027:{code:'wechat_submenuurlerr',message:'不合法的子菜单按钮URL长度'},
    40028:{code:'wechat_submenuusererr',message:'不合法的自定义菜单使用用户'},
    40029:{code:'wechat_oauthcodeerr',message:'不合法的oauth_code'},
    40030:{code:'wechat_refreshtokenerr',message:'不合法的refresh_token'},
    40031:{code:'wechat_openidlisterr',message:'不合法的openid列表'},
    40032:{code:'wechat_openidcounterr',message:'不合法的openid列表长度'},
    40033:{code:'wechat_requestformaterr',message:'不合法的请求字符，不能包含格式的字符'},
    40035:{code:'wechat_parametererr',message:'不合法的参数'},
    40038:{code:'wechat_requestformaterr',message:'不合法的请求格式'},
    40039:{code:'wechat_urlsizeerr',message:'不合法的URL长度'},
    40050:{code:'wechat_groupiderr',message:'不合法的分组id'},
    40051:{code:'wechat_groupnameerr',message:'分组名字不合法'},
    40117:{code:'wechat_groupnameerr',message:'分组名字不合法'},
    40118:{code:'wechat_mediaiderr',message:'media_id大小不合法'},
    40119:{code:'wechat_buttontypeerr',message:'button类型错误'},
    40120:{code:'wechat_buttontypeerr',message:'button类型错误'},
    40121:{code:'wechat_mediaiderr',message:'不合法的media_id类型'},
    40132:{code:'wechat_acounterr',message:'微信号不合法'},
    40137:{code:'wechat_imagetypeerr',message:'不支持的图片格式'},
    41001:{code:'wechat_lostaccesstoken',message:'缺少access_token参数'},
    41002:{code:'wechat_lostappid',message:'缺少appid参数'},
    41003:{code:'wechat_lostrefreshtoken',message:'缺少refresh_token参数'},
    41004:{code:'wechat_lostsecret',message:'缺少secret参数'},
    41005:{code:'wechat_lostmedia',message:'缺少多媒体文件数据'},
    41006:{code:'wechat_lostmediaid',message:'缺少media_id参数'},
    41007:{code:'wechat_lostsubmenu',message:'缺少子菜单数据'},
    41008:{code:'wechat_lostoauthcode',message:'缺少oauth code'},
    41009:{code:'wechat_lostopenid',message:'缺少openid'},
    42001:{code:'wechat_accesstokenouttime',message:'access_token超时'},
    42002:{code:'wechat_refreshtokenouttime',message:'refresh_token超时'},
    42003:{code:'wechat_oauthcodeouttime',message:'oauth_code超时'},
    43001:{code:'wechat_mustbeget',message:'需要GET请求'},
    43002:{code:'wechat_mustbepost',message:'需要POST请求'},
    43003:{code:'wechat_mustbehttps',message:'需要HTTPS请求'},
    43004:{code:'wechat_mustfollow',message:'需要接收者关注'},
    43005:{code:'wechat_mustbefriend',message:'需要好友关系'},
    44001:{code:'wechat_mediaempty',message:'多媒体文件为空'},
    44002:{code:'wechat_postdataempty',message:'POST的数据包为空'},
    44003:{code:'wechat_imageempty',message:'图文消息内容为空'},
    44004:{code:'wechat_textempty',message:'文本消息内容为空'},
    45001:{code:'wechat_mediasizeerr',message:'多媒体文件大小超过限制'},
    45002:{code:'wechat_messagesizeerr',message:'消息内容超过限制'},
    45003:{code:'wechat_titlesizeerr',message:'标题字段超过限制'},
    45004:{code:'wechat_describesizeerr',message:'描述字段超过限制'},
    45005:{code:'wechat_linksizeerr',message:'链接字段超过限制'},
    45006:{code:'wechat_imglinksizeerr',message:'图片链接字段超过限制'},
    45007:{code:'wechat_playtimeerr',message:'语音播放时间超过限制'},
    45008:{code:'wechat_messagesizeerr',message:'图文消息超过限制'},
    45009:{code:'wechat_apiconnecterr',message:'接口调用超过限制'},
    45010:{code:'wechat_menucounterr',message:'创建菜单个数超过限制'},
    45015:{code:'wechat_callbacktimeerr',message:'回复时间超过限制'},
    45016:{code:'wechat_notallowedit',message:'系统分组，不允许修改'},
    45017:{code:'wechat_groupnamesizeerr',message:'分组名字过长'},
    45018:{code:'wechat_groupcounterr',message:'分组数量超过上限'},
    46001:{code:'wechat_mediaempty',message:'不存在媒体数据'},
    46002:{code:'wechat_menuvererr',message:'不存在的菜单版本'},
    46003:{code:'wechat_menuempty',message:'不存在的菜单数据'},
    46004:{code:'wechat_usererr',message:'不存在的用户'},
    47001:{code:'wechat_jsonorxmlerr',message:'解析JSON/XML内容错误'},
    48001:{code:'wechat_notallowaccess',message:'api功能未授权，请确认公众号已获得该接口'},
    50001:{code:'wechat_accountlimit',message:'用户未授权该api'},
    50002:{code:'wechat_accountforbit',message:'用户受限，可能是违规后接口被封禁'},
    61450:{code:'wechat_syserr',message:'系统错误'},
    61451:{code:'wechat_parametererr',message:'参数错误'},
    61452:{code:'wechat_parametererr',message:'无效客服账号'},
    61453:{code:'wechat_sysbusy',message:'客服帐号已存在'},
    61454:{code:'wechat_sysbusy',message:'客服帐号名长度超过限制'},
    61455:{code:'wechat_sysbusy',message:'客服帐号名包含非法字符(仅允许英文+数字)'},
    61456:{code:'wechat_sysbusy',message:'客服帐号个数超过限制(10个客服账号)'},
    61457:{code:'wechat_headimgerr',message:'无效头像文件类型'},
    61500:{code:'wechat_dateformaterr',message:'日期格式错误'},
    61501:{code:'wechat_daterangeerr',message:'日期范围错误'},
    9001001:{code:'wechat_parametererr',message:'POST数据参数不合法'},
    9001002:{code:'wechat_apierr',message:'远端服务不可用'},
    9001003:{code:'wechat_ticketerr',message:'Ticket不合法'},
    9001004:{code:'wechat_sysbusy',message:'获取摇周边用户信息失败'},
    9001005:{code:'wechat_sysbusy',message:'获取商户信息失败'},
    9001006:{code:'wechat_getopenidfail',message:'获取OpenID失败'},
    9001007:{code:'wechat_uploadempty',message:'上传文件缺失'},
    9001008:{code:'wechat_uploadfileerr',message:'上传素材的文件类型不合法'},
    9001009:{code:'wechat_uploadsizeerr',message:'上传素材的文件尺寸不合法'},
    9001010:{code:'wechat_uploadfail',message:'上传失败'},
    9001020:{code:'wechat_accounterr',message:'帐号不合法'},
    9001021:{code:'wechat_sysbusy',message:'已有设备激活率低于50%，不能新增设备'},
    9001022:{code:'wechat_sysbusy',message:'设备申请数不合法，必须为大于0的数字'},
    9001023:{code:'wechat_sysbusy',message:'已存在审核中的设备ID申请'},
    9001024:{code:'wechat_sysbusy',message:'一次查询设备ID数量不能超过50'},
    9001025:{code:'wechat_sysbusy',message:'设备ID不合法'},
    9001026:{code:'wechat_sysbusy',message:'页面ID不合法'},
    9001027:{code:'wechat_sysbusy',message:'页面参数不合法'},
    9001028:{code:'wechat_sysbusy',message:'一次删除页面ID数量不能超过10'},
    9001029:{code:'wechat_sysbusy',message:'页面已应用在设备中，请先解除应用关系再删除'},
    9001030:{code:'wechat_sysbusy',message:'一次查询页面ID数量不能超过50'},
    9001031:{code:'wechat_sysbusy',message:'时间区间不合法'},
    9001032:{code:'wechat_sysbusy',message:'保存设备与页面的绑定关系参数错误'},
    9001033:{code:'wechat_sysbusy',message:'门店ID不合法'},
    9001034:{code:'wechat_sysbusy',message:'设备备注信息过长'},
    9001035:{code:'wechat_sysbusy',message:'设备申请参数不合法'},
    9001036:{code:'wechat_sysbusy',message:'查询起始值begin不合法'}
};

function createcallback (cb){
    var fun=function(error, response, body){
        if(error)
        {
            cb({code:returnData.errorType.unknow,message:error.message},null);
        }
        else{
            body=JSON.parse(body);
            if(body.errcode){
                var code=body.errcode;
                if(code==0){
                    cb(null,body);
                }
                else if(code==-1){
                    cb(errinfo.e1,null);
                }
                else{
                    cb(errinfo[code.toString()],null);
                }
            }
            else{
                cb(null,body);
            }
        }
    };
    return fun;
};

function xmlcreateCallback(err,response,body,cb){
    if(err){
        cb({code:returnData.errorType.unknow,message:err.message},null);
        return;
    }
    var parser = new xml2js.Parser({trim: true, explicitArray: false, explicitRoot: false});
    parser.parseString(body, function(error,result){
        if(error){
            cb({code:returnData.errorType.unknow,message:error.message},null);
            return;
        }
        else{
            if(result.result_code==='FAIL'){
               cb({code:result.err_code,message:result.err_code_des},null);
            }
            else{
                cb(null,result);
            }
        }
    });
};



exports.createcallback=createcallback;
exports.xmlcreateCallback=xmlcreateCallback;

