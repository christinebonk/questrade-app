require("dotenv").config();
var axios = require("axios");
var keys = require("./keys.js");
var key = keys.questrade.consumer_key;
var fs = require("fs");
var portfolio;



function getPortfolio() {
	fs.readFile("portfolio.txt", "utf8", function(error,data) {
		if(error) {
			return console.log(error);
		};
		portfolio = JSON.parse(data);
	});
}

function getAccounts() {
	axios.get("https://api02.iq.questrade.com/v1/accounts", {
		headers: {Authorization: "Bearer " + key}
	}).then(function(res) {
		var margin = res.data.accounts[0].number;
		var rrsp = res.data.accounts[1].number;
		console.log(margin);
		console.log(rrsp);
		getBalance(margin);
		getBalance(rrsp);
		getPositions(rrsp);
	}).catch(function(error) {
		console.log(error);
	})
}

function getBalance(account) {
	axios.get(`https://api02.iq.questrade.com/v1/accounts/${account}/balances`, {
		headers: {Authorization: "Bearer " + key}
	}).then(function(res){
		console.log(res.data.perCurrencyBalances[0].totalEquity);
	}).catch(function(error) {
		console.log(error);
	}) 
}

function getPositions(account) {
	axios.get(`https://api02.iq.questrade.com/v1/accounts/${account}/positions`, {
		headers: {Authorization: "Bearer " + key}
	}).then(function(res){
		console.log(res.data);
	}).catch(function(error) {
		console.log(error);
	}) 
}

getAccounts();


