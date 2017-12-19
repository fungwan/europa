// 七牛文件上传初始化服务
window.APP.factory("QiniuUploaderService", [
        "$rootScope", 
        "MessageService", 
        "UtilService", 
        function ($rootScope, MessageService, UtilService) {

    var service = {};
    // 默认设置
    var defaultOptions = {
        runtimes: 'html5, flash, html4',
        max_file_size: '100mb',
        dragdrop: false,
        chunk_size: '4mb',
        multi_selection: true,
        auto_start: true,
        get_new_uptoken: false,             
        unique_names: true,
        save_key: false 
    };
    // 初始化基础上传
    service.initUploader = function (options) {
        var uploader = Qiniu.uploader($.extend(true, {}, defaultOptions, options));
        return uploader;
    };
    // 初始化图片上传
    service.initImgUploader = function (options) {
        var options = $.extend(true, {
            filters: {
                mime_types: [
                    {title: "Image files", extensions: 'jpg,jpeg,gif,png'}
                ]
            },
            init: {
                FilesAdded: function (up, files) {
                    UtilService.startLoading();
                },
                Error: function (up, err, errTip) {
                    MessageService.error($rootScope, "图片上传失败，请稍后尝试！");
                    UtilService.stopLoading();
                },
                UploadComplete: function () {
                    MessageService.success($rootScope, "图片上传成功！");
                    UtilService.stopLoading();
                }
            }
        }, options);
        return this.initUploader(options);
    };

    return service;
}]);