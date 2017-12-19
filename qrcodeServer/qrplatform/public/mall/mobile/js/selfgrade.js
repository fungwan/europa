/**
 * Created by 75339 on 2017/2/15.
 */

var selfgrade = {
    parm: function () {
        return {
            custid: app.custid,
            begtime: app.getTime().begintime,
            endtime: app.getTime().endtime,
            pagenumber: app.scollItem.page,
            pagerows: app.scollItem.size,
            type: selfgrade.gettype
        }
    },
    renderList: function (data) {
        var d = data.data.rows;
        for (var i = 0; i < d.length; i++) {
            $(".list-container").append(`<div class=" row no-gutter" style="padding-left: 1rem;">
                    <div class="col-50"><span class="icontype"><img src="../images/self/pointtype/${d[i].changemode}.svg" alt=""></span>${d[i].remark}</div>
                    <div class="col-30">${d[i].pointtime.slice(0, 10)}</div>
                    <div class="col-20" id="${d[i].detailid}">${d[i].point}</div>
                </div>`);
            if (d[i].point < 0) {
                $("#" + d[i].detailid).addClass('red');
            } else {
                $("#" + d[i].detailid).addClass('blue');
            }
        };

        if (d.length < app.scollItem.size || d.length == 0) {
            // 加载完毕，则注销无限加载事件，以防不必要的加载
            $.detachInfiniteScroll($('.infinite-scroll'));
            // 删除加载提示符
            $('.infinite-scroll-preloader').hide();
            $.toast("没有更多记录了！");
        }
        app.scollItem.loading = false;
    },
    gettype: function () {
        var type = $('#pickertype').val();
        if (type == '积分抽奖') {
            type = 'lotto'
        } else if (type == '订单消费') {
            type = 'order'
        } else if (type == '签到送积分') {
            type = 'sign'
        } else if (type == '积分赠予记录') {
            type = 'out'
        } else if (type == '活动分享得积分') {
            type = 'share'
        } else if (type == '活动助力得积分') {
            type = 'help'
        } else if (type == '积分接收记录') {
            type = 'in'
        } else if (type == '扫码抽奖得积分') {
            type = 'prolottery'
        } else if (type == '扫码获得预设积分') {
            type = 'propoint'
        } else if (type == '订单撤销，退回积分') {
            type = 'refund'
        } else if (type == '扫码即送得积分') {
            type = 'progift'
        } else if (type == '全部') {
            type = ''
        }
        return type;
    },
    initmypage: function () {
        app.scollItem.addItems(
            '/club/getPointRecord',
            selfgrade.parm())
            .then(function (data) {
                selfgrade.renderList(data);
            })
    }
};
app.checkLogin()
    .then(function () {
        selfgrade.initmypage();
        app.getGrade();
    });
//改变时间筛选数据
$("body").on('click', '#sure', function () {
    app.scollItem.init();
    app.scollItem.addItems(
        '/club/getPointRecord',
        selfgrade.parm())
        .then(function (data) {
            selfgrade.renderList(data);
        })
});

$(document).on('infinite', '.infinite-scroll-bottom', function () {
    $.refreshScroller();
    if (app.scollItem.loading) return;
    app.scollItem.page++;
    app.scollItem.loading = true;
    app.scollItem.addItems(
        '/club/getPointRecord',
        selfgrade.parm())
        .then(function (data) {
            selfgrade.renderList(data);
        })
});
//改变类型筛选数据
$("body").on('click', '#suretype', function () {
    app.scollItem.init();
    app.scollItem.addItems(
        '/club/getPointRecord',
        selfgrade.parm())
        .then(function (data) {
            selfgrade.renderList(data);
        })
});

$(".tring-time").click(function () {
    $("#picker").picker("open");
})
$(".tring-type").click(function () {
    $("#pickertype").picker("open");
})