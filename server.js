var express = require("express");
var app = express();
var port = process.env.PORT || 3001;
var path = require("path");
var routes = require("./routes/routes.js");
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, function() {
  console.log("App listening on PORT " + port);
});

routes(app);