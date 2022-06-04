// 헉!
$("#button1").click(function() {
    console.log("헉!");

});

// 전역변수 설정 
var upbitchange = new XMLHttpRequest();
var trade_price = 0.0; 
var high_price = 0.0; 
var low_price = 0.0; 
var opening_price = 0.0; 
var change = ""; 
var change_price = 0.0; 
var change_rate = 0.0; 
var signed_change_price = 0.0;
var signed_change_rate = 0.0;

// 사이트 접속 시 최초실행 
$(document).ready(function() {
    UpdateCurrentStatus();
});

// upbit api호출 부분
upbitchange.withCredentials = true;
upbitchange.addEventListener("readystatechange", function() {
    if (this.readyState == 4) {
        var BTCinfo = JSON.parse(this.responseText)[0];
        /* 
            * trade_price           --> 종가(현재가)    double
            * high_price            --> 고가            double
            * low_price             --> 저가            double
            * opening_price         --> 시가            double
                                        RISE: 상승 
            * change                --> FALL: 하락      string
                                        EVEN: 보합
            * change_price          --> 변화액의 절대값 double
            * change_rate           --> 변화율의 절대값 double
            * signed_change_price   --> 변화액          double
            * signed_change_price   --> 변화율          double
        */
        trade_price = BTCinfo["trade_price"]; 
        high_price = BTCinfo["high_price"]; 
        low_price = BTCinfo["low_price"]; 
        opening_price = BTCinfo["opening_price"]; 
        change = BTCinfo["change"]; 
        change_price = BTCinfo["change_price"]; 
        change_rate = BTCinfo["change_rate"]; 
        signed_change_price = BTCinfo["signed_change_price"];
        signed_change_rate = BTCinfo["signed_change_rate"];
    }
});

// price_board와 관련된 요소들을 업데이트
function UpdateCurrentPriceBoard() {
    $(".price_board span.first strong").text(trade_price);
    $(".price_board span.second strong").text((signed_change_rate * 100).toFixed(2));
    $(".price_board span.second .updown").text(signed_change_price);
    if (change == "RISE") {
        document.getElementsByClassName("price_board")[0].classList.replace("even", "rise");
        document.getElementsByClassName("price_board")[0].classList.replace("fall", "rise");
    }
    else if (change == "FALL") {
        document.getElementsByClassName("price_board")[0].classList.replace("even", "fall");
        document.getElementsByClassName("price_board")[0].classList.replace("rise", "fall");
    }
    if (change == "EVEN") {
        document.getElementsByClassName("price_board")[0].classList.replace("rise", "even");
        document.getElementsByClassName("price_board")[0].classList.replace("fall", "even");
    }
}

// 현재상태를 1초마다 업데이트
function UpdateCurrentStatus() {
    url = "http://localhost:3000/upbit";
    upbitchange.open("GET", url);
    upbitchange.send();
    UpdateCurrentPriceBoard();
}
setInterval(UpdateCurrentStatus, 1000);



