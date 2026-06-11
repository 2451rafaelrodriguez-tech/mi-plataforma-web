const express = require('express');
const app = express();
const path = require('path');

// Permite al servidor entender archivos JSON y leer la carpeta 'public'
app.use(express.json());
app.use(express.static('public'));

// ==========================================
// 🗄️ BASE DE DATOS EN MEMORIA (Variables Globales)
// ==========================================

// 1. Registro de usuarios (Inicia con un usuario de prueba)
let usuarios = {
    "902961967": { telefono: "902961967", balance: 8.00 }
};

// 2. Lista donde se guardarán los vouchers de recarga enviados
let solicitudesRecarga = []; 

// 3. Configuración general de la plataforma (Modificable desde el Admin)
let configuracionApp = {
    montoMinimoRecarga: 10,
    mensajeAlerta: "⚠️ Realiza la transferencia al número de abajo, pon tu N° de Operación para validar y tu saldo se acreditará al ser aprobado.",
    mantenimiento: false
};

// 4. Catálogo de productos para las tareas (Modificable desde el Admin)
let catalogoProductos = [
    { name: "Xiaomi Redmi Note 13 Pro 5G", img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400" },
    { name: "Sony WH-1000XM5 Audífonos", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" }
];


// ==========================================
// 📱 RUTAS PARA EL USUARIO (index.html)
// ==========================================

// Obtener datos y saldo real de un usuario al navegar o actualizar
app.get('/api/usuario/:telefono', (req, res) => {
    const telefono = req.params.telefono;
    // Si el usuario no existe en el sistema, lo creamos con el saldo base de S/ 8.00
    if (!usuarios[telefono]) {
        usuarios[telefono] = { telefono: telefono, balance: 8.00 };
    }
    res.json(usuarios[telefono]);
});

// Sincronizar el saldo en el servidor cuando el usuario gana comisiones haciendo tareas
app.post('/api/actualizar-saldo', (req, res) => {
    const { telefono, balance } = req.body;
    if (usuarios[telefono]) {
        usuarios[telefono].balance = parseFloat(balance);
    }
    res.json({ OK: true });
});

// Registrar una nueva solicitud de recarga cuando el usuario envía un número de operación
app.post('/api/solicitar-recarga', (req, res) => {
    const { telefono, monto, numOperacion } = req.body;
    
    const nuevaSolicitud = {
        id: Date.now(), // ID único basado en milisegundos
        telefono,
        monto: parseFloat(monto),
        numOperacion,
        estado: "pendiente"
    };
    
    solicitudesRecarga.push(nuevaSolicitud);
    res.json({ mensaje: "Enviado con éxito", solicitud: nuevaSolicitud });
});

// Obtener las configuraciones globales actuales de la app
app.get('/api/configuracion', (req, res) => {
    res.json(configuracionApp);
});

// Obtener la lista de tareas/productos disponibles
app.get('/api/tareas', (req, res) => {
    res.json(catalogoProductos);
});


// ==========================================
// 🛠️ RUTAS PARA EL ADMINISTRADOR (admin.html)
// ==========================================

// El panel de control lee todas las solicitudes de recargas hechas por los usuarios
app.get('/api/admin/recargas', (req, res) => {
    res.json(solicitudesRecarga);
});

// Aprobar un depósito pendiente, sumando el dinero al balance del usuario
app.post('/api/admin/aprobar', (req, res) => {
    const { solicitudId } = req.body;
    const solicitud = solicitudesRecarga.find(s => s.id === parseInt(solicitudId));
    
    if (!solicitud) return res.status(404).json({ error: "Solicitud no encontrada" });
    if (solicitud.estado === "aprobado") return res.status(400).json({ error: "Esta solicitud ya fue aprobada previamente" });

    // Si el usuario por alguna razón no estaba registrado en memoria, lo inicializamos
    if (!usuarios[solicitud.telefono]) {
        usuarios[solicitud.telefono] = { telefono: solicitud.telefono, balance: 8.00 };
    }

    // OPERACIÓN CRÍTICA: Se le añade el dinero real al usuario en el servidor
    usuarios[solicitud.telefono].balance += solicitud.monto;
    solicitud.estado = "aprobado"; // Cambiamos el estado para que visualmente cambie en la tabla
    
    res.json({ mensaje: "¡Depósito aprobado y dinero acreditado al cliente!" });
});

// Actualizar textos, alertas y el modo mantenimiento de la web
app.post('/api/admin/actualizar-configuracion', (req, res) => {
    const { montoMinimo, nuevoMensaje, enMantenimiento } = req.body;
    
    configuracionApp.montoMinimoRecarga = parseFloat(montoMinimo);
    configuracionApp.mensajeAlerta = nuevoMensaje;
    configuracionApp.mantenimiento = enMantenimiento;
    
    res.json({ mensaje: "¡Configuración de la plataforma actualizada con éxito!" });
});

// Agregar un nuevo producto al catálogo de tareas desde el panel
app.post('/api/admin/agregar-tarea', (req, res) => {
    const { nombre, imagenUrl } = req.body;
    
    if (!nombre || !imagenUrl) {
        return res.status(400).json({ error: "Faltan campos obligatorios para crear la tarea" });
    }

    const nuevaTarea = { name: nombre, img: imagenUrl };
    catalogoProductos.push(nuevaTarea);
    
    res.json({ mensaje: "¡Nueva tarea añadida con éxito al sistema!" });
});


// ==========================================
// 🚀 ARRANQUE DEL SERVIDOR
// ==========================================
const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Servidor de MarketMind corriendo con éxito!`);
    console.log(`🌐 Acceso Cliente: http://localhost:${PUERTO}/index.html`);
    console.log(`🔧 Acceso Admin:   http://localhost:${PUERTO}/admin.html`);
    console.log(`==================================================\n`);
});