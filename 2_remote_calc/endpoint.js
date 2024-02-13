// ENDPOINT
const http = require('http');
const amqplib = require('amqplib');
const PORT = 1337;


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
			const queue = await ch.assertQueue('' , { exclusive: true } );
			ch.assertQueue('mongo-compute', { durable: false });
			ch.assertQueue('endpoint-redis', {durable: false});
			ch.assertQueue('redis-mongo', { durable: false, });
			// 11111111111111111111111111111111111111111
			ch.sendToQueue('endpoint-redis', Buffer.from(body), {
				correlationId: correlationId,
				replyTo: queue.queue,
			});
			//99999999999999999999999999999999
			ch.consume(queue.queue, (msg) => {
				if (msg.properties.correlationId == correlationId) {
					let ans = JSON.stringify({
						ans: msg.content.toString(),
						src: msg.properties.headers.producer.toString(),
					});
					res.statusCode = 200;
					res.end(ans);
					console.log('Producer: ' , msg.properties.headers.producer);
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
