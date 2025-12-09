// ==========================================
// HANOI SUSHI - INTEGRACIÓN ODOO ERP
// ==========================================

const OdooAPI = {
    // ✅ CONFIGURACIÓN
    config: {
        odooUrl: 'https://hanoishushi.odoo.com',
        db: 'hanoishushi',
        proxyUrl: 'https://hanoi-odoo-proxy.vercel.app/api/order',
        // false = envía a Odoo real
        simulationMode: false,
        enabled: true
    },

    // ==========================================
    // CREAR PEDIDO EN ODOO
    // ==========================================
    
    async createSaleOrder(orderData) {
        console.log('\n========================================');
        console.log('🍣 ENVIANDO PEDIDO A ODOO');
        console.log('========================================');
        
        // Preparar datos del pedido
        const odooPayload = {
            orderNumber: orderData.orderNumber,
            customer: {
                name: orderData.customer?.name || 'Cliente',
                phone: orderData.customer?.phone || orderData.phone,
                email: orderData.customer?.email || '',
                address: orderData.customer?.address || orderData.address
            },
            items: orderData.items.map(item => {
                // Calcular precio de salsas
                const salsasPrice = item.salsas ? item.salsas.reduce((sum, s) => sum + (s.price || 0), 0) : 0;
                const priceWithSalsas = item.price + salsasPrice;
                return {
                    product: item.name,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    salsasPrice: salsasPrice,
                    subtotal: priceWithSalsas * item.quantity,
                    extras: item.salsas?.map(s => s.name).join(', ') || 'Ninguno',
                    notes: item.notes || ''
                };
            }),
            delivery: {
                type: orderData.deliveryType === 'delivery' ? 'Delivery' : 'Retiro en local',
                cost: orderData.deliveryCost || 0,
                address: orderData.address || 'N/A'
            },
            payment: {
                method: orderData.paymentMethod,
                total: orderData.total
            },
            timestamp: new Date().toLocaleString('es-CL')
        };

        console.log('📦 Datos del pedido:');
        console.log(JSON.stringify(odooPayload, null, 2));
        
        // Guardar en localStorage siempre
        this.saveOrder(odooPayload);

        // Si está en modo simulación, no enviar al proxy
        if (this.config.simulationMode) {
            console.log('\n⚠️ MODO SIMULACIÓN ACTIVO');
            console.log('Para enviar a Odoo real, configura:');
            console.log('OdooAPI.config.simulationMode = false');
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return {
                success: true,
                simulated: true,
                odooOrderId: 'SIM-' + Date.now(),
                message: '✅ Pedido simulado correctamente'
            };
        }

        // Enviar al proxy real
        try {
            console.log('\n📡 Enviando a proxy:', this.config.proxyUrl);
            
            const response = await fetch(this.config.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    odooUrl: this.config.odooUrl,
                    db: this.config.db,
                    order: odooPayload
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('\n✅ PEDIDO ENVIADO A ODOO');
                console.log('ID Odoo:', result.odooOrderId);
                return result;
            } else {
                console.error('❌ Error:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('❌ Error de conexión:', error.message);
            return { 
                success: true, 
                simulated: true,
                message: 'Guardado localmente (sin conexión a Odoo)'
            };
        }
    },

    // Guardar pedido localmente
    saveOrder(orderData) {
        const orders = JSON.parse(localStorage.getItem('odoo_orders')) || [];
        orders.unshift({
            ...orderData,
            id: orderData.orderNumber,
            savedAt: new Date().toISOString(),
            status: this.config.simulationMode ? 'simulated' : 'sent'
        });
        localStorage.setItem('odoo_orders', JSON.stringify(orders));
    },

    // Obtener todos los pedidos
    getOrders() {
        return JSON.parse(localStorage.getItem('odoo_orders')) || [];
    },

    // Limpiar pedidos
    clearOrders() {
        localStorage.removeItem('odoo_orders');
        console.log('🗑️ Pedidos eliminados');
    },

    // Ver pedidos en consola
    showOrders() {
        const orders = this.getOrders();
        if (orders.length === 0) {
            console.log('📭 No hay pedidos');
            return;
        }
        
        console.log('\n========================================');
        console.log('📋 PEDIDOS (' + orders.length + ')');
        console.log('========================================');
        
        orders.forEach((order, i) => {
            console.log(`\n#${i + 1} - ${order.orderNumber}`);
            console.log(`   👤 ${order.customer.name} | 📱 ${order.customer.phone}`);
            console.log(`   🚚 ${order.delivery.type}`);
            console.log(`   💰 Total: $${order.payment.total.toLocaleString('es-CL')}`);
            console.log(`   📅 ${order.timestamp}`);
        });
        
        return orders;
    },

    // Activar modo producción
    enableProduction() {
        this.config.simulationMode = false;
        console.log('✅ Modo producción activado - Pedidos irán a Odoo');
    },

    // Activar modo simulación
    enableSimulation() {
        this.config.simulationMode = true;
        console.log('✅ Modo simulación activado');
    }
};

// Exportar globalmente
window.OdooAPI = OdooAPI;

console.log('🔗 Odoo Integration cargada');
console.log('📡 Proxy URL:', OdooAPI.config.proxyUrl);
console.log('🎮 Modo:', OdooAPI.config.simulationMode ? 'SIMULACIÓN' : 'PRODUCCIÓN');
console.log('💡 Comandos:');
console.log('   OdooAPI.showOrders()       - Ver pedidos');
console.log('   OdooAPI.enableProduction() - Activar Odoo real');
console.log('   OdooAPI.enableSimulation() - Volver a simulación');
