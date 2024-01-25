const redis = require('redis');
const amqplib = require('amqplib');



(async () => {
	const client = await redis.createClient().on('error', err => {console.log('error')}).connect();	
	const conn = await amqplib.connect('amqp://localhost');
	var ch1 = await conn.createChannel();
	var ch2 = await conn.createChannel();
	ch1.assertQueue('queue3');
	ch2.assertQueue('queue4');
	ch1.consume('queue3', async msg => {
		let response = msg.content.toString();	
		console.log(response);
		response = JSON.parse(response);
		if (response.login && response.password) {
			await client.set('login:1', response.login);
			await client.set('password:1', response.password);
		}
		ch1.ack(msg);
	});
	//ch2.sendToQueue();
	
	//await client.set('test', 'nice');
})();
