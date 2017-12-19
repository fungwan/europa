
/**
 * created by liyu on 2017/5/26
 * @param   btn:上传图片的按钮；
 * @param   uptoken_url：获取token的url；
 * @param   domain：bucket域名，下载资源时用到，必需
 * @param  callback：上传成功回调
 */
    window.APP.factory('fileuploadService', ['$rootScope', function($rootScope) {
    var qiNiu={};
    qiNiu.init=function(btn,uptoken_url,domain,callback){
        Qiniu.uploader({
            browse_button: btn,
            uptoken_url: uptoken_url,
            get_new_uptoken: false,
            unique_names: true, // 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
            save_key: false, // 默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
            domain: domain, // bucket域名，下载资源时用到，必需
            chunk_size: '4mb', // 分块上传时，每块的体积
            auto_start: true, // 选择文件后自动上传，若关闭需要自己绑定事件触发上传
            init: {
                'FileUploaded': function(up, file, info) {
                    callback(info)
                },
                'Key': function(up, file) {
                    var key = "";
                    return key
                }
            }
        });
    };
    return qiNiu;
}]);