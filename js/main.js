const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const more = document.querySelector('.more');
const navigationLinks = document.querySelectorAll('.navigation-link');
const longGoodsList = document.querySelector('.long-goods-list');
const card = document.querySelectorAll('.card');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');
const countCart = document.querySelector('.cart-count');
//const clearCarts = document.querySelector('.clear-button');


const getGoods = async function(){
	const result = await fetch('db/db.json');
	if(!result.ok){
		throw 'Ошибочка вышла:' + result.status;
	}
	return result.json();
}

const cart = {
	cartGoods: [
	],
	renderCarts(){
		cartTableGoods.textContent='';
		this.cartGoods.forEach(({id,name,price,count})=>{
		const table = document.createElement('tr');
		table.classList.add('cart-item');
		table.dataset.id= id;
		table.innerHTML=`
		<td>${name}</td>
		<td>${price}$</td>
		<td><button class="cart-btn-minus">-</button></td>
		<td>${count}</td>
		<td><button class="cart-btn-plus">+</button></td>
		<td>${price * count}$</td>
		<td><button class="cart-btn-delete">x</button></td>
		`
		cartTableGoods.append(table);
		this.cartQantity()
	})

	const total = this.cartGoods.reduce((summ, item)=>{
		return summ + item.price * item.count;
	},0)
	cardTableTotal.textContent = total + '$';
	},
	deleteGood(id){
		this.cartGoods = this.cartGoods.filter(item =>{
		return	id !== item.id;
		})
		this.renderCarts()
		this.cartQantity()
	},
	minusGood(id){
		for (const item of this.cartGoods){
			if(item.id === id){
				if (item.count <= 1){
					this.deleteGood(id)
				} else {
					item.count--;
				}
				break;
				}
		}
		this.renderCarts()
		this.cartQantity()

	},
	plusGood(id){
		for (const item of this.cartGoods){
			if(item.id === id){
				item.count++;
				break;
			}
		}
		this.renderCarts()
		this.cartQantity()

	},
	addCartGoods(id){
		const checkGoots = this.cartGoods.find(elem => elem.id ===id);
		if (checkGoots){
			this.plusGood(id);
		} else{
		getGoods()
		.then(data => data.find(elem => elem.id === id))
		.then(({id, name, price}) => { 
			this.cartGoods.push({
			id, 
			name, 
			price, 
			count:1})
			this.cartQantity()
		});
		};

	},
	cleanCartGoods(){
		this.cartGoods.length=0;
		this.cartQantity()
	},
	clearButton(){
		const clearCard = document.createElement('span');
		clearCard.classList.add('clear-button','visible');
		clearCard.textContent = 'Clear card';
		const cartHeader = document.querySelector('.modal-header');
		cartHeader.append(clearCard)
	},
	cartQantity(data) {
			if(this.cartGoods.length > 0){
			countCart.textContent = this.cartGoods.reduce((summ, data)=>{
				return summ + data.count;
			},0)} else{
				countCart.textContent ='';
			}
		
	}

};
cart.clearButton();

document.body.addEventListener('click', e=>{
		const target = e.target.closest('.clear-button');
		if(target){
			cart.cleanCartGoods();
			//target.classList.remove('visible');
			cart.renderCarts();
		}
	});

document.body.addEventListener('click', e => {
	const target = e.target.closest('.add-to-cart');
	if(target){
		const id = target.dataset.id;
		cart.addCartGoods(id);
		console.log(id);
	}
})

cart.renderCarts(...cart.cartGoods);

const openModal = () =>{
	modalCart.classList.add('show');
	cart.renderCarts();
};

cartTableGoods.addEventListener('click', e => {
	const target = e.target;
	if (target.tagName === 'BUTTON'){
		const id = target.closest('.cart-item').dataset.id;

		if (target.classList.contains('cart-btn-delete')){
			cart.deleteGood(id);
		};
		if (target.classList.contains('cart-btn-minus')){
			cart.minusGood(id);

		};
		if (target.classList.contains('cart-btn-plus')){
			cart.plusGood(id);
		};

	};
});



const closeModal = ()=> {
	modalCart.classList.remove('show')
};

buttonCart.addEventListener('click', openModal);
modalCart.addEventListener('click', event =>{
	let target = event.target
	if(target.classList.contains('overlay') ||
		target.classList.contains('modal-close')
	){
		closeModal()
	}
});

//scroll smooth

const scrollLink = document.querySelectorAll('a.scroll-link, .more');

for(const links of scrollLink){
	links.addEventListener('click',(e)=>{
		e.preventDefault();
		const id = links.getAttribute('href');
		document.querySelector(id).scrollIntoView({
			behavior:'smooth',
			block: 'start',
		});
	});
};

const createCard = ({label,img, name, description,price,id}) =>{
	const card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';
	card.innerHTML = `
	<div class="goods-card">
	${label?`<span class="label">${label}</span>`:''}
	<img src="db/${img}" alt="${name}" class="goods-image">
	<h3 class="goods-title">${name}</h3>
	<p class="goods-description">${description}</p>
	<button class="button goods-card-btn add-to-cart" data-id="${id}">
		<span class="button-price">$${price}</span>
	</button>
    </div>`;
	return card;
	
};

const renderCards = (data) => {
	longGoodsList.textContent='';
	const card = data.map(createCard);
	longGoodsList.append(...card);
	document.body.classList.add('show-goods');

}

more.addEventListener('click', (event)=>{
	event.preventDefault();
	getGoods().then(renderCards)});

const filterCards = (field, value)=>{
	getGoods()
	.then(data => data.filter(goods=>goods[field] === value))
	.then(renderCards);
};

navigationLinks.forEach((link)=>{
	link.addEventListener('click', (e)=>{
		e.preventDefault();
		const field = e.target.dataset.field;
		const value = e.target.innerHTML;
		(field && value)?filterCards (field,value):getGoods().then(renderCards);
	})
})



card.forEach((elem)=>{
elem.addEventListener('click', (e)=>{
	e.preventDefault();
	let scrollFunc = ()=>{ document.body.scrollIntoView({
		behavior:'smooth',
		block: 'start',
	})};
	if(e.target.closest('.button') && e.target.closest('.card-1')){
		filterCards('category','Accessories');
		scrollFunc();
	} else if (e.target.closest('.button') && e.target.closest('.card-2')){
		filterCards('category','Clothing');
		scrollFunc();
	}

})});

//sending data to server

const modalForm = document.querySelector('.modal-form');

const postData = dataUser => fetch('server.php', {
	method: 'POST',
	body: dataUser,
});



modalForm.addEventListener('submit', event => {
	event.preventDefault();
	const formData = new FormData(modalForm);
	formData.append('cart',JSON.stringify(cart.cartGoods));
	console.log('HI')
	postData(formData)
	.then(response => {
		if(!response.ok){
			throw Error(response.status);
		};
		alert('Инфа успешно отправлена');

	})
	.catch( err => {
		alert('Ошибка отправки!')
		console.error(err);
	}
	)
	.finally(()=>{
		closeModal();
		modalForm.reset();
		cart.cleanCartGoods();
	});

});

