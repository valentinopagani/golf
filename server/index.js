const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const { default: MercadoPagoConfig, Preference } = require('mercadopago');

app.use(cors());
app.use(express.json()); // Permite recibir JSON en las peticiones

const db = mysql.createConnection({
	host: 'localhost',
	port: 3307,
	user: 'root',
	password: '0000',
	database: 'golf'
});

db.connect((err) => {
	if (err) {
		console.error('Error al conectar:', err.message);
	} else {
		console.log('Conectado correctamente!');
	}
});

// MERCADO PAGO
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-2837454565417268-090321-14d98d3e3f8caa3e703760863ace90cc-2365070491' });

app.post('/create_preference', async (req, res) => {
	try {
		const preference = new Preference(client);
		const result = await preference.create({
			body: {
				payment_methods: {
					excluded_payment_methods: [{ id: 'cash' }, { id: 'amex' }, { id: 'argencard' }, { id: 'cabal' }, { id: 'cmr' }, { id: 'cencosud' }, { id: 'diners' }, { id: 'tarshop' }, { id: 'debcabal' }, { id: 'maestro' }],
					installments: 1
				},
				items: [
					{
						title: req.body.title,
						quantity: 1,
						unit_price: req.body.price,
						description: req.body.description,
						currency_id: 'ARS',
						category_id: 'sports'
					}
				],
				back_urls: {
					success: 'http://localhost:3000/inscripciones'
				},
				binary_mode: true,
				statement_descriptor: 'GolfPoint'
			}
		});

		res.json({
			id: result.id // si falla borrar .id
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: 'error al crear preferencia'
		});
	}
});

// TRAER TORNEOS CON SUS CATEGORIAS
app.get('/torneos', (req, res) => {
	const torneosSql = 'SELECT * FROM torneos';
	const categoriasSql = 'SELECT * FROM categorias_torneo';

	db.query(torneosSql, (err, torneos) => {
		if (err) return res.status(500).json({ error: err.message });

		db.query(categoriasSql, (err, categorias) => {
			if (err) return res.status(500).json({ error: err.message });

			const torneosConCategorias = torneos.map((torneo) => ({
				...torneo,
				categorias: categorias
					.filter((cat) => cat.torneo_id === torneo.id)
					.map((cat) => ({
						nombre: cat.nombre
					}))
			}));

			res.json(torneosConCategorias);
		});
	});
});

// TRAER CLUBES
app.get('/clubes', (req, res) => {
	db.query('SELECT * FROM clubes', (err, results) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(results);
	});
});

// TRAER CATEGORIAS
app.get('/categorias', (req, res) => {
	db.query('SELECT * FROM categorias', (err, results) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(results);
	});
});

// ELIMINAR CATEGORIA
app.delete('/categorias/:id', (req, res) => {
	const catId = req.params.id;
	db.query('DELETE FROM categorias WHERE id = ?', [catId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
});

// TRAER CANCHAS
app.get('/canchas', (req, res) => {
	db.query('SELECT * FROM canchas', (err, results) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(results);
	});
});

// ELIMINAR CANCHAS
app.delete('/canchas/:id', (req, res) => {
	const canchaId = req.params.id;
	db.query('DELETE FROM canchas WHERE id = ?', [canchaId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
});

// TRAER JUGADORES
app.get('/jugadores', (req, res) => {
	db.query('SELECT * FROM jugadores', (err, results) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(results);
	});
});

// TRAER INSCRIPTOS
app.get('/inscriptos', (req, res) => {
	db.query('SELECT * FROM inscriptos', (err, results) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(results);
	});
});

// CARGAR CLUB
app.post('/clubes', (req, res) => {
	const { nombre, logo, direccion, telefono, contacto, email, vinculo, fech_alta } = req.body;
	db.query('INSERT INTO clubes (nombre, logo, direccion, telefono, contacto, email, vinculo, fech_alta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [nombre, logo, direccion, telefono, contacto, email, vinculo, fech_alta], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: result.insertId, nombre, logo, direccion, telefono, contacto, email, vinculo, fech_alta });
	});
});

// CARCGAR CANCHAS
app.post('/canchas', (req, res) => {
	const { nombre, cant_hoyos, clubVinculo } = req.body;
	db.query('INSERT INTO canchas (nombre, cant_hoyos, clubVinculo) VALUES (?, ?, ?)', [nombre, cant_hoyos, clubVinculo], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: result.insertId, nombre, cant_hoyos, clubVinculo });
	});
});

// CARGAR HOYOS
app.put('/canchas/:id/hoyos', (req, res) => {
	const canchaId = req.params.id;
	const { hoyos, parCancha } = req.body;
	db.query('UPDATE canchas SET hoyos = ?, parCancha = ? WHERE id = ?', [JSON.stringify(hoyos), parCancha, canchaId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
});

// CARGAR CATEGORIAS POR CLUB
app.post('/categorias', (req, res) => {
	const { nombre, vinculo } = req.body;
	db.query('INSERT INTO categorias (nombre, vinculo) VALUES (?, ?)', [nombre, vinculo], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: result.insertId, nombre, vinculo });
	});
});

// CARGAR TORNEO
app.post('/torneos', (req, res) => {
	const { nombre, fech_ini, fech_fin, cancha, rondas, descripcion, clubVinculo, nombreClubVinculo, fech_alta, valor, finalizado } = req.body;
	db.query('INSERT INTO torneos ( nombre, fech_ini, fech_fin, cancha, rondas, descripcion, clubVinculo, nombreClubVinculo, fech_alta, valor, finalizado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [nombre, fech_ini, fech_fin, cancha, rondas, descripcion, clubVinculo, nombreClubVinculo, fech_alta, valor, finalizado], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: result.insertId, nombre, fech_ini, fech_fin, cancha, rondas, descripcion, clubVinculo, nombreClubVinculo, fech_alta, valor, finalizado });
	});
});
app.post('/categorias_torneo', (req, res) => {
	const { nombre, torneo_id } = req.body;
	db.query('INSERT INTO categorias_torneo (nombre, torneo_id) VALUES (?, ?)', [nombre, torneo_id], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: result.insertId, nombre, torneo_id });
	});
});

// REABRIR TORNEO
app.put('/torneos/:id/reabrir', (req, res) => {
	const torneoId = req.params.id;
	db.query('UPDATE torneos SET finalizado = 0 WHERE id = ?', [torneoId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
});

// FINALIZAR TORNEO
app.put('/torneos/:id/finalizar', (req, res) => {
	const torneoId = req.params.id;
	db.query('UPDATE torneos SET finalizado = 1 WHERE id = ?', [torneoId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
});

// ELIMINAR TORNEO JUNTO CON SUS CATEGORIAS
app.delete('/torneos/:id', (req, res) => {
	const torneoId = req.params.id;
	// Elimina las categorías asociadas
	db.query('DELETE FROM categorias_torneo WHERE torneo_id = ?', [torneoId], (err) => {
		if (err) return res.status(500).json({ error: err.message });
		// Despues el torneo
		db.query('DELETE FROM torneos WHERE id = ?', [torneoId], (err) => {
			if (err) return res.status(500).json({ error: err.message });
			res.json({ success: true });
		});
	});
});

// EDITAR TORNEO JUNTO CON SUS CATEGORIAS
app.put('/torneos/:id', (req, res) => {
	const torneoId = req.params.id;
	const { nombre, fech_ini, fech_fin, cancha, rondas, descripcion, valor, editado, categorias } = req.body;

	db.query('UPDATE torneos SET nombre=?, fech_ini=?, fech_fin=?, cancha=?, rondas=?, descripcion=?, valor=?, editado=? WHERE id=?', [nombre, fech_ini, fech_fin, cancha, rondas, descripcion, valor, editado, torneoId], (err) => {
		if (err) return res.status(500).json({ error: err.message });
		// Eliminar categorías anteriores
		db.query('DELETE FROM categorias_torneo WHERE torneo_id=?', [torneoId], (err) => {
			if (err) return res.status(500).json({ error: err.message });
			// Insertar nuevas categorías si hay
			if (Array.isArray(categorias) && categorias.length > 0) {
				const values = categorias.map((nombre) => [nombre, torneoId]);
				db.query('INSERT INTO categorias_torneo (nombre, torneo_id) VALUES ?', [values], (err) => {
					if (err) return res.status(500).json({ error: err.message });
					res.json({ success: true });
				});
			} else {
				res.json({ success: true });
			}
		});
	});
});
app.delete('/categorias_torneo/torneo/:id', (req, res) => {
	const torneoId = req.params.id;
	db.query('DELETE FROM categorias_torneo WHERE torneo_id = ?', [torneoId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
});

// CARGAR JUGADOR
app.post('/jugadores', (req, res) => {
	const { dni, nombre, fech_nac, sexo, clubReg, fech_alta } = req.body;
	db.query('INSERT INTO jugadores (dni, nombre, fech_nac, sexo, clubReg, fech_alta) VALUES (?, ?, ?, ?, ?, ?)', [dni, nombre, fech_nac, sexo, clubReg, fech_alta], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: result.insertId, dni, nombre, fech_nac, sexo, clubReg, fech_alta });
	});
});

// EDITAR JUGADOR
app.put('/jugadores/:id', (req, res) => {
	const { nombre, dni, fech_nac, sexo } = req.body;
	const { id } = req.params;
	const sql = 'UPDATE jugadores SET nombre = ?, dni = ?, fech_nac = ?, sexo = ? WHERE id = ?';
	db.query(sql, [nombre, dni, fech_nac, sexo, id], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
});

// CARGAR INSCRIPCION
app.post('/inscriptos', (req, res) => {
	const { dni, nombre, torneo, categoria, handicap, clubReg, clubSocio, fech_alta } = req.body;
	db.query('INSERT INTO inscriptos (dni, nombre, torneo, categoria, handicap, clubReg, clubSocio, fech_alta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [dni, nombre, torneo, categoria, handicap, clubReg, clubSocio, fech_alta], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: result.insertId, dni, nombre, torneo, categoria, handicap, clubReg, clubSocio, fech_alta });
	});
});

// CARGAR PUNTOS
app.put('/inscriptos/score', (req, res) => {
	const { id, scores, totalScore } = req.body;
	db.query('UPDATE inscriptos SET scores = ?, totalScore = ? WHERE id = ?', [JSON.stringify(scores), totalScore, id], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
});

// EDITAR PUNTOS
app.put('/inscriptos/score', (req, res) => {
	const { id, scores, totalScore } = req.body;
	const scoresStr = JSON.stringify(scores);

	const sql = 'UPDATE inscriptos SET scores = ?, totalScore = ? WHERE id = ?';
	db.query(sql, [scoresStr, totalScore, id], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
});

// ELIMINAR INSCRIPTO
app.delete('/inscriptos/:id', (req, res) => {
	const jugId = req.params.id;
	db.query('DELETE FROM inscriptos WHERE id = ?', [jugId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
});

// CALCULAR GOLPES POR CANCHA
app.get('/golpes', (req, res) => {
	db.query(
		`SELECT inscriptos.scores, torneos.cancha, inscriptos.torneo
		  FROM inscriptos
		  JOIN torneos ON inscriptos.torneo = torneos.id
		  WHERE inscriptos.scores IS NOT NULL`,
		(err, rows) => {
			if (err) return res.status(500).json({ error: err.message });

			const golpes = {};
			rows.forEach((row) => {
				const canchaId = row.cancha;
				const scores = row.scores || {};
				Object.keys(scores).forEach((key) => {
					const match = key.match(/ronda\d+_hoyo(\d+)/);
					if (match) {
						const hoyo = `hoyo_${match[1]}`;
						if (!golpes[canchaId]) golpes[canchaId] = {};
						if (!golpes[canchaId][hoyo]) golpes[canchaId][hoyo] = [];
						golpes[canchaId][hoyo].push(scores[key]);
					}
				});
			});
			res.json(golpes);
		}
	);
});

app.listen(3001, () => {
	console.log('corriendo en puerto 3001');
});
