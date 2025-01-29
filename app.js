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

    // Agregar animación visual
    animarProductoAlCarrito(nombre);

    // Actualizar el carrito
    actualizarCarrito();
}

function animarProductoAlCarrito(nombre) {
    const productoElemento = Array.from(document.querySelectorAll('.card-title')).find(el => el.textContent.includes(nombre));
    if (productoElemento) {
        const card = productoElemento.closest('.producto-card');
        const clon = card.cloneNode(true);

        // Estilos para la animación
        clon.classList.add('producto-animado');
        const rect = card.getBoundingClientRect();
        clon.style.position = 'fixed';
        clon.style.top = `${rect.top}px`;
        clon.style.left = `${rect.left}px`;
        clon.style.width = `${card.offsetWidth}px`;
        clon.style.height = `${card.offsetHeight}px`;
        clon.style.transition = 'all 0.5s ease-in-out';

        // Añadir el clon al body
        document.body.appendChild(clon);

        // Obtener la posición del carrito
        const carritoElemento = document.getElementById('carritoDraggable');
        const carritoRect = carritoElemento.getBoundingClientRect();

        // Mover el clon hacia el carrito
        setTimeout(() => {
            clon.style.top = `${carritoRect.top}px`;
            clon.style.left = `${carritoRect.left}px`;
            clon.style.transform = 'scale(0.1)';
            clon.style.opacity = '0';
        }, 10);

        // Eliminar el clon después de la animación
        clon.addEventListener('transitionend', () => clon.remove());
    }
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

//function hacerCarritoArrastrable() {
    const carritoDraggable = document.getElementById('carritoDraggable');
    const cantidadCarrito = document.getElementById('carrito-cantidad');

    if (!carritoDraggable || !cantidadCarrito) {
        console.error('Los elementos necesarios no se encontraron en el DOM.');
        return;
    }

    let isDragging = false;
    let offsetX, offsetY;

    // Desactivar el comportamiento predeterminado solo para el inicio del arrastre
    function startDrag(e) {
        isDragging = true;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        offsetX = clientX - carritoDraggable.getBoundingClientRect().left;
        offsetY = clientY - carritoDraggable.getBoundingClientRect().top;
        document.body.style.userSelect = 'none';  // Desactivar la selección de texto mientras arrastras

        // Evitar que el clic abra el modal si se está arrastrando
        e.preventDefault();
    }

    function drag(e) {
        if (isDragging) {
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;

            // Calcular las nuevas posiciones del carrito
            let newLeft = clientX - offsetX;
            let newTop = clientY - offsetY;

            // Limitar los bordes para que no se salga de la pantalla
            const maxLeft = window.innerWidth - carritoDraggable.offsetWidth;
            const maxTop = window.innerHeight - carritoDraggable.offsetHeight;

            // Asegurar que el carrito no se salga de la pantalla
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));

            // Aplicar las nuevas posiciones
            carritoDraggable.style.left = `${newLeft}px`;
            carritoDraggable.style.top = `${newTop}px`;

            // Actualizar la posición de la cantidad de productos
            cantidadCarrito.style.left = `${newLeft + carritoDraggable.offsetWidth / 2 - cantidadCarrito.offsetWidth / 2}px`;
            cantidadCarrito.style.top = `${newTop + carritoDraggable.offsetHeight / 2 - cantidadCarrito.offsetHeight / 2}px`;
        }
    }

    function endDrag() {
        isDragging = false;
        document.body.style.userSelect = 'auto';  // Habilitar la selección de texto nuevamente
    }

    // Eventos para mouse
    carritoDraggable.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Eventos para touch
    carritoDraggable.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', endDrag);
//}

// Llamamos a la función para que el carrito sea arrastrable
//hacerCarritoArrastrable();

// Función para ordenar los productos
function ordenarProductos(criterio) {
    let productosOrdenados;

    switch (criterio) {
        case 'nombre-asc':
            productosOrdenados = [...productosGlobales].sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case 'nombre-desc':
            productosOrdenados = [...productosGlobales].sort((a, b) => b.nombre.localeCompare(a.nombre));
            break;
        case 'precio-asc':
            productosOrdenados = [...productosGlobales].sort((a, b) => a.precio - b.precio);
            break;
        case 'precio-desc':
            productosOrdenados = [...productosGlobales].sort((a, b) => b.precio - a.precio);
            break;
        default:
            productosOrdenados = productosGlobales; // Si no se selecciona ninguna opción, no se hace ningún orden
    }

    mostrarProductos(productosOrdenados); // Mostrar los productos ordenados
}
