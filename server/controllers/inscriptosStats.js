const db = require('../db.js');

const getInscriptosStats = (req, res) => {
	let { club, fechaMin, fechaMax } = req.query;
	club = JSON.parse(decodeURIComponent(club));

	let sql = `
        SELECT 
            t.id,
            t.nombre,
            t.fech_ini,
				DATE_FORMAT(STR_TO_DATE(t.fech_ini, '%d/%m/%Y'), '%Y-%m-%d') AS fech_ini_inv,
            COUNT(DISTINCT i.dni) AS inscriptosUnicos
        FROM torneos t
        LEFT JOIN inscriptos i 
            ON i.torneo = t.id 
            AND i.clubReg = ?
        WHERE t.clubVinculo = ?
    `;

	const params = [club.nombre, Number(club.id)];

	if (fechaMin && fechaMin !== 'Todas') {
		sql += ` AND DATE_FORMAT(STR_TO_DATE(t.fech_ini, '%d/%m/%Y'), '%Y-%m-%d') >= '${fechaMin}'`;
	}
	if (fechaMax && fechaMax !== 'Todas') {
		sql += ` AND DATE_FORMAT(STR_TO_DATE(t.fech_fin, '%d/%m/%Y'), '%Y-%m-%d') <= '${fechaMax}'`;
	}

	sql += ' GROUP BY t.id, t.nombre, t.fech_ini ORDER BY fech_ini_inv';

	db.query(sql, params, (err, results) => {
		if (err) return res.status(500).json({ error: err.message });
		const labels = results.map((r) => `${r.nombre} ${r.fech_ini}`);
		const values = results.map((r) => r.inscriptosUnicos);
		res.json({ labels, values });
	});
};

module.exports = { getInscriptosStats };
