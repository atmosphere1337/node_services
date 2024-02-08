const http = require('http');
const amqplib = require('amqplib');
const PORT = 1337;

/*
function calculate(body) {
	let ans = 0;
	let f1 = parseInt(body.f1);
	let f2 = parseInt(body.f2);
	switch (body.op) {
		case "+" : 
			ans = f1 + f2;
			break;
		case "-" : 
			ans = f1 - f2;
			break;
		case "*" : 
			ans = f1 * f2;
			break;
		case "/" : 
			ans = f1 / f2;
			break;
		default:
			break;
	}
	return ans;
}
*/

async function rabbitmq(msg, res) {
	const conn = await amqplib.connect('amqp://localhost');
	const ch1 = await conn.createChannel();
	const ch2 = await conn.createChannel();
	await ch1.assertQueue('queue1');
	await ch2.assertQueue('queue2');
	ch1.sendToQueue('queue1', Buffer.from(msg));
	
	ch2.consume('queue2', (msg) => {
		console.log('asdfadsf');
		console.log(msg.content.toString());
		let ans = msg.content.toString();
		ch2.ack(msg);
		res.statusCode = 200;
		res.end(ans);
	});
}

function main(req, res) {
	console.log(req.method + " " + req.url);
	if (req.method == "POST") {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	}
	if (req.method == "POST") {
		req.on('data', async (chunk) => {
			let body = Buffer.from(chunk).toString();
			try {
				JSON.parse(body);
			} catch (e) {
				res.statusCode = 404;
				res.end();
				return;
			}
			body = JSON.parse(body);
			if (!body.f1 || !body.f2 || !body.op) {
				 res.statusCode = 404;
				 res.end();
				 return;
			}
			body = JSON.stringify(body);
						

			let correlationId = Math.random().toString();
			const conn = await amqplib.connect('amqp://localhost');
			const ch = await conn.createChannel();
			const queue = await ch.assertQueue('', { exclusive: true });
			// 11111111111111111111111111111111111111111
			ch.sendToQueue('rpc_queue', Buffer.from(body), {
				correlationId: correlationId,
				replyTo: queue.queue,
			});
			//44444444444444444444444444
			ch.consume(queue.queue, (msg) => {
				if (msg.properties.correlationId == correlationId) {
					console.log('asdfadsf');
					console.log(msg.content.toString());
					let ans = msg.content.toString();
					res.statusCode = 200;
					res.end(ans);
					setTimeout( ()=>{
						conn.close();
					}, 500);
							
				}
			}, {
				noAck: true
			}
			);



		});
	}
}



http.createServer(main).listen(PORT);
