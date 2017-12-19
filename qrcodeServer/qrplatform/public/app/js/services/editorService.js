
/**
 * created by xdf on 2017/4/17
 * @param   btn:上传图片的按钮；
 *  @param   container:编辑器容器；
 * @param   uptoken_url：获取token的url；
 * @param   domain：bucket域名，下载资源时用到，必需
 * @param  callback：编辑输入的回调
 */
window.APP.factory('editorService', ['$rootScope','MessageService',function($rootScope,MessageService) {
    var editor={};
    editor.init=function(container,uptoken_url,domain,callback){
        var editor = new wangEditor(container);
        editor.config.menus = $.map(wangEditor.config.menus, function(item, key) {
            if (item === 'insertcode') {
                return null;
            }
            if (item === 'fullscreen') {
                return null;
            }
            if (item === 'location') {
                return null;
            }
            if (item === 'video') {
                return null;
            }
            if (item === 'emotion') {
                return null;
            }
            return item;
        });

        function uploadInit() {
            // this 即 editor 对象
            var editor = this;
            // 触发选择文件的按钮的id
            var btnId = editor.customUploadBtnId;
            // 触发选择文件的按钮的父容器的id
            var containerId = editor.customUploadContainerId;

            // 创建上传对象
            var uploader = Qiniu.uploader({
                browse_button: btnId, //上传选择的点选按钮，**必需**
                uptoken_url: uptoken_url,
                get_new_uptoken: false,
                unique_names: true,
                save_key: false,
                domain: domain,
                container: containerId, //上传区域DOM ID，默认是browser_button的父元素，
                chunk_size: '4mb', //分块上传时，每片的体积
                auto_start: true, //选择文件后自动上传，若关闭需要自己绑定事件触发上传
                init: {
                    'UploadProgress': function(up, file) {
                        editor.showUploadProgress(file.percent);
                    },
                    Error: function (up, err, errTip) {
                      console.log(up);
                        console.log(err);
                        console.log(errTip);
                        MessageService.error($rootScope,'上传失败')
                    },
                    'FileUploaded': function(up, file, info) {
                        MessageService.success($rootScope,'上传成功！')
                        var res = JSON.parse(info);
                        var sourceLink = domain + res.key;
                        editor.command(null, 'insertHtml', '<img src="' + sourceLink + '" style="max-width:100%;"/>')
                    },
                    'UploadComplete': function() {
                        editor.hideUploadProgress();
                    }
                }
            });
        }
        editor.config.customUpload = true; // 设置自定义上传的开关
        editor.config.customUploadInit = uploadInit; // 配置自定义上传初始化事件，uploadInit方法在上面定义了
        editor.onchange = function() {
            callback(this.$txt.html())
        };
        editor.create();
    };
    return editor;
}]);