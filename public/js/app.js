//display accounts on load
$.ajax("/api/accounts", {
	type: "GET"
}).then(function(res) {
	var accounts = res;
	for (var key in accounts) {
		//todo: loading screen
		var selectionDiv = $(`<div class="selection">`);
		var selectionInput = $(`<input id=${key} value=${accounts[key]} name='accounts' type='radio'>`);
		var selectionLabel = $(`<label for=${key}>${key}</label>`);
		selectionDiv.append(selectionInput, selectionLabel);
		$("#single-select").append(selectionDiv);
	}
});

//submit button functionality
$("#submit").on("click", function(event) {
	event.preventDefault();
	var amount = $("#enter-amount").val().trim();
	var account = $("input[name='accounts']:checked").val();
	console.log(account)
})
