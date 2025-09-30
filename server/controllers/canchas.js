const db = require('../db.js');

const getCanchas = (req, res) => {
	let canchasSql = 'SELECT * FROM canchas';
	if (req.query.idCancha) {
		const { idCancha } = req.query;
		canchasSql += ` WHERE id = ${idCancha}`;
	}
	db.query(canchasSql, (err, results) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json(results);
	});
};

const setCancha = (req, res) => {
	const { nombre, cant_hoyos, clubVinculo } = req.body;
	db.query('INSERT INTO canchas (nombre, cant_hoyos, clubVinculo) VALUES (?, ?, ?)', [nombre, cant_hoyos, clubVinculo], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ id: result.insertId, nombre, cant_hoyos, clubVinculo });
	});
};

const setHoyos = (req, res) => {
	const canchaId = req.params.id;
	const { hoyos, parCancha } = req.body;
	db.query('UPDATE canchas SET hoyos = ?, parCancha = ? WHERE id = ?', [JSON.stringify(hoyos), parCancha, canchaId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
};

const deleteCancha = (req, res) => {
	const canchaId = req.params.id;
	db.query('DELETE FROM canchas WHERE id = ?', [canchaId], (err, result) => {
		if (err) return res.status(500).json({ error: err.message });
		res.json({ success: true });
	});
};

module.exports = { getCanchas, setCancha, setHoyos, deleteCancha };
