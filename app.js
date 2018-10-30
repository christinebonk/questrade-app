require("dotenv").config();
var axios = require("axios");
var keys = require("./keys.js");

var key = keys.questrade.consumer_key;

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
	}).catch(function(error) {
		console.log(error);
	})
}

getAccounts();



function getBalance(account) {
	axios.get(`https://api02.iq.questrade.com/v1/accounts/${account}/balances`, {
		headers: {Authorization: "Bearer " + key}
	}).then(function(res){
		console.log(res.data.perCurrencyBalances[0].totalEquity);
	}).catch(function(error) {
		console.log(error);
	}) 
}

