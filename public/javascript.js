// 전역변수 설정 upbit
var upbitchange = new XMLHttpRequest();
upbitchange.withCredentials = true;
var trade_price = 0.0; 
var high_price = 0.0; 
var low_price = 0.0; 
var opening_price = 0.0; 
var change = ""; 
var change_price = 0.0; 
var change_rate = 0.0; 
var signed_change_price = 0.0;
var signed_change_rate = 0.0;

// 전역변수 설정 naver
var naverchange = new XMLHttpRequest();
naverchange.withCredentials = true;
var count = 1;
var news = "";

// 업비트 api호출 부분
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
    upbitchange.onload = UpdateCurrentPriceBoard();
}
setInterval(UpdateCurrentStatus, 1000);

// 네이버 api 호출 부분
naverchange.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
        news = JSON.parse(this.responseText).items;
    }
});

$(document).ready(function() {
    UpdateCurrentStatus();
    
    // 네이버 뉴스 이전 가져오기
    $("#news_next_button").click(function() {
        let url = "http://localhost:3000/naver?";
        let start = count;
        let display = $("#news_form > select :selected").text();
        url += "start=" + start + "&display=" + display;
        naverchange.open("GET", url);
        naverchange.send();
        naverchange.onload = function() {
            let table2 = document.getElementById("table2");
            table2.innerHTML = "<table id=table2><thead><tr><th>번호</th><th>내용</th></tr></thead></table>";
            for (i in news) {
                var num = parseInt(count) + parseInt(i);
                console.log("title: " + news[i].title);
                console.log("description: " + news[i].description);
                table2.innerHTML += "<tr><td>" + num + "</td><td><a href='" + news[i].link + "' target='_blank'>" + news[i].title + "</a><span>" + news[i].description + "</span></td></tr>"
            }
            count += parseInt(display);
        }
    });

    $("#news_prev_button").click(function() {
        let url = "http://localhost:3000/naver?";
        let display = $("#news_form > select :selected").text();
        if (count - parseInt(display)*2 < 1) count = 1;
        else count -= parseInt(display)*2;
        let start = count;
        url += "start=" + start + "&display=" + display;
        naverchange.open("GET", url);
        naverchange.send();
        naverchange.onload = function() {
            let table2 = document.getElementById("table2");
            table2.innerHTML = "<table id=table2><thead><tr><th>번호</th><th>내용</th></tr></thead></table>";
            for (i in news) {
                var num = parseInt(count) + parseInt(i);
                console.log("title: " + news[i].title);
                console.log("description: " + news[i].description);
                table2.innerHTML += "<tr><td>" + num + "</td><td><a href='" + news[i].link + "' target='_blank'>" + news[i].title + "</a><span>" + news[i].description + "</span></td></tr>"
            }
            count += parseInt(display);
        }
    });
});