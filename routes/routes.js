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
			var accounts = results.data.accounts;
			var accountObj = {}
			accounts.forEach(function(item) {
				var type = item.type;
				var number = item.number;
				accountObj[type] = number;
			})
			res.json(accountObj);
		}).catch(function(error) {
			console.log(error);
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

	app.get("/api/positions/:account", function(req,res) {
		var account = req.params.account;
		getPortfolio();
		console.log(portfolio);
		axios.get(`${server}v1/accounts/${account}/positions`, {
			headers: {Authorization: "Bearer " + access}
		}).then(function(results){
			positions = results.data.positions;
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
			res.json(positions);
		}).catch(function(error) {
			console.log(error);
		}); 
	});

	app.get("/api/portfolio", function(req,res) {
		getPortfolio();
		console.log(portfolio);
	});

	
}

module.exports = routes;


//pull portfolio
function getPortfolio() {
	fs.readFile("portfolio.txt", "utf8", function(error,data) {
		if(error) {
			return console.log(error);
		};
		portfolio = JSON.parse(data);	
		return portfolio;
	});
}