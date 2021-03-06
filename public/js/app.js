//display accounts on load
getAccounts();




//get accounts
function getAccounts() {
    $.ajax("/api/accounts", {
        type: "GET"
    }).then(function(res) {
        //don't display token screen if token is already valid
        var accounts = res;
        if (accounts) {
            document.getElementById("token").style.display = "none";
        }
        for (var key in accounts) {
            //todo: loading screen
            getBalance(accounts[key]);
            var selectionDiv = $(`<div class="selection">`);
            var selectionInput = $(`<input id=${accounts[key]} value=${accounts[key]} name='accounts' type='radio'>`);
            var selectionLabel = $(`<label for=${accounts[key]}>${key}</label>`);
            selectionDiv.append(selectionInput, selectionLabel);
            $("#account-div").append(selectionDiv);
        }
    });
}


//get account balance
function getBalance(account) {
    $.ajax(`/api/balance/${account}`, {
        type: "GET"
    }).then(function(res) {
        $(`#${account}`).attr("data-equity", res);
    })
}

//get account positions
function getPositions(account, equity, amount, portfolio) {
    $.ajax(`/api/positions/${account}/${portfolio}`, {
        type: "GET"
    }).then(function(res) {
        var positions = res;
        determinePurchase(amount, equity, positions);
    }).catch(function(error) {
		$("#portfolio-error").append("! You've selected the incorrect portfolio for this account");
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

    var remainingAllocation = 0; //unused allocation for negative values
    var allocationCount = 0; //number of remaining items to share allocation
    var reallocation; //allocation amount between items

    //determine spend allocation and quantity
    positions.map(item => {
        item["spend"] = parseInt(((total * item.allocation) - item.currentMarketValue).toFixed(2));
        if (item["spend"] < 0) { //if a category is negative set it to zero
            item["spend"] = 0;
            remainingAllocation += item.allocation; //this amount should be reallocated to other funds
        } else {
            allocationCount += 1; //count which funds need allocation
        }
        item["quantity"] = Math.floor(item.spend / item.currentPrice);
        if (item["quantity"] > 0) {
            checkAmount += item.quantity * item.currentPrice //keep track of spend
        }
    });

    //calculate reallocation amount if required
    reallocation = remainingAllocation / allocationCount;

    //check if amount distributed is higher than entered spending amount
    if (checkAmount > amount) {
        checkAmount = 0; //reset check amount
        positions.map(item => {
            if (item.spend > 0) {
                item.spend = amount * (item.allocation + reallocation); //add the remaining allocation to funds
            }
            //set quantity
            item["quantity"] = Math.floor(item.spend / item.currentPrice);
            if (item["quantity"] > 0) {
                checkAmount += item.quantity * item.currentPrice; //keep track of spend
            }
        });

    }

    //finalize check amount number
    checkAmount = checkAmount.toFixed(2);


    //create purchase recommendation object
    var purchase = positions.map(item => {
        var remaining = Math.round(item.spend - item.quantity * item.currentPrice);
        totalRemaining = Math.round(amount - checkAmount);
        var obj = {
            symbol: item.symbol,
            spend: item.spend,
            quantity: item.quantity,
            currentPrice: item.currentPrice,
            remaining: remaining
        }
        return obj;
    });

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
    $("#portfolio-error").empty();

    //get user input
    var equity = $("input[name='accounts']:checked").attr("data-equity"); //account equity
    var amount = $("#enter-amount").val().trim(); //user's entered amount
    var account = $("input[name='accounts']:checked").val(); //chosen account
    var portfolio = $("input[name='portfolio']:checked").val();
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
    if (!portfolio) {
        $("#portfolio-error").append("! Please select a portfolio");
        error = true;
    }


    //execute call
    if (!error) {
        getPositions(account, equity, amount, portfolio);
    }

});

//submit token 

$("#submit-token").on("click", function(event) {
    event.preventDefault();
    //empty field
    $("token-input").empty();

    //get input 
    var token = $("#token-input").val().trim();
    var error = false;

    //check for errors
    if (!token) {
        $("#token-error").append("! Please enter a token");
        error = true;
    }

    if (!error) {
        console.log("hi")
        document.getElementById("token").style.display = "none";
    }


});