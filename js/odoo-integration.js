// ==========================================
// HANOI SUSHI - INTEGRACIÓN ODOO ERP
// MODO SIMULACIÓN para demostración
// ==========================================

const OdooAPI = {
    // ✅ CONFIGURACIÓN
    config: {
        odooUrl: 'https://hanoishushi.odoo.com',
        db: 'hanoishushi',
        // MODO SIMULACIÓN - cambiar a false cuando esté el proxy real
        simulationMode: true,
        enabled: true
    },

    // ==========================================
    // CREAR PEDIDO EN ODOO
    // ==========================================
    
    async createSaleOrder(orderData) {
        console.log('\n========================================');
        console.log('🍣 SIMULACIÓN DE PEDIDO A ODOO');
        console.log('========================================');
        
        // Datos que se enviarían a Odoo
        const odooPayload = {
            orderNumber: orderData.orderNumber,
            customer: {
                name: orderData.customer?.name || 'Cliente',
                phone: orderData.customer?.phone || orderData.phone,
                email: orderData.customer?.email || '',
                address: orderData.customer?.address || orderData.address
            },
            items: orderData.items.map(item => ({
                product: item.name,
                quantity: item.quantity,
                unitPrice: item.price,
                subtotal: item.price * item.quantity,
                extras: item.salsas?.map(s => s.name).join(', ') || 'Ninguno',
                notes: item.notes || ''
            })),
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
        
        console.log('\n📡 Destino: ' + this.config.odooUrl);
        console.log('🗄️ Base de datos: ' + this.config.db);
        
        // Guardar en localStorage para el panel de admin
        this.saveOrder(odooPayload);
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('\n✅ SIMULACIÓN EXITOSA');
        console.log('En producción, este pedido llegaría a Odoo automáticamente.');
        console.log('========================================\n');
        
        return {
            success: true,
            simulated: true,
            odooOrderId: 'SIM-' + Date.now(),
            message: '✅ Pedido simulado correctamente'
        };
    },

    // Guardar pedido
    saveOrder(orderData) {
        const orders = JSON.parse(localStorage.getItem('odoo_orders')) || [];
        orders.unshift({
            ...orderData,
            id: orderData.orderNumber,
            savedAt: new Date().toISOString(),
            status: 'simulated'
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

    // Ver pedidos en consola de forma bonita
    showOrders() {
        const orders = this.getOrders();
        if (orders.length === 0) {
            console.log('📭 No hay pedidos');
            return;
        }
        
        console.log('\n========================================');
        console.log('📋 PEDIDOS EN SISTEMA (' + orders.length + ')');
        console.log('========================================');
        
        orders.forEach((order, i) => {
            console.log(`\n#${i + 1} - ${order.orderNumber}`);
            console.log(`   👤 ${order.customer.name} | 📱 ${order.customer.phone}`);
            console.log(`   🚚 ${order.delivery.type}`);
            console.log(`   💰 Total: $${order.payment.total.toLocaleString('es-CL')}`);
            console.log(`   📅 ${order.timestamp}`);
        });
        
        console.log('\n========================================');
        return orders;
    }
};

// Exportar globalmente
window.OdooAPI = OdooAPI;

console.log('🔗 Odoo Integration cargada - MODO SIMULACIÓN');
console.log('📡 Odoo URL:', OdooAPI.config.odooUrl);
console.log('💡 Comandos disponibles:');
console.log('   OdooAPI.showOrders()  - Ver pedidos');
console.log('   OdooAPI.clearOrders() - Limpiar pedidos');
