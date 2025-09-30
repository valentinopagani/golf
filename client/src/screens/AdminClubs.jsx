import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import NavBarAdmin from '../components/NavBarAdmin';
import MainAdminClubs from '../components/MainAdminClubs';
import Canchas from '../components/Canchas';
import JugadoresTorneo from '../components/JugadoresTorneo';
import EstadisticasTorneo from '../components/EstadisticasTorneo';
import JugadoresAdm from '../components/JugadoresAdm';
import axios from 'axios';

function AdminClubs({ user }) {
	const [clubes, setClubes] = useState([]);

	const userId = user.displayName.toLowerCase().replaceAll(' ', '');

	const navigate = useNavigate();
	useEffect(() => {
		if (!window.location.pathname.includes('/administrador')) {
			navigate('/administrador');
		}
	}, []);

	useEffect(() => {
		axios
			.get(`http://localhost:3001/clubes?vinculo=${userId}`)
			.then((response) => setClubes(response.data))
			.catch((error) => console.error(error));
	}, []);

	return (
		<div>
			<div className='admin_club'>
				<NavBarAdmin />
				{clubes.map((club) => (
					<div key={club.id}>
						<Routes>
							<Route path='/administrador' element={<MainAdminClubs club={club} user={user} />} />
							<Route path='/administrador/inscripciones' element={<JugadoresTorneo club={club} />} />
						</Routes>

						{/* {tabs === 2 && (
								<div id='cancha'>
									<Canchas canchas={canchas} setCanchas={setCanchas} club={club} />
								</div>
							)}

							{tabs === 3 && (
								<div>
									<h3 style={{ textAlign: 'center', fontStyle: 'italic' }}>{club.nombre}</h3>
									<h2>MODIFICÁ LOS DATOS DE TUS JUGADORES</h2>
									<JugadoresAdm />
								</div>
							)} */}
					</div>
				))}
			</div>

			{/* {modal && <EstadisticasTorneo torneo={torneoPass} jugadores={jugadoresTorneos} setModal={setModal} user={user} />} */}

			{/* {editModal && (
				<div className='modal'>
					<Paper elevation={2} className='paper_editorneo'>
						<h3>
							Editar: <i>{datosEdit.nombre}</i>
						</h3>
						<form
							autoComplete='off'
							onSubmit={async (e) => {
								e.preventDefault();
								if (selectedCategorias.length === 0) {
									return alert('Selecciona al menos una categoría');
								}
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
								const valor = inscEdit ? e.target.valor.value : null;
								try {
									await axios.put(`http://localhost:3001/torneos/${datosEdit.id}`, {
										nombre,
										fech_ini,
										fech_fin,
										cancha,
										rondas,
										descripcion,
										valor,
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
									setInscEdit(false);
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
							<div>
								<label>Permitir inscripciones web:</label>
								<select onChange={() => setInscEdit(!inscEdit)} defaultValue={inscEdit}>
									<option value={false}>No</option>
									<option value={true}>Sí</option>
								</select>
							</div>
							{inscEdit && (
								<div>
									<label>Valor de inscripción:</label>
									<input type='number' id='valor' min={1000} placeholder='$' required defaultValue={datosEdit.valor} />
								</div>
							)}
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
			)} */}
		</div>
	);
}

export default AdminClubs;
