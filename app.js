const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Para generar IDs únicos

const DB_PATH = path.join(__dirname, 'data', 'recetas.json');

function guardarRecetas() {
    fs.writeFileSync(DB_PATH, JSON.stringify(recetas, null, 2), 'utf-8');
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Base de datos en memoria
let recetas = [];
if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    recetas = JSON.parse(data);
}

let plan = {};

app.get('/', (req, res) => {
    res.render('index', { titulo: 'Recetario de Almuerzos', recetas, plan });
});

app.post('/agregar', upload.single('imagen'), (req, res) => {
    const { nombre, ingredientes } = req.body;
    const imagen = req.file ? '/uploads/' + req.file.filename : '/uploads/default.jpg';
    recetas.push({ id: uuidv4(), nombre, ingredientes, imagen, uso: 0 });
    guardarRecetas();
    res.redirect('/');
});

app.get('/editar/:id', (req, res) => {
    const id = req.params.id;
    const receta = recetas.find(r => r.id === id); // ajusta según tu estructura de datos

    if (!receta) {
        return res.status(404).send('Receta no encontrada');
    }

    res.render('editar', { receta });
});



app.post('/editar/:id', upload.single('imagen'), (req, res) => {
    const receta = recetas.find(r => r.id === req.params.id);
    if (!receta) return res.send('Receta no encontrada');

    receta.nombre = req.body.nombre;
    receta.ingredientes = req.body.ingredientes;

    if (req.file) {
        receta.imagen = '/uploads/' + req.file.filename;
    }

    guardarRecetas();
    res.redirect('/');
});

app.post('/planificar', (req, res) => {
    plan = req.body;
    recetas.forEach(r => {
        for (let dia in plan) {
            if (plan[dia] === r.nombre) {
                r.uso = (r.uso || 0) + 1;
            }
        }
    });
    guardarRecetas();
    res.redirect('/');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
