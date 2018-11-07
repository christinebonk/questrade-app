//display accounts on load
getAccounts();

//get accounts
function getAccounts() {
	$.ajax("/api/accounts", {
		type: "GET"
	}).then(function(res) {
		var accounts = res;
		for (var key in accounts) {
			//todo: loading screen
			getBalance(accounts[key]);
			var selectionDiv = $(`<div class="selection">`);
			var selectionInput = $(`<input id=${accounts[key]} value=${accounts[key]} name='accounts' type='radio'>`);
			var selectionLabel = $(`<label for=${accounts[key]}>${key}</label>`);
			selectionDiv.append(selectionInput, selectionLabel);
			$("#single-select").append(selectionDiv);	
		}
	});
}

//get account balance
function getBalance(account) {
	$.ajax(`/api/balance/${account}`, {
		type:"GET"
	}).then(function(res) {
		$(`#${account}`).attr("data-equity",res);
	})
}

//get account positions
function getPositions(account, equity, amount) {
	$.ajax(`/api/positions/${account}`, {
		type:"GET"
	}).then(function(res) {
		var positions = res;
		determinePurchase(amount, equity, positions)
	});
}

//detemine purchase
function determinePurchase(amount, equity, positions) {
	$("#results").empty();
	amount = parseInt(amount);
	var total = amount;
	positions.map(item => {
		total = total + item.currentMarketValue;
	});
	positions.map(item => {
		item["spend"] = ((total * item.allocation) - item.currentMarketValue).toFixed(2);
		item["quantity"] = Math.round(item.spend/item.currentPrice);
	});
	var purchase = positions.map(item => {
		var obj = {
			symbol: item.symbol,
			spend: item.spend,
			quantity: item.quantity
		}
		return obj;
	});
	purchase.forEach(item => {
		var newDiv = $(`<div class="etf"></div>`);
		var newTitle = $(`<h3>${item.symbol}</h3>`);
		var newFig = $(`<figcaption>${item.quantity}</figcaption>`);
		newDiv.append(newTitle, newFig);
		$("#results").append(newDiv);
	})
}

//submit button functionality
$("#submit").on("click", function(event) {
	event.preventDefault();
	var equity =$("input[name='accounts']:checked").attr("data-equity");
	var amount = $("#enter-amount").val().trim();
	var account = $("input[name='accounts']:checked").val();
	if (!amount) {
		$("#amount-error").append("Please enter an amount");
	} 
	if (!account) {
		$("#account-error").append("Please select an account");
	}
	getPositions(account, equity, amount);
});
