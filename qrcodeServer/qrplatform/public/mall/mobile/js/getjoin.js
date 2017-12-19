// app.checkLogin()
//     .then(app.getCustInfo)
//     .then(function(data) {
//         $('.info').append(`
//             <img src="${data.data.headimgurl}" />
//         `);
//     })

$("#picker-sex").picker({
    toolbarTemplate: '<header class="bar bar-nav">\
    <button class="button button-link pull-left"></button>\
    <button class="button button-link pull-right close-picker">确定</button>\
    <h1 class="title">选择加盟方式</h1>\
    </header>',
    cols: [{
        textAlign: 'center',
        values: ['男', '女']
    }]
});

$("#picker-type").picker({
    toolbarTemplate: '<header class="bar bar-nav">\
    <button class="button button-link pull-left"></button>\
    <button class="button button-link pull-right close-picker">确定</button>\
    <h1 class="title">选择加盟方式</h1>\
    </header>',
    cols: [{
        textAlign: 'center',
        values: ['个人', '企业']
    }]
});
// 监听选择加盟城市
$('#picker-city').click(function() {
    app.cities().then(function (data) {
        app.getprv(data)
        $(".page").removeClass('page-current');
        $("#address").addClass('page-current');
        $.init();
    })
})
// 监听省份选择
$(".list-container").on('click', '.province', function () {
    var code = $(this).attr('data-code');
    app.cities(code).then(function (data) {
        app.getcity(data)
    })
})
// 监听城市选择
$(".list-container").on('click', '.cities', function () {
    var name = $(this).attr('data-name');
    $("#picker-city").val(name);
    $("#address").removeClass('page-current');
    $("#main").addClass('page-current');
    $.init();
})

$('.getjoin').click(function() {
    var name = $.trim($('input[name=name]').val());
    var sex = $('input[name=sex]').val();
    var phone = $.trim($('input[name=phone]').val());
    var email = $.trim($('input[name=email]').val());
    var method = $('input[name=method]').val();
    var city = $('input[name=city]').val();

    if(!app.RegVali.empty(name)) {
        return $.toast('姓名不能为空')
    } else if(!app.RegVali.empty(sex)) {
        return $.toast('性别不能为空')
    } else if(!app.RegVali.empty(method)) {
        return $.toast('加盟方式不能为空')
    } else if(!app.RegVali.empty(city) || city == '选择您的加盟城市') {
        return $.toast('加盟城市不能为空')
    } else if(!app.RegVali.phone(phone)) {
        return $.toast('电话输入错误')
    } else if(!app.RegVali.email(email)) {
        return $.toast('邮箱输入错误')
    } else {
        var data = {
            name,
            sex,
            phone,
            email,
            method,
            city
        }
        app.request(
            '/club/applyJoin',
            data
        ).then(function(res) {
            // console.log(res)
            if(res.data) return $.alert('发送成功，请耐心等待商家回复')
        }).catch(function(err) {
            console.log(err)
            if(err) return $.alert('发送错误，请稍后重试' + JSON.stringify(err))
        })
    }
})