/**
 * Created by 75339 on 2017/2/20.
 */
var lastpage = 2;
var ddaa=0;
var focudetail={
    getSearchParams:function(){
        var params = {};
        var search;
        if (window.parent != window) {
            var href = window.parent.location.href;
            // TODO 添加对?至#的支持
            var search = href.match(/(\?.*)$/);
            if (search) {
                var length = search[0].length;
                if (search[0][length - 1] == "#") {
                    search = search[0].substr(1, search[0].length - 2);
                } else {
                    search = search[0].substr(1, search[0].length - 1);
                }
            } else {
                search = "";
            }
        } else {
            search = window.location.search;
            search = search.substr(1);
        }
        var arr = search.split("&"),
            newarr = [];


        $.each(arr, function(i, v){
            newarr = v.split("=");

            if(typeof params[newarr[0]] === "undefined"){
                params[newarr[0]] = newarr[1];
            }
        });
        return params;
    },
    getinifit:function(){
        //获取时间
        var parm=focudetail.getSearchParams();

        // 加载flag
        var loading = false;
        // 最多可加载的条目
        var maxItems = 100;
        // 每次加载添加多少条目
        var itemsPerLoad = 10;
        var sendobj={
            custid:parm.custid,
            entid:parm.entid,
            pagenumber:'1',
            pagerows:itemsPerLoad
        };
        function addItems(number,sendobj) {
            // 生成新条目的HTML
            $.ajax({
                type: 'post',
                url: '/club/getarticle',
                data:sendobj,
                success: function (data) {
                    if(data.error){
                        $.alert("获取失败:"+data.error.message, ["提示"])
                    }else{
                        var order=data.data.rows;
                        ddaa=data.data.count;
                        if(order.length==0){
                            loading=false;
                            $.toast("没有文章可以查看！");
                            return;
                        }
                        function gettim(nS) {
                            return new Date(parseInt(nS)).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
                        };
                        $(".content").empty();
                        //循环
                        for(var i=0;i<order.length;i++){
                            $(".content").append(`<div class="card">
                <div class="card-content">
                    <div class="list-block media-list">
                        <ul>
                            <li class="item-content">
                                <div class="item-media">
                                    <img src="${config.mall.articleimageurl+order[i].titleimageurl+'-'+config.mall.articleimage60style}" width="44">
                                </div>
                                <div class="item-inner">
                                    <div class="item-title-row">
                                        <div class="item-title">${order[i].title}</div>
                                    </div>
                                    <div class="item-subtitle">${order[i].summary}</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="card-footer">
                    <span>${gettim(order[i].publishtime)}</span>
                    <a href="./newsdetail.html?artid=${order[i].artid}" class="button button-success button fill external">详情...</a>
                </div>
            </div>`)
                        }
                        loading = false;
                    }

                },
                error: function (d) {
                    $.alert("记录获取失败:"+d, ["提示"]);
                }
            });
        }
        //预先加载5条
        addItems(itemsPerLoad,sendobj);
        var lastIndex = 10;
        // 注册'infinite'事件处理函数
        $(document).on('infinite', '.infinite-scroll-bottom',function() {
            // 如果正在加载，则退出
            if (loading) return;
            // 设置flag
            loading = true;
            if(ddaa === 0 )return;
            if (ddaa!=0&&lastpage > Math.ceil(parseInt(ddaa)/10)) {
                // 加载完毕，则注销无限加载事件，以防不必要的加载
                $.detachInfiniteScroll($('.infinite-scroll'));
                // 删除加载提示符
                $('.infinite-scroll-preloader').remove();
                return;
            }
            // 添加新条目
            //itemsPerLoad页数每页20条
            //lastIndex上次加载的条数
            var mysendobj={
                custid:$(".changetime").attr('data-cuidd'),
                begtime:tm.begintime,
                endtime:tm.endtime,
                pagenumber:lastpage,
                pagerows:'10'
            };
            addItems(itemsPerLoad,mysendobj);
            // 更新最后加载的序号
            lastpage++;
            //容器发生改变,如果是js滚动，需要刷新滚动
            $.refreshScroller();
        });
    },
    checklog:function(){
        $.ajax({
            url: "/mobile/checklogin",
            type: 'post',
            success: function (data) {
                if(data.error){
                    if(data.error.code=='unlogin'){
                        //未登录
                        var thisurl=window.location.href;
                        window.sessionStorage.setItem('thisurl',thisurl);
                        window.location.href='./login.html';
                    }else{
                        $.alert("异常:"+data.error.message, ["提示"]);
                    }
                }else{
                    //获取微信用户信息
                    var d=data.data;
                    $('.content').attr({'data-cud':d.custid});
                    focudetail.initmypage(d);

                }

            },
            error: function (d) {
                $.alert("check异常:"+d, ["提示"]);
            }
        });
    },
    getinifitnoid:function(){
        //获取时间
        var parm=focudetail.getSearchParams();

        // 加载flag
        var loading = false;
        // 最多可加载的条目
        var maxItems = 100;
        // 每次加载添加多少条目
        var itemsPerLoad = 10;
        var sendobj={
            custid:$('.content').attr('data-cud'),
            pagenumber:'1',
            pagerows:itemsPerLoad
        };
        function addItems(number,sendobj) {
            // 生成新条目的HTML
            $.ajax({
                type: 'post',
                url: '/club/getarticle',
                data:sendobj,
                success: function (data) {
                    if(data.error){
                        $.alert("获取失败:"+data.error.message, ["提示"])
                    }else{
                        var order=data.data.rows;
                        ddaa=data.data.count;
                        if(order.length==0){
                            loading=false;
                        }
                        function gettim(nS) {
                            return new Date(parseInt(nS)).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
                        };
                        $(".content").empty();
                        //循环
                        for(var i=0;i<order.length;i++){
                            $(".content").append(`<div class="card">
                <div class="card-content">
                    <div class="list-block media-list">
                        <ul>
                            <li class="item-content">
                                <div class="item-media">
                                    <img src="${config.mall.articleimageurl+order[i].titleimageurl+'-'+config.mall.articleimage60style}" width="44">
                                </div>
                                <div class="item-inner">
                                    <div class="item-title-row">
                                        <div class="item-title">${order[i].title}</div>
                                    </div>
                                    <div class="item-subtitle">${order[i].summary}</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="card-footer">
                    <span>${gettim(order[i].publishtime)}</span>
                    <a href="./newsdetail.html?artid=${order[i].artid}" class="button button-success button fill external">详细...</a>
                </div>
            </div>`)
                        }
                        loading = false;
                    }

                },
                error: function (d) {
                    $.alert("记录获取失败:"+d, ["提示"]);
                }
            });
        }
        //预先加载5条
        addItems(itemsPerLoad,sendobj);
        var lastIndex = 10;
        // 注册'infinite'事件处理函数
        $(document).on('infinite', '.infinite-scroll-bottom',function() {
            // 如果正在加载，则退出
            if (loading) return;
            // 设置flag
            loading = true;
            if(ddaa === 0 )return;
            if (ddaa!=0&&lastpage > Math.ceil(parseInt(ddaa)/10)) {
                // 加载完毕，则注销无限加载事件，以防不必要的加载
                $.detachInfiniteScroll($('.infinite-scroll'));
                // 删除加载提示符
                $('.infinite-scroll-preloader').remove();
                return;
            }
            // 添加新条目
            //itemsPerLoad页数每页20条
            //lastIndex上次加载的条数
            var mysendobj={
                custid:$(".changetime").attr('data-cuidd'),
                begtime:tm.begintime,
                endtime:tm.endtime,
                pagenumber:lastpage,
                pagerows:'10'
            };
            addItems(itemsPerLoad,mysendobj);
            // 更新最后加载的序号
            lastpage++;
            //容器发生改变,如果是js滚动，需要刷新滚动
            $.refreshScroller();
        });
    },
    initmypage:function(d){
        var parm=focudetail.getSearchParams();
        console.log(parm.entid);
        if(parm.entid){
            focudetail.getinifit();
        }else{
            focudetail.getinifitnoid();
        }

    }
};
focudetail.checklog();
//focu.getlist('5a83d808-07dd-499a-af60-92c52eb62b9b');
