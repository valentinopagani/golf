import { useState, useEffect } from 'react';
import { Button, Paper, Stack } from '@mui/material';
import axios from 'axios';

function JugadoresAdm() {
	const [jugadores, setJugadores] = useState([]);
	const [filtro, setFiltro] = useState('');
	const [bandera, setBandera] = useState(false);
	const [jugadorData, setJugadorData] = useState([]);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		axios
			.get('http://localhost:3001/jugadores')
			.then((response) => setJugadores(response.data))
			.catch((error) => console.error(error));
	}, []);

	const fechaNacimiento = isOpen ? jugadorData.fech_nac.split('/').reverse().join('-') : 0;

	return (
		<div>
			<form
				style={{ margin: '40px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
				autoComplete='off'
				onSubmit={(e) => {
					e.preventDefault();
					setFiltro(e.target.inpfiltro.value.toLowerCase());
					setBandera(true);
					e.target.reset();
				}}
			>
				<input type='text' placeholder='🔎 Buscar por Apellido y Nombre o DNI:' id='inpfiltro' style={{ width: '350px', padding: '7px 5px' }} required />
				<Button type='submit' variant='outlined' size='medium'>
					Buscar 🏌🏻‍♂️
				</Button>
				{bandera && (
					<span
						style={{ cursor: 'pointer' }}
						onClick={() => {
							setBandera(false);
							setFiltro('');
						}}
					>
						Limpiar filtro
					</span>
				)}
			</form>

			<div style={{ width: '90%', margin: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
				{bandera &&
					(jugadores.filter((jugador) => jugador.dni.toString().includes(filtro) || jugador.nombre.toLowerCase().includes(filtro)).length === 0 ? (
						<span>No se encontró resultados para {filtro}...</span>
					) : (
						jugadores
							.filter((jugador) => jugador.dni.toString().includes(filtro) || jugador.nombre.toLowerCase().includes(filtro))
							.map((jugador) => (
								<Paper
									key={jugador.id}
									elevation={3}
									sx={{ padding: 2, cursor: 'pointer' }}
									onClick={() => {
										setJugadorData(jugador);
										setIsOpen(true);
									}}
								>
									{jugador.dni} - {jugador.nombre}
								</Paper>
							))
					))}
			</div>

			{isOpen && (
				<div className='modal_edit'>
					<div className='modal_edit_cont'>
						<form
							onSubmit={async (e) => {
								e.preventDefault();
								const nombre = e.target.nombre.value;
								const dni = e.target.dni.value;
								const fech_nac = e.target.fech_nac.value.split('-').reverse().join('/');
								const sexo = e.target.sexo.value;

								try {
									await axios.put('http://localhost:3001/jugadores/' + jugadorData.id, {
										nombre,
										dni,
										fech_nac,
										sexo
									});
									setIsOpen(false);
									const response = await axios.get('http://localhost:3001/jugadores');
									setJugadores(response.data);
								} catch (error) {
									alert('Error al actualizar jugador');
								}
							}}
						>
							<div>
								<label>Nombre:</label>
								<input type='text' name='nombre' defaultValue={jugadorData.nombre} />
							</div>
							<div>
								<label>DNI:</label>
								<input type='number' name='dni' minLength={8} defaultValue={jugadorData.dni} style={{ width: '100px' }} />
							</div>
							<div>
								<label>Fecha de Nacimiento:</label>
								<input type='date' name='fech_nac' defaultValue={fechaNacimiento} />
							</div>
							<div>
								<label>Género:</label>
								<select name='sexo' defaultValue={jugadorData.sexo}>
									<option value='M'>M</option>
									<option value='H'>H</option>
								</select>
							</div>
							<br />
							<Stack direction='row'>
								<Button variant='contained' size='small' onClick={() => setIsOpen(false)}>
									cancelar
								</Button>
								<Button variant='contained' size='small' color='success' type='submit'>
									actualizar
								</Button>
							</Stack>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

export default JugadoresAdm;
