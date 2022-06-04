// upbit api호출 부분입니다.
var upbitchange = new XMLHttpRequest();
upbitchange.withCredentials = true;
upbitchange.addEventListener("readystatechange", function() {
    if (this.readyState == 4) {
        var BTCinfo = JSON.parse(this.responseText)[0];
        /* 
            * trade_price   --> 종가(현재가)    double
            * high_price    --> 고가            double
            * low_price     --> 저가            double
            * opening_price --> 시가            double
                                RISE: 상승 
            * change        --> FALL: 하락      string
                                EVEN: 보합
            * change_price  --> 변화액의 절대값 double
            * change_rate   --> 변화율의 절대값 double
        */
        $("#current_price").text(BTCinfo["trade_price"]);
    }
});

// 헉!
$(document).ready(function() {
    $("#button1").click(function() {
        console.log("헉!");
        var a = document.getElementById("price_board").classList;
        if (a.contains("even")) {
            document.getElementById("price_board").classList.replace("even", "rising");
        }
        else if (a.contains("rising")) {
            document.getElementById("price_board").classList.replace("rising", "fall");
        }
        else if (a.contains("fall")) {
            document.getElementById("price_board").classList.replace("fall", "even");
        }
        
    });
});

// 현재가를 2초마다 갱신해줍니다.
function UpdateCurrentPrice() {
    url = "http://localhost:3000/upbit";
    upbitchange.open("GET", url);
    upbitchange.send();
}
setInterval(UpdateCurrentPrice, 2000);

