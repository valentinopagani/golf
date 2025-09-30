const db = require('../db.js');

const setCategoriasTorneo = (req, res) => {
	const { nombre, torneo_id } = req.body;
	db.query('INSERT INTO categorias_torneo (nombre, torneo_id) VALUES (?, ?)', [nombre, torneo_id], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: result.insertId, nombre, torneo_id });
	});
};

const deleteCategoriasTorneo = (req, res) => {
	const torneoId = req.params.id;
	db.query('DELETE FROM categorias_torneo WHERE torneo_id = ?', [torneoId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
};

module.exports = { setCategoriasTorneo, deleteCategoriasTorneo };
