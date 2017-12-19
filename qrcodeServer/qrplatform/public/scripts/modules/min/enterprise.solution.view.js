/**
 * Created by Yatagaras on 2015/12/2.
 */

define(function () {
    var module = {}, loaded = false, qrCodeSize = 100;

    function onButtonClick(e) {
        switch ($(e.currentTarget).val()) {
            case "home":
                parent.enterprise.solution.openPage(null, true);
                break;
        }
        return false;
    }

    module.init = function () {
        if (!loaded) {
            $(".qrcode").qrcode({text: "http://51s.co/xMq7eds6", width: qrCodeSize, height: qrCodeSize, background: "transparent", correctLevel: 1});
            $(document.body).on("click", "button", onButtonClick);
            var startTime = top.moment(), endTime = top.moment().add(3, "M");
            $(".querybar").parseData({
                starttime: startTime.toISOString(),
                endtime: endTime.toISOString()
            });

            loaded = true;
        }
    };

    return module;
});