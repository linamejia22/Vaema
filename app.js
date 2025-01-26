// Variable para almacenar el carrito de compras
let carrito = [];

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
    const contenedorProductos = document.getElementById('productos');
    contenedorProductos.innerHTML = ''; // Limpiar la sección de productos

    productos.forEach(producto => {
        const productoDiv = crearProductoElemento(producto);
        contenedorProductos.appendChild(productoDiv);
    });
}

// Crear el elemento HTML de un producto
function crearProductoElemento(producto) {
    const productoDiv = document.createElement('div');
    productoDiv.classList.add('producto');
    
    productoDiv.innerHTML = `
        <img src="images/${producto.imagen}" alt="${producto.nombre}">
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <p class="precio">$${producto.precio}</p>
        <button onclick="agregarAlCarrito('${producto.nombre}', ${producto.precio}, '${producto.imagen}')">Agregar al carrito</button>
    `;
    return productoDiv;
}

// Agregar un producto al carrito
function agregarAlCarrito(nombre, precio, imagen) {
    const productoEnCarrito = carrito.find(item => item.nombre === nombre);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carrito.push({ nombre, precio, imagen, cantidad: 1 });
    }

    actualizarCarrito();
}

// Ver el carrito
function verCarrito() {
    const modalCarrito = document.getElementById('modal-carrito');
    const modalContenido = document.getElementById('modal-contenido');
    
    modalContenido.innerHTML = ''; // Limpiar contenido anterior
    let total = 0;

    carrito.forEach(item => {
        total += item.precio * item.cantidad;
        modalContenido.innerHTML += `
            <div class="carrito-item">
                <img src="images/${item.imagen}" alt="${item.nombre}" class="carrito-imagen">
                <p>${item.nombre} - ${item.cantidad} x $${item.precio}</p>
            </div>
        `;
    });

    modalContenido.innerHTML += `<p><strong>Total: $${total}</strong></p>`;
    modalContenido.innerHTML += `<button onclick="comprar(${total})">Comprar</button>`;

    modalCarrito.style.display = 'block'; // Mostrar el modal
}

// Función para cerrar el modal del carrito
function cerrarModal() {
    const modalCarrito = document.getElementById('modal-carrito');
    modalCarrito.style.display = 'none';
}

// Redirigir a WhatsApp con la información del carrito
function comprar(total) {
    let mensaje = 'Hola, estoy interesado en los siguientes productos:\n';
    
    carrito.forEach(item => {
        mensaje += `${item.nombre} - ${item.cantidad} x $${item.precio}\n`;
    });

    mensaje += `\nTotal: $${total}\n\nEstoy listo para realizar la compra.`;

    // Redirigir a WhatsApp con el mensaje
    const telefono = '1234567890'; // Cambia este número por el de tu WhatsApp
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');

    // Limpiar el carrito después de la compra
    carrito = [];
    actualizarCarrito();
    cerrarModal();
}

// Filtrar productos según lo que se escribe en el buscador
function filtrarProductos() {
    const busqueda = document.getElementById('buscador').value.toLowerCase();
    const productos = document.querySelectorAll('.producto');

    productos.forEach(producto => {
        const nombreProducto = producto.querySelector('h3').textContent.toLowerCase();
        
        if (nombreProducto.includes(busqueda)) {
            producto.style.display = 'block';
        } else {
            producto.style.display = 'none';
        }
    });
}

// Actualizar el contador de artículos en el carrito
function actualizarCarrito() {
    const cantidadCarrito = carrito.reduce((total, item) => total + item.cantidad, 0);
    document.getElementById('carrito-cantidad').textContent = `${cantidadCarrito} artículos`;
}

// Iniciar la carga de productos al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);
