// ==========================================
// HANOI SUSHI - Sistema Premium 2024
// La mejor experiencia de pedidos del MUNDO
// ==========================================

const HanoiApp = {
    cart: JSON.parse(localStorage.getItem('hanoi_cart')) || [],
    user: JSON.parse(localStorage.getItem('hanoi_user')) || null,
    currentProduct: null,
    deliveryType: 'delivery',
    paymentMethod: 'webpay',
    scheduleType: 'asap',
    scheduledTime: null,
    promoCode: null,
    promoDiscount: 0,
    tipPercent: 0,
    checkoutStep: 1,
    
    salsas: [
        { id: 1, name: 'Salsa de Soya', price: 0 },
        { id: 2, name: 'Salsa Teriyaki', price: 500 },
        { id: 3, name: 'Salsa Unagi', price: 500 },
        { id: 4, name: 'Salsa Spicy Mayo', price: 500 },
        { id: 5, name: 'Wasabi Extra', price: 300 },
        { id: 6, name: 'Jengibre Extra', price: 300 }
    ],
    
    promoCodes: {
        'HANOI20': { discount: 20, type: 'percent', minOrder: 15000 },
        'PRIMERAVEZ': { discount: 15, type: 'percent', minOrder: 10000 },
        'DELIVERY': { discount: 2990, type: 'fixed', minOrder: 20000 },
        'SUSHI50': { discount: 50, type: 'percent', minOrder: 50000, maxDiscount: 15000 }
    },

    init() {
        this.updateCartUI();
        this.updateUserUI();
        this.bindEvents();
        this.initSearch();
    },

    // CARRITO
    addToCart(product) {
        const cartItem = {
            ...product,
            cartId: Date.now() + Math.random(),
            quantity: product.quantity || 1,
            salsas: product.salsas || [],
            notes: product.notes || ''
        };
        this.cart.push(cartItem);
        this.saveCart();
        this.updateCartUI();
        this.showNotification(product.name + ' agregado al carrito');
    },

    removeFromCart(cartId) {
        this.cart = this.cart.filter(item => item.cartId !== cartId);
        this.saveCart();
        this.updateCartUI();
        this.renderCartModal();
    },

    updateQuantity(cartId, change) {
        const item = this.cart.find(item => item.cartId === cartId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(cartId);
            } else {
                this.saveCart();
                this.updateCartUI();
                this.renderCartModal();
            }
        }
    },

    getCartTotal() {
        return this.cart.reduce((total, item) => {
            let itemTotal = item.price * item.quantity;
            if (item.salsas) {
                item.salsas.forEach(s => { itemTotal += s.price * item.quantity; });
            }
            return total + itemTotal;
        }, 0);
    },

    getCartCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    },

    saveCart() {
        localStorage.setItem('hanoi_cart', JSON.stringify(this.cart));
    },

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
    },

    updateCartUI() {
        const count = this.getCartCount();
        const total = this.getCartTotal();
        
        // Update header cart button
        document.querySelectorAll('.cart-btn, [data-cart-btn]').forEach(btn => {
            if (count > 0) {
                btn.innerHTML = '<i class="fas fa-shopping-bag"></i> Carrito (' + count + ')';
            } else {
                btn.innerHTML = '<i class="fas fa-shopping-bag"></i> Pedir';
            }
        });

        // Update floating cart
        const floatCart = document.getElementById('floatCartBtn');
        if (floatCart) {
            floatCart.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
            floatCart.querySelector('.cart-total').textContent = this.formatPrice(total);
            const countText = floatCart.querySelector('.cart-count-text');
            if (countText) countText.innerHTML = '<span class="cart-count">' + count + '</span> ' + (count === 1 ? 'producto' : 'productos');
            floatCart.style.display = count > 0 ? 'flex' : 'none';
        }
        
        // Update cart badge
        document.querySelectorAll('.cart-badge').forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    },


    // MODAL DE PRODUCTO
    openProductModal(productData) {
        this.currentProduct = {
            ...productData,
            quantity: 1,
            salsas: [],
            notes: ''
        };
        
        const modal = document.getElementById('productModal');
        if (!modal) return;
        
        document.getElementById('productModalImage').src = productData.image;
        document.getElementById('productModalName').textContent = productData.name;
        document.getElementById('productModalDesc').textContent = productData.description || '';
        document.getElementById('productModalPrice').textContent = this.formatPrice(productData.price);
        document.getElementById('productQty').textContent = '1';
        document.getElementById('productNotes').value = '';
        
        // Renderizar salsas con eventos correctos
        const salsasContainer = document.getElementById('salsasOptions');
        if (salsasContainer) {
            salsasContainer.innerHTML = this.salsas.map(salsa => 
                '<div class="option-item" data-salsa-id="' + salsa.id + '">' +
                    '<span class="option-check"><i class="fas fa-check"></i></span>' +
                    '<span class="option-info"><span>' + salsa.name + '</span></span>' +
                    '<span class="option-price">' + (salsa.price > 0 ? '+' + this.formatPrice(salsa.price) : 'Gratis') + '</span>' +
                '</div>'
            ).join('');
            
            // Eventos de click para salsas
            salsasContainer.querySelectorAll('.option-item').forEach(item => {
                item.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    item.classList.toggle('selected');
                    this.updateProductTotal();
                };
            });
        }
        
        this.updateProductTotal();
        this.openModal('productModal');
    },

    updateProductQty(change) {
        if (!this.currentProduct) return;
        this.currentProduct.quantity = Math.max(1, this.currentProduct.quantity + change);
        document.getElementById('productQty').textContent = this.currentProduct.quantity;
        this.updateProductTotal();
    },

    updateProductTotal() {
        if (!this.currentProduct) return;
        
        let total = this.currentProduct.price * this.currentProduct.quantity;
        
        document.querySelectorAll('#salsasOptions .option-item.selected').forEach(item => {
            const salsaId = parseInt(item.dataset.salsaId);
            const salsa = this.salsas.find(s => s.id === salsaId);
            if (salsa) total += salsa.price * this.currentProduct.quantity;
        });
        
        document.getElementById('addToCartTotal').textContent = this.formatPrice(total);
    },

    addCurrentProductToCart() {
        if (!this.currentProduct) return;
        
        const selectedSalsas = [];
        document.querySelectorAll('#salsasOptions .option-item.selected').forEach(item => {
            const salsaId = parseInt(item.dataset.salsaId);
            const salsa = this.salsas.find(s => s.id === salsaId);
            if (salsa) selectedSalsas.push(salsa);
        });
        
        const notes = document.getElementById('productNotes').value.trim();
        
        this.addToCart({
            ...this.currentProduct,
            salsas: selectedSalsas,
            notes: notes
        });
        
        this.closeModal('productModal');
        this.currentProduct = null;
    },

    // USUARIO
    login(email, password) {
        const users = JSON.parse(localStorage.getItem('hanoi_users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.user = { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address };
            localStorage.setItem('hanoi_user', JSON.stringify(this.user));
            this.updateUserUI();
            this.closeModal('loginModal');
            this.showNotification('¡Bienvenido ' + user.name.split(' ')[0] + '!');
            return true;
        }
        return false;
    },

    register(userData) {
        const users = JSON.parse(localStorage.getItem('hanoi_users')) || [];
        
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Este email ya está registrado' };
        }

        const newUser = { id: Date.now(), ...userData, orders: 0 };
        users.push(newUser);
        localStorage.setItem('hanoi_users', JSON.stringify(users));
        
        this.user = { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, address: newUser.address };
        localStorage.setItem('hanoi_user', JSON.stringify(this.user));
        this.updateUserUI();
        
        return { success: true, message: '¡Cuenta creada exitosamente!' };
    },

    logout() {
        this.user = null;
        localStorage.removeItem('hanoi_user');
        this.updateUserUI();
        this.showNotification('Sesión cerrada');
    },

    updateUserUI() {
        document.querySelectorAll('[data-user-btn]').forEach(btn => {
            if (this.user) {
                btn.innerHTML = '<i class="fas fa-user-circle"></i> ' + this.user.name.split(' ')[0];
                btn.onclick = () => this.openModal('profileModal');
            } else {
                btn.innerHTML = '<i class="fas fa-user"></i> Ingresar';
                btn.onclick = () => this.openModal('loginModal');
            }
        });
        
        if (this.user) {
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            if (profileName) profileName.textContent = this.user.name;
            if (profileEmail) profileEmail.textContent = this.user.email;
        }
    },


    // ==========================================
    // CHECKOUT PREMIUM - ESTILO McDONALD'S/BK
    // ==========================================
    
    openCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Tu carrito está vacío', 'error');
            return;
        }
        this.checkoutStep = 1;
        
        // Cerrar carrito primero sin animación
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.classList.remove('active');
            cartModal.style.display = 'none';
        }
        document.body.style.overflow = '';
        
        // Pequeño delay para asegurar que el carrito se cierre
        setTimeout(() => {
            this.renderCheckoutModal();
            this.openModal('checkoutModal');
        }, 50);
    },

    renderCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        if (!modal) return;
        
        const subtotal = this.getCartTotal();
        const deliveryCost = this.getDeliveryCost();
        const discount = this.calculateDiscount(subtotal);
        const tip = Math.round(subtotal * (this.tipPercent / 100));
        const total = subtotal + deliveryCost - discount + tip;
        
        // Update progress steps
        this.updateCheckoutProgress();
        
        // Update order summary
        this.renderOrderSummary(subtotal, deliveryCost, discount, tip, total);
        
        // Update delivery options
        document.querySelectorAll('.delivery-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.type === this.deliveryType);
        });
        
        // Update payment methods
        document.querySelectorAll('.payment-method').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.method === this.paymentMethod);
        });
        
        // Update schedule options
        document.querySelectorAll('.schedule-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.schedule === this.scheduleType);
        });
        
        // Update tip options
        document.querySelectorAll('.tip-option').forEach(opt => {
            opt.classList.toggle('selected', parseInt(opt.dataset.tip) === this.tipPercent);
            const tipAmount = Math.round(subtotal * (parseInt(opt.dataset.tip) / 100));
            const amountEl = opt.querySelector('.tip-amount');
            if (amountEl) amountEl.textContent = this.formatPrice(tipAmount);
        });
        
        // Show/hide address section
        const addressSection = document.getElementById('addressSection');
        if (addressSection) {
            addressSection.style.display = this.deliveryType === 'delivery' ? 'block' : 'none';
        }
        
        // Show/hide time picker
        const timePicker = document.querySelector('.time-picker');
        if (timePicker) {
            timePicker.classList.toggle('active', this.scheduleType === 'scheduled');
        }
    },
    
    updateCheckoutProgress() {
        document.querySelectorAll('.checkout-step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 === this.checkoutStep) {
                step.classList.add('active');
            } else if (index + 1 < this.checkoutStep) {
                step.classList.add('completed');
            }
        });
    },
    
    renderOrderSummary(subtotal, deliveryCost, discount, tip, total) {
        const itemsContainer = document.getElementById('checkoutItems');
        if (itemsContainer) {
            itemsContainer.innerHTML = this.cart.map(item => {
                let itemTotal = item.price * item.quantity;
                if (item.salsas) item.salsas.forEach(s => { itemTotal += s.price * item.quantity; });
                
                return '<div class="order-item">' +
                    '<img src="' + item.image + '" alt="' + item.name + '">' +
                    '<div class="order-item-info">' +
                        '<div class="order-item-name">' + item.name + '</div>' +
                        '<div class="order-item-qty">x' + item.quantity + 
                        (item.salsas && item.salsas.length > 0 ? ' • ' + item.salsas.map(s => s.name).join(', ') : '') + '</div>' +
                    '</div>' +
                    '<span class="order-item-price">' + this.formatPrice(itemTotal) + '</span>' +
                '</div>';
            }).join('');
        }
        
        const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
        el('checkoutSubtotal', this.formatPrice(subtotal));
        el('checkoutDelivery', deliveryCost === 0 ? '¡Gratis!' : this.formatPrice(deliveryCost));
        el('checkoutDiscount', discount > 0 ? '-' + this.formatPrice(discount) : '$0');
        el('checkoutTip', tip > 0 ? this.formatPrice(tip) : '$0');
        el('checkoutTotal', this.formatPrice(total));
        
        // Show/hide discount row
        const discountRow = document.getElementById('discountRow');
        if (discountRow) discountRow.style.display = discount > 0 ? 'flex' : 'none';
        
        // Show/hide tip row
        const tipRow = document.getElementById('tipRow');
        if (tipRow) tipRow.style.display = tip > 0 ? 'flex' : 'none';
        
        // Free delivery message
        const freeDeliveryMsg = document.getElementById('freeDeliveryMsg');
        if (freeDeliveryMsg) {
            if (subtotal < 25000 && this.deliveryType === 'delivery') {
                const remaining = 25000 - subtotal;
                freeDeliveryMsg.innerHTML = '<i class="fas fa-truck"></i> Agrega ' + this.formatPrice(remaining) + ' más para delivery gratis';
                freeDeliveryMsg.style.display = 'block';
            } else {
                freeDeliveryMsg.style.display = 'none';
            }
        }
    },
    
    getDeliveryCost() {
        if (this.deliveryType !== 'delivery') return 0;
        const subtotal = this.getCartTotal();
        if (subtotal >= 25000) return 0;
        return 2990;
    },
    
    calculateDiscount(subtotal) {
        if (!this.promoCode || !this.promoCodes[this.promoCode]) return 0;
        
        const promo = this.promoCodes[this.promoCode];
        if (subtotal < promo.minOrder) return 0;
        
        let discount = 0;
        if (promo.type === 'percent') {
            discount = Math.round(subtotal * (promo.discount / 100));
            if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
        } else {
            discount = promo.discount;
        }
        
        return discount;
    },

    setDeliveryType(type) {
        this.deliveryType = type;
        this.renderCheckoutModal();
        this.showNotification(type === 'delivery' ? '🛵 Delivery seleccionado' : '🏪 Retiro en local seleccionado');
    },

    setPaymentMethod(method) {
        this.paymentMethod = method;
        document.querySelectorAll('.payment-method').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.method === method);
        });
        
        const methodNames = {
            'webpay': '💳 Webpay seleccionado',
            'efectivo': '💵 Efectivo seleccionado',
            'transferencia': '🏦 Transferencia seleccionada',
            'tarjeta': '💳 Tarjeta en local seleccionada'
        };
        this.showNotification(methodNames[method] || 'Método de pago actualizado');
    },
    
    setScheduleType(type) {
        this.scheduleType = type;
        this.renderCheckoutModal();
    },
    
    setScheduledTime(time) {
        this.scheduledTime = time;
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.toggle('selected', slot.dataset.time === time);
        });
    },
    
    setTip(percent) {
        this.tipPercent = percent;
        this.renderCheckoutModal();
    },
    
    applyPromoCode() {
        const input = document.getElementById('promoCodeInput');
        if (!input) return;
        
        const code = input.value.trim().toUpperCase();
        
        if (!code) {
            this.showNotification('Ingresa un código de descuento', 'error');
            return;
        }
        
        if (!this.promoCodes[code]) {
            this.showNotification('Código inválido o expirado', 'error');
            input.value = '';
            return;
        }
        
        const promo = this.promoCodes[code];
        const subtotal = this.getCartTotal();
        
        if (subtotal < promo.minOrder) {
            this.showNotification('Pedido mínimo de ' + this.formatPrice(promo.minOrder) + ' para este código', 'error');
            return;
        }
        
        this.promoCode = code;
        this.showNotification('🎉 ¡Código aplicado! ' + (promo.type === 'percent' ? promo.discount + '% de descuento' : this.formatPrice(promo.discount) + ' de descuento'));
        this.renderCheckoutModal();
        
        // Disable input
        input.disabled = true;
        input.style.background = '#e8f5e9';
    },
    
    removePromoCode() {
        this.promoCode = null;
        const input = document.getElementById('promoCodeInput');
        if (input) {
            input.disabled = false;
            input.value = '';
            input.style.background = '';
        }
        this.renderCheckoutModal();
        this.showNotification('Código removido');
    },
    
    nextCheckoutStep() {
        // Validations
        if (this.checkoutStep === 1) {
            if (this.deliveryType === 'delivery') {
                const address = document.getElementById('checkoutAddress')?.value || this.user?.address;
                if (!address) {
                    this.showNotification('Por favor ingresa tu dirección', 'error');
                    document.getElementById('checkoutAddress')?.focus();
                    return;
                }
            }
        }
        
        if (this.checkoutStep < 3) {
            this.checkoutStep++;
            this.updateCheckoutProgress();
            
            // Scroll to top of modal
            document.querySelector('#checkoutModal .modal-body')?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },
    
    prevCheckoutStep() {
        if (this.checkoutStep > 1) {
            this.checkoutStep--;
            this.updateCheckoutProgress();
        }
    },

    async confirmOrder() {
        const address = document.getElementById('checkoutAddress')?.value || this.user?.address || '';
        const phone = document.getElementById('checkoutPhone')?.value || this.user?.phone || '';
        const name = document.getElementById('checkoutName')?.value || this.user?.name || '';
        const notes = document.getElementById('checkoutNotes')?.value || '';
        const email = this.user?.email || '';
        
        if (this.deliveryType === 'delivery' && !address) {
            this.showNotification('Por favor ingresa tu dirección', 'error');
            return;
        }
        
        if (!phone) {
            this.showNotification('Por favor ingresa tu teléfono', 'error');
            return;
        }

        const subtotal = this.getCartTotal();
        const deliveryCost = this.getDeliveryCost();
        const discount = this.calculateDiscount(subtotal);
        const tip = Math.round(subtotal * (this.tipPercent / 100));
        const total = subtotal + deliveryCost - discount + tip;

        const order = {
            id: Date.now(),
            orderNumber: 'HS-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            items: [...this.cart],
            subtotal: subtotal,
            delivery: deliveryCost,
            deliveryCost: deliveryCost,
            discount: discount,
            promoCode: this.promoCode,
            tip: tip,
            total: total,
            deliveryType: this.deliveryType,
            paymentMethod: this.paymentMethod,
            scheduleType: this.scheduleType,
            scheduledTime: this.scheduledTime,
            customerName: name,
            customer: {
                name: name,
                phone: phone,
                email: email,
                address: address
            },
            address: address,
            phone: phone,
            notes: notes,
            date: new Date().toLocaleString('es-CL'),
            status: 'confirmado',
            estimatedTime: this.scheduleType === 'asap' ? this.getEstimatedTime() : this.scheduledTime
        };

        // Mostrar loading
        this.showNotification('⏳ Procesando pedido...', 'info');

        // ==========================================
        // INTEGRACIÓN ODOO - Enviar pedido al ERP
        // ==========================================
        if (window.OdooAPI) {
            try {
                const odooResult = await OdooAPI.createSaleOrder(order);
                if (odooResult.success) {
                    order.odooOrderId = odooResult.odooOrderId;
                    order.odooSync = true;
                    console.log('✅ Pedido sincronizado con Odoo:', odooResult);
                } else {
                    order.odooSync = false;
                    order.odooError = odooResult.error;
                    console.warn('⚠️ Pedido no sincronizado con Odoo:', odooResult.error);
                }
            } catch (error) {
                order.odooSync = false;
                order.odooError = error.message;
                console.error('❌ Error Odoo:', error);
            }
        }

        // Save order locally
        const orders = JSON.parse(localStorage.getItem('hanoi_orders')) || [];
        orders.push(order);
        localStorage.setItem('hanoi_orders', JSON.stringify(orders));
        localStorage.setItem('hanoi_last_order', JSON.stringify(order));

        // Show confirmation
        this.closeModal('checkoutModal');
        this.showOrderConfirmation(order);
        this.clearCart();
        
        // Reset checkout state
        this.promoCode = null;
        this.tipPercent = 0;
        this.checkoutStep = 1;
    },
    
    getEstimatedTime() {
        const now = new Date();
        const minTime = this.deliveryType === 'delivery' ? 35 : 20;
        const maxTime = this.deliveryType === 'delivery' ? 50 : 30;
        now.setMinutes(now.getMinutes() + minTime);
        const endTime = new Date(now);
        endTime.setMinutes(endTime.getMinutes() + (maxTime - minTime));
        
        return now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) + 
               ' - ' + endTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    },

    showOrderConfirmation(order) {
        // Create confetti
        this.createConfetti();
        
        const modal = document.getElementById('confirmationModal');
        if (modal) {
            const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
            el('orderNumber', order.orderNumber);
            el('orderTotal', this.formatPrice(order.total));
            el('orderETA', order.estimatedTime);
            el('orderDeliveryType', order.deliveryType === 'delivery' ? 'Delivery a tu dirección' : 'Retiro en local');
            el('orderPaymentMethod', this.getPaymentMethodName(order.paymentMethod));
            
            // Start tracking animation
            this.startOrderTracking();
            
            this.openModal('confirmationModal');
        } else {
            this.showNotification('🎉 ¡Pedido confirmado! ' + order.orderNumber);
        }
    },
    
    createConfetti() {
        const colors = ['#019389', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(confetti);
        }
        
        setTimeout(() => container.remove(), 5000);
    },
    
    startOrderTracking() {
        const steps = document.querySelectorAll('.tracking-step');
        if (steps.length === 0) return;
        
        let currentStep = 0;
        steps[0].classList.add('active');
        
        // Simulate order progress
        const interval = setInterval(() => {
            if (currentStep < steps.length - 1) {
                steps[currentStep].classList.remove('active');
                steps[currentStep].classList.add('completed');
                currentStep++;
                steps[currentStep].classList.add('active');
            } else {
                clearInterval(interval);
            }
        }, 3000);
    },

    sendOrderWhatsApp(orderId) {
        const order = JSON.parse(localStorage.getItem('hanoi_last_order')) || 
                      (JSON.parse(localStorage.getItem('hanoi_orders')) || []).slice(-1)[0];
        
        if (!order) return;

        let message = '🍣 *PEDIDO ' + order.orderNumber + ' - HANOI SUSHI*\n\n';
        message += '👤 *Cliente:* ' + (order.customerName || 'No especificado') + '\n';
        message += '📱 *Teléfono:* ' + order.phone + '\n';
        
        if (order.deliveryType === 'delivery') {
            message += '📍 *Dirección:* ' + order.address + '\n';
        } else {
            message += '🏪 *Retiro en local*\n';
        }
        
        message += '\n*━━━ DETALLE DEL PEDIDO ━━━*\n\n';
        
        order.items.forEach(item => {
            let itemTotal = item.price * item.quantity;
            message += '• *' + item.name + '* x' + item.quantity + '\n';
            message += '  ' + this.formatPrice(itemTotal) + '\n';
            if (item.salsas && item.salsas.length > 0) {
                message += '  _Salsas: ' + item.salsas.map(s => s.name).join(', ') + '_\n';
            }
            if (item.notes) {
                message += '  _Nota: "' + item.notes + '"_\n';
            }
        });
        
        message += '\n*━━━━━━━━━━━━━━━━━━━━━━━━*\n';
        message += '📦 Subtotal: ' + this.formatPrice(order.subtotal) + '\n';
        message += '🚚 Delivery: ' + (order.delivery === 0 ? 'Gratis' : this.formatPrice(order.delivery)) + '\n';
        if (order.discount > 0) {
            message += '🎁 Descuento: -' + this.formatPrice(order.discount) + '\n';
        }
        if (order.tip > 0) {
            message += '💝 Propina: ' + this.formatPrice(order.tip) + '\n';
        }
        message += '\n💰 *TOTAL: ' + this.formatPrice(order.total) + '*\n';
        message += '💳 *Pago: ' + this.getPaymentMethodName(order.paymentMethod) + '*\n';
        
        if (order.notes) {
            message += '\n📝 *Notas:* ' + order.notes + '\n';
        }
        
        message += '\n⏰ *Entrega estimada:* ' + order.estimatedTime;

        window.open('https://wa.me/56222447450?text=' + encodeURIComponent(message), '_blank');
    },

    getPaymentMethodName(method) {
        const methods = { 
            'webpay': 'Webpay (Tarjeta)', 
            'efectivo': 'Efectivo', 
            'transferencia': 'Transferencia',
            'tarjeta': 'Tarjeta en local'
        };
        return methods[method || this.paymentMethod] || 'Efectivo';
    },


    // BUSCADOR
    initSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    },

    handleSearch(term) {
        const searchTerm = term.toLowerCase().trim();
        const categories = document.querySelectorAll('.category-section');
        
        if (!searchTerm) {
            document.querySelectorAll('.product-card').forEach(p => p.style.display = '');
            categories.forEach(c => c.style.display = '');
            this.showNoResultsMessage(false, '');
            return;
        }

        let hasResults = false;
        
        categories.forEach(category => {
            const products = category.querySelectorAll('.product-card');
            let categoryHasResults = false;
            
            products.forEach(card => {
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
                const matches = title.includes(searchTerm) || desc.includes(searchTerm);
                
                card.style.display = matches ? '' : 'none';
                if (matches) { categoryHasResults = true; hasResults = true; }
            });
            
            category.style.display = categoryHasResults ? '' : 'none';
        });

        this.showNoResultsMessage(!hasResults, searchTerm);
    },

    showNoResultsMessage(show, term) {
        let noResults = document.getElementById('noSearchResults');
        
        if (show) {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.id = 'noSearchResults';
                noResults.style.cssText = 'text-align:center;padding:3rem;color:#888;';
                noResults.innerHTML = '<i class="fas fa-search" style="font-size:3rem;color:#ddd;margin-bottom:1rem;display:block;"></i>' +
                    '<h3 style="margin-bottom:0.5rem;">No encontramos "' + term + '"</h3>' +
                    '<p>Intenta con otro término</p>';
                document.querySelector('.main-content')?.appendChild(noResults);
            } else {
                noResults.querySelector('h3').textContent = 'No encontramos "' + term + '"';
                noResults.style.display = 'block';
            }
        } else if (noResults) {
            noResults.style.display = 'none';
        }
    },

    // MODALES
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            // Pequeño delay para que la animación funcione
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            // Esperar a que termine la animación antes de ocultar
            setTimeout(() => {
                if (!modal.classList.contains('active')) {
                    modal.style.display = 'none';
                }
            }, 300);
            document.body.style.overflow = '';
        }
    },

    renderCartModal() {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        const cartContent = document.getElementById('cartContent');
        const cartFooter = document.getElementById('cartFooter');

        if (!cartItems) return;

        if (this.cart.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartContent) cartContent.style.display = 'none';
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        if (cartContent) cartContent.style.display = 'block';
        if (cartFooter) cartFooter.style.display = 'block';

        cartItems.innerHTML = this.cart.map(item => {
            let itemTotal = item.price * item.quantity;
            if (item.salsas) item.salsas.forEach(s => { itemTotal += s.price * item.quantity; });
            
            return '<div class="cart-item" data-id="' + item.cartId + '">' +
                '<img src="' + item.image + '" alt="' + item.name + '">' +
                '<div class="cart-item-info">' +
                    '<h4>' + item.name + '</h4>' +
                    (item.salsas && item.salsas.length > 0 ? '<small style="color:#019389;">+ ' + item.salsas.map(s => s.name).join(', ') + '</small>' : '') +
                    (item.notes ? '<p class="item-notes">"' + item.notes + '"</p>' : '') +
                    '<p class="cart-item-price">' + this.formatPrice(itemTotal) + '</p>' +
                '</div>' +
                '<div class="cart-item-actions">' +
                    '<button class="qty-btn" onclick="HanoiApp.updateQuantity(' + item.cartId + ', -1)">−</button>' +
                    '<span class="qty">' + item.quantity + '</span>' +
                    '<button class="qty-btn" onclick="HanoiApp.updateQuantity(' + item.cartId + ', 1)">+</button>' +
                '</div>' +
                '<button class="remove-btn" onclick="HanoiApp.removeFromCart(' + item.cartId + ')">' +
                    '<i class="fas fa-trash"></i>' +
                '</button>' +
            '</div>';
        }).join('');

        const subtotal = this.getCartTotal();
        const el1 = document.getElementById('cartSubtotal');
        const el2 = document.getElementById('cartTotal');
        if (el1) el1.textContent = this.formatPrice(subtotal);
        if (el2) el2.textContent = this.formatPrice(subtotal);
    },

    // UTILIDADES
    formatPrice(price) {
        return '$' + price.toLocaleString('es-CL');
    },

    showNotification(message, type) {
        type = type || 'success';
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification ' + type;
        notification.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'exclamation-circle') + '"></i><span>' + message + '</span>';
        document.body.appendChild(notification);

        setTimeout(function() { notification.classList.add('show'); }, 10);
        setTimeout(function() {
            notification.classList.remove('show');
            setTimeout(function() { notification.remove(); }, 300);
        }, 3000);
    },

    // EVENTOS
    bindEvents() {
        // Cerrar modales al hacer clic afuera
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Agregar al carrito
        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = e.target.closest('.product-card');
                if (card) {
                    const product = {
                        id: Date.now(),
                        name: card.querySelector('h3').textContent,
                        description: card.querySelector('p')?.textContent || '',
                        price: parseInt(card.querySelector('.product-price').textContent.replace(/\D/g, '')),
                        image: card.querySelector('img').src
                    };
                    this.openProductModal(product);
                }
            });
        });

        // Carrito
        document.querySelectorAll('.cart-btn, [data-cart-btn]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.renderCartModal();
                this.openModal('cartModal');
            });
        });
    }
};

// Inicializar
document.addEventListener('DOMContentLoaded', function() { HanoiApp.init(); });

// Funciones globales
function switchAuthTab(tab) {
    // Actualizar tabs
    document.querySelectorAll('.auth-tab').forEach(t => {
        t.classList.remove('active');
        t.style.background = 'transparent';
        t.style.color = '#666';
    });
    const activeTab = document.querySelector('[data-tab="' + tab + '"]');
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.style.background = 'white';
        activeTab.style.color = '#019389';
    }
    
    // Actualizar contenido
    document.querySelectorAll('.auth-content').forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none';
    });
    const activeContent = document.getElementById(tab + 'Form');
    if (activeContent) {
        activeContent.classList.add('active');
        activeContent.style.display = 'block';
    }
}

function handleLogin(e) {
    e.preventDefault();
    if (!HanoiApp.login(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value)) {
        HanoiApp.showNotification('Email o contraseña incorrectos', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const result = HanoiApp.register({
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        password: document.getElementById('regPassword').value,
        address: document.getElementById('regAddress')?.value || ''
    });
    if (result.success) {
        HanoiApp.showNotification(result.message);
        HanoiApp.closeModal('loginModal');
    } else {
        HanoiApp.showNotification(result.message, 'error');
    }
}

// ==========================================
// FUNCIONES ADICIONALES PREMIUM
// ==========================================

// Mostrar loading overlay
function showLoading(message) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = '<div class="spinner"></div><div class="loading-text">' + (message || 'Procesando...') + '</div>';
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.remove();
}

// Animación de producto volando al carrito
function flyToCart(element) {
    const rect = element.getBoundingClientRect();
    const cartBtn = document.querySelector('.float-cart') || document.querySelector('[data-cart-btn]');
    if (!cartBtn) return;
    
    const cartRect = cartBtn.getBoundingClientRect();
    const clone = element.cloneNode(true);
    clone.className = 'quick-add-animation';
    clone.style.cssText = 'position:fixed;top:' + rect.top + 'px;left:' + rect.left + 'px;width:' + rect.width + 'px;height:' + rect.height + 'px;border-radius:50%;overflow:hidden;';
    document.body.appendChild(clone);
    
    setTimeout(() => {
        clone.style.transition = 'all 0.8s ease-in-out';
        clone.style.top = cartRect.top + 'px';
        clone.style.left = cartRect.left + 'px';
        clone.style.transform = 'scale(0.2)';
        clone.style.opacity = '0';
    }, 10);
    
    setTimeout(() => clone.remove(), 800);
}

// Vibración háptica (móviles)
function hapticFeedback() {
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Formatear número de teléfono chileno
function formatChileanPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.startsWith('56')) value = value.substring(2);
    if (value.startsWith('9') && value.length > 1) {
        value = value.substring(0, 1) + ' ' + value.substring(1, 5) + ' ' + value.substring(5, 9);
    }
    input.value = '+56 ' + value.trim();
}

// Validar RUT chileno (para futuro)
function validateRUT(rut) {
    if (!rut) return false;
    rut = rut.replace(/\./g, '').replace(/-/g, '');
    if (rut.length < 8) return false;
    
    const body = rut.slice(0, -1);
    const dv = rut.slice(-1).toUpperCase();
    
    let sum = 0;
    let multiplier = 2;
    
    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const expectedDV = 11 - (sum % 11);
    const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();
    
    return dv === calculatedDV;
}

// Copiar al portapapeles
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        HanoiApp.showNotification('Copiado al portapapeles');
    });
}

// Compartir pedido (Web Share API)
function shareOrder(order) {
    if (navigator.share) {
        navigator.share({
            title: 'Mi pedido en Hanoi Sushi',
            text: '¡Acabo de pedir en Hanoi Sushi! Pedido ' + order.orderNumber,
            url: window.location.href
        });
    }
}

// Detectar si es móvil
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Scroll suave a elemento
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Debounce para búsqueda
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Formatear fecha
function formatDate(date) {
    return new Date(date).toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Calcular distancia (para futuro delivery tracking)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Service Worker para PWA (preparado)
if ('serviceWorker' in navigator) {
    // navigator.serviceWorker.register('/sw.js');
}

// Notificaciones push (preparado)
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Mostrar notificación del sistema
function showSystemNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'https://tofuu.getjusto.com/orioneat-local/resized2/s84YdnWJtwcyS6PdE-300-x.webp',
            badge: 'https://tofuu.getjusto.com/orioneat-local/resized2/s84YdnWJtwcyS6PdE-300-x.webp'
        });
    }
}

console.log('🍣 Hanoi Sushi Premium - Sistema cargado correctamente');
console.log('📱 La mejor experiencia de pedidos del MUNDO');
