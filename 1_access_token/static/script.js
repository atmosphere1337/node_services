let loginpage = document.getElementById("login");
let registerpage = document.getElementById("register"); 
let pagepage = document.getElementById("page");
let sendlogin = document.getElementById("sendlogin");
let sendregister = document.getElementById("sendregister");
let gologin = document.getElementById("goLog");
let goregister = document.getElementById("goReg");
let gologout = document.getElementById("logout");

let rlogin = document.getElementById("rlogin");
let rpassword = document.getElementById("rpassword");
let llogin = document.getElementById("llogin");
let lpassword = document.getElementById("lpassword");

loginpage.style.display = 'block';
registerpage.style.display = 'none';
pagepage.style.display = 'none';

gologin.addEventListener('click', (what) => {
	 document.getElementById("login").style.display='block';
	 document.getElementById("register").style.display='none';
	 document.getElementById("page").style.display='none';
});

goregister.addEventListener('click', (what) => {
	 document.getElementById("login").style.display='none';
	 document.getElementById("register").style.display='block';
	 document.getElementById("page").style.display='none';
});

sendlogin.addEventListener('click', async ()=>{
	//send login;
	let llogin = document.getElementById("llogin").value;
	let lpassword = document.getElementById("lpassword").value;
	let data = {login:llogin, password: lpassword};

	let url = '/login';
	let options = {
		method: "POST",
		headers: {
			"Content-type" : "application/json"
		},
		body : JSON.stringify(data)
	};
	let response = await fetch(url, options);
	let response2 = await response.text();
	if (response.status == 404) {
		document.getElementById("lerror").innerText = "Wrong login or password";
		setTimeout(() => {
			document.getElementById("lerror").innerText = "";
		}, 5000);
	}
});

sendregister.addEventListener('click', async (shit)=>{
	let login = document.getElementById("rlogin").value;
	let password = document.getElementById("rpassword").value;
	let body = {login: login, password: password};
	let url = "/register";
	let options = {
		method: "POST",
		body: JSON.stringify(body)
	};
	let response = await fetch(url, options);
	if (response.status == 200) {
		document.getElementById("login").style.display='block';
		document.getElementById("register").style.display='none';
		document.getElementById("page").style.display='none';
		document.getElementById("lsuccess").innerText = "Account created!";
		setTimeout(()=>{
			document.getElementById("lsuccess").innerText = "";
		}, 5000);

	} else {
		document.getElementById("rerror").innerText = "account exists";
		setTimeout(()=>{
			document.getElementById("rerror").innerText = "";
		}, 5000);
		
	}
});
	
setInterval(async () => {
	let url = '/page';
	let options = {
		method: "GET"
	};
	let response = await fetch(url, options);
	let response2 = await response.text();
	if (response.status == 200) {
		 document.getElementById("login").style.display='none';
		 document.getElementById("register").style.display='none';
		 document.getElementById("page").style.display='block';
		 document.getElementById("message").innerText=response2;
	}
	else {
		if (document.getElementById("page").style.display == 'block') {
			 document.getElementById("login").style.display='block';
			 document.getElementById("register").style.display='none';
			 document.getElementById("page").style.display='none';
		 }
	}

}, 1000);

gologout.addEventListener('click', async () => {
	let url = '/logout';
	let options = {method: "GET"};
	let response = await fetch(url, options);
});






