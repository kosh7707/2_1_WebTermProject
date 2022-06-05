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
var money = 0;
var die_count = 0;
var position_info = [];

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

// position_info = [position, execution, reverage, size, price, PNL, ROE, liquidation_price]

// 현재상태를 1초마다 업데이트
function UpdateCurrentStatus() {
    url = "http://localhost:3000/upbit";
    upbitchange.open("GET", url);
    upbitchange.send();
    upbitchange.onload = UpdateCurrentPriceBoard();
    UpdatePositionTable();
}
setInterval(UpdateCurrentStatus, 1000);

// price_board와 관련된 요소들을 업데이트
function UpdateCurrentPriceBoard() {
    $(".price_board span.first strong").text(trade_price.toLocaleString('ko-KR'));
    $(".price_board span.second strong").text((signed_change_rate * 100).toFixed(2)+"%");
    $(".price_board span.second .updown").text(signed_change_price.toLocaleString('ko-KR'));
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
    $("#price").val(trade_price);
}

// 네이버 api 호출 부분
naverchange.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
        news = JSON.parse(this.responseText).items;
    }
});

// 게임 시작시 정보 로딩 부분
function gameStart() {
    if (localStorage.getItem("WebTermProject_money") == null) {
        money = 100000000;
        die_count = 0;
        localStorage.setItem("WebTermProject_money", money);
        localStorage.setItem("WebTermProject_die_count", die_count);
    }
    else {
        money = localStorage.getItem("WebTermProject_money");
        die_count = localStorage.getItem("WebTermProject_die_count");
    }
    $("#money > span").text(Number(money).toLocaleString('ko-KR'));
}

// 포지션 정보 업데이트
function UpdatePositionInfo() {
    if (!position_info[1]) {
        if (position_info[0] == "long" && trade_price <= position_info[4]) {
            position_info[4] = trade_price;
            position_info[1] = true;
        }
        else if (position_info[0] == "short" && trade_price >= position_info[4]) {
            position_info[4] = trade_price;
            position_info[1] = true;
        }
        else return;
    }
    if (position_info[0] == "long") {
        position_info[5] = (trade_price - position_info[4])*position_info[2] * position_info[3]; // PNL
        position_info[6] = position_info[5]/position_info[4]/position_info[3]; // ROE
        position_info[7] = (-1+position_info[2])/position_info[2] * position_info[4]; // liquidation_price
    }
    else {
        position_info[5] = (-1) * (trade_price - position_info[4])*position_info[2] * position_info[3];
        position_info[6] = position_info[5]/position_info[4]/position_info[3];
        position_info[7] = (1+position_info[2])/position_info[2] * position_info[4];
    }

}

// 포지션 table 업데이트
function UpdatePositionTable() {
    UpdatePositionInfo();
    if (!position_info[1]) return;
    let table1 = document.getElementById("table1");
    table1.innerHTML = "<table id='table1'><thead><tr><th>포지션</th><th>레버리지</th><th>진입 가격</th><th>청산 가격</th><th>크기</th><th>PNL(ROE %)</th><th>포지션 종료</th></tr></thead></table>"
    let PNL_ROE = position_info[5].toLocaleString('ko-KR') + "(" + (position_info[6]*100).toFixed(2) + "%)";
    if (position_info[0] == "long") 
        table1.innerHTML += "<tr><td>매수(롱)</td><td>" + position_info[2] + "</td><td>" + position_info[4].toLocaleString('ko-KR') + "</td><td>"
        + position_info[7].toLocaleString('ko-KR') + "</td><td>" + position_info[3] + "</td><td>"
        + PNL_ROE + "</td><td>" + "<input type='button' id='close_button' value='포지션 종료'>" + "</td></tr>";
    else 
        table1.innerHTML += "<tr><td>매도(숏)</td><td>" + position_info[2] + "</td><td>" + position_info[4].toLocaleString('ko-KR') + "</td><td>"
        + position_info[7].toLocaleString('ko-KR') + "</td><td>" + position_info[3] + "</td><td>"
        + PNL_ROE + "</td><td>" + "<input type='button' id='close_button' value='포지션 종료'>" + "</td></tr>";
    $("#close_button").click(function() {
        let table1 = document.getElementById("table1");
        table1.deleteRow(-1);
        close_position();
    });
    if (position_info[5] > 0) {
        document.getElementById("table1").classList.replace("even", "rise");
        document.getElementById("table1").classList.replace("fall", "rise");
    }
    else if (position_info[5] < 0) {
        document.getElementById("table1").classList.replace("even", "fall");
        document.getElementById("table1").classList.replace("rise", "fall");
    }
    else {
        document.getElementById("table1").classList.replace("rise", "even");
        document.getElementById("table1").classList.replace("fall", "even");
    }
}

// 포지션 종료
function close_position() {
    if (!position_info[1]) {
        money += position_info[3] * position_info[4];
    } else {
        money += position_info[3] * position_info[4] + position_info[5];
    }
    localStorage.setItem("WebTermProject_money", money);
    $("#money > span").text(Number(money).toLocaleString('ko-KR'));
    position_info = [];
    return ;
}

// 가격과 크기 값 유효성 체크
function PriceAndSizeValidationCheck() {
    let price = $("#price").val();
    if (price == "") {
        alert("가격을 입력해주세요");
        return false;
    } else if (isNaN(price) || (parseInt(price) != parseFloat(price))) {
        alert("가격은 정수만 입력해주세요");
        return false;
    }
    let coin_count = $("#coin_count").val();
    if (coin_count == "") {
        alert("개수를 입력해주세요");
        return false;
    } else if (isNaN(coin_count)) {
        alert("개수는 실수만 입력해주세요");
        return false;
    }    
    let reverage = $("#reverage").val();
    if (reverage == "") {
        alert("레버리지를 입력해주세요");
        return false;
    } else if (isNaN(reverage) || Number(reverage) < 1 || Number(reverage) > 50) {
        alert("레버리지는 1~50 사이의 숫자만 입력해 주세요.");
        return false;
    }
    if (price * coin_count * reverage > money) {
        alert("소지금이 부족합니다");
        return false;
    }
    return true;
}

$(document).ready(function() {
    gameStart();
    UpdateCurrentStatus();

    // 네이버 뉴스 다음 가져오기
    $("#news_next_button").click(function() {
        let url = "http://localhost:3000/naver?";
        let start = count;
        let display = $("#news_form > select :selected").text();
        url += "start=" + start + "&display=" + display;
        naverchange.open("GET", url);
        naverchange.send();
        naverchange.onload = function() {
            let table2 = document.getElementById("table2");
            table2.innerHTML = "<thead><tr><th>번호</th><th>내용</th></tr></thead>";
            for (i in news) {
                var num = parseInt(count) + parseInt(i);
                table2.innerHTML += "<tr><td>" + num + "</td><td><a href='" + news[i].link + "' target='_blank'>" + news[i].title + "</a><span>" + news[i].description + "</span></td></tr>"
            }
            count += parseInt(display);
        }
    });

    // 네이버 뉴스 이전 가져오기
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
            table2.innerHTML = "<thead><tr><th>번호</th><th>내용</th></tr></thead>";
            for (i in news) {
                var num = parseInt(count) + parseInt(i);
                table2.innerHTML += "<tr><td>" + num + "</td><td><a href='" + news[i].link + "' target='_blank'>" 
                                    + news[i].title + "</a><span>" + news[i].description + "</span></td></tr>";
            }
            count += parseInt(display);
        }
    });

    // 매수 버튼 클릭 시
    $("#buy_button").click(function() {
        if (!PriceAndSizeValidationCheck()) return ;
        if (position_info.length) {
            alert("이미 포지션이 진행중입니다");
            return ;
        }
        let price = Number($("#price").val());
        let reverage = Number($("#reverage").val());
        let coin_count = Number($("#coin_count").val());
        let liquidation_price = '-';
        let PNL = '-';
        let ROE = '-';
        let PNL_ROE = PNL + "(" + ROE + "%)";
        let size = reverage * coin_count;

        let table1 = document.getElementById("table1");
        table1.innerHTML += "<tr><td>매수(롱)</td><td>" + reverage + "</td><td>" + price + "</td><td>"
                        + liquidation_price + "</td><td>" + size + "</td><td>"
                        + PNL_ROE + "</td><td>" + "<input type='button' id='close_button' value='포지션 종료'>" + "</td></tr>";
        $("#close_button").click(function() {
            let table1 = document.getElementById("table1");
            table1.deleteRow(-1);
            close_position();
        });

        position_info.push("long");
        position_info.push(false);
        position_info.push(reverage);
        position_info.push(size);
        position_info.push(price);

        money -= price * size;
        localStorage.setItem("WebTermProject_money", money);
        $("#money > span").text(Number(money).toLocaleString('ko-KR'));
    });
 
    // 매도 버튼 클릭 시
    $("#sell_button").click(function() {
        if (!PriceAndSizeValidationCheck()) return ;
        if (position_info.length) {
            alert("이미 포지션이 진행중입니다");
            return ;
        }
        let price = Number($("#price").val());
        let reverage = Number($("#reverage").val());
        let coin_count = Number($("#coin_count").val());
        let liquidation_price = '-';
        let PNL = '-';
        let ROE = '-';
        let PNL_ROE = PNL + "(" + ROE + "%)";
        let size = reverage * coin_count;

        let table1 = document.getElementById("table1");
        table1.innerHTML += "<tr><td>매수(롱)</td><td>" + reverage + "</td><td>" + price + "</td><td>"
                        + liquidation_price + "</td><td>" + size + "</td><td>"
                        + PNL_ROE + "</td><td>" + "<input type='button' id='close_button' value='포지션 종료'>" + "</td></tr>";
        $("#close_button").click(function() {
            let table1 = document.getElementById("table1");
            table1.deleteRow(-1);
            close_position();
        });

        position_info.push("short");
        position_info.push(false);
        position_info.push(reverage);
        position_info.push(size);
        position_info.push(price);

        money -= price * size;
        localStorage.setItem("WebTermProject_money", money);
        $("#money > span").text(Number(money).toLocaleString('ko-KR'));
    });

});