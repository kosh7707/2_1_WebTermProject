const express = require('express')
const { encode } = require('punycode')
const app = express()
const port = 3000

app.use(express.static('public'))

app.use(express.static('image'))

// http://localhost:3000 으로 접속시 /Home.html로 redirect 시켜줍니다.
app.get('/', (req, res) => res.redirect('/Home.html'))

// upbit api 호출 부분입니다.
app.get('/upbit', function(req,res){
    var request = require('request');
    var options = {
        'method': 'GET',
        'url': 'https://api.upbit.com/v1/ticker?markets=KRW-BTC',
    };
    request(options, function (error, response) { 
        if (error) throw new Error(error);
        res.send(response.body);
    });
})

// naver api 호출 부분입니다.
app.get('/naver', function(req,res){
    var request = require('request');
    let url = "https://openapi.naver.com/v1/search/news.json?"
    let start = req.query.start;
    let display = req.query.display;
    url += "query=" + encodeURI("비트코인") + "&start=" + start + "&display=" + display;
    var options = {
        'method': 'GET',
        'url': url,
        'headers': {
        'X-Naver-Client-Id': 'igPLrT_D9udSNsRqy3SX',
        'X-Naver-Client-Secret': 'bEeNhymihg'
    }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body);
    });
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))