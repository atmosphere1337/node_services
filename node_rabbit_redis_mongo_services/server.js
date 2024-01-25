//server
const amqplib = require('amqplib');

( async () => {
	const conn = await amqplib.connect('amqp://localhost'); 
	const ch1 = await conn.createChannel();
	await ch1.assertQueue('queue1');
	const ch2 = await conn.createChannel();
	await ch2.assertQueue('queue2');

	ch1.consume('queue1', (msg) => {
		if (msg != null) {
			console.log('Recieved: ', msg.content.toString());
			ch1.ack(msg);
			ch2.sendToQueue('queue2', Buffer.from(msg.content.toString()));
		} else {
			console.log('Rejected ahaha');
		}
	});

})();
