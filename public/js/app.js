//display accounts on load
getAccounts();

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

function getBalance(account) {
	$.ajax(`/api/balance/${account}`, {
		type:"GET"
	}).then(function(res) {
		$(`#${account}`).attr("data-equity",res);
	})
}


//submit button functionality
$("#submit").on("click", function(event) {
	event.preventDefault();
	var amount = $("#enter-amount").val().trim();
	var account = $("input[name='accounts']:checked").val();
	if (!amount) {
		$("#amount-error").append("Please enter an amount");
	} 
	if (!account) {
		$("#account-error").append("Please select an account");
	}

});
