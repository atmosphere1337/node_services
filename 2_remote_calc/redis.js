// REDIS
const amqplib = require('amqplib');
const redis = require('redis');

async function rds_get(key) {
	const client = await redis.createClient().connect();
	let ans;
	if (await client.exists(key.toString())) {
		ans = await client.get(key.toString());
	}
	await client.disconnect();
	return ans;
}
async function rds_set(expression, ans) {
	const client = await redis.createClient().connect();
	await client.set(expression, ans, {EX: 10});
	await client.disconnect();
}

(
	async () => {
		const conn = await amqplib.connect('amqp://localhost');
		const ch = await conn.createChannel();
		ch.assertQueue('mongo-compute', { durable: false });
		ch.assertQueue('endpoint-redis', {durable: false});
		ch.assertQueue('redis-mongo', { durable: false, });
		ch.assertQueue('mongo-redis', { durable: false, });
		ch.prefetch(1);
		// 222222222222222222222222222222222222222
		ch.consume('endpoint-redis', async (msg) => {
			let data = msg.content.toString();
			console.log("redis got", data); //xxxxxxxxxxxxxxx
			let ans =  await rds_get(data);
			ch.ack(msg);
			if (ans == undefined) {
				// 3333333333333333333333333333333333
				console.log('not found in redis'); //xxxxxxxxxxxxxxx
				ch.sendToQueue('redis-mongo', Buffer.from(data), {
					correlationId: msg.properties.correlationId,
					replyTo: msg.properties.replyTo,
				});
			} else {
				// 000000000000000
				console.log('found in redis'); //xxxxxxxxxxxxxxx
				ch.sendToQueue(msg.properties.replyTo, Buffer.from(ans.toString()), {
					correlationId: msg.properties.correlationId,
					headers : {
						producer: "redis",
					},
				});
			}
		});
		ch.consume('mongo-redis', (msg) => {
			const data = JSON.parse(msg.content.toString());
			rds_set(data.expression, data.ans);
			ch.ack(msg);
		});
	}
)();

