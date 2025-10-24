const db = require('../db.js');

const getInscriptos = (req, res) => {
	let inscriptosSql = 'SELECT * FROM inscriptos';

	if (req.query.torneo) {
		const { torneo } = req.query;
		inscriptosSql += ` WHERE torneo = ${torneo}`;
	} else if (req.query.torneos) {
		const ids = req.query.torneos.split(',').map(Number).filter(Boolean);
		if (ids.length > 0) {
			inscriptosSql += ` WHERE torneo IN (${ids.join(',')})`;
		}
	} else if (req.query.clubReg) {
		const { clubReg } = req.query;
		inscriptosSql += ` WHERE clubReg='${clubReg}'`;
	}

	db.query(inscriptosSql, (err, results) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(results);
	});
};

const setInscriptos = (req, res) => {
	const { dni, nombre, torneo, categoria, handicap, clubReg, clubSocio, fech_alta } = req.body;
	db.query('INSERT INTO inscriptos (dni, nombre, torneo, categoria, handicap, clubReg, clubSocio, fech_alta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [dni, nombre, torneo, categoria, handicap, clubReg, clubSocio, fech_alta], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: result.insertId, dni, nombre, torneo, categoria, handicap, clubReg, clubSocio, fech_alta });
	});
};

const setScores = (req, res) => {
	const { id, scores, totalScore } = req.body;
	db.query('UPDATE inscriptos SET scores = ?, totalScore = ? WHERE id = ?', [JSON.stringify(scores), totalScore, id], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
};

const editScores = (req, res) => {
	const { id, scores, totalScore } = req.body;
	const scoresStr = JSON.stringify(scores);

	const sql = 'UPDATE inscriptos SET scores = ?, totalScore = ? WHERE id = ?';
	db.query(sql, [scoresStr, totalScore, id], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
};

const getHistorial = (req, res) => {
	let historialSql = 'SELECT * FROM inscriptos';

	if (req.query.dni) {
		const { dni } = req.query;
		historialSql += ` WHERE dni = '${dni}'`;
	}
	db.query(historialSql + ` ORDER BY STR_TO_DATE(fech_alta, '%d/%m/%Y') ASC`, (err, inscriptos) => {
		if (err) return res.status(500).json({ error: err.message });

		// Extract unique torneo IDs from inscriptos
		const torneoIds = [...new Set(inscriptos.map((insc) => insc.torneo))];

		// Fetch tournaments based on the extracted IDs
		const torneosSql = `SELECT * FROM torneos WHERE id IN (${torneoIds.join(',')})`;

		db.query(torneosSql, (err, torneos) => {
			if (err) return res.status(500).json({ error: err.message });
			res.json({ inscriptos, torneos });
		});
	});
};

const deleteInscripto = (req, res) => {
	const jugId = req.params.id;
	db.query('DELETE FROM inscriptos WHERE id = ?', [jugId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
};

module.exports = { getInscriptos, setInscriptos, setScores, editScores, getHistorial, deleteInscripto };
