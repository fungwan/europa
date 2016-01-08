/**
 * Created by Administrator on 2015/11/25.
 */

var rolesArray = [];//所有角色，包含源对象和map对象,索引0是源对象、1是封装后的map对象
var selectedRoleId = '';
var selectedCraftsId = '';

$(document).ready(function(){


    $.getJSON("/doGetRoleAndRegionsInfo",function(data){

        if(data.result === 'fail'){
            return;
        }else{
            var regionsAndRolesArray = data.content.get_roleAndRegions;
            //console.log(regionsAndRolesArray);

            rolesArray = regionsAndRolesArray[1];
            console.log(rolesArray);

            warpHtml();

        }
    });

    function warpHtml() {

        $("#roles-ul").empty();

        var orgRolesArray = rolesArray[0];
        for (x in orgRolesArray) {

            var roleInfo = orgRolesArray[x];

            var trHtml = '<li id="';
            trHtml += roleInfo['id'] + '"' + "><a name=\"roles\" href=\"javacript:void(0);\">" + roleInfo['name'] +"</a>" ;
            trHtml += '</li>';

            $("#roles-ul").append(trHtml);
        }

        $('a[name="roles"]').click(function($this){

            $("#crafts-ul").empty();
            $("#amountSetting-div").css({"display":"none"});

            var roleId = $this.currentTarget.parentNode.id;
            selectedRoleId = roleId;

            var rolesMap = rolesArray[1];
            var craftsArray = rolesMap[roleId]['crafts'];

            for (x in craftsArray) {

                var craftsInfo = craftsArray[x];

                var trHtml = '<li id="';
                trHtml += craftsInfo['id'] + '"' + "><a name=\"crafts\" href=\"javacript:void(0);\">" + craftsInfo['name'] +"</a>" ;
                trHtml += '</li>';

                $("#crafts-ul").append(trHtml);
            }

            $('a[name="crafts"]').click(function($this){

                selectedCraftsId = $this.currentTarget.parentNode.id;
                var amountSetInfo = rolesArray[1][selectedCraftsId];

                $("#amountSetting-div").css({"display":""});

                //show amount info
                var showRoleName = rolesArray[1][selectedRoleId]['name'];
                var showCraftsName = rolesArray[1][selectedCraftsId]['name'];
                $("#showRole-label").text(showRoleName + '-' + showCraftsName);
                $("#earnestSet-input").val(amountSetInfo['earnest']);
                $("#commission_basicSet-input").val(amountSetInfo['commission_basic']);
                $("#commission_floatSet-input").val(amountSetInfo['commission_float']);
                $("#margin_rateSet-input").val(amountSetInfo['margin_rate']);
                $("#margin_up_thresholdSet-input").val(amountSetInfo['margin_up_threshold']);
                $("#margin_down_thresholdSet-input").val(amountSetInfo['margin_down_threshold']);
            });
        });
    }

    $("#updateAmountSet-btn").click(function(){

        //$("#need_trustee-input").attr({"checked":"false"});

        /*var isNeedTrustee = $("#need_trustee-input").attr("checked");
        if(isNeedTrustee){
            alert('需要托管');
        }*/

        /*$.post("/amount",
            {
                roleId:'',
                craftId:'',
                earnest:'',
                need_trustee:'',
                commssion_basic:'',
                commssion_float:'',
                margin_rate:'',
                margin_up_threshold:'',
                margin_down_threshold:''
            },
            function (data) {

                //console.log(data);

            }
        );*/
    });

    $("input[name='check_float-input']").blur(function($this){
        console.log($this.target['value']);
        var floatInputVal = $this.target['value'];
        var floatInputNum = 0;
        var regFloat = /^[0-9]*\.?[0-9]{1,2}$/;
        if(!floatInputVal.match(regFloat)){
            $("#updateAmountSet-btn").attr('disabled',true);
            return;
        }else{

            floatInputNum = parseFloat(floatInputVal);
            $("#updateAmountSet-btn").attr('disabled',false);
        }

        if(floatInputNum > 100000000){
            $("#updateAmountSet-btn").attr('disabled',true);
            alert('金额超出限制...');
            return;
        }
    });

    $("input[name='check_int-input']").blur(function($this){

        var intInputVal = $this.target['value'];
        var intInputNum = 0;
        var regInt = /^[0-9][0-9]*$/;
        if(!intInputVal.match(regInt)){
            $("#updateAmountSet-btn").attr('disabled',true);
            return;
        }else{
            intInputNum = parseInt(intInputVal);
            $("#updateAmountSet-btn").attr('disabled',false);
        }

        if(intInputNum > 100000000){
            $("#updateAmountSet-btn").attr('disabled',true);
            alert('金额超出限制...');
            return;
        }
    });


});

