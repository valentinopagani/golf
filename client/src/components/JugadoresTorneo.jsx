import { useEffect, useState } from 'react';
import Modal from './Modal';
import ModalEdit from './ModalEdit';
import axios from 'axios';
import { MdEdit } from 'react-icons/md';
import { FaTrash } from 'react-icons/fa';

function JugadoresTorneo({ club, torneos, jugadoresTorneos, setTorneos }) {
	const [jugadores, setJugadores] = useState([]);
	const [filterJugadoresDni, setFilterJugadoresDni] = useState('');
	const [filterJugadoresNombre, setFilterJugadoresNombre] = useState('');
	const [filteredJugadores, setFilteredJugadores] = useState([]);
	const [jugadoresTorneo, setJugadoresTorneo] = useState(jugadoresTorneos);
	const [filterTorneo, setFilterTorneo] = useState(0);
	const [filteredTorneo, setFilteredTorneo] = useState(null);
	const [registrado, setRegistrado] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [isOpenEdit, setIsOpenEdit] = useState(false);
	const [jugadorDatos, setJugadorDatos] = useState([]);
	const [torneoDatos, setTorneoDatos] = useState([]);
	const [filterCategoria, setFilterCategoria] = useState({});

	useEffect(() => {
		axios
			.get('http://localhost:3001/jugadores')
			.then((response) => setJugadores(response.data))
			.catch((error) => console.error(error));

		axios
			.get('http://localhost:3001/inscriptos')
			.then((response) => setJugadoresTorneo(response.data))
			.catch((error) => console.error(error));
	}, []);

	useEffect(() => {
		setFilteredTorneo(torneos.find((torneo) => torneo.id === filterTorneo));
	}, [filterTorneo, torneos]);

	useEffect(() => {
		setFilteredJugadores(
			jugadores.filter((jugador) => {
				if (filterJugadoresDni.length === 8) {
					return jugador.dni.toString() === filterJugadoresDni;
				}
				if (filterJugadoresNombre.length > 0) {
					return jugador.nombre.toLowerCase().includes(filterJugadoresNombre.toLowerCase());
				}
				return false;
			})
		);
	}, [filterJugadoresNombre, filterJugadoresDni, jugadores]);

	useEffect(() => {
		if ((filterJugadoresNombre.length >= 3 && filteredJugadores.length === 1) || (filterJugadoresDni.length === 8 && filteredJugadores.length === 1)) {
			setRegistrado(true);
		} else {
			setRegistrado(false);
		}
	}, [filterJugadoresNombre, filterJugadoresDni, filteredJugadores]);

	const jugadoresPorTorneo = torneos
		.filter((torneo) => torneo.finalizado === 0 && torneo.clubVinculo === club.id)
		.reduce((acc, torneo) => {
			acc[torneo.nombre] = {
				...torneo,
				jugadores: jugadoresTorneo.filter((jugador) => jugador.torneo === torneo.id)
			};
			return acc;
		}, {});

	async function cerrarTorneo(torneo) {
		try {
			await axios.put(`http://localhost:3001/torneos/${torneo.id}/finalizar`, { finalizado: 1 });
			alert('Torneo cerrado correctamente');
			await axios
				.get('http://localhost:3001/torneos')
				.then((response) => setTorneos(response.data))
				.catch((error) => console.error(error));
		} catch (error) {
			alert('Error al cerrar el torneo');
			console.error(error);
		}
	}

	const handleCategoriaChange = (torneoId, categoria) => {
		setFilterCategoria((prev) => ({
			...prev,
			[torneoId]: categoria
		}));
	};

	return (
		<div className='jugadores_admin'>
			<form
				className='form_nuevojug'
				id='form_nuevojug'
				autoComplete='off'
				onSubmit={async (e) => {
					e.preventDefault();
					let dni = e.target.dni.value;
					let nombre = e.target.nombre.value;
					const torneo = e.target.torneo.value;
					const categoria = e.target.categoria.value;
					const handicap = parseInt(e.target.handicap.value);
					const clubReg = club.nombre;
					const clubSocio = e.target.club_per.value;
					const fech_alta = new Date().toLocaleDateString();
					if (registrado) {
						dni = filteredJugadores[0].dni;
						nombre = filteredJugadores[0].nombre;
						try {
							await axios.post('http://localhost:3001/inscriptos', { dni, nombre, torneo, categoria, handicap, clubReg, clubSocio, fech_alta });
							await axios
								.get('http://localhost:3001/inscriptos')
								.then((response) => setJugadoresTorneo(response.data))
								.catch((error) => console.error(error));
						} catch (error) {
							console.error('error al registrar inscripto', error);
						}
					} else {
						const fecha = e.target.fech_nac.value.split('-');
						const fech_nac = fecha[2] + '/' + fecha[1] + '/' + fecha[0];
						const sexo = e.target.sexo.value;
						try {
							await axios.post('http://localhost:3001/jugadores', { dni, nombre, fech_nac, sexo, clubReg, fech_alta });
							await axios.post('http://localhost:3001/inscriptos', { dni, nombre, torneo, categoria, handicap, clubReg, clubSocio, fech_alta });
							await axios
								.get('http://localhost:3001/jugadores')
								.then((response) => setJugadores(response.data))
								.catch((error) => console.error(error));
							await axios
								.get('http://localhost:3001/inscriptos')
								.then((response) => setJugadoresTorneo(response.data))
								.catch((error) => console.error(error));
						} catch (error) {
							console.error('error al registrar inscripto y/o datos personales', error);
						}
					}
					e.target.reset();
					setFilterJugadoresDni('');
					setFilterJugadoresNombre('');
					setRegistrado(false);
				}}
			>
				<div>
					<span>Torneo: </span>
					<select id='torneo' onChange={(e) => setFilterTorneo(parseInt(e.target.value))} required>
						<option disabled selected>
							Seleccionar torneo
						</option>
						{torneos
							.filter((torneo) => torneo.clubVinculo === club.id && !torneo.finalizado)
							.map((torneo) => (
								<option value={torneo.id}>{torneo.nombre}</option>
							))}
					</select>
					<span>Categoria: </span>
					<select id='categoria' required>
						{filteredTorneo && filteredTorneo.categorias.length > 0 ? (
							<>
								<option selected disabled>
									Seleccionar categoria
								</option>
								{filteredTorneo.categorias.map((categoria) => (
									<option>{categoria.nombre}</option>
								))}
							</>
						) : (
							<option selected disabled>
								Elige un torneo
							</option>
						)}
					</select>
					<span>DNI: </span>
					<input type='text' id='dni' onChange={(e) => setFilterJugadoresDni(e.target.value)} placeholder={registrado && filteredJugadores[0] ? filteredJugadores[0].dni : '(sin puntos)'} />
					<span>Nombre: </span>
					<input type='text' id='nombre' onChange={(e) => setFilterJugadoresNombre(e.target.value)} placeholder={registrado && filteredJugadores[0] ? filteredJugadores[0].nombre : '(apellido y nombre)'} />
				</div>
				{registrado && filteredJugadores[0] && <span className='green'>Ya tenemos los datos de {filteredJugadores[0].dni + ' - ' + filteredJugadores[0].nombre}!!</span>}
				{!registrado && (
					<div>
						<span>Fecha de nacimiento: </span>
						<input type='date' id='fech_nac' />
						<span>Genero: </span>
						<select id='sexo' required>
							<option value='H'>Hombre</option>
							<option value='M'>Mujer</option>
							<option value='X'>Otro</option>
						</select>
					</div>
				)}
				<div>
					<span>Handicap: </span>
					<input type='number' id='handicap' placeholder='HDC' required />
					<span>Club de pertenencia: </span>
					<input type='text' id='club_per' placeholder='club asociado' />
				</div>
				<button type='submit'>Inscribir +</button>
			</form>

			<div>
				{Object.keys(jugadoresPorTorneo).map((torneoNombre) => {
					const torneo = jugadoresPorTorneo[torneoNombre];
					const categorias = [...new Set(torneo.jugadores.map((jugador) => jugador.categoria))];
					const selectedCategoria = filterCategoria[torneo.id] || 'Todas';
					return (
						<div key={torneoNombre} className='jugadores_torneo'>
							<div className='jugadores_torneo_header'>
								<span>{torneoNombre.toUpperCase()}</span>

								<select value={selectedCategoria} onChange={(e) => handleCategoriaChange(torneo.id, e.target.value)}>
									<option value='Todas'>Todas las categorías</option>
									{categorias.map((categoria) => (
										<option key={categoria} value={categoria}>
											{categoria}
										</option>
									))}
								</select>

								<button onClick={() => cerrarTorneo(torneo)}>Cerrar torneo</button>
							</div>
							{torneo.jugadores.length === 0 && <p>No hay jugadores inscriptos...</p>}
							{categorias
								.filter((categoria) => selectedCategoria === 'Todas' || categoria === selectedCategoria)
								.map((categoria) => (
									<div key={categoria} className='table_container'>
										<table>
											<caption>
												{torneoNombre} - {categoria.toUpperCase()}
												<label>
													{torneo.jugadores.filter((jugador) => jugador.categoria === categoria).length} inscriptos, {torneo.jugadores.filter((jugador) => jugador.categoria === categoria && jugador.scores).length} scores
												</label>
											</caption>
											<thead>
												<tr>
													<th>DNI</th>
													<th>Nombre</th>
													<th>HCP</th>
													<th>Club Asociado</th>
													<th>Fecha Inscripcion</th>
													<th>Scores</th>
													<th />
													<th />
												</tr>
											</thead>
											<tbody>
												{torneo.jugadores
													.filter((jugador) => jugador.categoria === categoria)
													.map((jugador) => (
														<tr key={jugador.dni}>
															<td>{jugador.dni}</td>
															<td>{jugador.nombre}</td>
															<td>{jugador.handicap}</td>
															<td>{jugador.clubSocio}</td>
															<td>{jugador.fech_alta}</td>
															<td>
																{jugador.scores ? (
																	<span>✅</span>
																) : (
																	<span
																		onClick={() => {
																			setJugadorDatos(jugador);
																			setTorneoDatos(torneo);
																			setIsOpen(true);
																		}}
																		className='pointer'
																	>
																		❌
																	</span>
																)}
															</td>
															<td
																onClick={() => {
																	setJugadorDatos(jugador);
																	setTorneoDatos(torneo);
																	setIsOpenEdit(true);
																}}
																className='pointer'
															>
																<MdEdit size={20} />
															</td>
															<td>
																<FaTrash
																	className='pointer'
																	title='Eliminar'
																	onClick={async () => {
																		if (!window.confirm(`¿Seguro que deseas eliminar a ${jugador.nombre}?`)) return;
																		try {
																			await axios.delete(`http://localhost:3001/inscriptos/${jugador.id}`);
																			await axios
																				.get('http://localhost:3001/inscriptos')
																				.then((response) => setJugadoresTorneo(response.data))
																				.catch((error) => console.error(error));
																		} catch (error) {
																			alert('Error al eliminar jugador');
																			console.error(error);
																		}
																	}}
																/>
															</td>
														</tr>
													))}
											</tbody>
										</table>
									</div>
								))}
						</div>
					);
				})}
				{isOpen && <Modal torneoDatos={torneoDatos} jugadorDatos={jugadorDatos} setJugadoresTorneo={setJugadoresTorneo} setIsOpen={setIsOpen} />}
				{isOpenEdit && <ModalEdit jugadorDatos={jugadorDatos} setJugadoresTorneo={setJugadoresTorneo} setIsOpen={setIsOpenEdit} />}
			</div>
		</div>
	);
}

export default JugadoresTorneo;
