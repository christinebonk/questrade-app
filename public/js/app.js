$.ajax("/api/accounts", {
	type: "GET"
}).then(function(res) {
	var accounts = res;
	console.log(accounts)
	for (var key in accounts) {
		console.log(key);
		var selectionDiv = $(`<div class="selection">`);
		var selectionInput = $(`<input id=${key} value=${res[key]} name='accounts' type='radio' defaultChecked`);
		var selectionLabel = $(`<label for=${key}>${key}</label>`);
		selectionDiv.append(selectionInput, selectionLabel);
		$("#accounts").append("hello");
	}
})