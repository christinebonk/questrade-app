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
			$(".single-select").append(selectionDiv);	
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
	$("#result-title").empty(); //empty results area
	amount = parseInt(amount); //user entered amount

	var total = amount;
	var totalRemaining = 0;
	var checkAmount = 0;

	//determine total equity
	positions.map(item => {
		total = total + item.currentMarketValue;
	});

	//determine spend allocation and quantity
	positions.map(item => {
		item["spend"] = parseInt(((total * item.allocation) - item.currentMarketValue).toFixed(2));
		if (item["spend"] < 0) { //if a category is negative set it to zero
			item["spend"] = 0;
		}
		item["quantity"] = Math.floor(item.spend/item.currentPrice);
		if(item["quantity"] > 0) {
			checkAmount += item["spend"]
		}
	});

	//redistribute if spending more than amount
	if (checkAmount > amount) {
		checkAmount = 0;
		positions.map(item => {
			if (item.spend > 0) {
				item.spend = amount * item.allocation
			}
			item["quantity"] = Math.floor(item.spend/item.currentPrice);
			if(item["quantity"] > 0) {
				checkAmount += item["spend"]
			}
		})
		
	}
	console.log(checkAmount)


	//create purchase recommendation object
	var purchase = positions.map(item => {
		var remaining = Math.round(item.spend - item.quantity * item.currentPrice);
		totalRemaining = amount - checkAmount;
		var obj = {
			symbol: item.symbol,
			spend: item.spend,
			quantity: item.quantity,
			currentPrice: item.currentPrice,
			remaining: remaining
		}
		return obj;
	});
		console.log(purchase)

	//attach everything to page
	var resultTitle = $(`<h2>Your Results</h2>`);
	var resultRemaining = $(`<p>Remaining spend: $${totalRemaining}</p>`);
	$("#result-title").prepend(resultTitle, resultRemaining);
	purchase.forEach(item => {
		var newDiv = $(`<div class="etf"></div>`);
		var newTitle = $(`<h3>${item.symbol}</h3>`);
		var newFig = $(`<figcaption>Quantity: <span class="highlight">${item.quantity}</span></figcaption>`);
		var newFig2 = $(`<figcaption>Price: <span class="highlight">$${item.currentPrice}</span></figcaption>`);
		newDiv.append(newTitle, newFig, newFig2);
		$("#results").append(newDiv);
	})
}

//submit button functionality
$("#submit").on("click", function(event) {
	event.preventDefault();

	//empty fields
	$("#amount-error").empty();
	$("#account-error").empty();

	//get user input
	var equity =$("input[name='accounts']:checked").attr("data-equity"); //account equity
	var amount = $("#enter-amount").val().trim(); //user's entered amount
	var account = $("input[name='accounts']:checked").val(); //chosen account
	var error = false; 

	//check for errors
	if (!amount) {
		$("#amount-error").append("! Please enter an amount");
		error = true;
	} 
	if (!account) {
		$("#account-error").append("! Please select an account");
		error = true;
	}

	//execute call
	if(!error) {
		getPositions(account, equity, amount);
	}
	
});
