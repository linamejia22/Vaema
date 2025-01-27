// Variable para almacenar el carrito de compras
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Variable global para los productos
let productosGlobales = []; // Almacenar los productos cargados desde el JSON

// Cargar productos desde un archivo JSON
async function cargarProductos() {
    try {
        const response = await fetch('productos.json'); // Cambia esta ruta si es necesario
        productosGlobales = await response.json();
        mostrarProductos(productosGlobales); // Mostrar todos los productos al cargar la página
    } catch (error) {
        console.error('Error cargando los productos:', error);
    }
}

// Función para filtrar productos
function filtrarProductos() {
    const busqueda = document.getElementById('buscador').value.toLowerCase();
    const productosFiltrados = productosGlobales.filter(producto => {
        return producto.nombre.toLowerCase().includes(busqueda) || 
               producto.marca.toLowerCase().includes(busqueda) ||
               producto.descripcion.toLowerCase().includes(busqueda);
    });
    mostrarProductos(productosFiltrados); // Mostrar productos filtrados
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
        <div class="producto-card card shadow-sm border-light">
            <img src="images/${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
            <div class="card-body">
                <h5 class="card-title">${producto.nombre} - ${producto.marca}</h5>
                <p class="card-text">${producto.descripcion}</p>
                <p class="precio">$${producto.precio}</p>
            <div class="d-flex justify-content-between align-items-center">
    <span>${producto.nombre} (${producto.marca}) - $${producto.precio} x ${cantidadEnCarrito}</span>
    <div>
        <button class="btn btn-sm btn-outline-danger" onclick="actualizarCantidadEnCarrito('${producto.nombre}', ${producto.precio}, '${producto.imagen}', '${producto.marca}', -1)">-</button>
        <button class="btn btn-sm btn-outline-success" onclick="actualizarCantidadEnCarrito('${producto.nombre}', ${producto.precio}, '${producto.imagen}', '${producto.marca}', 1)">+</button>
    </div>
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

        // No permitir cantidades negativas
        if (productoEnCarrito.cantidad <= 0) {
            productoEnCarrito.cantidad = 0;
        }

        // Eliminar el producto si la cantidad es 0
        if (productoEnCarrito.cantidad === 0) {
            carrito = carrito.filter(item => item !== productoEnCarrito);
        }
    } else if (cantidadCambio > 0) {
        carrito.push({ nombre, precio, imagen, marca, cantidad: cantidadCambio });
    }

    actualizarCarrito();
}

// Función para agregar productos al carrito
function agregarAlCarrito(nombre, precio, imagen, marca) {
    const productoExistente = carrito.find(item => item.nombre === nombre && item.marca === marca);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({ nombre, precio, imagen, marca, cantidad: 1 });
    }

    actualizarCarrito();
}

// Función para mostrar el modal del carrito
function mostrarModalCarrito() {
    if (!document.getElementById('modalCarrito')) {
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
                        <button type="button" class="btn btn-success" onclick="finalizarCompra()">Finalizar Compra</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    mostrarProductosEnCarrito();

    const modalElement = document.getElementById('modalCarrito');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// Mostrar productos en el carrito dentro del modal
function mostrarProductosEnCarrito() {
    const productosCarrito = document.getElementById('productosCarrito');
    productosCarrito.innerHTML = '';

    let total = 0;
    carrito.forEach(producto => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>${producto.nombre} (${producto.marca}) - $${producto.precio} x ${producto.cantidad}</span>
                <div>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarDelCarrito('${producto.nombre}', '${producto.marca}')">Eliminar</button>
                </div>
            </div>
        `;
        productosCarrito.appendChild(li);
        total += producto.precio * producto.cantidad;
    });

    document.getElementById('totalCarrito').textContent = total;
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(nombre, marca) {
    carrito = carrito.filter(item => !(item.nombre === nombre && item.marca === marca));
    actualizarCarrito();
    mostrarModalCarrito();
}

// Finalizar la compra
function finalizarCompra() {
    if (carrito.length === 0) {
        alert("No tienes productos en el carrito.");
        return;
    }
    alert("Compra realizada con éxito!");
    carrito = [];
    actualizarCarrito();
    cerrarModal();
}

// Actualizar el contador de artículos en el carrito
function actualizarCarrito() {
    const cantidadCarrito = carrito.reduce((total, item) => total + item.cantidad, 0);
    document.getElementById('carrito-cantidad').textContent = `${cantidadCarrito} artículos`;
    localStorage.setItem('carrito', JSON.stringify(carrito)); 
}

// Cerrar el modal
function cerrarModal() {
    const modalCarrito = bootstrap.Modal.getInstance(document.getElementById('modalCarrito'));
    modalCarrito.hide();
}

// Iniciar la carga de productos al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);

// Event listener para abrir el modal al hacer clic en el carrito
document.getElementById('carrito-btn').addEventListener('click', mostrarModalCarrito);

// Función para hacer el carrito arrastrable
function hacerCarritoArrastrable() {
    const carritoDraggable = document.getElementById('carritoDraggable');
    let isDragging = false;
    let offsetX, offsetY;

    carritoDraggable.addEventListener('mousedown', function (e) {
        isDragging = true;
        offsetX = e.clientX - carritoDraggable.getBoundingClientRect().left;
        offsetY = e.clientY - carritoDraggable.getBoundingClientRect().top;
        document.body.style.userSelect = 'none';  // Desactivar la selección de texto mientras arrastras

        // Evitar que el clic abra el modal si se está arrastrando
        e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            carritoDraggable.style.left = `${e.clientX - offsetX}px`;
            carritoDraggable.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
        document.body.style.userSelect = 'auto';  // Habilitar la selección de texto nuevamente
    });
}

// Llamamos a la función para que el carrito sea arrastrable
hacerCarritoArrastrable();
