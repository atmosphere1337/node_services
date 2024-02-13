// COMPUTE
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
	ch.assertQueue('mongo-compute', { durable: false });
	ch.assertQueue('endpoint-redis', {durable: false});
	ch.assertQueue('redis-mongo', { durable: false, });
	ch.assertQueue('compute-mongo', { durable: false, });
	ch.prefetch(1);
	//22222222222222222222222222222222222222222
	ch.consume('mongo-compute', (msg)=> {
		console.log('compute reached');//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
		let body = msg.content.toString();
		let ans = calculate(JSON.parse(body));
		//33333333333333333333333333333333333333
		ch.sendToQueue(msg.properties.replyTo, Buffer.from(ans.toString()), {
			correlationId: msg.properties.correlationId,
			headers: {
				producer: "compute",
			},
		});
		ch.ack(msg);
		ch.sendToQueue('compute-mongo', Buffer.from(
			JSON.stringify({expression: body, ans: ans})
		));
	});
})();
