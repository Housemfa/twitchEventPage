var express = require('express');
var fs = require('fs');
var app = express();
var http = require('http').Server(app); 
var io = require('socket.io')(http);    
var id = "";
var SEC_VALUE = "";
var admin = "";
var M_VALUE="";//masked answer
app.get('/', function (req, res) {  //2
	console.log(req.query);
	id = req.query.id;
	res.sendFile(__dirname + '/client.html');
});
app.get('/log', function (req, res) {  //2
	console.log(req.query);
	id = req.query.id;
	res.sendFile(__dirname + '/client.html');
});

var count = 1;
io.on('connection', function (socket) { //3
	console.log('user connected: ', socket.id);  //3-1
	var name = "user" + count++;
	if (name != null) { name = id; }              //3-1
	else { name = "Unknown Dodie" }
	io.to(socket.id).emit('change name', name);   //3-1
	
	if(M_VALUE!=""){
		console.log('newbie!'+M_VALUE+"<<")
		io.emit('maskedAns', M_VALUE);
	}
	socket.on('disconnect', function () { //3-2
		console.log('user disconnected: ', socket.id);
	});
	socket.on('refresh', function () { //3-2
		console.log('사용자 전체 REFRESH');
		socket.broadcast.emit('refresh');
	});
	socket.on('setans', function (value, mValue) { //3-2
		if (admin == "") {
			admin = socket.id
		}
		console.log('정답설정: ', value);
		SEC_VALUE = value;
		M_VALUE = mValue;
		io.emit('maskedAns', mValue);
		socket.broadcast.emit('maskedAns', mValue);
	});

	socket.on('send message', function (name, text) { //3-3
		if (text.substr(0, 1) == '@') {
			var args = text.split(' ');
			var newName = args[1];
			console.log(name + " -> " + newName);
		}
		else {
			if (text == SEC_VALUE) {
				console.log("WE'VE GOT A WINNER!");
				io.emit('congrats', '정답자 : ' + name + '(' + text + ')');
				socket.broadcast.emit('congrats', '정답자 : ' + name + '(' + text + ')');
			}
			var msg = name + ' : ' + text;
			console.log(msg);
			io.emit('receive message', msg);
		}
	});
});
var server_port = process.env.YOUR_PORT || process.env.PORT || 8000;

http.listen(server_port, function () { //4
	console.log('server on! listening ' + server_port);

});

function saveData(Account, msg) {
	// array 1000 개 만들어서 이전 1000개의 대화명/대화 저장해서 누구 접속할때마다 띄워줄것
}

app.get('/imgs', function (req, res) {
	fs.readFile('img/tree.gif', function (error, data) {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(data);
	});
});
