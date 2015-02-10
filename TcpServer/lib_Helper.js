/**
 * Created by fengyun on 14-6-20.
 */
exports.getCurrentTime = function(flag){

    var currentTime = "";
    var myDate = new Date();
    var year = myDate.getFullYear();
    var month = parseInt(myDate.getMonth().toString()) + 1; //month是从0开始计数的，因此要 + 1
    if (month < 10) {
        month = "0" + month.toString();
    }
    var date = myDate.getDate();
    if (date < 10) {
        date = "0" + date.toString();
    }
    var hour = myDate.getHours();
    if (hour < 10) {
        hour = "0" + hour.toString();
    }
    var minute = myDate.getMinutes();
    if (minute < 10) {
        minute = "0" + minute.toString();
    }
    var second = myDate.getSeconds();
    if (second < 10) {
        second = "0" + second.toString();
    }
    if(flag == "0")
    {
        currentTime = year.toString() + month.toString() + date.toString() + hour.toString() + minute.toString() + second.toString(); //返回时间的数字组合
    }
    else if(flag == "1")
    {
        currentTime = year.toString() + "/" + month.toString() + "/" + date.toString() + " " + hour.toString() + ":" + minute.toString() + ":" + second.toString(); //以时间格式/返回
    }
    else if(flag == "2")
    {
        currentTime = year.toString() + "/" + month.toString() + "/" + date.toString(); //以时间格式返回,不要时分秒
    }
    else if(flag == "3")
    {
        currentTime = year.toString() + "/" + month.toString() ; //以时间格式返回,不要日时分秒
    }
    return currentTime;
};

exports.GetDateStr = function(AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = parseInt(dd.getMonth().toString()) + 1; //month是从0开始计数的，因此要 + 1
    if (m < 10) {
        m = "0" + m.toString();
    }
    var d = dd.getDate();
    if (d < 10) {
        d = "0" + d.toString();
    }
    return y+"/"+m+"/"+d;
}
;
exports.isFromBiggerThanTo = function(dtmfrom, dtmto){
    var from = new Date(dtmfrom).getTime();
    var to = new Date(dtmto).getTime() ;
    return from >= to ;
};