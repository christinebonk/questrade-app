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
		if (error.response.data.code == "1017") {
			refreshToken();
		} else {
			console.log(error);
		}
		;
	})
}

function getBalance(account) {
	axios.get(`${server}v1/accounts/${account}/balances`, {
		headers: {Authorization: "Bearer " + access}
	}).then(function(res){
		equity = res.data.perCurrencyBalances[0].totalEquity;
		getPositions(account, equity);
		determineSpend(1000, equity);
	}).catch(function(error) {
		console.log(error);
	}) 
}

function getPositions(account, equity) {
	axios.get(`${server}v1/accounts/${account}/positions`, {
		headers: {Authorization: "Bearer " + access}
	}).then(function(res){
		var positions = res.data.positions;
		positions = positions.map(position => {
			var currentAllocation = position.currentMarketValue/equity;
			var allocation = portfolio.filter(obj => {
				return obj.symbol === position.symbol
			});
			var obj = {
				symbol: position.symbol,
				currentMarketValue: position.currentMarketValue,
				currentAllocation: (currentAllocation).toFixed(2),
				allocation: allocation[0].allocation
			}
			return obj;
		});
		console.log(positions);
	}).catch(function(error) {
		console.log(error);
	}) 
}

function determineSpend(amount, equity) {
	var total = amount + equity;
	portfolio.map(item => {
		item["spend"] = total * item.allocation;
	})
	console.log(portfolio);
}

getPortfolio();
getAccounts();




// getAccounts();


