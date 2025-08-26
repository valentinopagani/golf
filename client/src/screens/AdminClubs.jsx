import { useCallback, useEffect, useState } from 'react';
import { FormGroup, IconButton, Paper, Typography } from '@mui/material';
import { FaSearch } from 'react-icons/fa';
import NavBarAdmin from '../components/NavBarAdmin';
import Canchas from '../components/Canchas';
import TorneosAdmin from '../components/TorneosAdmin';
import JugadoresTorneo from '../components/JugadoresTorneo';
import EstadisticasTorneo from '../components/EstadisticasTorneo';
import { FaPencil } from 'react-icons/fa6';
import CategoryStatsChart from '../components/CategoryStatsChart';
import axios from 'axios';

function AdminClubs({ user }) {
	const [clubes, setClubes] = useState([]);
	const [torneos, setTorneos] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [selectedCategorias, setSelectedCategorias] = useState([]);
	const [filterName, setFilterName] = useState('');
	const [filteredTorneos, setFilteredTorneos] = useState([]);
	const [canchas, setCanchas] = useState([]);
	const [fechIni, setFechIni] = useState('');
	const [fechFin, setFechFin] = useState('');
	const [torneoPass, setTorneoPass] = useState([]);
	const [modal, setModal] = useState(false);
	const [editModal, setEditModal] = useState(false);
	const [datosEdit, setDatosEdit] = useState([]);
	const [clubEdit, setClubEdit] = useState([]);
	const [tabs, setTabs] = useState(0);
	const [jugadoresTorneos, setJugadoresTorneos] = useState([]);
	const [categoryStats, setCategoryStats] = useState({ labels: [], values: [] });
	const [fechaMin, setFechaMin] = useState('Todas');
	const [fechaMax, setFechaMax] = useState('Todas');

	const userId = user.displayName.toLowerCase().replaceAll(' ', '');

	useEffect(() => {
		axios
			.get('http://localhost:3001/clubes')
			.then((response) => setClubes(response.data))
			.catch((error) => console.error(error));

		axios
			.get('http://localhost:3001/canchas')
			.then((response) => setCanchas(response.data))
			.catch((error) => console.error(error));

		axios
			.get('http://localhost:3001/torneos')
			.then((response) => setTorneos(response.data))
			.catch((error) => console.error(error));

		axios
			.get('http://localhost:3001/categorias')
			.then((response) => setCategorias(response.data))
			.catch((error) => console.error(error));

		axios
			.get('http://localhost:3001/inscriptos')
			.then((response) => setJugadoresTorneos(response.data))
			.catch((error) => console.error(error));
	}, []);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [tabs]);

	const processCategoryStats = useCallback(
		(jugadoresTorneos, fechaMin, fechaMax) => {
			const club = clubes.find((club) => club.vinculo === userId);

			// Filtra torneos del club y por fechas
			const torneosFiltrados = torneos.filter((torneo) => {
				if (torneo.clubVinculo !== club.id) return false;
				const fechaIni = torneo.fech_ini.split('/').reverse().join('-');
				const fechaFin = torneo.fech_fin.split('/').reverse().join('-');
				const min = fechaMin === 'Todas' ? null : fechaMin;
				const max = fechaMax === 'Todas' ? null : fechaMax;
				if (min && fechaIni < min) return false;
				if (max && fechaFin > max) return false;
				return true;
			});

			const labels = [];
			const values = [];

			torneosFiltrados.forEach((torneo) => {
				labels.push(`${torneo.nombre} - ${torneo.fech_ini}`);
				// Filtra inscriptos de este torneo y club
				let inscriptos = jugadoresTorneos.filter((j) => j.torneo === torneo.id && j.clubReg === club.nombre);
				// Cuenta DNIs únicos
				const dnisUnicos = new Set(inscriptos.map((j) => j.dni));
				values.push(dnisUnicos.size);
			});

			setCategoryStats({ labels, values });
		},
		[clubes, torneos, userId]
	);

	useEffect(() => {
		processCategoryStats(jugadoresTorneos, fechaMin, fechaMax);
	}, [jugadoresTorneos, fechaMin, fechaMax, processCategoryStats]);

	// ABRIR MODAL DE EDICION
	const openEditModal = (torneo, club) => {
		setDatosEdit(torneo);
		setClubEdit(club);
		setSelectedCategorias(torneo.categorias.map((cat) => cat.nombre));
		setEditModal(true);
	};

	const date = new Date();
	let day = date.getDate();
	if (day < 10) {
		day = '0' + day;
	}
	let month = date.getMonth() + 1;
	if (month < 10) {
		month = '0' + month;
	}
	const year = date.getFullYear();
	const actualDate = year + '/' + month + '/' + day;

	// SELECCIONAR CATEGORIAS
	const handleCheckboxChange = (event) => {
		const { value, checked } = event.target;
		if (checked) {
			setSelectedCategorias([...selectedCategorias, value]);
		} else {
			setSelectedCategorias(selectedCategorias.filter((categoria) => categoria !== value));
		}
	};

	// BUSCAR TORNEO
	useEffect(() => {
		setFilteredTorneos(torneos.filter((torneo) => torneo.nombre.toLowerCase().includes(filterName.toLowerCase())));
	}, [filterName, torneos]);

	const handleTorneoClick = async (torneo) => {
		await setTorneoPass(torneo);
		setModal(true);
	};

	const fechaMinSelec = (value) => {
		if (value === '') {
			setFechaMin('Todas');
		} else {
			setFechaMin(value);
		}
	};

	const fechaMaxSelec = (value) => {
		if (value === '') {
			setFechaMax('Todas');
		} else {
			setFechaMax(value);
		}
	};

	return (
		<div>
			<div className='admin_club'>
				<NavBarAdmin setTabs={setTabs} />
				{clubes
					.filter((club) => club.vinculo === userId)
					.map((club) => (
						<div key={club.id}>
							{tabs === 0 && (
								<div>
									<h3 style={{ textAlign: 'center', fontStyle: 'italic' }}>{club.nombre}</h3>
									<h2 id='nuevo_torneo'>ADMINISTRÁ TUS TORNEOS</h2>

									<div className='nueva_categoria'>
										<h3>Añadir una nueva Categoria:</h3>
										<form
											autoComplete='off'
											onSubmit={async (e) => {
												e.preventDefault();
												const nombre = e.target.cat_nombre.value;
												const vinculo = club.id;
												try {
													await axios.post('http://localhost:3001/categorias', { nombre, vinculo });
													await axios
														.get('http://localhost:3001/categorias')
														.then((response) => setCategorias(response.data))
														.catch((error) => console.error(error));
													e.target.reset();
												} catch (error) {
													console.error('estas errado pa', error);
												}
											}}
											id='form_cat'
										>
											<input type='text' id='cat_nombre' placeholder='nombre de categoria:' required />
											<button type='submit'>Crear</button>
										</form>
										<div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, marginTop: 10 }}>
											{categorias
												.filter((cat) => cat.vinculo === club.id)
												.map((cat) => (
													<Paper key={cat.id} elevation={1} sx={{ padding: 1 }}>
														<span>{cat.nombre} </span>
														<span
															style={{ cursor: 'pointer', color: 'red' }}
															title='Eliminar categoria'
															onClick={async () => {
																if (!window.confirm('¿Seguro que deseas eliminar esta categoria?')) return;
																try {
																	await axios.delete(`http://localhost:3001/categorias/${cat.id}`);
																	await axios
																		.get('http://localhost:3001/categorias')
																		.then((response) => setCategorias(response.data))
																		.catch((error) => console.error(error));
																} catch (error) {
																	alert('Error al eliminar categoria');
																	console.error(error);
																}
															}}
														>
															x
														</span>
													</Paper>
												))}
										</div>
									</div>

									<div className='torneos_view'>
										<div>
											<Paper sx={{ p: 2 }} elevation={4} className='paper_newtorneo'>
												<h3>+ Agregar nuevo Torneo</h3>
												<form
													autoComplete='off'
													onSubmit={async (e) => {
														e.preventDefault();
														const fechaInicio = e.target.fech_ini.value.split('-');
														const fechaFin = e.target.fech_fin.value.split('-');
														const nombre = e.target.nombre_tor.value;
														const fech_ini = fechaInicio[2] + '/' + fechaInicio[1] + '/' + fechaInicio[0];
														const fech_fin = fechaFin[2] + '/' + fechaFin[1] + '/' + fechaFin[0];
														const cancha = e.target.cancha_juego.value;
														const rondas = parseInt(e.target.rondas.value);
														const categorias = selectedCategorias;
														const descripcion = e.target.descripcion_tor.value;
														const clubVinculo = club.id;
														const nombreClubVinculo = club.nombre;
														const fech_alta = new Date().toLocaleDateString();
														const finalizado = 0;
														try {
															const response = await axios.post('http://localhost:3001/torneos', {
																nombre,
																fech_ini,
																fech_fin,
																cancha,
																rondas,
																descripcion,
																clubVinculo,
																nombreClubVinculo,
																fech_alta,
																finalizado
															});
															const torneoId = response.data.id;
															// Cargar cada categoría seleccionada a la tabla categorias_torneo
															await Promise.all(
																categorias.map((nombre) =>
																	axios.post('http://localhost:3001/categorias_torneo', {
																		nombre,
																		torneo_id: torneoId
																	})
																)
															);

															document.getElementById('form_torneo').reset();
															setFechIni('');
															setFechFin('');
															setSelectedCategorias([]);
															await axios
																.get('http://localhost:3001/torneos')
																.then((response) => setTorneos(response.data))
																.catch((error) => console.error(error));
														} catch (error) {
															alert('Algo ha salido mal');
															console.error('Error al crear torneo o categorías', error);
														}
													}}
													className='form_torneo'
													id='form_torneo'
												>
													<input type='text' id='nombre_tor' placeholder='Nombre del torneo:' required />
													<div>
														<label>Fecha de inicio:</label>
														<input type='date' id='fech_ini' max={fechFin} onChange={(e) => setFechIni(e.target.value)} required />
													</div>
													<div>
														<label>Fecha de cierre:</label>
														<input type='date' id='fech_fin' min={fechIni} onChange={(e) => setFechFin(e.target.value)} required />
													</div>
													<div>
														<label>Cancha:</label>
														<select id='cancha_juego'>
															<option selected disabled>
																Selecciona una chancha
															</option>
															{canchas
																.filter((cancha) => cancha.clubVinculo === club.id)
																.map((cancha) => (
																	<option key={cancha.id} value={cancha.id}>
																		{cancha.nombre} ({cancha.cant_hoyos} hoyos)
																	</option>
																))}
														</select>
													</div>
													<div>
														<label>Número de rondas:</label>
														<select id='rondas' required>
															<option value='1'>1</option>
															<option value='2'>2</option>
															<option value='3'>3</option>
															<option value='4'>4</option>
														</select>
													</div>
													<div>
														<label>Seleccionar categoría/s:</label>
														<FormGroup onChange={handleCheckboxChange}>
															{categorias
																.filter((categoria) => categoria.vinculo === club.id)
																.map((categoria) => (
																	<div key={categoria.id}>
																		<input type='checkbox' value={categoria.nombre} className='pointer' />
																		<label key={categoria.id}> {categoria.nombre}</label>
																	</div>
																))}
														</FormGroup>
													</div>
													<textarea id='descripcion_tor' placeholder='Añade una descripcion:' />
													<button type='submit' title='Nuevo torneo en el club'>
														Agregar Torneo
													</button>
												</form>
											</Paper>
										</div>

										<div className='torneos_list'>
											<h3>Torneos proximos:</h3>
											<div className='torneos'>
												{torneos
													.filter((torneo) => torneo.clubVinculo === club.id && torneo.fech_ini.split('/').reverse().join('/') >= actualDate)
													.sort((a, b) => new Date(a.fech_ini.split('/').reverse().join('-')) - new Date(b.fech_ini.split('/').reverse().join('-')))
													.map((torneo) => (
														<div key={torneo.id} className='torneo_adm'>
															<TorneosAdmin torneo={torneo} club={club} setTorneos={setTorneos} />
															{!torneo.finalizado && (
																<IconButton
																	className='edit_bt'
																	onClick={() => {
																		openEditModal(torneo, club);
																	}}
																>
																	<FaPencil size={18} color='#0e7cde' />
																</IconButton>
															)}
														</div>
													))}
											</div>
										</div>
									</div>

									<div className='torneos_all'>
										{torneos.filter((torneo) => torneo.clubVinculo === club.id).length === 0 ? (
											<h3>Agrega un nuevo torneo para visualizarlo aquí...</h3>
										) : (
											<div id='torneos'>
												<h3>Todos los Torneos:</h3>
												<label htmlFor='search'>Buscar: </label>
												<input type='text' placeholder='Filtrar por nombre de torneo:' value={filterName} onChange={(e) => setFilterName(e.target.value)} autoComplete='off' />
												<FaSearch />
												<div className='torneos'>
													{filteredTorneos.filter((torneo) => torneo.clubVinculo === club.id).length === 0 ? (
														<Typography variant='h3' sx={{ mt: 12, mb: 12 }}>
															No se encontró ningun torneo con ese nombre...
														</Typography>
													) : (
														filteredTorneos
															.filter((torneo) => torneo.clubVinculo === club.id)
															.sort((a, b) => new Date(b.fech_ini.split('/').reverse().join('-')) - new Date(a.fech_ini.split('/').reverse().join('-')))
															.map((torneo) => (
																<div key={torneo.id} onDoubleClick={() => handleTorneoClick(torneo)} className='torneo_adm'>
																	<TorneosAdmin torneo={torneo} club={club} setTorneos={setTorneos} />
																	{!torneo.finalizado && (
																		<IconButton
																			className='edit_bt'
																			onClick={() => {
																				openEditModal(torneo, club);
																			}}
																		>
																			<FaPencil size={18} color='#0e7cde' />
																		</IconButton>
																	)}
																</div>
															))
													)}
												</div>
											</div>
										)}
									</div>
								</div>
							)}

							{tabs === 1 && (
								<div>
									<h3 style={{ textAlign: 'center', fontStyle: 'italic' }}>{club.nombre}</h3>
									<h2>REGISTRÁ LOS JUGADORES</h2>

									<div id='jugadoresTor'>
										<JugadoresTorneo club={club} torneos={torneos} jugadoresTorneos={jugadoresTorneos} setTorneos={setTorneos} />
									</div>

									<div>
										<h2>Análisis de inscriptos totales o por categoría</h2>
										<div style={{ width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
											<div>
												<label>Desde: </label>
												<input type='date' onChange={(e) => fechaMinSelec(e.target.value)} style={{ marginRight: 8 }} />

												<label style={{ marginLeft: 8 }}>Hasta: </label>
												<input type='date' onChange={(e) => fechaMaxSelec(e.target.value)} />
											</div>
										</div>
										<div className='graf_inscriptos'>
											<CategoryStatsChart data={categoryStats} />
										</div>
									</div>
								</div>
							)}

							{tabs === 2 && (
								<div id='cancha'>
									<Canchas canchas={canchas} setCanchas={setCanchas} club={club} />
								</div>
							)}
						</div>
					))}
			</div>

			{modal && <EstadisticasTorneo torneo={torneoPass} jugadores={jugadoresTorneos} setModal={setModal} user={user} />}

			{editModal && (
				<div className='modal'>
					<Paper elevation={2} className='paper_editorneo'>
						<h3>
							Editar Torneo "<i>{datosEdit.nombre}</i>"
						</h3>
						<form
							autoComplete='off'
							onSubmit={async (e) => {
								e.preventDefault();
								const fechaInicio = e.target.fech_ini.value.split('-');
								const fechaFin = e.target.fech_fin.value.split('-');
								const nombre = e.target.nombre_tor.value;
								const fech_ini = fechaInicio[2] + '/' + fechaInicio[1] + '/' + fechaInicio[0];
								const fech_fin = fechaFin[2] + '/' + fechaFin[1] + '/' + fechaFin[0];
								const cancha = e.target.cancha_juego.value;
								const rondas = parseInt(e.target.rondas.value);
								const categorias = selectedCategorias;
								const descripcion = e.target.descripcion_tor.value;
								const editado = new Date().toLocaleDateString();
								try {
									await axios.put(`http://localhost:3001/torneos/${datosEdit.id}`, {
										nombre,
										fech_ini,
										fech_fin,
										cancha,
										rondas,
										descripcion,
										editado
									});
									// Eliminar categorías_torneo asociadas
									await axios.delete(`http://localhost:3001/categorias_torneo/torneo/${datosEdit.id}`);
									// Crear nuevas categorías_torneo
									await Promise.all(
										categorias.map((nombre) =>
											axios.post('http://localhost:3001/categorias_torneo', {
												nombre,
												torneo_id: datosEdit.id
											})
										)
									);
									await axios
										.get('http://localhost:3001/torneos')
										.then((response) => setTorneos(response.data))
										.catch((error) => console.error(error));

									document.getElementById('form_edit_torneo').reset();
									setFechIni('');
									setFechFin('');
									setSelectedCategorias([]);
									setEditModal(false);
								} catch (error) {
									alert('Algo ha salido mal');
									console.error('Error al editar torneo', error);
								}
							}}
							id='form_edit_torneo'
						>
							<div>
								<label>Nombre: </label>
								<input type='text' id='nombre_tor' placeholder='Nombre del torneo:' defaultValue={datosEdit.nombre} required />
							</div>
							<div>
								<label>Fecha de inicio:</label>
								<input type='date' id='fech_ini' defaultValue={datosEdit.fech_ini.split('/').reverse().join('-')} max={fechFin} onChange={(e) => setFechIni(e.target.value)} required />
							</div>
							<div>
								<label>Fecha de cierre:</label>
								<input type='date' id='fech_fin' defaultValue={datosEdit.fech_fin.split('/').reverse().join('-')} min={fechIni} onChange={(e) => setFechFin(e.target.value)} required />
							</div>
							<div>
								<label>Cancha:</label>
								<select id='cancha_juego' defaultValue={datosEdit.cancha}>
									<option selected disabled>
										Selecciona una chancha
									</option>
									{canchas
										.filter((cancha) => cancha.clubVinculo === clubEdit.id)
										.map((cancha) => (
											<option key={cancha.id} value={cancha.id}>
												{cancha.nombre} ({cancha.cant_hoyos} hoyos)
											</option>
										))}
								</select>
							</div>
							<div>
								<label>Número de rondas:</label>
								<select id='rondas' defaultValue={datosEdit.rondas} required>
									<option value='1'>1</option>
									<option value='2'>2</option>
									<option value='3'>3</option>
									<option value='4'>4</option>
								</select>
							</div>
							<div>
								<label>Seleccionar categoría/s:</label>
								<FormGroup onChange={handleCheckboxChange}>
									{categorias
										.filter((categoria) => categoria.vinculo === clubEdit.id)
										.map((categoria) => (
											<div key={categoria.id}>
												<input
													type='checkbox'
													value={categoria.nombre}
													className='pointer'
													// defaultChecked compara con el array de nombres
													defaultChecked={selectedCategorias.includes(categoria.nombre)}
												/>
												<span> {categoria.nombre}</span>
											</div>
										))}
								</FormGroup>
							</div>
							<textarea id='descripcion_tor' placeholder='Añade una descripcion:' defaultValue={datosEdit.descripcion} />
							<div className='edit_bts'>
								<button onClick={() => setEditModal(false)} title='Cerrar Editor' className='cerrar_edit'>
									Cancelar
								</button>
								<button type='submit' title='Confirmar Cambios' className='submit_edit'>
									Guardar Cambios
								</button>
							</div>
						</form>
					</Paper>
				</div>
			)}
		</div>
	);
}

export default AdminClubs;
