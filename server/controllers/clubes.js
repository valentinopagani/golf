const db = require('../db.js');

const getClubes = (req, res) => {
	let clubesSql = 'SELECT * FROM clubes';

	if (req.query.vinculo) {
		const { vinculo } = req.query;
		clubesSql += ` WHERE vinculo = '${vinculo}'`;
	}

	db.query(clubesSql, (err, results) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(results);
	});
};

const setClub = (req, res) => {
	const { nombre, logo, direccion, telefono, contacto, email, vinculo, fech_alta } = req.body;
	db.query('INSERT INTO clubes (nombre, logo, direccion, telefono, contacto, email, vinculo, fech_alta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [nombre, logo, direccion, telefono, contacto, email, vinculo, fech_alta], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: result.insertId, nombre, logo, direccion, telefono, contacto, email, vinculo, fech_alta });
	});
};

module.exports = { getClubes, setClub };
