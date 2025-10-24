const db = require('../db.js');

const getCanchasStats = (req, res) => {
	db.query(
		`SELECT i.scores, t.cancha, c.hoyos, c.nombre AS cancha_nombre, club.id AS club_id, club.nombre AS club_nombre
		 FROM inscriptos i
		 JOIN torneos t ON i.torneo = t.id
		 JOIN canchas c ON t.cancha = c.id
		 JOIN clubes club ON c.clubVinculo = club.id
		 WHERE i.scores IS NOT NULL`,
		(err, rows) => {
			if (err) return res.status(500).json({ error: err.message });

			const estadisticas = {};

			rows.forEach((row) => {
				const canchaId = row.cancha;
				let scores = row.scores;
				let hoyosInfo = row.hoyos;

				// golpes de cada jugador
				Object.keys(scores).forEach((key) => {
					const match = key.match(/ronda\d+_hoyo(\d+)/);
					if (!match) return;

					const hoyoNum = match[1];
					const hoyoKey = `hoyo_${hoyoNum}`;
					const golpe = Number(scores[key]);

					if (!estadisticas[canchaId]) estadisticas[canchaId] = {};
					if (!estadisticas[canchaId][hoyoKey])
						estadisticas[canchaId][hoyoKey] = {
							distancia: hoyosInfo[hoyoKey]?.distancia || null,
							dificultad: hoyosInfo[hoyoKey]?.dificultad || null,
							par: hoyosInfo[hoyoKey]?.par || 0,
							golpes: []
						};

					estadisticas[canchaId][hoyoKey].golpes.push(golpe);
				});
			});

			// estadísticas finales
			Object.values(estadisticas).forEach((cancha) => {
				Object.values(cancha).forEach((hoyo) => {
					const total = hoyo.golpes.length;
					if (total === 0) return;

					const par = hoyo.par;
					const promedio = hoyo.golpes.reduce((acc, g) => acc + g, 0) / total;

					const contar = (cond) => hoyo.golpes.filter(cond).length;
					const porcentaje = (n) => ((n / total) * 100).toFixed(2);

					hoyo.promedio = promedio.toFixed(2);
					hoyo.porcentajes = {
						aguila: porcentaje(contar((g) => g === par - 2)),
						birdie: porcentaje(contar((g) => g === par - 1)),
						par: porcentaje(contar((g) => g === par)),
						bogey: porcentaje(contar((g) => g === par + 1)),
						dobleBogey: porcentaje(contar((g) => g === par + 2))
					};

					delete hoyo.golpes;
				});
			});

			// junto estadísticas e información
			const canchasEstadisticas = rows.reduce((acc, row) => {
				const canchaId = row.cancha;
				if (!acc[canchaId]) {
					acc[canchaId] = {
						cancha_nombre: row.cancha_nombre,
						club_id: row.club_id,
						estadisticas: estadisticas[canchaId] || {}
					};
				}
				return acc;
			}, {});

			res.json(canchasEstadisticas);
		}
	);
};

module.exports = { getCanchasStats };
