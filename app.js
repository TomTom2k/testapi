// show item click
window.handlerClick = (e) => {
	const listItem = document.querySelectorAll('.item');
	listItem.forEach((item) => {
		let checkBox = item.querySelector('input');

		if (checkBox.checked || item === e) item.classList.add('active');
		else item.classList.remove('active');
	});
};

//set date for input date
getDateNow = () => {
	let dt = new Date();
	const day = ('0' + dt.getDate()).slice(-2);
	const month = ('0' + (dt.getMonth() + 1)).slice(-2);
	const date = dt.getFullYear() + '-' + month + '-' + day;
	return date;
};

let fromDate = document.getElementById('from-date');
fromDate.value = getDateNow();

let toDate = document.getElementById('to-date');
toDate.value = getDateNow();

// do with api
const messageAPI = 'http://localhost:3000/message';
var page = 1;
var maxPages;

const start = () => {
	getMessage((message) => {
		renderMessageFilter(message);
	});

	renderPage();

	handleCreateForm();
};

start();
// get api
function getMessage(callback) {
	fetch(messageAPI)
		.then((res) => res.json())
		.then(callback);
}
// post api
function createMessage(data) {
	fetch(messageAPI, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})
		.then((res) => res.json())
		.then(window.location.reload());
}
// edit api
function editMessage(id, data) {
	fetch(messageAPI + '/' + id, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})
		.then((res) => res.json())
		.then(window.location.reload());
}
// delete api
function handlerDeleteMessage(id) {
	fetch(messageAPI + '/' + id, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
	})
		.then((res) => res.json())
		.then(window.location.reload());
}

// sent message
let sentBtn = document.getElementById('sent');

sentBtn.onclick = (e) => {
	e.preventDefault();
	sentBtn.classList.toggle('active');
};

function handleCreateForm() {
	let postBtn = document.getElementById('post');

	postBtn.onclick = () => {
		let number = document.getElementById('number').value;
		let name = document.getElementById('name').value;
		let message = document.getElementById('message').value;

		let formData = {
			Number: number,
			Caller: name,
			receivedDate: getDateNow(),
			confirmDate: getDateNow(),
		};

		createMessage(formData);
	};
}

// delete selected message
let deleteBtn = document.getElementById('delete');
deleteBtn.onclick = () => {
	const listItem = document.querySelectorAll('.item');
	listItem.forEach((item) => {
		let checkBox = item.querySelector('input');
		if (checkBox.checked) handlerDeleteMessage(checkBox.id);
	});
};

// edit message
window.handlerClickReply = (e) => {
	document.querySelector('.body').classList.toggle('active');

	let putBtn = document.getElementById('put');

	putBtn.onclick = () => {
		let number = document.getElementById('number-new').value;
		let name = document.getElementById('name-new').value;
		let message = document.getElementById('message-new').value;

		let formData = {
			Number: number,
			Caller: name,
			receivedDate: getDateNow(),
			confirmDate: getDateNow(),
		};

		editMessage(e, formData);
	};
};

// create table when change number item
function renderPage() {
	let numItemBtn = document.getElementById('num-item');
	numItemBtn.onblur = () => {
		if (numItemBtn.value) {
			getMessage((message) => {
				renderMessageFilter(message);
			});
		}
	};
}

function createPagination() {
	let numPages = document.querySelector('.pagination .pages');

	// render pagination number
	numPages.innerHTML = '';
	for (let i = 0; i < maxPages; i++) {
		if (i + 1 === page) {
			numPages.innerHTML += `
				<button class="active" onclick="goToPage(${i + 1})">${i + 1}</button>
			`;
		} else {
			numPages.innerHTML += `
				<button onclick="goToPage(${i + 1})">${i + 1}</button>
			`;
		}
	}

	// prev page by click before btn
	const beforeBtn = document.getElementById('before');
	beforeBtn.onclick = () => {
		if (page === 1) page = maxPages;
		else page--;
		getMessage((message) => {
			renderMessageFilter(message);
		});
	};

	// next page by click next button
	const nextBtn = document.getElementById('next');
	nextBtn.onclick = () => {
		if (page === maxPages) page = 1;
		else page++;
		getMessage((message) => {
			renderMessageFilter(message);
		});
	};
}

// go to page number when click number in pagination
window.goToPage = (pageNum) => {
	page = pageNum;
	getMessage((message) => {
		renderMessageFilter(message);
	});
};

// ----------------search---------------------
// search by caller
const searchBtn = document.getElementById('search-btn');
searchBtn.onclick = () => {
	const name = document.getElementById('search-caller').value;
	getMessage((message) => {
		let messageFil = message.filter((mes) =>
			mes.Caller.toLowerCase().includes(name.toLowerCase())
		);
		renderMessageFilter(messageFil);
	});
};

// search by date
const searchDateBtn = document.getElementById('search-date-btn');
searchDateBtn.onclick = () => {
	const fromDate = document.getElementById('from-date').value;
	const toDate = document.getElementById('to-date').value;

	getMessage((message) => {
		let messageFil = message.filter(
			(mes) => mes.receivedDate >= fromDate && mes.confirmDate <= toDate
		);
		renderMessageFilter(messageFil);
	});
};

// show by filter
function renderMessageFilter(message) {
	let listMessage = document.querySelector('.body-table');

	let numItem = document.getElementById('num-item').value;
	maxPages = Math.round(message.length / numItem);
	createPagination();

	let htmls = message.map((message, index) =>
		index < numItem * page && index >= numItem * page - numItem
			? `
				<tr onclick="handlerClick(this)" class="item " key="${message.id}">
					<td><input type="checkbox" id="${message.id}"></td>
					<td>${message.Number}</td>
					<td>${message.Caller}</td>
					<td>This is content</td>
					<td>${message.receivedDate}</td>
					<td>${message.confirmDate}</td>
					<td>
						<button onclick="handlerDeleteMessage(${message.id})">Delete</button>
					</td>
					<td><button onclick="handlerClickReply(${message.id})">Reply</button></td>
				</tr>
			`
			: ''
	);

	listMessage.innerHTML = htmls.join('');
}
