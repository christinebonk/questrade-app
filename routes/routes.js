var bodyparser = require("body-parser");
const path = require("path");
require("dotenv").config();
var axios = require("axios");
var keys = require("../keys.js");
var refresh = keys.questrade.refresh_token;
var access = keys.questrade.access_token;
var server = keys.questrade.server;
var fs = require("fs");
var portfolio;
var positions;

//routes
function routes(app) {
	app.get("/", function(req,res) {
		res.sendFile(path.join(__dirname, "../index.html"));
	});

	app.get("/api/accounts", function(req,res) {
		axios.get(`${server}v1/accounts`, {
			headers: {Authorization: "Bearer " + access}
		}).then(function(results) {
			var margin = results.data.accounts[0].number;
			var rrsp = results.data.accounts[1].number;
			res.json({Margin:margin, RRSP:rrsp});
		}).catch(function(error) {
			if (error.response.data.code == "1017") {
				refreshToken();
			} else {
				console.log(error);
			};
		});
	});

	app.get("/api/balance/:account", function(req,res) {
		var account = req.params.account;
		axios.get(`${server}v1/accounts/${account}/balances`, {
			headers: {Authorization: "Bearer " + access}
		}).then(function(results){
			equity = results.data.perCurrencyBalances[0].totalEquity;
			res.json(equity);
		}).catch(function(error) {
			console.log(error);
		}); 
	});

}

module.exports = routes;

//refresh token
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
		});
	}).catch(function(error) {
		console.log(error);
	});
};

//pull portfolio
function getPortfolio() {
	fs.readFile("portfolio.txt", "utf8", function(error,data) {
		if(error) {
			return console.log(error);
		};
		portfolio = JSON.parse(data);	
	});
}