require("dotenv").config();
var axios = require("axios");
var keys = require("./keys.js");
var refresh = keys.questrade.refresh_token;
var access = keys.questrade.access_token;
var server = keys.questrade.server;
var fs = require("fs");
var portfolio;

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
	})
};

getAccounts();

function getPortfolio() {
	fs.readFile("portfolio.txt", "utf8", function(error,data) {
		if(error) {
			return console.log(error);
		};
		portfolio = JSON.parse(data);
	});
}

function getAccounts() {
	axios.get(`${server}v1/accounts`, {
		headers: {Authorization: "Bearer " + access}
	}).then(function(res) {
		var margin = res.data.accounts[0].number;
		var rrsp = res.data.accounts[1].number;
		console.log(margin);
		console.log(rrsp);
		getBalance(margin);
		getBalance(rrsp);
	}).catch(function(error) {
		console.log(error);

	})
}

function getBalance(account) {
	axios.get(`${server}v1/accounts/${account}/balances`, {
		headers: {Authorization: "Bearer " + access}
	}).then(function(res){
		equity = res.data.perCurrencyBalances[0].totalEquity;
		getPositions(account, equity);
	}).catch(function(error) {
		console.log(error);
	}) 
}

function getPositions(account, equity) {
	axios.get(`${server}v1/accounts/${account}/positions`, {
		headers: {Authorization: "Bearer " + access}
	}).then(function(res){
		var positions = res.data.positions;
		console.log(positions)
		positions = positions.map(position => {
			var allocation = position.currentMarketValue/equity;
			var obj = {
				symbol: position.symbol,
				currentMarketValue: position.currentMarketValue,
				allocation: allocation
			}
			return obj;
		})
		console.log(positions)
	}).catch(function(error) {
		console.log(error);
	}) 
}



