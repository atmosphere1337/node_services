const ans = document.getElementById('ans');
const src = document.getElementById('src');
const f1 = document.getElementById('f1');
const f2 = document.getElementById('f2');
const op = document.getElementById('op');
const send = document.getElementById('send');

send.addEventListener('click', async () => {
	 const url = "http://localhost:1337/";
	 const payload = JSON.stringify({
			f1: f1.value,
			f2: f2.value,
			op: op.value
	 });
	 const options = {
		method: 'POST',
		body: payload,
	 };
	 const response = await fetch(url, options);
	 if (response.status == 200) {
		 const response2 = await response.text();
		 const result = JSON.parse(response2);
		 ans.innerText = result.ans;
		 src.innerText = result.src;
	 }
	 else {
	 	alert('server error');
	 }
});

