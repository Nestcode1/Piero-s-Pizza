document.addEventListener('DOMContentLoaded', () => {
    // 1. Menú Móvil Hamburguesa
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle('open');
            navLinks.classList.toggle('active');
        });
        
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('open');
                navLinks.classList.remove('active');
            });
        });
    }

    // 2. Barra de Progreso de Scroll
    const scrollProgressBar = document.getElementById('scrollProgressBar');
    if (scrollProgressBar) {
        window.addEventListener('scroll', () => {
            const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            scrollProgressBar.style.width = `${progress}%`;
        });
    }

    // 3. Animación Fade-in al hacer Scroll
    const fadeElements = document.querySelectorAll('.fade-in');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.15 });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // 4. Lógica del Carrito de Pedidos
    let carrito = [];
    let totalActual = 0;
    const productoSelect = document.getElementById('productoSelect');
    const cantidadInput = document.getElementById('cantidadInput');
    const agregarBtn = document.getElementById('agregarBtn');
    const cartList = document.getElementById('cartList');
    const cartTotal = document.getElementById('cartTotal');
    const enviarWSPBtn = document.getElementById('enviarWSPBtn');

    // Elementos de Método de Pago
    const metodoPagoSelect = document.getElementById('metodoPagoSelect');
    const pagoEfectivoBox = document.getElementById('pagoEfectivoBox');
    const pagoTarjetaBox = document.getElementById('pagoTarjetaBox');
    const pagoTransferenciaBox = document.getElementById('pagoTransferenciaBox');
    const montoEfectivoInput = document.getElementById('montoEfectivoInput');
    const cambioCalculadoNota = document.getElementById('cambioCalculadoNota');

    // Cambio de visibilidad según Método de Pago seleccionado
    if (metodoPagoSelect) {
        metodoPagoSelect.addEventListener('change', () => {
            const val = metodoPagoSelect.value;
            pagoEfectivoBox.style.display = (val === 'Efectivo') ? 'block' : 'none';
            pagoTarjetaBox.style.display = (val === 'Tarjeta') ? 'block' : 'none';
            pagoTransferenciaBox.style.display = (val === 'Transferencia') ? 'block' : 'none';
        });
    }

    // Cálculo dinámico de cambio para pago en efectivo
    if (montoEfectivoInput) {
        montoEfectivoInput.addEventListener('input', () => {
            const monto = parseFloat(montoEfectivoInput.value);
            if (isNaN(monto) || monto <= 0) {
                cambioCalculadoNota.textContent = 'Calcularemos tu cambio automáticamente.';
                return;
            }

            if (monto < totalActual) {
                cambioCalculadoNota.textContent = `⚠️ El monto es menor al total ($${totalActual.toFixed(2)}).`;
                cambioCalculadoNota.style.color = '#ef4444';
            } else {
                const cambio = monto - totalActual;
                cambioCalculadoNota.textContent = `💡 Cambio a entregar: $${cambio.toFixed(2)}`;
                cambioCalculadoNota.style.color = '#ffb300';
            }
        });
    }

    // Función para mostrar notificaciones toast
    function showToast(message) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Función global para agregar directamente desde las tarjetas
    window.agregarDirecto = (nombre, precio) => {
        const index = carrito.findIndex(item => item.nombre === nombre);
        if (index !== -1) {
            carrito[index].cantidad += 1;
        } else {
            carrito.push({ nombre: nombre, precio: precio, cantidad: 1 });
        }
        actualizarCarrito();
        showToast(`✅ ¡${nombre} agregado al pedido!`);
    };

    // Agregar desde el selector interactivo
    if (agregarBtn) {
        agregarBtn.addEventListener('click', () => {
            const selectedOption = productoSelect.options[productoSelect.selectedIndex];
            const nombreProducto = selectedOption.value;
            const precioProducto = parseFloat(selectedOption.getAttribute('data-price'));
            const cantidad = parseInt(cantidadInput.value);

            if (isNaN(cantidad) || cantidad <= 0) {
                showToast('⚠️ Ingresa una cantidad válida.');
                return;
            }

            const index = carrito.findIndex(item => item.nombre === nombreProducto);
            if (index !== -1) {
                carrito[index].cantidad += cantidad;
            } else {
                carrito.push({ nombre: nombreProducto, precio: precioProducto, cantidad: cantidad });
            }

            actualizarCarrito();
            showToast(`✅ ${cantidad}x ${nombreProducto} agregado(s)`);
        });
    }

    function actualizarCarrito() {
        if (!cartList || !cartTotal) return;

        if (carrito.length === 0) {
            cartList.innerHTML = `<li class="cart-empty">Aún no has agregado productos.</li>`;
            cartTotal.textContent = `$0.00`;
            totalActual = 0;
            if (montoEfectivoInput) montoEfectivoInput.dispatchEvent(new Event('input'));
            return;
        }

        cartList.innerHTML = '';
        totalActual = 0;

        carrito.forEach((item, index) => {
            const subtotal = item.precio * item.cantidad;
            totalActual += subtotal;

            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <span><strong>${item.cantidad}x</strong> ${item.nombre} ($${subtotal.toFixed(2)})</span>
                <button type="button" onclick="window.eliminarItem(${index})" title="Eliminar ítem">❌</button>
            `;
            cartList.appendChild(li);
        });

        cartTotal.textContent = `$${totalActual.toFixed(2)}`;
        if (montoEfectivoInput) montoEfectivoInput.dispatchEvent(new Event('input'));
    }

    // Función global para eliminar ítems del carrito
    window.eliminarItem = (index) => {
        carrito.splice(index, 1);
        actualizarCarrito();
        showToast('🗑️ Ítem eliminado del carrito');
    };

    // Enviar pedido hacia WhatsApp con formato de pago
    if (enviarWSPBtn) {
        enviarWSPBtn.addEventListener('click', () => {
            if (carrito.length === 0) {
                showToast('⚠️ Por favor agrega al menos un producto a tu pedido.');
                return;
            }

            const nombreCliente = document.getElementById('clienteNombre').value.trim();
            const direccionCliente = document.getElementById('clienteDireccion').value.trim();
            const notasCliente = document.getElementById('clienteNotas').value.trim();
            const metodoPago = metodoPagoSelect.value;

            if (!nombreCliente || !direccionCliente) {
                showToast('⚠️ Por favor completa tu Nombre y Dirección.');
                return;
            }

            // Construcción del mensaje formateado para WhatsApp
            let mensaje = `*¡Hola, Piero's Pizza! 🍕 Quiero hacer un pedido:* \n\n`;
            mensaje += `👤 *Cliente:* ${nombreCliente}\n`;
            mensaje += `📍 *Dirección:* ${direccionCliente}\n`;
            if (notasCliente) {
                mensaje += `📝 *Notas:* ${notasCliente}\n`;
            }

            mensaje += `\n*🛒 Detalle del Pedido:*\n`;
            let totalGeneral = 0;
            carrito.forEach(item => {
                const subtotal = item.precio * item.cantidad;
                totalGeneral += subtotal;
                mensaje += `- ${item.cantidad}x ${item.nombre} ($${subtotal.toFixed(2)})\n`;
            });

            mensaje += `\n💰 *Total a Pagar:* $${totalGeneral.toFixed(2)}\n`;
            mensaje += `💳 *Método de Pago:* ${metodoPago}\n`;

            if (metodoPago === 'Efectivo') {
                const montoPaga = parseFloat(montoEfectivoInput.value);
                if (!isNaN(montoPaga) && montoPaga >= totalGeneral) {
                    const cambio = montoPaga - totalGeneral;
                    mensaje += `💵 *Paga con:* $${montoPaga.toFixed(2)} (Cambio: $${cambio.toFixed(2)})\n`;
                } else if (!isNaN(montoPaga) && montoPaga < totalGeneral) {
                    showToast('⚠️ El monto ingresado para pago en efectivo es menor al total.');
                    return;
                } else {
                    mensaje += `💵 *Paga con:* Efectivo exacto o a definir al entregar.\n`;
                }
            } else if (metodoPago === 'Tarjeta') {
                mensaje += `💳 *Requiere Terminal:* Sí\n`;
            } else if (metodoPago === 'Transferencia') {
                mensaje += `🏦 *Estatus:* Transferencia SPEI (Adjunto comprobante a este chat)\n`;
            }

            // Número de WhatsApp para pruebas
            const telefonoNegocio = "523311440230";
            const urlWhatsApp = `https://wa.me/${telefonoNegocio}?text=${encodeURIComponent(mensaje)}`;

            window.open(urlWhatsApp, '_blank');
        });
    }
});