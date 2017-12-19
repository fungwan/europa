/**
 * Created by 75339 on 2017/4/12.
 */
/**
 * Created by 75339 on 2017/3/1.
 */
window.APP.controller("commonditySaleCtrl", ["$scope", "PaginationService", "$http", "HostConfig", "MessageService","ConfirmService", "ValiService","QiniuUploaderService","editorService",function($scope, PaginationService, $http, HostConfig, MessageService,Confirm,vali,QiniuUploaderService,editor) {

    $scope.isCollapse = false;
    //用于提交文章的参数
    $scope.commondity = {
    };
    $scope.edit = {
    };
    $scope.toggleCollapse = function() {
        $scope.isCollapse = !$scope.isCollapse;
    };
    // 选择/全选/全不选
    $scope.tableItems = [];
    $scope.queryCondition = {
        key: "",
        begtime: "",
        endtime: "",
        state: ""
    };
    // 数据加载
    var query = function(page) {
        $http({
            method: "POST",
            url: "/club/getarticlebyentid",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
            data: $.param({
                pagenumber: page||1,
                pagerows: 5,
                key: $scope.queryCondition.key,
                entid: window.localStorage.getItem("entid"),
                begtime: $scope.queryCondition.begtime, //$scope.queryCondition.nickname
                endtime: $scope.queryCondition.endtime, //$scope.queryCondition.minlotterytime
                state: $scope.queryCondition.state //$scope.queryCondition.maxlotterytime
            })
        }).success(function(resp) {
            vali.check(resp);
            if (resp.data && resp.data.rows) {
                console.info("request success");
                $scope.tableItems = resp.data.rows;
                $scope.checkedItems = [];
                PaginationService.setContainer(".view-table").render({
                    page: page || 1,
                    size: 5,
                    total: parseInt(resp.data.count),
                    pageCount: Math.ceil(parseInt(resp.data.count) / 5),
                    scope: $scope
                });
            }
        }).error(function(err) {
            MessageService.error($scope, "保存失败！");
        });
    };
    query();
    $scope.query = function(page) {
        query(page);
    };
    $scope.queryReset = function() {
        $scope.queryCondition = {
            key: "",
            begtime: "",
            endtime: "",
            state: ""
        };
        query();
    };
    //deleteItems

    //添加文章
    $scope.showAddartcle = function() {
        $scope.commondity.content = '';
        $scope.showAddForm = true;
        $scope.commondity.artid = '';
        $scope.commondity.title = '';
        $scope.commondity.keyword = '';
        $scope.commondity.summary = '';
        $scope.commondity.author = '';
        $scope.commondity.authorurl = '';
        $scope.commondity.arttype = '';
        //$scope.commondity.state=item.state;
        $scope.commondity.publishtime = new Date();
        var nwdate=new Date();
        $scope.commondity.outtime = new Date(nwdate.setDate(nwdate.getDate()+1));
        //$scope.commondity.content=item.content;

        $scope.commondity.titleimageurl = '';
    };
    $scope.close = function() {
        MessageService.confirm({
            title: "提示",
            content: "确定取消吗？",
            confirm: function () {
                $scope.category = {
                    categoryid: "",
                    name: "",
                    categorydesc: ""
                };
                $scope.showAddForm = false;
                $scope.showEditForm = false;
                $scope.$apply();
            }
        });

    };
    $scope.closeform = function() {

        $scope.category = {
            categoryid: "",
            name: "",
            categorydesc: ""
        };
        $scope.showAddForm = false;
        $scope.showEditForm = false;



    };
    //初始化编辑器
    $scope.initEdit = function() {
        $scope.imgscan();
        editor.init('divedit','/uploader/getarticletoken',HostConfig.mall.articleimageurl,function(html){
            $scope.commondity.content =html;
        });
    };
    //save
    $scope.save = function() {
        if(!vali.Notempty($scope.commondity.title)){
            MessageService.error($scope, "标题为必填项！");
            return;
        }else if($scope.commondity.title.length>30){
            MessageService.error($scope, "标题不超过30个字！");
            return;
        }

        if(!vali.Notempty($scope.commondity.keyword)){
            MessageService.error($scope, "关键字为必填项！");
            return;
        }else if($scope.commondity.keyword.length>20){
            MessageService.error($scope, "关键字不超过20个字！");
            return;
        }

        if(!vali.Notempty($scope.commondity.summary)){
            MessageService.error($scope, "摘要为必填项！");
            return;
        }else if($scope.commondity.summary.length>200){
            MessageService.error($scope, "摘要不超过200个字！");
            return;
        }

        if(!vali.Notempty($scope.commondity.author)){
            MessageService.error($scope, "作者为必填项！");
            return;
        }else if($scope.commondity.author.length>10){
            MessageService.error($scope, "作者不超过10个字！");
            return;
        }
        if($scope.commondity.authorurl!=""){
            if(!vali.isUrl($scope.commondity.authorurl)){
                MessageService.error($scope, "原文地址请输入正确的URL！");
                return;
            }
        }
        if($scope.commondity.arttype==""){
            MessageService.error($scope, "请选择文章类型！");
            return;
        }
        if($scope.commondity.outtime<=$scope.commondity.publishtime){
            MessageService.error($scope, "过期时间应该大于发布时间！");
            return;
        }
        if(!$scope.commondity.titleimageurl){
            MessageService.error($scope, "请上传文章标题图片！");
            return;
        };
        $http({
            method: "POST",
            url: "/club/createAritle",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
            data: $.param({
                article: JSON.stringify({
                    title: $scope.commondity.title,
                    keyword: $scope.commondity.keyword,
                    summary: $scope.commondity.summary,
                    author: $scope.commondity.author,
                    authorurl: $scope.commondity.authorurl,
                    arttype: $scope.commondity.arttype,
                    publishtime: $scope.commondity.publishtime,
                    outtime: $scope.commondity.outtime,
                    content: $scope.commondity.content,
                    istop: '0',
                    ishot: '0',
                    titleimageurl: $scope.commondity.titleimageurl
                })
            })
        }).success(function(resp) {
            vali.check(resp);
            if (resp && resp.data != undefined) {
                if (resp.error) {
                    MessageService.error($scope, "保存失败！");
                } else {
                    if (resp.data) {
                        //成功了
                        MessageService.success($scope, "保存成功！");
                        $scope.closeform();
                        $scope.query();
                    } else {
                        //出错了
                        MessageService.error($scope, "保存失败！");
                    }
                }

            }
        }).error(function(err) {
            MessageService.error($scope, "保存失败！");
        });
    };
    //图片上传预览
    $scope.imgscan = function() {

        QiniuUploaderService.initImgUploader({
            browse_button: "pickfiles",
            uptoken_url: "/uploader/getarticletoken",
            domain: HostConfig.mall.articleimageurl,
            init: {
                FileUploaded: function (up, file, info) {
                    var res = JSON.parse(info);
                    $scope.commondity.titleimageurl = res.key;
                    $("#scanimg").attr({ 'src': HostConfig.mall.articleimageurl + res.key + "-" + HostConfig.mall.articleimage60style })
                    $scope.$apply();
                }
            }
        });
    };
    $scope.initscan=function(){
        $scope.imgscan();
    };
    //文章停用
    $scope.stopArticle = function(item) {
        MessageService.confirm({
            title: "提示？",
            content: "确定停用吗？",
            confirm: function () {
                $http({
                    method: "POST",
                    url: "/club/delarticle",
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                    data: $.param({
                        artid: item
                    })
                }).success(function(data) {
                    vali.check(data);
                    if (data.error) {
                        MessageService.error($scope, "失败！");
                    } else {
                        if (data.data.length != 0) {
                            $scope.query();
                        }
                    }
                }).error(function(err) {
                    MessageService.error($scope, "异常！");
                });
            }
        });

    };
    //编辑文章初始化
    $scope.showEditArtcle = function(item) {
        $scope.showEditForm = true;
        $http({
            method: "POST",
            url: "/club/getarticlebyid",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
            data: $.param({
                artid: item.artid
            })
        }).success(function(resp) {
            vali.check(resp);
            if (resp && resp.data) {
                //console.log(resp.data.content);
                var html = resp.data.content;
                $("#divedit").html(html);
            }
        });
        $scope.commondity.artid = item.artid;
        $scope.commondity.title = item.title;
        $scope.commondity.keyword = item.keyword;
        $scope.commondity.summary = item.summary;
        $scope.commondity.author = item.author;
        $scope.commondity.authorurl = item.authorurl || "";
        $scope.commondity.arttype = item.arttype;
        //$scope.commondity.state=item.state;
        $scope.commondity.publishtime = new Date(item.publishtime);
        $scope.commondity.outtime = new Date(item.outtime);
        //$scope.commondity.content=item.content;
        $scope.configurl = HostConfig.mall.articleimageurl;
        $scope.configstyle = HostConfig.mall.articleimage60style;
        $scope.commondity.titleimageurl = item.titleimageurl;

    };
    // dropdown
    //编辑文章提交
    $scope.saveEdit = function() {
        if(!vali.Notempty($scope.commondity.title)){
            MessageService.error($scope, "标题为必填项！");
            return;
        }else if($scope.commondity.title.length>30){
            MessageService.error($scope, "标题不超过30个字！");
            return;
        }

        if(!vali.Notempty($scope.commondity.keyword)){
            MessageService.error($scope, "关键字为必填项！");
            return;
        }else if($scope.commondity.keyword.length>20){
            MessageService.error($scope, "关键字不超过20个字！");
            return;
        }

        if(!vali.Notempty($scope.commondity.summary)){
            MessageService.error($scope, "摘要为必填项！");
            return;
        }else if($scope.commondity.summary.length>200){
            MessageService.error($scope, "摘要不超过200个字！");
            return;
        }

        if(!vali.Notempty($scope.commondity.author)){
            MessageService.error($scope, "作者为必填项！");
            return;
        }else if($scope.commondity.author.length>10){
            MessageService.error($scope, "作者不超过10个字！");
            return;
        }
        if($scope.commondity.authorurl!=""){
            if(!vali.isUrl($scope.commondity.authorurl)){
                MessageService.error($scope, "原文地址请输入正确的URL！");
                return;
            }
        }
        if($scope.commondity.arttype==""){
            MessageService.error($scope, "请选择文章类型！");
            return;
        }
        if($scope.commondity.outtime<$scope.commondity.publishtime){
            MessageService.error($scope, "过期时间应该大于发布时间！");
            return;
        }
        console.log($scope.commondity.titleimageurl)
        if(!$scope.commondity.titleimageurl){
            MessageService.error($scope, "请上传文章标题图片！");
            return;
        };
        $http({
            method: "POST",
            url: "/club/createAritle",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
            data: $.param({
                article: JSON.stringify({
                    artid: $scope.commondity.artid,
                    title: $scope.commondity.title,
                    keyword: $scope.commondity.keyword,
                    summary: $scope.commondity.summary,
                    author: $scope.commondity.author,
                    authorurl: $scope.commondity.authorurl,
                    arttype: $scope.commondity.arttype,
                    publishtime: $scope.commondity.publishtime,
                    outtime: $scope.commondity.outtime,
                    content: $scope.commondity.content,
                    istop: '0',
                    ishot: '0',
                    titleimageurl: $scope.commondity.titleimageurl
                })
            })
        }).success(function(resp) {
            vali.check(resp);
            if (resp && resp.data != undefined) {
                console.log("request success");
                if (resp.error) {
                    //出错了
                    MessageService.error($scope, "保存失败！");
                } else {
                    if (resp.data) {
                        //成功了
                        MessageService.success($scope, "保存成功！");
                        $scope.closeform();
                        $scope.query();
                    } else {
                        //出错了
                        MessageService.error($scope, "保存失败！");
                    }
                }

            }
        });
    };
    //预览
    $scope.scan = function() {
        $scope.scanphonebox = true;
    };
    //关闭预览
    $scope.closescan = function() {
        $scope.scanphonebox = false;
    };
    //翻页
    $scope.$on("goPage", function(event, page) {
        $scope.query(page);
    })
}]);