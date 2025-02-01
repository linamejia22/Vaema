// Array para almacenar los productos y el carrito
let productos = [];
let carrito = [];

// Cargar productos desde productos.json
async function cargarProductos() {
    const response = await fetch('productos.json'); // Asegúrate de que el archivo JSON esté en el directorio correcto
    productos = await response.json();

    // Renderizar los productos al cargar la página
    renderizarProductos(productos);
}

// Renderizar los productos en la página
function renderizarProductos(productos) {
    const listaProductos = document.getElementById('lista-productos');
    listaProductos.innerHTML = '';

    productos.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('col-6', 'col-sm-6', 'col-md-4', 'col-lg-3', 'mb-4');
        
        // Convertir el precio a formato de peso colombiano (COP) sin decimales
        const precioFormateado = producto.precio.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0  // Eliminar los dos ceros decimales
        });

        // Reemplazar el símbolo de la moneda al final
        const precioConCOPAlFinal = precioFormateado.replace('COP', '').trim() + ' COP';

        productoDiv.innerHTML = `
  <div class="card">
    <img src="images/${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
    <div class="card-body">
        <h5 class="card-title">${producto.nombre}</h5>
        <p class="marca">${producto.marca}</p> <!-- Mostrar la marca -->
    </div>
<div class="card-footer">
    <p class="precio">${precioConCOPAlFinal}</p>  <!-- Mostrar el precio correctamente formateado -->
    <button class="btn-carrito" onclick="agregarAlCarrito('${producto.nombre}', ${producto.precio}, '${producto.imagen}', '${producto.marca}')">
        <i class="fa fa-shopping-cart"></i> <!-- Icono de carrito -->
    </button>
</div>

</div>
     `;
        listaProductos.appendChild(productoDiv);
    });
}

// Agregar producto al carrito
function agregarAlCarrito(nombre, precio, imagen, marca) {
    const producto = { nombre, precio, imagen, marca, cantidad: 1 };
    const productoEnCarrito = carrito.find(p => p.nombre === nombre && p.marca === marca);  // Verificar por nombre y marca

    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carrito.push(producto);
    }

    // Actualizamos el carrito
    actualizarCarrito();
}

// Actualizar la visualización del carrito
function actualizarCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    const cantidadCarrito = document.getElementById('carrito-cantidad');
    listaCarrito.innerHTML = '';

    let total = 0;
    carrito.forEach(producto => {
        // Formatear el precio del producto a peso colombiano (COP)
        const precioFormateado = producto.precio.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0  // Eliminar los decimales
        });

        const itemCarrito = document.createElement('li');
        itemCarrito.classList.add('list-group-item');
        itemCarrito.innerHTML = `
           <div class="d-flex justify-content-between">
        <div class="d-flex">
            <img src="images/${producto.imagen}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
            <div class="ml-3">
                <div class="d-flex justify-content-between">
                    <span class="producto-nombre">${producto.nombre}</span>
                    <p class="mb-0 text-muted producto-precio">${precioFormateado}</p> <!-- Precio con formato COP -->
                </div>
                <div class="d-flex justify-content-between">
                    <p class="mb-0 text-muted producto-marca">${producto.marca}</p>
                    <div class="d-flex align-items-center">
                        <button onclick="cambiarCantidad('${producto.nombre}', '${producto.marca}', -1)" class="btn btn-sm btn-outline-secondary">-</button>
                        <span class="mx-2">${producto.cantidad}</span>
                        <button onclick="cambiarCantidad('${producto.nombre}', '${producto.marca}', 1)" class="btn btn-sm btn-outline-secondary">+</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
        `;
        listaCarrito.appendChild(itemCarrito);
        total += producto.precio * producto.cantidad;
    });

    cantidadCarrito.innerText = carrito.length;

    // Formatear el total para mostrar en COP
    const totalFormateado = total.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0  // Eliminar los decimales
    });
    
    document.getElementById('finalizar-compra').innerText = `Finalizar Compra - ${totalFormateado}`;

    // Guardar el carrito en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
}



// Cambiar la cantidad de un producto en el carrito
function cambiarCantidad(nombre, marca, cantidad) {
    const producto = carrito.find(p => p.nombre === nombre && p.marca === marca);
    if (producto) {
        producto.cantidad += cantidad;
        
        // Si la cantidad llega a cero, eliminar solo ese producto
        if (producto.cantidad <= 0) {
            carrito = carrito.filter(p => !(p.nombre === nombre && p.marca === marca)); // Eliminar solo ese producto específico
        }

        // Actualizar el carrito después de cambiar la cantidad
        actualizarCarrito();
    }
}


// Eliminar un producto del carrito
function eliminarDelCarrito(nombre, marca) {
    carrito = carrito.filter(p => p.nombre !== nombre || p.marca !== marca);
    actualizarCarrito();
}


// Eliminar un producto del carrito
function eliminarDelCarrito(nombre) {
    carrito = carrito.filter(p => p.nombre !== nombre);
    actualizarCarrito();
}

// Filtrar productos al escribir en el buscador
function filtrarProductos() {
    const busqueda = document.getElementById('buscador').value.toLowerCase();
    const productosFiltrados = productos.filter(producto => producto.nombre.toLowerCase().includes(busqueda));
    renderizarProductos(productosFiltrados);
}

// Finalizar la compra y redirigir a WhatsApp con los detalles de los productos
function finalizarCompra() {
    let mensaje = '¡Estoy interesado en estos productos!\n\n'; // Añadir espacio al inicio
    carrito.forEach(producto => {
        mensaje += `• ${producto.nombre} - ${producto.cantidad} x $${producto.precio.toLocaleString()} COP\n`; // Formato de moneda y salto de línea
    });

    const total = carrito.reduce((sum, producto) => sum + producto.precio * producto.cantidad, 0);
    mensaje += `\nTotal: $${total.toLocaleString()} COP`; // Formato total en pesos colombianos

    const url = `https://wa.me/+573204535477?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    carrito = [];
    actualizarCarrito();
}


// Event listeners para abrir y cerrar el carrito
document.getElementById('carrito-btn').addEventListener('click', function() {
    document.getElementById('carrito-sidebar').classList.toggle('translate-x-full');
});

document.getElementById('cerrar-carrito').addEventListener('click', function() {
    document.getElementById('carrito-sidebar').classList.add('translate-x-full');
});

// Cargar los productos cuando la página esté lista
window.onload = cargarProductos;

// Event listener para finalizar compra
document.getElementById('finalizar-compra').addEventListener('click', finalizarCompra);

function filtrarProductos() {
    const busqueda = document.getElementById('buscador').value.toLowerCase();  // Obtener el texto de búsqueda
    const productosFiltrados = productos.filter(producto => 
        producto.nombre.toLowerCase().includes(busqueda) || 
        producto.marca.toLowerCase().includes(busqueda) ||
        producto.precio.toString().includes(busqueda)
    );  // Filtrar por nombre, marca o precio

    renderizarProductos(productosFiltrados);  // Renderizar los productos filtrados
}

// Filtrar productos al escribir en el buscador
function filtrarProductos() {
    const busqueda = document.getElementById('buscador').value.toLowerCase();  // Obtener el texto de búsqueda

    // Filtrar productos por nombre, marca o precio
    const productosFiltrados = productos.filter(producto => 
        producto.nombre.toLowerCase().includes(busqueda) ||  // Filtrar por nombre
        producto.marca.toLowerCase().includes(busqueda) ||    // Filtrar por marca
        producto.precio.toString().includes(busqueda)          // Filtrar por precio (convertirlo a string para buscar)
    );

    renderizarProductos(productosFiltrados);  // Renderizar los productos filtrados
}


// Código para abrir el carrito
document.getElementById('carrito-btn').addEventListener('click', function() {
    document.getElementById('carrito-sidebar').classList.add('open');
  });
  
  // Código para cerrar el carrito
  document.getElementById('cerrar-carrito').addEventListener('click', function() {
    document.getElementById('carrito-sidebar').classList.remove('open');
  });
  

  // Cargar el carrito desde localStorage al cargar la página
function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito(); // Actualizar la visualización del carrito
    }
}

// Cargar los productos y el carrito cuando la página esté lista
window.onload = function() {
    cargarProductos();      // Cargar productos
    cargarCarritoDesdeLocalStorage();  // Cargar el carrito guardado (si existe)
};
