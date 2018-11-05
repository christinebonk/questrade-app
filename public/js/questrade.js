require("dotenv").config();
var axios = require("axios");
var keys = require("./keys.js");
var refresh = keys.questrade.refresh_token;
var access = keys.questrade.access_token;
var server = keys.questrade.server;
var fs = require("fs");
var portfolio;
var positions;

//refresh token when expired
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
		getAccounts();
	}).catch(function(error) {
		console.log(error);
	})
};

//pull user portfolio
function getPortfolio() {
	fs.readFile("portfolio.txt", "utf8", function(error,data) {
		if(error) {
			return console.log(error);
		};
		portfolio = JSON.parse(data);	
	});
}

//get account information
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
		// order(margin,"ZPR.TO", 1)
	}).catch(function(error) {
		if (error.response.data.code == "1017") {
			refreshToken();
		} else {
			console.log(error);
		}
		;
	})
}

//get account balance
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

//get positions 
function getPositions(account, equity) {
	axios.get(`${server}v1/accounts/${account}/positions`, {
		headers: {Authorization: "Bearer " + access}
	}).then(function(res){
		positions = res.data.positions;
		positions = positions.map(position => {
			var currentAllocation = position.currentMarketValue/equity;
			var allocation = portfolio.filter(obj => {
				return obj.symbol === position.symbol
			});
			var obj = {
				symbol: position.symbol,
				currentMarketValue: position.currentMarketValue,
				currentAllocation: (currentAllocation).toFixed(2),
				allocation: allocation[0].allocation,
				currentPrice: position.currentPrice
			}
			return obj;
		});
		determinePurchase(1000, equity);
	}).catch(function(error) {
		console.log(error);
	}) 
}


//determine purchase based on user amount
function determinePurchase(amount, equity) {
	var total = amount + equity;
	positions.map(item => {
		item["spend"] = ((total * item.allocation) - item.currentMarketValue).toFixed(2);
		item["quantity"] = Math.round(item.spend/item.currentPrice);
	})
	var purchase = positions.map(item => {
		var obj = {
			symbol: item.symbol,
			spend: item.spend,
			quantity: item.quantity
		}
		return obj;
	});
}

//WIP
function order(account, symbol, quantity) {
	console.log(access);
	axios.post(`${server}v1/accounts/${account}/orders`, {
		headers: {Authorization: "Bearer " + access},
		payload: {
			accountNumber: account,
			symbolId: symbol,
			quantity: quantity,
			isAllOrNone: true,
			isAnonymous: false,
			orderType: "Market",
			action: "Buy",
			primaryRoute: "AUTO",
			secondaryRoute: "AUTO"
		}
	}).then(function(res){
		console.log(res);
	}).catch(function(error) {
		console.log(error);
	});;
}

//call funtions
getPortfolio();
getAccounts();

module.exports = {
    refreshToken: refreshToken,
    getPortfolio: getPortfolio,
    getAccounts: getAccounts,
    getBalance: getBalance,
    getPortfolio: getPortfolio,
    getPositions: getPositions,
    determinePurchase: determinePurchase
}




