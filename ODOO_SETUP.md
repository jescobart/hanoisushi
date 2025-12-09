# 🔗 Guía de Integración Odoo - Hanoi Sushi

## 📋 Requisitos Previos

1. **Cuenta Odoo** - Crear en [odoo.com](https://www.odoo.com)
   - Odoo Online (SaaS): ~$25/mes por usuario
   - Self-hosted: Gratis (requiere servidor)

2. **Módulos necesarios en Odoo:**
   - Ventas (sale)
   - Punto de Venta (point_of_sale) - opcional
   - Inventario (stock) - opcional
   - Contabilidad (account) - para facturación

---

## ⚙️ Configuración Paso a Paso

### 1. Obtener API Key de Odoo

1. Ir a **Ajustes > Usuarios**
2. Seleccionar tu usuario
3. Pestaña **Preferencias**
4. Sección **Claves API** → Crear nueva clave
5. Copiar la clave generada

### 2. Configurar el archivo `odoo-integration.js`

Editar el archivo `js/odoo-integration.js`:

```javascript
config: {
    url: 'https://tu-empresa.odoo.com',  // Tu URL de Odoo
    db: 'tu-empresa',                     // Nombre de tu base de datos
    apiKey: 'abc123xyz...',               // Tu API Key
    enabled: true                          // ¡Cambiar a true!
},
```

### 3. Crear Productos en Odoo

En Odoo, ir a **Ventas > Productos** y crear cada producto de tu carta:

| Producto Web | Crear en Odoo con mismo nombre |
|--------------|-------------------------------|
| Ebi Maguro Roll | Ebi Maguro Roll |
| Hanoi Special Roll | Hanoi Special Roll |
| Dragon Roll | Dragon Roll |
| ... | ... |

### 4. Mapear IDs de Productos

Después de crear los productos en Odoo, obtener sus IDs y actualizar:

```javascript
productMapping: {
    'Ebi Maguro Roll': 15,      // ID real en Odoo
    'Hanoi Special Roll': 16,   // ID real en Odoo
    'Dragon Roll': 17,          // ID real en Odoo
    // etc...
},
```

**Tip:** Para ver el ID de un producto en Odoo:
- Abrir el producto
- Ver la URL: `/web#id=15&model=product.product`
- El número después de `id=` es el ID

### 5. Configurar Métodos de Pago

En Odoo, ir a **Contabilidad > Configuración > Diarios** y crear:

1. **Webpay** - Tipo: Banco
2. **Efectivo** - Tipo: Efectivo
3. **Transferencia** - Tipo: Banco

Luego actualizar los IDs en `odoo-integration.js`:

```javascript
paymentMethods: {
    'webpay': 7,        // ID del diario Webpay
    'efectivo': 8,      // ID del diario Efectivo
    'transferencia': 9  // ID del diario Transferencia
},
```

---

## 🧪 Probar la Integración

### Modo Demo (sin Odoo)
Con `enabled: false`, los pedidos se procesan normalmente pero no se envían a Odoo. Verás en consola:
```
📝 Modo demo - Pedido simulado: {...}
```

### Modo Producción
Con `enabled: true`, cada pedido:
1. Crea/actualiza el cliente en Odoo
2. Crea una Orden de Venta
3. Confirma la orden automáticamente

---

## 🔧 Funcionalidades Incluidas

| Función | Descripción |
|---------|-------------|
| `createSaleOrder()` | Crea pedido en Odoo |
| `findOrCreatePartner()` | Busca o crea cliente |
| `confirmSaleOrder()` | Confirma el pedido |
| `checkStock()` | Verifica disponibilidad |
| `getProducts()` | Obtiene productos de Odoo |

---

## 📊 Qué verás en Odoo

Después de un pedido exitoso:

1. **Ventas > Pedidos** - Nuevo pedido con:
   - Cliente (creado automáticamente)
   - Productos del carrito
   - Notas con detalles (dirección, tipo entrega, etc.)
   - Referencia: número de pedido web

2. **Contactos** - Cliente nuevo o actualizado

---

## ⚠️ Solución de Problemas

### Error CORS
Si ves errores de CORS, necesitas:
1. Configurar proxy en tu servidor
2. O usar Odoo con CORS habilitado

### Pedidos no llegan a Odoo
1. Verificar `enabled: true`
2. Revisar consola del navegador (F12)
3. Verificar API Key válida
4. Confirmar URL correcta

### IDs de productos incorrectos
Los pedidos llegarán pero con productos genéricos. Actualizar `productMapping` con IDs reales.

---

## 📞 Soporte

Para configuración avanzada o problemas:
- Documentación Odoo: [odoo.com/documentation](https://www.odoo.com/documentation)
- API Reference: [odoo.com/documentation/16.0/developer/reference/external_api.html](https://www.odoo.com/documentation/16.0/developer/reference/external_api.html)

---

## 🚀 Próximos Pasos (Opcionales)

1. **Sincronizar productos** - Cargar carta desde Odoo
2. **Stock en tiempo real** - Mostrar disponibilidad
3. **Facturación automática** - Generar boletas/facturas
4. **Reportes** - Dashboard de ventas
5. **Multi-local** - Separar pedidos por sucursal
