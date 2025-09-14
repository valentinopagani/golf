import { useEffect, useState } from 'react';
import axios from 'axios';

function EstadisticasCancha() {
	const [clubes, setClubes] = useState([]);
	const [canchas, setCanchas] = useState([]);
	const [golpes, setGolpes] = useState({});

	async function getClubes() {
		const res = await axios.get('http://localhost:3001/clubes');
		return res.data;
	}
	async function getCanchas() {
		const res = await axios.get('http://localhost:3001/canchas');
		return res.data;
	}
	async function getGolpes() {
		const res = await axios.get('http://localhost:3001/golpes');
		return res.data;
	}

	useEffect(() => {
		const fetchData = async () => {
			const clubesData = await getClubes();
			setClubes(clubesData);

			const canchasData = await getCanchas();
			setCanchas(canchasData);

			const canchaGolpes = await getGolpes();
			setGolpes(canchaGolpes);
		};
		fetchData();
	}, []);

	const renderHoyoData = (cancha, hoyo, hoyoGolpes) => {
		const hoyoData = cancha.hoyos[hoyo];
		if (!hoyoData) return null;

		const { par = 0, distancia = '-', dificultad = '-' } = hoyoData;
		const totalGolpes = hoyoGolpes.length;
		const promedioGolpes = totalGolpes > 0 ? (hoyoGolpes.reduce((acc, golpe) => acc + Number(golpe), 0) / totalGolpes).toFixed(2) : 'Cargando...';

		const parCount = hoyoGolpes.filter((golpe) => Number(golpe) === par).length;
		const aguilaCount = hoyoGolpes.filter((golpe) => Number(golpe) === par - 2).length;
		const birdieCount = hoyoGolpes.filter((golpe) => Number(golpe) === par - 1).length;
		const bogeyCount = hoyoGolpes.filter((golpe) => Number(golpe) === par + 1).length;
		const dobleBogeyCount = hoyoGolpes.filter((golpe) => Number(golpe) === par + 2).length;

		const parPercentage = totalGolpes > 0 ? ((parCount / totalGolpes) * 100).toFixed(2) : 'Cargando...';
		const aguilaPercentage = totalGolpes > 0 ? ((aguilaCount / totalGolpes) * 100).toFixed(2) : 'Cargando...';
		const birdiePercentage = totalGolpes > 0 ? ((birdieCount / totalGolpes) * 100).toFixed(2) : 'Cargando...';
		const bogeyPercentage = totalGolpes > 0 ? ((bogeyCount / totalGolpes) * 100).toFixed(2) : 'Cargando...';
		const dobleBogeyPercentage = totalGolpes > 0 ? ((dobleBogeyCount / totalGolpes) * 100).toFixed(2) : 'Cargando...';

		return (
			<tr key={hoyo}>
				<th>Hoyo {hoyo.split('_')[1]}</th>
				<td>{distancia} yd</td>
				<td>{dificultad}</td>
				<td>{par}</td>
				<td>{promedioGolpes}</td>
				<td className='aguila'>{aguilaPercentage} %</td>
				<td className='birdie'>{birdiePercentage} %</td>
				<td className='par'>{parPercentage} %</td>
				<td className='bogey'>{bogeyPercentage} %</td>
				<td className='dbogey'>{dobleBogeyPercentage} %</td>
			</tr>
		);
	};

	return (
		<div className='body_home'>
			<div className='title_banner'>
				<h2>Visualizá tu próxima cancha.</h2>
			</div>

			{clubes.map((club) => (
				<div key={club.id}>
					<h2>{club.nombre}</h2>

					{canchas
						.filter((cancha) => cancha.clubVinculo === club.id)
						.map((cancha) => (
							<div key={cancha.id}>
								{cancha.hoyos && (
									<details>
										<summary style={{ cursor: 'pointer', textAlign: 'center', fontSize: 20, margin: '10px 0' }}>CANCHA {cancha.nombre.toUpperCase()}</summary>
										<div className='datos_cancha'>
											<div className='table_container'>
												<table>
													<thead>
														<tr>
															<th></th>
															<th>Distancia</th>
															<th>Dificultad</th>
															<th>Par</th>
															<th>Par Promedio</th>
															<th>Águila</th>
															<th>Birdie</th>
															<th>Par</th>
															<th>Bogey</th>
															<th>Doble Bogey</th>
														</tr>
													</thead>
													<tbody>
														{Object.entries(cancha.hoyos)
															.sort((a, b) => parseInt(a[0].split('_')[1]) - parseInt(b[0].split('_')[1]))
															.map(([hoyo, _]) => renderHoyoData(cancha, hoyo, golpes[cancha.id]?.[hoyo] || []))}
													</tbody>
												</table>
											</div>
										</div>
									</details>
								)}
							</div>
						))}
				</div>
			))}
		</div>
	);
}

export default EstadisticasCancha;
