const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 📂 Ruta del archivo donde guardaremos los datos de forma permanente
const DATA_FILE = path.join(__dirname, 'usuarios.json');

// Función auxiliar para leer los datos del archivo JSON
function leerDatos() {
    if (!fs.existsSync(DATA_FILE)) {
        // Base de datos inicial con usuarios de prueba si el archivo no existe
        const datosIniciales = [
            { id: "1", nombre: "Carlos Mendoza", telefono: "987654321", contrasena: "password123", tareas: [] },
            { id: "2", nombre: "Ana Flores", telefono: "912345678", contrasena: "ana2026", tareas: [] }
        ];
        fs.writeFileSync(DATA_FILE, JSON.stringify(datosIniciales, null, 2));
        return datosIniciales;
    }
    const contenido = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(contenido);
}

// Función auxiliar para guardar los datos en el archivo JSON
function guardarDatos(datos) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(datos, null, 2));
}

// 🚀 RUTA 1: Procesar Inicio de Sesión (Login)
app.post('/login', (req, res) => {
    const { telefono, contrasena } = req.body;
    const usuarios = leerDatos();

    const usuarioEncontrado = usuarios.find(u => u.telefono === telefono && u.contrasena === contrasena);

    if (usuarioEncontrado) {
        res.json({
            success: true,
            nombre: usuarioEncontrado.nombre,
            telefono: usuarioEncontrado.telefono
        });
    } else {
        res.json({ success: false, message: "Teléfono o contraseña incorrectos." });
    }
});

// 🚀 RUTA 2: Obtener la lista de todos los usuarios (Para el Admin)
app.get('/api/usuarios', (req, res) => {
    const usuarios = leerDatos();
    // Devolvemos la lista omitiendo las contraseñas por seguridad
    const listaPublica = usuarios.map(u => ({ id: u.id, nombre: u.nombre, telefono: u.telefono, tareas: u.tareas }));
    res.json(listaPublica);
});

// 🚀 RUTA 3: Asignar o actualizar tareas de un usuario específico
app.post('/api/usuarios/tareas', (req, res) => {
    const { usuarioId, tareas } = req.body; // 'tareas' debe ser un arreglo de strings []
    const usuarios = leerDatos();

    const index = usuarios.findIndex(u => u.id === String(usuarioId));
    if (index !== -1) {
        usuarios[index].tareas = tareas;
        guardarDatos(usuarios);
        res.json({ success: true, message: "Tareas actualizadas correctamente." });
    } else {
        res.json({ success: false, message: "Usuario no encontrado." });
    }
});

// Redirección por defecto al index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor MarketMind activo en el puerto ${PORT}`);
});
