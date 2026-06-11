const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hacer visible la carpeta public (donde están index.html y admin.html)
app.use(express.static(path.join(__dirname, 'public')));

// 🗄️ LISTA DE USUARIOS (Simulación de Base de Datos)
// He añadido dos usuarios. Si entran con el segundo, verás que ya no sale tu número.
let usuariosRegistrados = [
    { nombre: "Rafael Rodríguez", telefono: "902961967", contrasena: "123456" },
    { nombre: "Carlos Mendoza", telefono: "987654321", contrasena: "password123" }
];

// 🚀 PROCESAR INICIO DE SESIÓN DINÁMICO
app.post('/login', (req, res) => {
    const { telefono, contrasena } = req.body;

    // Buscamos si existe el usuario con los datos tipeados
    const usuarioEncontrado = usuariosRegistrados.find(
        u => u.telefono === telefono && u.contrasena === contrasena
    );

    if (usuarioEncontrado) {
        // Si existe, respondemos mandándole sus datos reales al HTML
        res.json({
            success: true,
            nombre: usuarioEncontrado.nombre,
            telefono: usuarioEncontrado.telefono
        });
    } else {
        // Si no existe, mandamos error
        res.json({
            success: false,
            message: "El número de teléfono o la contraseña son incorrectos."
        });
    }
});

// Enlace limpio directo al index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Puerto automático de Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de MarketMind corriendo en el puerto ${PORT}`);
});
