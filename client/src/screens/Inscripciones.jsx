import { useEffect, useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { compareAsc, parse } from 'date-fns';
import { Box, Button, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { IoCloseCircleSharp } from 'react-icons/io5';
import axios from 'axios';

function Inscripciones() {
	const [preference, setPreference] = useState(null);
	const [torneos, setTorneos] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [torneoData, setTorneoData] = useState([]);
	const [formulario, setFormulario] = useState({});

	useEffect(() => {
		initMercadoPago('APP_USR-600ac2b9-515b-4fda-b368-a8c0ba293b63', {
			locale: 'es-AR'
		});

		axios
			.get('http://localhost:3001/torneos')
			.then((response) => setTorneos(response.data))
			.catch((error) => console.error(error));
	}, []);

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

	const filteredTorneos = torneos.filter((torneo) => torneo.fech_ini.split('/').reverse().join('/') >= actualDate && !torneo.finalizado && torneo.valor).sort((a, b) => compareAsc(parse(a.fech_ini, 'dd/MM/yyyy', new Date()), parse(b.fech_ini, 'dd/MM/yyyy', new Date())));

	const createPreference = async (torneo) => {
		try {
			const response = await axios.post('http://localhost:3001/create_preference', {
				title: `Inscripcion a ${torneo.nombre}`,
				description: `El torneo se llevará a cabo en ${torneo.nombreClubVinculo}, inicia el ${torneo.fech_ini !== torneo.fech_fin ? torneo.fech_ini + ' al ' + torneo.fech_fin : torneo.fech_ini}`,
				price: torneo.valor
			});

			const { id } = response.data;
			return id;
		} catch (error) {
			console.error('Error', error);
		}
	};

	const handleBuy = async (torneo) => {
		const id = await createPreference(torneo);
		if (id) {
			setPreference(id);
		}
	};

	const openModal = (torneo) => {
		setTorneoData(torneo);
		setIsOpen(true);
	};

	const closeModal = () => {
		setIsOpen(false);
		setTorneoData([]);
		setPreference(null);
	};

	return (
		<div className='body_home'>
			<div className='title_banner'>
				<h2>Apuntate en tu próximo torneo</h2>
			</div>

			<div>
				{filteredTorneos.map((torneo) => (
					<Paper key={torneo.id} className='torneos_ins'>
						<Box sx={{ maxWidth: '600px' }}>
							<Typography variant='span'>{torneo.nombreClubVinculo}</Typography>
							<Typography variant='h6' sx={{ fontWeight: 'bold' }}>
								{torneo.nombre}
							</Typography>
							<Typography variant='span' sx={{ backgroundColor: '#ffffa9', fontWeight: 'bold' }}>
								📅 {torneo.fech_ini !== torneo.fech_fin ? torneo.fech_ini + ' al ' + torneo.fech_fin : torneo.fech_ini}
							</Typography>
							<Stack direction='row' marginTop={1} flexWrap='wrap' maxWidth='600px' justifyContent='center'>
								{torneo.categorias.map((categoria, idx) => (
									<Chip key={idx} label={categoria.nombre} size='small' sx={{ margin: 0.4 }} />
								))}
							</Stack>
						</Box>
						<Box>
							<Button color='success' variant='contained' onClick={() => openModal(torneo)}>
								inscripción
							</Button>
						</Box>
					</Paper>
				))}
			</div>

			{isOpen && (
				<div className='modal'>
					<div className='modal_cont_ins'>
						<h3>Formulario de Inscripción</h3>
						<div className='modal_cont_ins_contain'>
							<div>
								<span>Datos del jugador:</span>
								<hr />
								<form
									style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '10px 0' }}
									onSubmit={(e) => {
										e.preventDefault();
										const formData = new FormData(e.target);
										const data = Object.fromEntries(formData);
										console.log(data);
										setFormulario(data);
									}}
								>
									<label>
										DNI: <input type='number' name='dni' minLength={7} placeholder='sin puntos ni guiones' required />
									</label>
									<label>
										Nombre: <input type='text' name='nombre' placeholder='Ej: Juan' required />
									</label>
									<label>
										Apellido: <input type='text' name='apellido' placeholder='Ej: Perez' required />
									</label>
									<label>
										Club Pertenencia: <input type='text' name='clubPer' placeholder='club asociado' required />
									</label>
									<label>
										Teléfono: <input type='number' name='tel' placeholder='Ej: 3534174147' required />
									</label>
									<label>
										Email: <input type='email' name='email' placeholder='Ej: juanperez23@ejemplo.com' required />
									</label>
									<label>
										HDC: <input type='number' name='hcp' required />
									</label>
									<label>
										Categoría:
										<select name='categoria' required>
											{torneoData.categorias.map((cat) => (
												<option value={cat.nombre} key={cat.id}>
													{cat.nombre}
												</option>
											))}
										</select>
									</label>
									<Button variant='contained' size='small' type='submit'>
										Cargar
									</Button>
								</form>
							</div>
							<div>
								<span>Datos del Torneo:</span>
								<hr />
								<span>Torneo: {torneoData.nombre}</span>
								<span>Fecha: {torneoData.fech_ini !== torneoData.fech_fin ? torneoData.fech_ini + ' al ' + torneoData.fech_fin : torneoData.fech_ini}</span>
								<span>Lugar: {torneoData.nombreClubVinculo}</span>
								<span style={{ color: '#008000', fontWeight: 900 }}>Valor ${torneoData.valor}</span>
								<Button variant='contained' disabled={!formulario ? true : false} color='success' size='small' onClick={() => handleBuy(torneoData)}>
									Generar Cupón de Pago
								</Button>
								{preference && (
									<Wallet
										initialization={{ preferenceId: preference, redirectMode: 'blank' }}
										onError={(error) => {
											console.error(error);
											alert('Ocurrió un error');
										}}
									/>
								)}
							</div>
						</div>
					</div>

					<IconButton onClick={() => closeModal()} size='medium' sx={{ position: 'absolute', top: 5, right: 10, color: 'white' }}>
						<IoCloseCircleSharp fontSize='40' />
					</IconButton>
				</div>
			)}
		</div>
	);
}

export default Inscripciones;
