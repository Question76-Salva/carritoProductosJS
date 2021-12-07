//* ==================
//* === carrito js ===
//* ==================

// ======================================
// === seleccionar/capturar elementos ===
// ======================================
const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
const templateCard = document.getElementById('template-card').content;  // .content -> para acceder a template
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
const fragment = document.createDocumentFragment();

// ====================================
// === colección de datos | objetos ===
// ====================================
let carrito = {};

// ===============
// === eventos ===
// ===============

// === espera a que se carge todo el html y luego ejecuta las funciones ===
document.addEventListener('DOMContentLoaded', () => {
    // === ejecuta funciones ===
    fetchData();
    // === ¿existe algo en el localStorage? ===
    if(localStorage.getItem('carrito')) {
        // si, existe | llenamos el carrito con la info que viene del localStorage | al refrescar la página
        // convierte de string a json
        carrito = JSON.parse(localStorage.getItem('carrito'));
        pintarCarrito();
    }
});

// === delegación eventos | para los botones "Comprar" ===
cards.addEventListener('click', e => {
    // === ejecutar función | 'e' para capturar el elemento que queremos modificar ===
    addCarrito(e);
});

// === delegación eventos | para los botones "Acciones + -" ===
items.addEventListener('click', e => {
    btnAccion(e);
})


// =================
// === funciones ===
// =================

// === capturar los datos ===
// acceder a la api con fetch | api.json
const fetchData = async () => {
    try {
        // === hacer la petición | pedir respuesta a api.json | espera a leer api.json y continua programa ===
        const res = await fetch('api.json');
        // === una vez obtenida la respuesta guardar la data (colección de datos) | respuesta en .json ===
        const data = await res.json();
        //console.log(data);
        // === llama a la función y pasarle la colección de datos ===
        pintarCards(data);
    } catch (error) {
        console.log(error);
    }
}


const pintarCards = data => {
    //console.log(data);
    // === una vez que tenemos la 'data' tenemos que recorrerla (colección de datos) ===
    data.forEach(producto => {
        //console.log(producto);
        // === acceder a los elementos del 'template-card' del html para renderizarlo dinámicamente === 
        templateCard.querySelector('img').setAttribute("src", producto.thumbnailUrl);
        templateCard.querySelector('h5').textContent = producto.title;
        templateCard.querySelector('p').textContent = producto.precio;
        templateCard.querySelector('.btn-dark').dataset.id = producto.id;

        // === hacer la clonación ===
        const clone = templateCard.cloneNode(true);
        // === colocarlo en su sitio ===
        fragment.appendChild(clone);
    });

    // === renderizarlo en el html ===
    cards.appendChild(fragment);
}


const addCarrito = e => {
    //console.log(e.target);
    // === seleccionar/capturar botón 'Comprar' ===
    //console.log(e.target.classList.contains('btn-dark'));
    // === detectar botón 'Comprar' ===
    if(e.target.classList.contains('btn-dark')) {
        // === empujar todo el div que contiene el producto ===
        // mandamos el elemento padre a 'setCarrito' (setCarrito captura estos elementos) ===
        setCarrito(e.target.parentElement);
    }

    // === detener otro evento que se pueda generar en nuestro 'items' (eventos) ===
    e.stopPropagation();
}


const setCarrito = objeto => {
    // === al hacer click en 'Comprar' seleccionamos todos los elementos y los empujamos a 'setCarrito' ===
    // y así poder generar ese objeto (cpatura los elementos) | captura todo el div que corresponde al producto
    //console.log(objeto);
    // === crear el objeto | producto ===
    const producto = {
        id: objeto.querySelector('.btn-dark').dataset.id,
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1        
    }

    // === aumentar cantidad del producto | si queremos comprar más de 1 | para que no se pinte otra vez ===
    // solo aúmente la cantidad en el número
    // === ¿existe el producto? ===
    if(carrito.hasOwnProperty(producto.id)) {
        // si, entonces el producto se está duplicando | aumentar la cantidad
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }

    // === empujar el producto al carrito | adquirir el objeto y hacer una copia del producto ===
    // si el producto no existe lo vamos a crear, si existe lo sobrescribimos
    carrito[producto.id] = {...producto};

    //console.log(carrito);

    // === renderiza prodcuto en el html | una vez haya sido añadido al carrito ===
    pintarCarrito();
}


const pintarCarrito = () => {
    //console.log(carrito);

    // === limpiar html | para no repetir elementos ===
    items.innerHTML = '';

    // === recorrer el carrito | colección de datos ===
    Object.values(carrito).forEach(producto => {
        // === seleccionar elementos del template ===
        templateCarrito.querySelector('th').textContent = producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title;
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio;

        // === clonar el elemento/producto ===
        const clone = templateCarrito.cloneNode(true);

        // === posicionar elemento ===
        fragment.appendChild(clone);
    });

    // === renderizar el producto en el html ===
    items.appendChild(fragment);

    // === renderizar el footer en el html ===
    pintarFooter();

    // === guardar objeto/producto en el localStorage | convierte colección a string ===
    localStorage.setItem('carrito', JSON.stringify(carrito));
}


const pintarFooter = () => {
    // === limpiar html | para no repetir elementos ===
    footer.innerHTML = '';

    // === ¿contiene el carrito elementos? ===
    if(Object.keys(carrito).length === 0) {
        // el carrito está vacio | no existen elementos
        footer.innerHTML = `
            <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
        `;
        // === sal de la función ===
        return;
    }

    // === suma de todas las cantidades ===
    const nCantidad = Object.values(carrito).reduce((acc, {cantidad}) => acc + cantidad, 0);
    
    // === suma los precios ===
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio, 0);

    //console.log(nPrecio);

    // === renderizar template en el footer ===
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    templateFooter.querySelector('span').textContent = nPrecio;

    // === hacer la clonación ===
    const clone = templateFooter.cloneNode(true);

    // === posicionar elemento ===    
    fragment.appendChild(clone);

    // === renderizar el elemento en el html ===
    footer.appendChild(fragment);

    // === seleccionar botón 'Vaciar Carrito ===
    const btnVaciar = document.getElementById('vaciar-carrito');

    // === añadir evento al botón ===
    btnVaciar.addEventListener('click', () => {
        // === vaciar ===
        carrito = {};
        // === actualizar elementos en el html ===
        pintarCarrito();
    });
}


const btnAccion = e => {
    // === detectar los botones para las 'Acciones + -' ===
    //console.log(e.target);

    // === acceder a nuestra colección de objetos que tiene esa cantidad ===
    // acción de aumentar | +
    if(e.target.classList.contains('btn-info')) {
        // === acceder al elemento ===
        //console.log(carrito[e.target.dataset.id]);
        // === acceder al producto ===
        const producto = carrito[e.target.dataset.id];
        // === le sumamos 1 a la cantidad del producto ===
        producto.cantidad++;
        // === hace un copia del producto ===
        carrito[e.target.dataset.id] = {...producto};
        // === actualizar elementos en el html ===
        pintarCarrito();
    }

    // acción de disminuir | -
    if(e.target.classList.contains('btn-danger')) {
        // === acceder al producto ===
        const producto = carrito[e.target.dataset.id];
        // === le restamos 1 a la cantidad del producto ===
        producto.cantidad--;
        // === que no pase de 0 a número negativo | con 0 desaparece el producto ===
        if(producto.cantidad === 0) {
            // === eliminar el objeto que tiene el índice | sólo el prodcuto ===
            delete carrito[e.target.dataset.id];
        }

        // === actualizar elementos en el html ===
        pintarCarrito();
    }

    // === evita que otros eventos del div actuen ===
    e.stopPropagation();
}