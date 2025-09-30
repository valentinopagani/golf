const db = require('../db.js');

const getCategorias = (req, res) => {
	let categoriasSql = 'SELECT * FROM categorias';
	if (req.query.club) {
		const { club } = req.query;
		categoriasSql += ` WHERE vinculo = ${club}`;
	}

	db.query(categoriasSql, (err, results) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(results);
	});
};

const setCategorias = (req, res) => {
	const { nombre, vinculo } = req.body;
	db.query('INSERT INTO categorias (nombre, vinculo) VALUES (?, ?)', [nombre, vinculo], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: result.insertId, nombre, vinculo });
	});
};

const deleteCategorias = (req, res) => {
	const catId = req.params.id;
	db.query('DELETE FROM categorias WHERE id = ?', [catId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
};

module.exports = { getCategorias, setCategorias, deleteCategorias };
