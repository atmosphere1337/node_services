// MONGO
const amqplib = require('amqplib');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/calculate');
const Compute = mongoose.model('compute', {expression: String, ans: String});

async function mng_get(data) {
	let ans =  await Compute.findOne({expression: data});
	console.log('mng_get: ', ans);
	if (ans)
		return ans.ans.toString();
	else
		return undefined;
}

async function mng_set(expression, ans) {
	console.log('mng_set', expression, ans);
	//await Compute.create({expression: expression, ans: ans});
	const record = new Compute(); 
	record.expression = expression;
	record.ans = ans;
	record.save();
}

(async () => {
	const conn = await amqplib.connect('amqp://localhost'); 
	const ch = await conn.createChannel();
	ch.assertQueue('mongo-compute', { durable: false });
	ch.assertQueue('endpoint-redis', {durable: false});
	ch.assertQueue('redis-mongo', { durable: false, });
	ch.assertQueue('compute-mongo', { durable: false, });
	ch.assertQueue('mongo-redis', { durable: false, });
	ch.prefetch(1);
	// 4444444444444444444
	ch.consume('redis-mongo', async (msg) => {
		let data = msg.content.toString();
		console.log('mongo got', data); // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
		let ans = await mng_get(data);
		// 555555555555555555555
		if (ans == undefined) {
			console.log('not found in mongo'); // xxxxxxxxxxxxxxxxxxx
			ch.sendToQueue('mongo-compute', Buffer.from(data), {
				correlationId: msg.properties.correlationId,
				replyTo: msg.properties.replyTo,
			});
		} else {
			// 0000000000000000000
			console.log('found in mongo', ans); // xxxxxxxxxxxxxxxxxxx
			ch.sendToQueue(msg.properties.replyTo, Buffer.from(ans), {
				correlationId: msg.properties.correlationId,
				headers: {
					producer: "mongo",
				}
			});
			const toRedis = JSON.stringify({
				expression: data,
				ans: ans,
			});
			ch.sendToQueue('mongo-redis', Buffer.from(toRedis) );
		}
		ch.ack(msg);
	});
	ch.consume('compute-mongo', (msg) => {
		let data = JSON.parse(msg.content.toString());
		mng_set(data.expression, data.ans);
		ch.ack(msg);
	});

})();

