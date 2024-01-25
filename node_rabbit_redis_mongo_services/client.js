//client
const amqplib = require('amqplib');
const http = require('http');


const middleware = (req, res) => {
	var body = 'x';
	if (req.method == 'POST' && req.url == '/')
	{
		req.on('data', async (chunk) => {
			const conn = await amqplib.connect('amqp://localhost'); 
			const ch1 = await conn.createChannel();
			const ch2 = await conn.createChannel();
			await ch2.assertQueue('queue2');

			await ch1.assertQueue('queue1');
			ch1.sendToQueue('queue1', Buffer.from(chunk.toString() ));
			setTimeout(() => {
				ch2.consume('queue2', msg => {
					body = msg.content.toString();
					ch2.ack(msg);
					res.write(`${body}`);
					res.end();
				});
			}, 3000);
		});
	}
	if (req.method == "GET" && req.url == '/redis') {
		(async () => {
			const conn = await amqplib.connect('amqp://localhost');
			let ch1 = await conn.createChannel();
			let ch2 = await conn.createChannel();
			ch1.assertQueue('queue3');
			const data = {login : 'atmopshere', password: '1337'};
			ch1.sendToQueue('queue3', Buffer.from(JSON.stringify(data)));
			res.write('done');
			res.end();
		})();
	}
};




http.createServer(middleware).listen(1337);
