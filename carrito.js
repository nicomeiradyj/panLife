const CLAVE_CARRITO = 'carrito_panlife';
let carrito = cargarCarrito();

document.querySelectorAll('.cantidad').forEach(input => {
  input.min = '1';
  input.step = '1';
  input.required = true;
  input.addEventListener('input', () => input.setCustomValidity(''));
});

actualizarBadge();

function cargarCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || '[]');
    if (!Array.isArray(guardado)) return [];

    return guardado.filter(item =>
      item &&
      typeof item.nombre === 'string' && item.nombre.trim() &&
      typeof item.unidad === 'string' && item.unidad.trim() &&
      Number.isSafeInteger(item.cantidad) && item.cantidad >= 1
    );
  } catch {
    return [];
  }
}

// --- Agregar al carrito ---
document.querySelectorAll('.btn-agregar').forEach(btn => {
  btn.addEventListener('click', e => {
    const card   = e.target.closest('.producto-card');
    const nombre = card.querySelector('h3').innerText;
    const unidad = card.querySelector('.tipo-unidad').value;
    const inputCantidad = card.querySelector('.cantidad');

    if (!inputCantidad.checkValidity()) {
      inputCantidad.reportValidity();
      inputCantidad.focus();
      return;
    }

    const cant = Number(inputCantidad.value);
    if (!Number.isSafeInteger(cant) || cant < 1) {
      inputCantidad.setCustomValidity('Ingresá una cantidad entera mayor o igual a 1.');
      inputCantidad.reportValidity();
      inputCantidad.focus();
      return;
    }

    const existente = carrito.find(i => i.nombre === nombre && i.unidad === unidad);
    if (existente) {
      const nuevaCantidad = existente.cantidad + cant;
      if (!Number.isSafeInteger(nuevaCantidad)) {
        inputCantidad.setCustomValidity('La cantidad total del producto es demasiado grande.');
        inputCantidad.reportValidity();
        inputCantidad.focus();
        return;
      }
      existente.cantidad = nuevaCantidad;
      guardarCarrito();
    } else {
      carrito.push({ nombre, unidad, cantidad: cant });
      guardarCarrito();
    }

    actualizarBadge();

    btn.textContent = '¡Agregado! 👍';
    btn.classList.add('agregado');
    setTimeout(() => {
      btn.textContent = 'Agregar al Pedido';
      btn.classList.remove('agregado');
    }, 1200);
  });
});

function actualizarBadge() {
  const total = carrito.reduce((s, i) => s + i.cantidad, 0);
  document.getElementById('contador-carrito').textContent = total;
  document.getElementById('boton-carrito').style.display = total > 0 ? 'flex' : 'none';
}

function guardarCarrito() {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

// --- Modal ---
document.getElementById('boton-carrito').addEventListener('click', abrirCarrito);

function abrirCarrito() {
  renderizarCarrito();
  document.getElementById('overlay-carrito').classList.add('visible');
}

document.querySelector('.cerrar-modal').addEventListener('click', cerrarCarrito);

function cerrarCarrito() {
  document.getElementById('overlay-carrito').classList.remove('visible');
}

document.getElementById('overlay-carrito').addEventListener('click', e => {
  if (e.target.id === 'overlay-carrito') cerrarCarrito();
});

function renderizarCarrito() {
  const lista  = document.getElementById('lista-carrito');
  const vacio  = document.getElementById('carrito-vacio');
  const btnWA  = document.getElementById('btn-enviar-wa');
  const btnVac = document.getElementById('btn-vaciar');
  lista.innerHTML = '';

  if (carrito.length === 0) {
    vacio.style.display = 'block';
    btnWA.style.display = 'none';
    btnVac.style.display = 'none';
    return;
  }

  vacio.style.display = 'none';
  btnWA.style.display = 'flex';
  btnVac.style.display = 'block';

  carrito.forEach((item, idx) => {
    const li = document.createElement('li');
    const nombre = document.createElement('span');
    nombre.className = 'item-nombre';
    nombre.textContent = item.nombre;

    const detalle = document.createElement('span');
    detalle.className = 'item-detalle';
    detalle.textContent = `${item.cantidad} ${item.unidad}`;

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn-eliminar';
    btnEliminar.title = 'Eliminar';
    btnEliminar.setAttribute('aria-label', `Eliminar ${item.nombre}`);
    btnEliminar.textContent = '🗑️';
    btnEliminar.addEventListener('click', () => eliminarItem(idx));

    li.append(nombre, detalle, btnEliminar);
    lista.appendChild(li);
  });
}

function eliminarItem(idx) {
  carrito.splice(idx, 1);
  guardarCarrito();
  actualizarBadge();
  renderizarCarrito();
}

document.getElementById('btn-vaciar').addEventListener('click', () => {
  if (confirm('¿Seguro que querés vaciar el pedido?')) {
    carrito = [];
    guardarCarrito();
    actualizarBadge();
    renderizarCarrito();
  }
});

document.getElementById('btn-enviar-wa').addEventListener('click', () => {
  if (!carrito.length) return;
  const tel = WHATSAPP_NUMERO;
  const lineas = [
    'Hola panLife! 👋 Quiero hacer el siguiente pedido:',
    '',
    ...carrito.map(i => `• ${i.nombre}: ${i.cantidad} ${i.unidad}`),
    '',
    '¿Me pueden pasar el presupuesto? ¡Gracias! 🙏'
  ];
  const msg = encodeURIComponent(lineas.join('\n'));
  window.open(`https://wa.me/${tel}?text=${msg}`, '_blank', 'noopener,noreferrer');
});

// --- Busqueda y filtros ---
let categoriaActiva = 'todos';

document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => filtrarCategoria(btn.dataset.categoria, btn));
});

function filtrarCategoria(cat, btn) {
  categoriaActiva = cat;
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
  btn.classList.add('activo');
  filtrarProductos();
}

document.getElementById('busqueda').addEventListener('input', filtrarProductos);

function filtrarProductos() {
  const texto = document.getElementById('busqueda').value.toLowerCase().trim();
  const textoNormalizado = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let hayAlgo = false;

  document.querySelectorAll('.seccion-categoria').forEach(sec => {
    let hayEnSec = false;

    sec.querySelectorAll('.producto-card').forEach(card => {
      const coincideCat  = categoriaActiva === 'todos' || card.dataset.categoria === categoriaActiva;
      const nombreNormalizado = card.dataset.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const coincideText = !texto || nombreNormalizado.includes(textoNormalizado);

      if (coincideCat && coincideText) {
        card.classList.remove('oculto');
        hayEnSec = true;
        hayAlgo  = true;
      } else {
        card.classList.add('oculto');
      }
    });

    sec.classList.toggle('vacia', !hayEnSec);
  });

  document.getElementById('sin-resultados').style.display = hayAlgo ? 'none' : 'block';
}

// --- Boton volver arriba ---
const btnVolver = document.getElementById('btn-volver-arriba');
if (btnVolver) {
  const actualizarBotonVolver = () => {
    btnVolver.classList.toggle('visible', window.scrollY > 500);
  };

  window.addEventListener('scroll', actualizarBotonVolver, { passive: true });
  btnVolver.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  actualizarBotonVolver();
}
