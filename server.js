var express = require('express');
var app = express();
var path = require('path');
var request = require('request');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', //파일로 따로 관리
    database: 'kisafintech'
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
//request string parsing 해줌 

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

connection.connect();

app.get('/signup', function (req, res) {
    res.render('signup')
})

app.get('/hi', function (req, res) {
    res.send(req.query.body)
})

app.get('/authResult', function (req, res) {
    var auth_code = req.query.code;
    console.log(auth_code)

    var option = {
        method: 'POST',
        url: 'https://testapi.open-platform.or.kr/oauth/2.0/token',
        header: 'Content-type: application/x-www-form-urlencoded; charset=UTF-8',
        form: {
            code: auth_code,
            client_id: 'l7xx0a1f4c2de1594718945275b24de61730',
            client_secret: 'c5deb57ebce34807bdb777304fae79b2',
            redirect_uri: 'http://localhost:3000/authResult',
            grant_type: 'authorization_code'
        }

    }

    request(option, function (err, respond, body) {

            if (err) {
                console.log(err)
                throw new Error(err);
            }

            console.log(body);

            var authData = JSON.parse(body);
            var sql = "INSERT INTO user (name, user_id, user_password, user_address, user_accessToken, user_userNum) VALUES('강민주', 'kmju1997', 'kmjukmju', 'kmju1997@naver.com', ?, ?)";

        connection.query(sql, [authData.access_token, authData.user_seq_no], function (err, result) {
            if (err) {
                console.error(err);
                throw err;
            } else {
                res.send(JSON.parse(body));
            }
        })

        res.render('authComplete', {
            authData: authData
        })

        /*  var option = {
            method :'POST', 
            url : 'http://localhost:3000/signin',
            form : {
                access_token : body.access_token
            }      
        }
        request(option);  */
    
    })

})

app.get('/mydata', function(req, res){
    var user_num = '1100034707';
    var qs = 'user_seq_no=' + user_num;             
    var requestURL = "https://testapi.open-platform.or.kr/user/me?";

    var option = {
        url: requestURL + qs,
        method: 'GET',
        headers : {
           'Authorization' : 'Bearer d16baa69-1dcf-42d2-8317-d28993c88377'
        }
    }

    request(option, function(error, response, body){
        console.log(JSON.parse(body));
        res.json(body);
    })
})


app.get('/list', function(req,res){
    var user_num =  '1100034707';
    var qs = 'user_seq_no=' + user_num +'&include_cancel_yn=Y&sort_order=D';
    var requestURL = 'https://testapi.open-platform.or.kr/v1.0/account/list?'

    var option = {
        url: requestURL + qs,
        method : 'GET',
        headers : {
            'Authorization' : 'Bearer d16baa69-1dcf-42d2-8317-d28993c88377'
        }
        
    }

    request(option, function(err, response, body){
        console.log(JSON.parse(body));
        res.render('accountList', {data :  JSON.parse(body).res_list});
    })

})
app.listen(3000);