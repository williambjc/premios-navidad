const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'votos.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Sirve los archivos HTML/CSS de la carpeta

// Inicializar archivo de votos si no existe
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Endpoint para recibir votos
app.post('/api/votar', (req, res) => {
    const { email, categoria, nominado } = req.body;

    if (!email || !categoria || !nominado) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const votos = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    // Validar si ya votó en esta categoría
    const yaVoto = votos.find(v => v.email === cleanEmail && v.categoria === categoria);
    if (yaVoto) {
        return res.status(400).json({ 
            success: false, 
            message: 'Este correo ya registró un voto en esta categoría.' 
        });
    }

    // Registrar nuevo voto
    const nuevoVoto = {
        id: Date.now(),
        fecha: new Date().toLocaleString(),
        email: cleanEmail,
        categoria,
        nominado: nominado.trim()
    };

    votos.push(nuevoVoto);
    fs.writeFileSync(DATA_FILE, JSON.stringify(votos, null, 2));

    console.log(`[VOTO REGISTRADO] ${cleanEmail} votó por ${nominado} en ${categoria}`);
    res.json({ success: true, message: 'Voto registrado exitosamente.' });
});

// Endpoint para que tú puedas ver los resultados en formato JSON o pasarlos a una tabla
app.get('/api/resultados', (req, res) => {
    const votos = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(votos);
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor de votaciones corriendo localmente en: http://localhost:${PORT}`);
    console.log(`📊 Para ver los resultados en bruto ve a: http://localhost:${PORT}/api/resultados`);
});