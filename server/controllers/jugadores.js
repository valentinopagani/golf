const db = require('../db.js');

const getJugadores = (req, res) => {
	let jugadoresSql = 'SELECT * FROM jugadores';

	if (req.query.nombreDni) {
		const { nombreDni } = req.query;
		jugadoresSql += ` WHERE LOWER(nombre) LIKE '%${nombreDni}%' OR CAST(dni AS CHAR) LIKE '%${nombreDni}%'`;
	} else if (req.query.nombreClub) {
		const { nombreClub } = req.query;
		jugadoresSql += ` WHERE clubReg = '${nombreClub}'`;
	}

	db.query(jugadoresSql, (err, results) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(results);
	});
};

const setJugadores = (req, res) => {
	const { dni, nombre, fech_nac, sexo, clubReg, fech_alta } = req.body;
	db.query('INSERT INTO jugadores (dni, nombre, fech_nac, sexo, clubReg, fech_alta) VALUES (?, ?, ?, ?, ?, ?)', [dni, nombre, fech_nac, sexo, clubReg, fech_alta], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: result.insertId, dni, nombre, fech_nac, sexo, clubReg, fech_alta });
	});
};

const editJugador = (req, res) => {
	const { nombre, dni, fech_nac, sexo } = req.body;
	const { id } = req.params;
	const sql = 'UPDATE jugadores SET nombre = ?, dni = ?, fech_nac = ?, sexo = ? WHERE id = ?';
	db.query(sql, [nombre, dni, fech_nac, sexo, id], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
};

module.exports = { getJugadores, setJugadores, editJugador };
