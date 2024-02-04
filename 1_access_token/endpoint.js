const http = require('http');
const fs = require('fs');
const sha256 = require('crypto-js/hmac-sha256');
const base64 = require('crypto-js/enc-base64url');

const KEY = 'GbDsXuL';

http.createServer(
	(req, res) => {
		console.log(req.url + req.method);
		if (req.url == '/' && req.method == "GET") {
			fs.readFile('./static/template.html', (error, content) => {
				res.writeHead(200, {'Content-type':'text/html'});
				res.end(content, 'utf-8');
			});
		}
		else if (req.url == '/style.css' && req.method == "GET") { 
			fs.readFile('./static/style.css', (error, content) => {
				res.writeHead(200, {'Content-type':'text/css'});
				res.end(content, 'utf-8');
			});
		}
		else if (req.url == '/script.js' && req.method == "GET") { 
			console.log('js');	
			fs.readFile('./static/script.js', (error, content) => {
				res.writeHead(200, {'Content-type':'text/javascript'});
				res.end(content, 'utf-8');
			});
		}
		else if (req.url == '/login' && req.method == "POST") {
			req.on('data', (chunk) => {
				let fields = JSON.parse(Buffer.from(chunk).toString());
				let id = userFindByLP(fields.login, fields.password);
				// Didn't find user in database
				if (id == -1) {
					res.statusCode = 404;
					res.end('Wrong login');
					return;
				}
				let token = generateToken(id);
				res.writeHeader(302, {'Set-Cookie' : `accesstoken=${token}`});
				res.end(token);
				return;
			});
		}
		else if (req.url == '/page' && req.method == "GET") {
			let token = getToken(req);
			if (!token) {
				res.statusCode = 404;
				res.end("token is not set");
				return;
			}
			let isTokenVerified = verifyToken(token);
			if (!isTokenVerified) {
				res.statusCode = 302;
				res.end("token is not valid");
				return;
			}
			token = decipherToken(token);
			if (!token) {
				res.statusCode = 404;
				res.end('request body is broken');
				return;
			}
			if (isTokenExpired(token.time)) {
				res.statusCode = 302;
				res.end('token is expired');
				return;
			}
			let result = userFind(token.id); 
			res.statusCode = 200;
			res.end(result.message);
			return;
		}
		else if (req.url == '/logout' && req.method == "GET") {
			res.setHeader('set-cookie', 'accesstoken=; max-age=0');
			res.statusCode = 200;
			res.end();
			return;
		}
		else if (req.url == '/register' && req.method == "POST") {
			req.on('data', (chunk) => {
				let data = JSON.parse(Buffer.from(chunk).toString());
				if (!data.login || !data.password) {
					res.statusCode = 404;
					res.end();
					return;
				}
				if (!register(data.login, data.password)) {
					res.statusCode = 404;
					res.end();
					return;
				}
				res.statusCode = 200;
				res.end();
				return;
			});
		}
		else {
			res.statusCode = 404;
			res.end();
			return;
		}

		
	}
).listen(1337);


function generateToken(id) {
	let header = JSON.stringify({"alg":"hmac_HS256", "typ":"almostJWT"});  
	let date = new Date();
	let time = date.getTime() + 10000;
	let payload = JSON.stringify({id: id, time: time});
	header = Buffer.from(header).toString("base64url");	
	payload = Buffer.from(payload).toString("base64url");
	let check = sha256(`${header}.${payload}`, KEY).toString();
	return `${header}.${payload}.${check}`;
}

function getToken(req) {
	let cookies = req.headers.cookie.split(';');
	let key;
	let value;
	for (let element of cookies) {
		[key, value] = element.split('=');
		if (key.trim() == 'accesstoken') {
			return value.trim();
		}
	}
	return null;

}

function verifyToken(token) {
	let split = token.split('.');
	if (split.length != 3)
		return false;
	[header, payload, check] = split;
	let cipher = sha256(`${header}.${payload}`, KEY).toString();
	if (cipher != check) 
		return false;
	return true;
}

function decipherToken(cipheredToken) {
	let payload = cipheredToken.split('.')[1];
	let decipherstring = Buffer.from(payload, 'base64url').toString();
	let output = JSON.parse(decipherstring);
	if (!output.id || !output.time)
		return null;
	return output;
}

function userFind(id)  {
	
	return {message: "message", id: 1};
}

function userFindByLP(login, password) {
	if (login == 'atmosphere' && password == '1337')
		return 1;
	else
		return -1;
}

function register(login, password) {
	if (login == 'atmosphere' && password == '1337') {
		return false;
	}
	return true;
}
function isTokenExpired(time) {
	let currentTime = new Date();
	if (time < currentTime.getTime())
		return true;
	return false;
}
