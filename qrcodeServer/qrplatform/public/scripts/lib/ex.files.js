/**
 * Created by Yatagaras on 2015/11/18.
 */

define("files", ["jquery"], function () {
    var module = {};

    $.fn.fileSelector = function () {
        var rv = this;
        if (arguments.length > 0 && this.length > 0) {
            var t = this.eq(0);
            if ($.isPlainObject(arguments[0])) {
                t.empty();
                var o = $.extend(true, {}, $.fn.fileSelector.defaultSettings, arguments[0]),
                    tUrl = $('<input type="text" readonly class="flex" name="' + (o.name || "tmpUrl") + '" />').attr(o.attr.url || {}),
                    tUploader = $('<button class="tU" disabled></button>').attr(o.attr.uploader || {}),
                    tFile = $('<input type="file" />').css({
                        position: "absolute",
                        top: -1000,
                        left: -1000
                    }).attr({
                        accept: o.accept || ""
                    });

                if (!tUrl.attr("placeholder")) tUrl.attr("placeholder", "点击选择文件");

                t.addClass("buttonGroup").append(tUrl).append(tUploader).append(tFile);
                core.language.install(t);

                if (o.multiple === true) tFile.attr("multiple", "multiple");
                if (o.upload.enable !== true || !o.upload.url)
                    tUploader.remove();
                else {
                    tUploader.unbind("click").click(function (e) {
                        var files = tFile.get(0).files;
                        if (!tUrl.validation() && files.length > 0) {
                            t.data("uploading", true);
                            var fd = new FormData();
                            $.each(files, function (_i, _file) {
                                fd.append("file_" + _i, _file);
                            });
                            tUploader.action({
                                url: o.upload.url,
                                data: fd,
                                contentType: false,
                                processData: false
                            }, false, true).then(o.upload.success, o.upload.fail).always(o.upload.complete, function () {
                                t.removeData("uploading");
                            });
                        }
                        return false;
                    });
                }

                tUrl.click(function (e) {
                    tFile.get(0).click();
                });

                tFile.click(function (e) {
                    e.stopPropagation();
                }).change(function (e) {
                    var _files = tFile.get(0).files, _names = [], _err = [];
                    if (_files.length > 0) {
                        tUploader.prop("disabled", false);
                        $.each(_files, function (i, f) {
                            _names.push(f.name);
                            if (f.size > o.maxSize) _err.push(f.name);
                        });
                        if (_err.length > 0) {
                            if (o.error && $.type(o.error) == "function")
                                o.error("message.error.fileSizeOver" + _err.join(", "));
                            else
                                tUrl.setError("message.error.fileSizeOver" + _err.join(", "));
                        }
                        tUrl.val(_names.join(", "));
                        if (o.change && $.type(o.change) == "function")
                            o.change(_files);
                    } else {
                        t.fileSelector("clear");
                    }

                    return false;
                });
            } else if ($.type(arguments[0]) == "string") {
                var tUrl = t.children("input[type=text]"), tUploader = t.children(".tU"), tFile = t.children("input[type=file]");
                switch (arguments[0]) {
                    case "clear":
                        if (t.data("uploading") !== true) {
                            tUrl.val("");
                            tUploader.prop("disabled", true);
                            tFile.val("").get(0).outerHTML = tFile.get(0).outerHTML;
                        }
                        break;
                }
            }
        }
        return rv;
    };

    $.fn.fileSelector.defaultSettings = {
        multiple: false, //是否可以多选文件
        name: null, //用于表达文件的名称
        accept: "", //允许选择的文件类型
        upload: {
            enable: true,
            url: "",
            success: null,
            fail: null,
            complete: null
        },
        change: null, //当文件选择发生改变时
        error: null,
        maxSize: 10240000, //单个文件最大大小，单位bytes，默认为10MB
        attr: {
            url: {}, //地址文本控件
            uploader: {} //上传按钮控件
        } //控件属性
    };

    return module;
});