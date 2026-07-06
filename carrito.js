let carrito = JSON.parse(localStorage.getItem('carrito_panlife') || '[]');
actualizarBadge();
// --- Agregar al carrito ---
document.querySelectorAll('.btn-agregar').forEach(btn => {
  btn.addEventListener('click', e => {
    const card   = e.target.closest('.producto-card');
    const nombre = card.querySelector('h3').innerText;
    const unidad = card.querySelector('.tipo-unidad').value;
    const cant   = parseInt(card.querySelector('.cantidad').value) || 1;

    const existente = carrito.find(i => i.nombre === nombre && i.unidad === unidad);
    if (existente) {
      existente.cantidad += cant;
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
  localStorage.setItem('carrito_panlife', JSON.stringify(carrito));
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
    li.innerHTML = `
      <span class="item-nombre">${item.nombre}</span>
      <span class="item-detalle">${item.cantidad} ${item.unidad}</span>
      <button class="btn-eliminar" title="Eliminar">🗑️</button>
    `;
    li.querySelector('.btn-eliminar').addEventListener('click', () => eliminarItem(idx));
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
  let msg = "Hola panLife! 👋 Quiero hacer el siguiente pedido:%0A%0A";
  carrito.forEach(i => { msg += `• ${i.nombre}: ${i.cantidad} ${i.unidad}%0A`; });
  msg += "%0A¿Me pueden pasar el presupuesto? ¡Gracias! 🙏";
  window.open(`https://wa.me/${tel}?text=${msg}`, '_blank');
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

  // --- Boton volver arriba ---
  const btnVolver = document.getElementById('btn-volver-arriba');
  if (btnVolver) {
    window.addEventListener('scroll', () => {
      btnVolver.classList.toggle('visible', window.scrollY > 500);
    });
    btnVolver.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
