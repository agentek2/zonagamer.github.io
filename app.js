const listProducts = document.querySelector('#listProducts');
const contentProducts = document.querySelector('#contentProducts');
const emptyCart = document.querySelector('#emptyCart')

let productsArray = [];

document.addEventListener('DOMContentLoaded', function() {
    eventListeners();
});

function eventListeners() {
    listProducts.addEventListener('click', getDataElements);
    emptyCart.addEventListener('click', function() {
        productsArray = [];
        productsHtml();
        updateCartCount();
        updateTotal();
    });

    const loadProduct = localStorage.getItem('products');
    if (loadProduct) {
        productsArray = JSON.parse(loadProduct);
        productsHtml();
        updateCartCount();

    } else {
        productsArray = [];
    }

}

function updateCartCount() {
    const cartCount = document.querySelector('#cartCount');
    cartCount.textContent = productsArray.length;
}

function updateTotal() {
    const total = document.querySelector('#total');
    let totalProduct = productsArray.reduce((total, prod) => total + prod.price * prod.quantity, 0);
    total.textContent = `$${totalProduct.toFixed(2)}`;
}

function getDataElements(e) {
    const boton = e.target.closest('.boton-mas');

    if (!boton) return;

    const elementHtml = boton.closest('.card');

    if (!elementHtml) return;

    selectData(elementHtml);
}


function selectData(prod) {
    const productObj = {
        img: prod.querySelector('img').src,
        title: prod.querySelector('h3').textContent.trim(),
        price: parseFloat(
            prod.querySelector('#currentPrice').textContent
            .replace('S/', '')
            .trim()
        ),
        id: parseInt(
            prod.querySelector('.boton-mas').dataset.id,
            10
        ),
        quantity: 1
    };

    // Comprobar si el producto ya existe
    const existe = productsArray.some(
        producto => producto.id === productObj.id
    );

    if (existe) {
        // Si existe, aumentar su cantidad
        productsArray = productsArray.map(producto => {
            if (producto.id === productObj.id) {
                return {
                    ...producto,
                    quantity: producto.quantity + 1
                };
            }

            return producto;
        });
    } else {
        // Si no existe, agregarlo al carrito
        productsArray = [...productsArray, productObj];
    }

    showAlert('el producto fue agregado exitosamente', 'success');
    productsHtml();
    updateCartCount();
    updateTotal();
}

function productsHtml() {
    cleanHtml();
    productsArray.forEach(prod => {
        const { img, title, price, quantity, id, } = prod;
        const tr = document.createElement('tr');
        const tdImg = document.createElement('td');
        const prodImg = document.createElement('img');
        prodImg.src = img;
        prodImg.alt = 'image product'
        tdImg.appendChild(prodImg);

        const tdTitle = document.createElement('td');
        const prodTitle = document.createElement('p');
        prodTitle.textContent = title;
        tdTitle.appendChild(prodTitle);

        const tdPrice = document.createElement('td');
        const prodPrice = document.createElement('p');
        const newPrice = price * quantity;
        prodPrice.textContent = `$${newPrice.toFixed(2)}`;
        tdPrice.appendChild(prodPrice);


        const tdQuantity = document.createElement('td');
        const prodQuantity = document.createElement('input');
        prodQuantity.type = 'number';
        prodQuantity.min = '1';
        prodQuantity.value = quantity;
        prodQuantity.dataset.id = id;
        prodQuantity.oninput = updateQuantity;
        tdQuantity.appendChild(prodQuantity);



        const tdDelete = document.createElement('td');
        const prodDelete = document.createElement('button');
        prodDelete.type = 'button';
        prodDelete.textContent = 'X';
        prodDelete.onclick = () => destroyPrduct(id);
        tdDelete.appendChild(prodDelete);

        tr.append(tdImg, tdTitle, tdPrice, tdQuantity, tdDelete);

        contentProducts.appendChild(tr);
    });
    saveLocalStorage();
}

function saveLocalStorage() {
    localStorage.setItem('products', JSON.stringify(productsArray));

}

function updateQuantity(e) {
    const newQuantity = parseInt(e.target.value, 10);
    const idProd = parseInt(e.target.dataset.id, 10);
    const product = productsArray.find(prod => prod.id == idProd);
    if (product && newQuantity > 0) {
        product.quantity = newQuantity;
    }
    productsHtml();
    updateTotal();
    saveLocalStorage();
}

function destroyPrduct(idProd) {
    productsArray = productsArray.filter(prod => prod.id !== idProd);

    showAlert('se elimino exitosamente', 'success');
    productsHtml();
    updateCartCount();
    updateTotal();
    saveLocalStorage();
}

function cleanHtml() {
    contentProducts.innerHTML = '';
}

function showAlert(menssage, type) {
    const nonRepeatAlert = document.querySelector('.alert');
    if (nonRepeatAlert) {
        nonRepeatAlert.remove();

    }
    const div = document.createElement('div');
    div.classList.add('alert', type);
    div.textContent = menssage;

    document.body.appendChild(div);

    setTimeout(() => div.remove(), 5000);
}