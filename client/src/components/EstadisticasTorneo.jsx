import { useState, lazy, memo, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi';
import { IoCloseCircleSharp } from 'react-icons/io5';
import * as XLSX from 'xlsx';
import axios from 'axios';

const ModalEst = lazy(() => import('./ModalEst'));

const EstadisticasTorneo = memo(function EstadisticasTorneo({ torneo, categoriaSelect, jugadores, setModal, user }) {
	const [isOpen, setIsOpen] = useState(false);
	const [jugadorDatos, setJugadorDatos] = useState([]);
	const [canchas, setCanchas] = useState([]);
	const [selectedCategoria, setSelectedCategoria] = useState(categoriaSelect || 'Todas');

	useEffect(() => {
		axios
			.get('http://localhost:3001/canchas')
			.then((response) => setCanchas(response.data))
			.catch((error) => console.error(error));
	}, []);

	async function handleJugadorClick(jugador) {
		await setJugadorDatos(jugador);
		setIsOpen(true);
	}

	const datosCancha = canchas.find((cancha) => cancha.id === torneo.cancha);

	const jugadoresFiltrados = torneo.categorias.map((categoria) => {
		const nombreCategoria = categoria.nombre;
		const jugadoresCategoria = jugadores
			.filter((jugador) => jugador.torneo === torneo.id && jugador.categoria === nombreCategoria)
			.map((jugador) => {
				if (jugador.scores && datosCancha) {
					const scoreNeto = jugador.categoria.toLowerCase().includes('gross') || jugador.categoria.toLowerCase().includes('scratch') ? jugador.totalScore - datosCancha.parCancha : jugador.totalScore - jugador.handicap * torneo.rondas - datosCancha.parCancha;
					return {
						...jugador,
						scoreNeto
					};
				} else {
					return { ...jugador };
				}
			})
			.filter((jugador) => jugador.scoreNeto !== null)
			.sort((a, b) => {
				if (torneo.rondas !== 1) return a.scoreNeto - b.scoreNeto;
				else {
					// 1) score
					if (a.scoreNeto !== b.scoreNeto) return a.scoreNeto - b.scoreNeto;
					// 2) vuelta
					const aVuelta = a.scores?.['ronda1_vuelta'] ?? Infinity;
					const bVuelta = b.scores?.['ronda1_vuelta'] ?? Infinity;
					if (aVuelta !== bVuelta) return aVuelta - bVuelta;
					// 3) 3 últimos hoyos
					const hoyosTotales = datosCancha?.cant_hoyos ?? 18;
					const ultimos3 = [hoyosTotales - 2, hoyosTotales - 1, hoyosTotales];
					const sumaA = ultimos3.reduce((acc, h) => acc + (a.scores?.[`ronda1_hoyo${h}`] ?? 0), 0);
					const sumaB = ultimos3.reduce((acc, h) => acc + (b.scores?.[`ronda1_hoyo${h}`] ?? 0), 0);
					return sumaA - sumaB;
				}
			});

		return { categoria, jugadoresCategoria };
	});

	const exportToExcel = () => {
		const workbook = XLSX.utils.book_new();

		jugadoresFiltrados.forEach(({ categoria, jugadoresCategoria }) => {
			jugadoresCategoria.sort((a, b) => a.scoreNeto - b.scoreNeto);
			const data = jugadoresCategoria.map((jugador, index) => {
				function getPosiciones() {
					if (index === 0) return 1;
					if (index > 0 && jugadoresCategoria[index].scoreNeto !== jugadoresCategoria[index - 1].scoreNeto) {
						return index + 1;
					}
				}
				if (torneo.rondas === 1) {
					return {
						'POS.': getPosiciones(),
						DNI: jugador.dni,
						'APELLIDO Y NOMBRE': jugador.nombre,
						CLUB: jugador.clubSocio,
						HDC: jugador.handicap,
						IDA: jugador.scores['ronda1_ida'],
						VUELTA: jugador.scores['ronda1_vuelta'],
						TOTAL: jugador.totalScore,
						NETO: jugador.scoreNeto
					};
				} else {
					return {
						'POS.': getPosiciones(),
						DNI: jugador.dni,
						'APELLIDO Y NOMBRE': jugador.nombre,
						CLUB: jugador.clubSocio,
						HDC: jugador.handicap,
						TOTAL: jugador.totalScore,
						NETO: jugador.scoreNeto
					};
				}
			});

			const title = [[`${torneo.nombre.toUpperCase()} - ${categoria.nombre.toUpperCase()} - ${torneo.fech_ini}`]];
			const worksheet = XLSX.utils.aoa_to_sheet(title);

			if (!worksheet['!merges']) worksheet['!merges'] = [];
			worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } });

			XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A3', skipHeader: false });

			const colWidths = [
				{ wpx: 35 }, // Posicion
				{ wpx: 75 }, // DNI
				{ wpx: 200 }, // Nombre
				{ wpx: 200 }, // Club
				{ wpx: 55 }, // HDC
				{ wpx: 55 }, // Ida
				{ wpx: 55 }, // Vuelta
				{ wpx: 55 }, // Total
				{ wpx: 55 } // Neto
			];
			worksheet['!cols'] = colWidths;

			XLSX.utils.book_append_sheet(workbook, worksheet, categoria.nombre);
		});

		XLSX.writeFile(workbook, `Resultados ${torneo.nombre} ${torneo.fech_ini}.xlsx`);
	};

	return (
		<div className='modal'>
			<div className='modal_cont'>
				<div className='modal_title'>
					<h3>{torneo.nombre}</h3>
					<select value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.target.value)}>
						<option value='Todas'>Todas las categorías</option>
						{torneo.categorias.map((categoria) => (
							<option key={categoria} value={categoria.nombre}>
								{categoria.nombre}
							</option>
						))}
					</select>
					{user && (
						<IconButton onClick={exportToExcel} title='Exportar a Excel'>
							<PiMicrosoftExcelLogoFill fill='green' fontSize='30' />
						</IconButton>
					)}
				</div>
				{jugadoresFiltrados
					.filter(({ categoria }) => selectedCategoria === 'Todas' || categoria.nombre === selectedCategoria)
					.map(({ categoria, jugadoresCategoria }) => {
						return (
							<div key={categoria} className='table_container'>
								<table className='tabla_est'>
									<caption>{categoria.nombre.toUpperCase()}</caption>
									<thead>
										<tr>
											<th className='pos'>Pos.</th>
											<th className='dni'>DNI</th>
											<th className='jug'>Apellido y Nombre</th>
											<th className='club'>Club</th>
											<th className='hdc'>HDC</th>
											{torneo.rondas === 1 && <th className='ida'>Ida</th>}
											{torneo.rondas === 1 && <th className='vuelta'>Vuelta</th>}
											<th className='score'>Score</th>
										</tr>
									</thead>
									<tbody>
										{jugadoresCategoria.map((jugador, jugadorIndex) => {
											function getPosiciones() {
												if (jugadorIndex === 0) return 1;
												if (jugadorIndex > 0 && jugadoresCategoria[jugadorIndex].scoreNeto !== jugadoresCategoria[jugadorIndex - 1].scoreNeto) return jugadorIndex + 1;
											}
											return (
												<tr key={jugador.dni}>
													<td>{getPosiciones()}</td>
													<td onClick={() => handleJugadorClick(jugador)} className='pointer'>
														{jugador.dni}
													</td>
													<td onClick={() => handleJugadorClick(jugador)} className='pointer'>
														<b style={{ color: 'brown', fontWeight: 900 }}>+</b> {jugador.nombre}
													</td>
													<td>{jugador.clubSocio}</td>
													<td className='hdc'>{jugador.handicap}</td>
													{torneo.rondas === 1 && jugador.scores && <td className='ida'>{jugador.scores['ronda1_ida']}</td>}
													{torneo.rondas === 1 && jugador.scores && <td className='vuelta'>{jugador.scores['ronda1_vuelta']}</td>}
													<td onClick={() => handleJugadorClick(jugador)} className='score'>
														{jugador.scoreNeto}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						);
					})}
				<IconButton onClick={() => setModal(false)} size='medium' sx={{ position: 'absolute', top: 5, right: 10, color: 'white' }}>
					<IoCloseCircleSharp fontSize='40' />
				</IconButton>
			</div>
			{isOpen && <ModalEst torneo={torneo} jugadorDatos={jugadorDatos} canchas={canchas} setIsOpen={setIsOpen} />}
		</div>
	);
});

export default EstadisticasTorneo;
