const db = require('../db.js');

const getJugadoresFiltrados = (req, res) => {
	const torneoId = req.params.id;

	db.query('SELECT * FROM torneos WHERE id = ?', [torneoId], (err, torneoResult) => {
		if (err) return res.status(500).json({ message: 'Error al obtener torneo' });
		const torneo = torneoResult[0];
		if (!torneo) return res.status(404).json({ message: 'Torneo no encontrado' });

		db.query('SELECT * FROM categorias_torneo WHERE torneo_id = ?', [torneoId], (err, categorias) => {
			if (err) return res.status(500).json({ message: 'Error al obtener categorías' });

			db.query('SELECT * FROM inscriptos WHERE torneo = ?', [torneoId], (err, jugadores) => {
				if (err) return res.status(500).json({ message: 'Error al obtener jugadores' });

				db.query('SELECT * FROM canchas WHERE id = ?', [torneo.cancha], (err, canchaResult) => {
					if (err) return res.status(500).json({ message: 'Error al obtener cancha' });
					const cancha = canchaResult[0];

					const calcularScoreNeto = (jugador) => {
						const esGross = /gross|scratch/i.test(jugador.categoria);
						return esGross ? jugador.totalScore - cancha.parCancha : jugador.totalScore - jugador.handicap * torneo.rondas - cancha.parCancha;
					};

					const desempate = (a, b) => {
						if (torneo.rondas !== 1) return a.scoreNeto - b.scoreNeto;
						else {
							// 1) score
							if (a.scoreNeto !== b.scoreNeto) return a.scoreNeto - b.scoreNeto;
							// 2) vuelta
							const aVuelta = a.scores?.['ronda1_vuelta'] ?? Infinity;
							const bVuelta = b.scores?.['ronda1_vuelta'] ?? Infinity;
							if (aVuelta !== bVuelta) return aVuelta - bVuelta;
							// 3) 3 últimos hoyos
							const hoyosTotales = cancha?.cant_hoyos ?? 18;
							const ultimos3 = [hoyosTotales - 2, hoyosTotales - 1, hoyosTotales];
							const sumaA = ultimos3.reduce((acc, h) => acc + (a.scores?.[`ronda1_hoyo${h}`] ?? 0), 0);
							const sumaB = ultimos3.reduce((acc, h) => acc + (b.scores?.[`ronda1_hoyo${h}`] ?? 0), 0);
							return sumaA - sumaB;
						}
					};

					const jugadoresFiltrados = categorias.map((categoria) => {
						const jugadoresCategoria = jugadores
							.filter((j) => j.categoria === categoria.nombre)
							.map((j) => ({
								...j,
								scoreNeto: j.scores ? calcularScoreNeto(j) : null
							}))
							.filter((j) => j.scoreNeto !== null)
							.sort((a, b) => (torneo.rondas !== 1 ? a.scoreNeto - b.scoreNeto : a.scoreNeto - b.scoreNeto || desempate(a, b)));

						return { categoria, jugadoresCategoria };
					});

					res.json(jugadoresFiltrados);
				});
			});
		});
	});
};

module.exports = { getJugadoresFiltrados };
