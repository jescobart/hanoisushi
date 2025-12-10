# 🍣 Hanoi Sushi - Sistema de Pedidos Online

Sistema web completo para el restaurante Hanoi Sushi Premium Nikkei, con integración a Odoo ERP para gestión automatizada de pedidos.

## 📋 Descripción

Hanoi Sushi es una aplicación web de e-commerce para un restaurante de comida japonesa/nikkei ubicado en Santiago de Chile (Huechuraba y Lo Barnechea). El sistema permite a los clientes:

- Explorar el menú completo (rolls, sashimi, tablas, entradas, etc.)
- Agregar productos al carrito con extras (salsas)
- Realizar pedidos con delivery o retiro en local
- Aplicar códigos de descuento
- Elegir método de pago y programar horario de entrega

## 🏗️ Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   FRONTEND      │     │   BACKEND       │     │   ERP           │
│   (Sitio Web)   │────▶│   (API Proxy)   │────▶│   (Odoo)        │
│                 │     │                 │     │                 │
│ - HTML/CSS/JS   │     │ - Node.js       │     │ - Odoo Online   │
│ - Carrito       │     │ - Vercel        │     │ - XML-RPC API   │
│ - Checkout      │     │ - Serverless    │     │ - Base de datos │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 📁 Estructura del Proyecto

```
hanoi sushi/
├── index.html              # Página principal (home)
├── carta.html              # Menú completo con productos
├── delivery.html           # Información de zonas de reparto
├── locales.html            # Ubicación de los locales
├── contacto.html           # Formulario de contacto
├── css/
│   └── modals.css          # Estilos de modales (carrito, checkout, etc.)
├── js/
│   ├── app.js              # Lógica principal (carrito, checkout, usuarios)
│   └── odoo-integration.js # Módulo de integración con Odoo ERP
└── README.md

hanoi-odoo-proxy/           # Repositorio separado para el backend
├── api/
│   └── order.js            # Función serverless (proxy a Odoo)
├── package.json
└── vercel.json
```

## ⚙️ Funcionalidades Principales

### 🛒 Sistema de Carrito
- Agregar/eliminar productos
- Modificar cantidades
- Agregar extras (salsas) con precio adicional
- Notas especiales por producto
- Persistencia en LocalStorage

### 💳 Checkout Premium
- Proceso de 3 pasos (Entrega → Pago → Confirmación)
- Opciones de delivery o retiro en local
- Múltiples métodos de pago (Webpay, efectivo, transferencia)
- Programación de horario de entrega
- Sistema de propinas
- Códigos promocionales

### 👤 Sistema de Usuarios
- Registro e inicio de sesión
- Perfil con datos guardados
- Historial de pedidos

### 🔗 Integración Odoo
- Sincronización automática de pedidos al ERP
- Creación de clientes en Odoo
- Registro de órdenes de venta con líneas de productos

## 🛠️ Tecnologías Utilizadas

| Componente | Tecnología |
|------------|------------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | Node.js (Serverless Functions) |
| Hosting Backend | Vercel |
| ERP | Odoo Online |
| Protocolo API | XML-RPC |
| Iconos | Font Awesome |
| Fuentes | Google Fonts (Lato) |

## 🚀 Instalación y Uso

### Frontend (Sitio Web)
El frontend es estático, solo necesitas un servidor web:

```bash
# Opción 1: Abrir directamente en el navegador
# Simplemente abre index.html

# Opción 2: Usar un servidor local
npx serve .
# o
python -m http.server 8000
```

### Backend (Proxy Odoo)
El proxy está desplegado en Vercel. Para desarrollo local:

```bash
cd hanoi-odoo-proxy
npm install
vercel dev
```

## 🔧 Configuración

### Variables de Entorno (Backend)
Configurar en Vercel o archivo `.env`:

```env
ODOO_URL=https://tu-instancia.odoo.com
ODOO_DB=nombre_base_datos
ODOO_USERNAME=usuario@email.com
ODOO_API_KEY=tu_api_key
```

### Configuración Frontend
En `js/odoo-integration.js`:

```javascript
const OdooAPI = {
    config: {
        proxyUrl: 'https://tu-proxy.vercel.app/api/order',
        simulationMode: false  // true para pruebas sin Odoo
    }
};
```

## 📱 Características de la UI

- Diseño responsive (mobile-first)
- Slider de imágenes en hero
- Modales animados para productos y checkout
- Notificaciones toast
- Animación de confetti en confirmación de pedido
- Botón flotante de WhatsApp
- Menú móvil hamburguesa

## 🎨 Paleta de Colores

```css
--primary: #019389;      /* Verde azulado principal */
--primary-dark: #017a72; /* Verde oscuro */
--secondary: #f5f5f5;    /* Gris claro */
--text-dark: #333;       /* Texto oscuro */
--text-light: #666;      /* Texto secundario */
```

## 📊 Flujo de un Pedido

1. Cliente agrega productos al carrito
2. Abre el checkout y completa datos
3. Selecciona tipo de entrega y método de pago
4. Confirma el pedido
5. Frontend envía datos al proxy (Vercel)
6. Proxy autentica con Odoo via XML-RPC
7. Se crea/busca el cliente en Odoo
8. Se crea la orden de venta con líneas de productos
9. Se muestra confirmación al cliente

## 🧪 Modo Simulación

Para probar sin conexión a Odoo:

```javascript
// En consola del navegador
OdooAPI.enableSimulation();  // Activa modo simulación
OdooAPI.enableProduction();  // Vuelve a modo producción
OdooAPI.showOrders();        // Ver pedidos guardados
```

## 📞 Información del Negocio

**Hanoi Sushi Premium Nikkei**
- 📍 Huechuraba: Av. Pedro Fontova 7280, Local 115
- 📍 Lo Barnechea: Camino Los Trapenses 3200
- 📱 Teléfono: +56 2 2244 7450
- ⏰ Horario: Lunes a Sábado 13:00 - 23:30

## 📄 Documentación Adicional

- [Integración Odoo Detallada](INTEGRACION_ODOO_DETALLE.md)
- [Configuración de Odoo](ODOO_SETUP.md)
- [Preguntas para Defensa](PREGUNTAS_DEFENSA.md)

## 👨‍💻 Autor

Proyecto desarrollado como sistema de pedidos online con integración ERP.

## 📝 Licencia

Este proyecto es de uso educativo/demostrativo.
