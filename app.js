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

// Crear el elemento HTML de un producto con controles de cantidad
function crearProductoElemento(producto) {
    const productoDiv = document.createElement('div');
    productoDiv.classList.add('col-md-4', 'mb-4');

    const productoEnCarrito = carrito.find(item => item.nombre === producto.nombre && item.marca === producto.marca);
    const cantidadEnCarrito = productoEnCarrito ? productoEnCarrito.cantidad : 0;

    productoDiv.innerHTML = `
        <div class="producto-card">
            <img src="images/${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
            <div class="card-body">
                <h5 class="card-title">${producto.nombre} - ${producto.marca}</h5>  <!-- Aquí agregamos la marca -->
                <p class="card-text">${producto.descripcion}</p>
                <p class="precio">$${producto.precio}</p>
                <div class="d-flex justify-content-between align-items-center">
                    ${cantidadEnCarrito > 0 ? 
                        `<button class="btn btn-outline-success" onclick="actualizarCantidadEnCarrito('${producto.nombre}', ${producto.precio}, '${producto.imagen}', '${producto.marca}', -1)">-</button>
                        <span>${cantidadEnCarrito} en carrito</span>
                        <button class="btn btn-outline-success" onclick="actualizarCantidadEnCarrito('${producto.nombre}', ${producto.precio}, '${producto.imagen}', '${producto.marca}', 1)">+</button>` 
                        : 
                        `<button class="btn btn-primary" onclick="agregarAlCarrito('${producto.nombre}', ${producto.precio}, '${producto.imagen}', '${producto.marca}')">Agregar al carrito</button>`
                    }
                </div>
            </div>
        </div>
    `;
    return productoDiv;
}

// Función para actualizar la cantidad de un producto en el carrito
function actualizarCantidadEnCarrito(nombre, precio, imagen, marca, cantidadCambio) {
    const productoEnCarrito = carrito.find(item => item.nombre === nombre && item.marca === marca);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad += cantidadCambio;

        // Eliminar el producto si la cantidad es 0
        if (productoEnCarrito.cantidad <= 0) {
            carrito = carrito.filter(item => item !== productoEnCarrito);
        }
    } else if (cantidadCambio > 0) {
        carrito.push({ nombre, precio, imagen, marca, cantidad: cantidadCambio });
    }

    actualizarCarrito();
    mostrarModalCarrito(); // Mostrar el modal actualizado
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

// Función para mostrar los productos en el carrito dentro del modal
function mostrarProductosEnCarrito() {
    const productosCarrito = document.getElementById('productosCarrito');
    productosCarrito.innerHTML = ''; // Limpiar el contenido del modal

    let total = 0;
    carrito.forEach(producto => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>${producto.nombre} (${producto.marca}) - $${producto.precio} x ${producto.cantidad}</span>
                <div>
                    <button class="btn btn-sm btn-outline-success" onclick="actualizarCantidadEnCarrito('${producto.nombre}', ${producto.precio}, '${producto.imagen}', '${producto.marca}', -1)">-</button>
                    <button class="btn btn-sm btn-outline-success" onclick="actualizarCantidadEnCarrito('${producto.nombre}', ${producto.precio}, '${producto.imagen}', '${producto.marca}', 1)">+</button>
                </div>
            </div>
        `;
        productosCarrito.appendChild(li);
        total += producto.precio * producto.cantidad;
    });

    document.getElementById('totalCarrito').textContent = total;
}

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

// Función para abrir el modal del carrito solo cuando se hace clic en el ícono
document.querySelector('.carrito-btn').addEventListener('click', mostrarModalCarrito);


