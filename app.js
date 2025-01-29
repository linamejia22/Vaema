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

// Crear el elemento HTML de un producto con un botón de "Comprar"
function crearProductoElemento(producto) {
    const productoDiv = document.createElement('div');
    productoDiv.classList.add('col-6', 'col-sm-6', 'col-md-4', 'col-lg-3', 'mb-4');

    productoDiv.innerHTML = `
        <div class="producto-card card shadow-sm border-light rounded-3 h-100">
            <div class="card-body d-flex flex-column align-items-center text-center">
                <img src="images/${producto.imagen}" class="img-fluid rounded mb-3" alt="${producto.nombre}" style="max-height: 150px; object-fit: cover;">
                <h5 class="card-title">${producto.nombre} - ${producto.marca}</h5>
                <p class="card-text">${producto.descripcion}</p>
                <p class="precio">$${producto.precio}</p>
                <button class="btn btn-sm btn-warning w-100 mt-auto" onclick="agregarAlCarrito('${producto.nombre}', ${producto.precio}, '${producto.imagen}', '${producto.marca}')">
                    Comprar
                </button>
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

    // Actualizar el carrito en el localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Actualizar la UI para reflejar el cambio en la cantidad
    mostrarProductos(productosGlobales);  // Vuelve a mostrar los productos con las cantidades actualizadas
    actualizarCarrito(); // Actualiza el contador del carrito
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
    productosCarrito.innerHTML = '';  // Limpiar productos del carrito

    let total = 0;
    carrito.forEach(producto => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>${producto.nombre} (${producto.marca}) - $${producto.precio} x ${producto.cantidad}</span>
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-danger me-2" onclick="modificarCantidadCarrito('${producto.nombre}', '${producto.marca}', -1)">-</button>
                    <span class="cantidad-carrito">${producto.cantidad}</span>
                    <button class="btn btn-sm btn-outline-success ms-2" onclick="modificarCantidadCarrito('${producto.nombre}', '${producto.marca}', 1)">+</button>
                    <button class="btn btn-sm btn-outline-danger ms-3" onclick="eliminarDelCarrito('${producto.nombre}', '${producto.marca}')">Eliminar</button>
                </div>
            </div>
        `;
        productosCarrito.appendChild(li);
        total += producto.precio * producto.cantidad;
    });

    document.getElementById('totalCarrito').textContent = total;
}

// Función para modificar la cantidad de un producto en el carrito
function modificarCantidadCarrito(nombre, marca, cantidadCambio) {
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
    }

    // Actualizar el carrito en el localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Actualizar la UI del modal con los cambios
    mostrarProductosEnCarrito();
    actualizarCarrito();  // Actualizar la cantidad total en el carrito (fuera del modal)
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(nombre, marca) {
    carrito = carrito.filter(item => !(item.nombre === nombre && item.marca === marca));
    localStorage.setItem('carrito', JSON.stringify(carrito));  // Actualizar localStorage
    mostrarProductosEnCarrito();  // Volver a renderizar los productos en el carrito
    actualizarCarrito();  // Actualizar el contador de productos en el carrito
}

// Finalizar la compra
function finalizarCompra() {
    if (carrito.length === 0) {
        alert("No tienes productos en el carrito.");
        return;
    }

    // Crear el mensaje para WhatsApp con los productos comprados
    let mensaje = "¡Hola! Quiero comprar los siguientes productos:\n\n";
    carrito.forEach(producto => {
        mensaje += `${producto.nombre} (${producto.marca}) - $${producto.precio} x ${producto.cantidad}\n`;
    });
    mensaje += `\nTotal: $${calcularTotalCarrito()}`;

    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);

    // Crear la URL de WhatsApp con el mensaje
    const telefono = "+573204535477"; // Aquí puedes poner el número de teléfono de WhatsApp
    const urlWhatsApp = `https://wa.me/${telefono}?text=${mensajeCodificado}`;

    // Redirigir al usuario a WhatsApp
    window.location.href = urlWhatsApp;

    // Vaciar el carrito y actualizar la UI
    carrito = [];
    actualizarCarrito();
    alert("Compra realizada con éxito!");
    cerrarModal();
}

// Función para calcular el total del carrito
function calcularTotalCarrito() {
    return carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
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

