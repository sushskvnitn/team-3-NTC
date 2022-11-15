const express = require('express');

const app = express();
app.use("/", express.static(__dirname + '/public/'));

app.get('/', function(req, res){
	res.sendFile(__dirname + "/main.html");
});
app.get('/list', function(req, res){
	res.sendFile(__dirname + "/list.html");
});
app.listen(process.env.PORT || 3000, () =>{
	console.log("Server running on port 3000");
})