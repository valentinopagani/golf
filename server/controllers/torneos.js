const db = require('../db.js');
const { subMonths } = require('date-fns');

const getTorneos = (req, res) => {
	let torneosSql = 'SELECT * FROM torneos';
	const categoriasSql = 'SELECT * FROM categorias_torneo';

	if (req.query.tipo) {
		const { tipo } = req.query;
		if (tipo === 'proximos') {
			torneosSql += " WHERE STR_TO_DATE(fech_ini, '%d/%m/%Y') >= CURDATE();";
		} else if (tipo === 'dosmeses') {
			torneosSql += ` WHERE STR_TO_DATE(fech_ini, '%d/%m/%Y') >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) AND finalizado = 1`;
		} else if (tipo === 'antiguos') {
			torneosSql += ` WHERE STR_TO_DATE(fech_ini, '%d/%m/%Y') < CURDATE()`;
		} else if (tipo === 'inscripciones') {
			torneosSql += " WHERE STR_TO_DATE(fech_ini, '%d/%m/%Y') >= CURDATE() AND finalizado=0 AND valor IS NOT NULL";
		} else if (tipo === 'inscripcionesadmin') {
			torneosSql += ' WHERE finalizado=0';
		}
	} else if (req.query.nombre) {
		const { nombre } = req.query;
		torneosSql += ` WHERE LOWER(nombre) LIKE '%${nombre}%'`;
	} else if (req.query.tipo && req.query.clubVinculo) {
		const { tipo, clubVinculo } = req.query;
		if (tipo === 'inscripcionesadmin') {
			torneosSql += ` WHERE finalizado=0 AND clubVinculo=${clubVinculo}`;
		}
	} else if (req.query.clubVinculo) {
		const { clubVinculo } = req.query;
		torneosSql += ` WHERE clubVinculo=${clubVinculo}`;
	}

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
};

const setTorneo = (req, res) => {
	const { nombre, fech_ini, fech_fin, cancha, rondas, descripcion, clubVinculo, nombreClubVinculo, fech_alta, valor, finalizado } = req.body;
	db.query('INSERT INTO torneos ( nombre, fech_ini, fech_fin, cancha, rondas, descripcion, clubVinculo, nombreClubVinculo, fech_alta, valor, finalizado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [nombre, fech_ini, fech_fin, cancha, rondas, descripcion, clubVinculo, nombreClubVinculo, fech_alta, valor, finalizado], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: result.insertId, nombre, fech_ini, fech_fin, cancha, rondas, descripcion, clubVinculo, nombreClubVinculo, fech_alta, valor, finalizado });
	});
};

const closeTorneo = (req, res) => {
	const torneoId = req.params.id;
	db.query('UPDATE torneos SET finalizado = 1 WHERE id = ?', [torneoId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
};

const reopenTorneo = (req, res) => {
	const torneoId = req.params.id;
	db.query('UPDATE torneos SET finalizado = 0 WHERE id = ?', [torneoId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
};

const editTorneo = (req, res) => {
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
};

const deleteTorneo = (req, res) => {
	// borra el torneo y sus categorias
	const torneoId = req.params.id;
	db.query('DELETE FROM categorias_torneo WHERE torneo_id = ?', [torneoId], (err) => {
		if (err) return res.status(500).json({ error: err.message });
		db.query('DELETE FROM torneos WHERE id = ?', [torneoId], (err) => {
			if (err) return res.status(500).json({ error: err.message });
			res.json({ success: true });
		});
	});
};

module.exports = { getTorneos, setTorneo, closeTorneo, reopenTorneo, editTorneo, deleteTorneo };
