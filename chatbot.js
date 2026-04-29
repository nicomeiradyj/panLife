// ============================================================
//  panLife - Asistente Virtual con IA (Google Gemini Flash)
//  ¿Cómo activarlo?
//    1. Reemplazá TU_API_KEY_AQUI con tu clave de Google AI Studio
//    2. Agregá esta línea antes del </body> en index.html y productos.html:
//       <script src="chatbot.js"></script>
// ============================================================

const GEMINI_API_KEY = 'AIzaSyCaTYQoFmHSzYiqkDHHiVKrFh9b0lAJMhM';

// ---------- PROMPT DEL ASISTENTE ----------
const SYSTEM_PROMPT = `Sos el asistente virtual de panLife, una panadería familiar de Florencio Varela que distribuye a todo el país. Tu nombre es "Pan 🥖" y hablás en español argentino informal (tuteo, "vos", "che"). Sos cálido, breve y útil.

PRODUCTOS DISPONIBLES:
🥖 Panificados: Baguette, Baguette de Salvado, Mini Baguette, Flauta, Flauta de Salvado, Mignoncito, Pan Panini, Pan Petit, Pan Petit de Salvado
🫓 Panes Especiales: Chipa de Queso, Scones de Queso, Bagel de Salvado, Criollito de Grasa, Cremona, Pan de Campo, Bollo Campesino, Figaza Arabe, Pan Lomitero
🍕 Prepizzas: Prepizza de Tomate, Prepizza de Cebolla, Pizzeta de Tomate, Pizzeta de Cebolla
🥐 Facturas: Plancha de Hojaldre, Panal de Membrillo, Panal de Batata, Panal de Pastelera, Roll de Manzana, Palitos de Grasa
🌙 Medialunas: Croissant, Medialuna de Manteca, Medialuna de Manteca Chica, Medialuna Mar del Plata, Medialuna Multigrano, Medialuna Salada, Medialuna de Grasa

INFORMACIÓN DE LA EMPRESA:
- Empresa familiar (familia Helman), base en Florencio Varela, distribuyen a todo el país
- Atienden comedores, familias, escuelas y más
- WhatsApp: +54 9 11 4042-1634
- Instagram: @panlife.arg

PRECIOS Y PEDIDOS:
- Los precios varían diariamente y según el volumen — siempre derivar al WhatsApp para cotizaciones
- Hacen descuentos por cantidad, pero depende del caso y se habla con el equipo
- Para hacer un pedido: el cliente elige productos en la página y los manda por WhatsApp usando el botón de carrito

REGLAS PARA VOS:
- Respondé siempre en máximo 3 oraciones. Si la respuesta necesita más, usá una lista corta.
- Nunca inventes precios ni hagas promesas de descuento
- Para precios o consultas especiales, siempre derivá al WhatsApp
- Si te preguntan algo que no sabés, decí que lo consulten por WhatsApp
- No uses markdown en exceso. Solo emojis ocasionales para dar calidez.`;

// ---------- HISTORIAL DE MENSAJES ----------
let historialChat = [];

// ---------- ESTILOS ----------
const estilos = `
  #chat-boton {
    position: fixed;
    bottom: 24px;
    left: 24px;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: #2fab6f;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(47,171,111,0.45);
    font-size: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 800;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  #chat-boton:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 22px rgba(47,171,111,0.6);
  }
  #chat-boton .chat-badge {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 18px;
    height: 18px;
    background: #d35400;
    border-radius: 50%;
    border: 2px solid white;
    display: none;
  }

  #chat-panel {
    position: fixed;
    bottom: 96px;
    left: 24px;
    width: 340px;
    max-height: 500px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.18);
    z-index: 800;
    display: none;
    flex-direction: column;
    overflow: hidden;
    animation: chatSlide 0.25s ease;
    font-family: 'Nunito', Arial, sans-serif;
  }

  #chat-panel.visible { display: flex; }

  @keyframes chatSlide {
    from { transform: translateY(15px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  #chat-header {
    background: #2fab6f;
    color: white;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  #chat-header .avatar {
    width: 36px;
    height: 36px;
    background: rgba(255,255,255,0.25);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  #chat-header .info { flex-grow: 1; }
  #chat-header .info strong { display: block; font-size: 0.95rem; }
  #chat-header .info span {
    font-size: 0.75rem;
    opacity: 0.85;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  #chat-header .info span::before {
    content: '';
    width: 7px;
    height: 7px;
    background: #a8f5cf;
    border-radius: 50%;
    display: inline-block;
  }

  #chat-cerrar {
    background: none;
    border: none;
    color: white;
    font-size: 1.3rem;
    cursor: pointer;
    opacity: 0.8;
    padding: 0 4px;
    line-height: 1;
  }
  #chat-cerrar:hover { opacity: 1; }

  #chat-mensajes {
    flex-grow: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scroll-behavior: smooth;
  }

  #chat-mensajes::-webkit-scrollbar { width: 4px; }
  #chat-mensajes::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

  .msg {
    max-width: 82%;
    padding: 9px 13px;
    border-radius: 16px;
    font-size: 0.88rem;
    line-height: 1.45;
    word-break: break-word;
  }

  .msg.bot {
    background: #f4f4f4;
    color: #333;
    border-bottom-left-radius: 4px;
    align-self: flex-start;
  }

  .msg.user {
    background: #2fab6f;
    color: white;
    border-bottom-right-radius: 4px;
    align-self: flex-end;
  }

  .msg.typing {
    background: #f4f4f4;
    align-self: flex-start;
    padding: 12px 16px;
  }

  .typing-dots span {
    display: inline-block;
    width: 7px;
    height: 7px;
    background: #999;
    border-radius: 50%;
    margin: 0 2px;
    animation: bounce 1.2s infinite;
  }
  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30%            { transform: translateY(-6px); }
  }

  #chat-input-area {
    display: flex;
    gap: 8px;
    padding: 12px 14px;
    border-top: 1px solid #eee;
    flex-shrink: 0;
  }

  #chat-input {
    flex-grow: 1;
    padding: 9px 14px;
    border: 1.5px solid #e0e0e0;
    border-radius: 50px;
    font-size: 0.88rem;
    font-family: 'Nunito', Arial, sans-serif;
    outline: none;
    transition: border-color 0.2s;
  }

  #chat-input:focus { border-color: #2fab6f; }

  #chat-enviar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #2fab6f;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.2s, transform 0.1s;
  }

  #chat-enviar:hover { background: #269660; }
  #chat-enviar:active { transform: scale(0.92); }
  #chat-enviar:disabled { background: #ccc; cursor: default; }

  @media (max-width: 420px) {
    #chat-panel {
      width: calc(100vw - 48px);
      left: 24px;
      right: 24px;
    }
  }
`;

// ---------- INYECTAR ESTILOS ----------
const styleEl = document.createElement('style');
styleEl.textContent = estilos;
document.head.appendChild(styleEl);

// ---------- CREAR EL HTML DEL CHAT ----------
const chatHTML = `
  <button id="chat-boton" onclick="toggleChat()" title="Hablar con el asistente">
    💬
    <span class="chat-badge" id="chat-badge"></span>
  </button>

  <div id="chat-panel">
    <div id="chat-header">
      <div class="avatar">🥖</div>
      <div class="info">
        <strong>Pan — Asistente panLife</strong>
        <span>En línea ahora</span>
      </div>
      <button id="chat-cerrar" onclick="toggleChat()">✕</button>
    </div>
    <div id="chat-mensajes"></div>
    <div id="chat-input-area">
      <input
        id="chat-input"
        type="text"
        placeholder="Escribí tu consulta..."
        onkeydown="if(event.key==='Enter') enviarMensaje()"
        maxlength="300"
      >
      <button id="chat-enviar" onclick="enviarMensaje()">➤</button>
    </div>
  </div>
`;

document.body.insertAdjacentHTML('beforeend', chatHTML);

// ---------- MENSAJE DE BIENVENIDA ----------
function mostrarBienvenida() {
  agregarMensaje('bot', '¡Hola! 👋 Soy Pan, el asistente de panLife. Puedo ayudarte a conocer nuestros productos, responder tus dudas o guiarte para hacer tu pedido. ¿En qué te ayudo?');
}

// ---------- TOGGLE CHAT ----------
let chatAbierto = false;
let bienvenidaMostrada = false;

function toggleChat() {
  chatAbierto = !chatAbierto;
  const panel = document.getElementById('chat-panel');
  const boton = document.getElementById('chat-boton');
  const badge = document.getElementById('chat-badge');

  panel.classList.toggle('visible', chatAbierto);
  boton.textContent = chatAbierto ? '✕' : '💬';
  if (chatAbierto) boton.appendChild(badge);
  badge.style.display = 'none';

  if (chatAbierto && !bienvenidaMostrada) {
    bienvenidaMostrada = true;
    setTimeout(mostrarBienvenida, 300);
  }

  if (chatAbierto) {
    setTimeout(() => document.getElementById('chat-input').focus(), 100);
  }
}

// ---------- AGREGAR MENSAJE AL DOM ----------
function agregarMensaje(rol, texto) {
  const cont = document.getElementById('chat-mensajes');
  const div = document.createElement('div');
  div.className = `msg ${rol}`;
  div.textContent = texto;
  cont.appendChild(div);
  cont.scrollTop = cont.scrollHeight;
  return div;
}

function mostrarTyping() {
  const cont = document.getElementById('chat-mensajes');
  const div = document.createElement('div');
  div.className = 'msg typing';
  div.id = 'typing-indicator';
  div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  cont.appendChild(div);
  cont.scrollTop = cont.scrollHeight;
}

function ocultarTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

// ---------- ENVIAR MENSAJE ----------
async function enviarMensaje() {
  const input = document.getElementById('chat-input');
  const texto = input.value.trim();
  if (!texto) return;

  input.value = '';
  document.getElementById('chat-enviar').disabled = true;

  agregarMensaje('user', texto);
  historialChat.push({ role: 'user', parts: [{ text: texto }] });

  mostrarTyping();

  try {
    const respuesta = await llamarGemini();
    ocultarTyping();
    agregarMensaje('bot', respuesta);
    historialChat.push({ role: 'model', parts: [{ text: respuesta }] });

    // Mostrar badge si el chat está cerrado
    if (!chatAbierto) {
      document.getElementById('chat-badge').style.display = 'block';
    }
  } catch (err) {
    ocultarTyping();
    agregarMensaje('bot', 'Ups, tuve un problema para conectarme. Podés escribirnos directamente por WhatsApp al +54 9 11 4042-1634 😊');
    console.error('Gemini error:', err);
  }

  document.getElementById('chat-enviar').disabled = false;
  document.getElementById('chat-input').focus();
}

// ---------- LLAMADA A GEMINI FLASH ----------
async function llamarGemini() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents: historialChat,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta. Intentá de nuevo.';
}

// ---------- MOSTRAR BADGE DESPUÉS DE 8 SEGUNDOS (INVITACIÓN) ----------
setTimeout(() => {
  if (!chatAbierto && !bienvenidaMostrada) {
    document.getElementById('chat-badge').style.display = 'block';
    document.getElementById('chat-boton').style.animation = 'none';
  }
}, 8000);
