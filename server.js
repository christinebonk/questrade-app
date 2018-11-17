var express = require("express");
var app = express();
var port = process.env.PORT || 3001;
var path = require("path");
var routes = require("./routes/routes.js");
var bodyParser = require("body-parser");
require("dotenv").config();
var keys = require("./keys.js");
var refresh = keys.questrade.refresh_token;
var access = keys.questrade.access_token;
var server = keys.questrade.server;
var fs = require("fs");
var axios = require("axios");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, function() {
  console.log("App listening on PORT " + port);
  checkToken();
  
});

function checkToken() {
  axios.get(`${server}v1/accounts`, {
    headers: {Authorization: "Bearer " + access}
  }).then(function(results) {
    routes(app);
  }).catch(function(error) {
    if (error.response.data.code == "1017") {
      refreshToken();
    } else {
      console.log(error);
    };
  });
}

function refreshToken() {
  axios.get(`https://login.questrade.com/oauth2/token?grant_type=refresh_token&refresh_token=${refresh}`)
  .then(function(res) {
    console.log(res);
    fs.writeFile(".env", 
      `REFRESH_TOKEN=${res.data.refresh_token}\nACCESS_TOKEN=${res.data.access_token}\nSERVER=${res.data.api_server}`
      , function(error,data) {
      if(error) {
        return console.log(error);
      };
      access = res.access_token;
      routes(app);
    });
  }).catch(function(error) {
    console.log(error);
  });
};

