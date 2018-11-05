//display accounts on load
$.ajax("/api/accounts", {
	type: "GET"
}).then(function(res) {
	var accounts = res;
	for (var key in accounts) {
		//todo: loading screen
		var selectionDiv = $(`<div class="selection">`);
		var selectionInput = $(`<input id=${key} value=${accounts[key]} name='accounts' type='radio' defaultChecked>`);
		var selectionLabel = $(`<label for=${key}>${key}</label>`);
		selectionDiv.append(selectionInput, selectionLabel);
		$("#single-select").append(selectionDiv);
	}
});


