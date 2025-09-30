const db = require('../db.js');

const getGolpes = (req, res) => {
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
};

module.exports = { getGolpes };
