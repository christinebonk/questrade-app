var bodyparser = require("body-parser");
const path = require("path");

function routes(app) {
	app.get("/", function(req,res) {
		res.sendFile(path.join(__dirname, "../index.html"));
	});
}

module.exports = routes;