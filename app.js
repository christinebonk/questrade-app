require("dotenv").config();
var axios = require("axios");
var keys = require("./keys.js");

var key = keys.questrade.consumer_key;



axios.get("https://api02.iq.questrade.com/v1/accounts", {
	headers: {Authorization: "Bearer " + key}
}).then(function(res) {
	console.log(res.data)
}).catch(function(error) {
	console.log(error);
})


