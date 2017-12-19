/**
 * Created by san on 2015/12/1.
 */
define(function () {
    var module = {}, loaded = false, submitBtn = $("#submit");

    /**
     * 获取企业信息成功
     * @param d 企业信息
     */
    function getEnterpriseInfoSuccess(d) {
        var _body = $(document.body).parseData(d.data);
    }

    /**
     * 获取企业信息
     */
    function getEnterpriseInfo() {
        submitBtn.action("getentinfo", {
            enable: false,
            message: "正在获取企业信息"
        }).then(getEnterpriseInfoSuccess);
    }

    /**
     * 提交企业信息
     */
    function submitEnterpiseInfo() {
        var res = $(document.body).serializeForm();
        if (res.hasError) {

        } else {
            submitBtn.action({
                url: "updateentinfo",
                data: res.result
            },{
                enable: false,
                message: "正在保存企业信息"
            }).then(function() {
                $("#ent-msg").notice(true, "保存企业信息成功!");
            }, function(err) {
                $("#ent-msg").notice(false, err.message || "保存企业信息成功!");
            });
        }
    }

    module.init = function () {
        if (!loaded) {
            getEnterpriseInfo();
            $("#submit").click(submitEnterpiseInfo);
            loaded = true;
        }
    };

    return module;
});