// Variable para almacenar el carrito de compras
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Cargar productos desde el archivo JSON
async function cargarProductos() {
    try {
        const response = await fetch('productos.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo de productos.');
        }
        const productos = await response.json();
        mostrarProductos(productos);
    } catch (error) {
        console.error('Error cargando los productos:', error);
    }
}

// Mostrar productos en la página
function mostrarProductos(productos) {
    const contenedorProductos = document.getElementById('lista-productos');
    contenedorProductos.innerHTML = ''; // Limpiar la sección de productos

    productos.forEach(producto => {
        const productoDiv = crearProductoElemento(producto);
        contenedorProductos.appendChild(productoDiv);
    });
}

// Crear el elemento HTML de un producto
function crearProductoElemento(producto) {
    const productoDiv = document.createElement('div');
    productoDiv.classList.add('col-md-4', 'mb-4');

    const productoEnCarrito = carrito.find(item => item.nombre === producto.nombre);
    const cantidadEnCarrito = productoEnCarrito ? productoEnCarrito.cantidad : 0;

    productoDiv.innerHTML = `
        <div class="card">
            <img src="images/${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
            <div class="card-body">
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text">${producto.descripcion}</p>
                <p class="precio">$${producto.precio}</p>
                ${cantidadEnCarrito > 0 ? 
                    `<button class="btn btn-outline-success" onclick="agregarAlCarrito('${producto.nombre}', ${producto.precio}, '${producto.imagen}')">+ ${cantidadEnCarrito} en carrito</button>` 
                    : 
                    `<button class="btn btn-primary" onclick="agregarAlCarrito('${producto.nombre}', ${producto.precio}, '${producto.imagen}')">Agregar al carrito</button>`}
            </div>
        </div>
    `;
    return productoDiv;
}

// Agregar un producto al carrito o aumentar su cantidad
function agregarAlCarrito(nombre, precio, imagen) {
    const productoEnCarrito = carrito.find(item => item.nombre === nombre);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carrito.push({ nombre, precio, imagen, cantidad: 1 });
    }

    actualizarCarrito();
}

// Función para mostrar el modal del carrito
function mostrarModalCarrito() {
    // Verifica si el modal ya está creado
    if (document.getElementById('modalCarrito')) {
        mostrarProductosEnCarrito();
        const modalElement = document.getElementById('modalCarrito');
        const modal = new bootstrap.Modal(modalElement);
        modal.show(); // Mostrar el modal
        return;
    }

    // Crear el modal dinámicamente
    const modalHTML = `
    <div id="modalCarrito" class="modal fade" tabindex="-1" aria-labelledby="modalCarritoLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalCarritoLabel">Tu Carrito</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ul id="productosCarrito" class="list-group"></ul>
                    <div class="mt-3 text-end">
                        <strong>Total: $<span id="totalCarrito">0</span></strong>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-success" onclick="comprar()">Finalizar Compra</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Insertar el modal en el body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Mostrar los productos en el carrito dentro del modal
    mostrarProductosEnCarrito();

    // Inicializar y mostrar el modal
    const modalElement = document.getElementById('modalCarrito');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// Mostrar productos en el carrito dentro del modal
function mostrarProductosEnCarrito() {
    const productosCarrito = document.getElementById('productosCarrito');
    productosCarrito.innerHTML = ''; // Limpiar el contenido del modal

    let total = 0;
    carrito.forEach(producto => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = `${producto.nombre} - $${producto.precio} x ${producto.cantidad}`;
        productosCarrito.appendChild(li);
        total += producto.precio * producto.cantidad;
    });

    document.getElementById('totalCarrito').textContent = total;
}

// Función para abrir el modal del carrito
document.querySelector('.carrito-btn').addEventListener('click', mostrarModalCarrito);

// Función de compra (como ejemplo)
function comprar() {
    let total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    let mensaje = 'Hola, estoy interesado en los siguientes productos:\n';
    
    carrito.forEach(item => {
        mensaje += `${item.nombre} - ${item.cantidad} x $${item.precio}\n`;
    });

    mensaje += `\nTotal: $${total}\n\nEstoy listo para realizar la compra.`;

    // Redirigir a WhatsApp con el mensaje
    const telefono = '+573204535477'; // Cambia este número por el de tu WhatsApp
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');

    // Limpiar el carrito después de la compra
    carrito = [];
    actualizarCarrito();
    cerrarModal();
}

// Actualizar el contador de artículos en el carrito
function actualizarCarrito() {
    const cantidadCarrito = carrito.reduce((total, item) => total + item.cantidad, 0);
    document.getElementById('carrito-cantidad').textContent = `${cantidadCarrito} artículos`;
    localStorage.setItem('carrito', JSON.stringify(carrito));  // Guardar el carrito en el almacenamiento local
}

// Cerrar el modal
function cerrarModal() {
    const modalCarrito = bootstrap.Modal.getInstance(document.getElementById('modalCarrito'));
    modalCarrito.hide();
}

// Iniciar la carga de productos al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);

// Manejo del carrito flotante
const carritoDraggable = document.getElementById("carritoDraggable");

let offsetX = 0;
let offsetY = 0;
let isDragging = false;

// Cuando el usuario comienza a arrastrar
carritoDraggable.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - carritoDraggable.getBoundingClientRect().left;
    offsetY = e.clientY - carritoDraggable.getBoundingClientRect().top;
    carritoDraggable.style.cursor = "grabbing";
});

// Mientras arrastra el carrito
document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        carritoDraggable.style.left = `${e.clientX - offsetX}px`;
        carritoDraggable.style.top = `${e.clientY - offsetY}px`;
        carritoDraggable.style.position = "fixed";
    }
});

// Cuando el usuario suelta el carrito
document.addEventListener("mouseup", () => {
    if (isDragging) {
        isDragging = false;
        carritoDraggable.style.cursor = "grab";
    }
});
