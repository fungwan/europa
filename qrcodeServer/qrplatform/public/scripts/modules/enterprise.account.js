/**
 * Created by san on 2015/12/1.
 */
define(function () {
    var module = {}, loaded = false;
    var imgDomain = "http://om5zzdb7m.bkt.clouddn.com/";

    /**
     * 获取企业信息成功
     * @param d 企业信息
     */
    function getEnterpriseInfoSuccess(d) {
        $(document.body).parseData(d.data);
        $("#logoImg").attr("src", imgDomain + d.data.imageurl + "-" + "title60");
    }

    /**
     * 获取企业信息
     */
    function getEnterpriseInfo() {
        $(document.body).action("getentinfo", {
            enable: false,
            message: "正在获取企业信息"
        }, false).then(getEnterpriseInfoSuccess);
    }

    /**
     * 提交企业信息
     */
    function submitEnterpiseInfo(e) {
        var res = $(".fw").serializeForm();
        if (res.hasError) {
            $("#ent-msg").notice(false, res.result);
        } else {
            $(e.currentTarget).action({
                url: "updateentinfo",
                data: res.result
            }, {
                enable: false,
                message: "正在保存企业信息"
            }).then(function () {
                $("#ent-msg").notice(true, "企业信息保存成功!");
                if (!account.updated) {
                    account.update = true;
                    document.body.classList.add("completed");
                }
            }, function (err) {
                $("#ent-msg").notice(false, err.message || "企业信息保存失败!");
            });
        }
    }

    function onButtonClick(e) {
        switch ($(e.currentTarget).val()) {
            case "save":
                submitEnterpiseInfo(e);
                break;
            case "close":
                document.body.classList.remove("completed");
                break;
            case "go":
                window.location.href = "do.html";
                break;
        }
    }

    // 初始化logo上传
    function initImgUploader () {
        var uploader = Qiniu.uploader({
            browse_button: 'logoFile',         // 上传选择的点选按钮，必需
            uptoken_url: '/uploader/getarticletoken',         // Ajax请求uptoken的Url，强烈建议设置（服务端提供）
            get_new_uptoken:false,             // 设置上传文件的时候是否每次都重新获取新的uptoken
            unique_names: true,              // 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
            save_key:false,                  // 默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
            domain: imgDomain,     // bucket域名，下载资源时用到，必需
            chunk_size: '500kb',                  // 分块上传时，每块的体积
            auto_start: true,                   // 选择文件后自动上传，若关闭需要自己绑定事件触发上传
            init: {
                'FilesAdded': function(up, files) {
                    $("#logoError").hide();
                    plupload.each(files, function(file) {
                        console.log('文件添加进队列后，处理相关的事情')
                    });
                },
                'BeforeUpload': function(up, file) {
                    console.log('每个文件上传前，处理相关的事情');
                },
                'UploadProgress': function(up, file) {
                    console.log('每个文件上传时，处理相关的事情');
                },
                'FileUploaded': function(up, file, info) {
                    var res = JSON.parse(info);
                    var imgUrl = imgDomain + res.key + "-" + "title60";
                    $("#logoImg").attr("src", imgUrl);
                    $("[name=imageurl]").val(res.key);
                },
                'Error': function(up, err, errTip) {
                    $("#logoError").show();
                },
                'UploadComplete': function() {
                },
                'Key': function(up, file) {
                    var key = "";
                    return key
                }
            }
        });
    }

    module.init = function () {
        if (!loaded) {
            navigation.direction("account");
            $(document.body).on("click", "button", onButtonClick);
            account.sign.listen("-enterprise-get", getEnterpriseInfo);
            initImgUploader();
            loaded = true;
        }
    };

    return module;
});