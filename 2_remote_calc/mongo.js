const amqplib = require('amqplib');

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

(async () => {
	const conn = await amqplib.connect('amqp://localhost');
	const ch = await conn.createChannel();
	await ch.assertQueue('rpc_queue', {
		durable: false
	});
	ch.prefetch(1);
	//22222222222222222222222222222222222222222
	ch.consume('rpc_queue', (msg)=> {
		console.log(msg.content.toString());
		let body = msg.content.toString();
		let ans = calculate(JSON.parse(body));
		//33333333333333333333333333333333333333
		ch.sendToQueue(msg.properties.replyTo, Buffer.from(ans.toString()), {
			correlationId: msg.properties.correlationId,
		});
		ch.ack(msg);
	});
})();
