import { useEffect, useState, lazy, Suspense, memo, useMemo } from 'react';
import { Button, CircularProgress, Paper } from '@mui/material';
import { subMonths, parse, compareAsc } from 'date-fns';
import axios from 'axios';
import EstadisticasTorneo from '../components/EstadisticasTorneo';

const TorneosResultados = lazy(() => import('../components/TorneosResultados'));

const Resultados = memo(function Resultados() {
	const [torneos, setTorneos] = useState([]);
	const [inscriptos, setInscriptos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filtro, setFiltro] = useState('');
	const [bandera, setBandera] = useState(false);
	const [torneoPass, setTorneoPass] = useState([]);
	const [modal, setModal] = useState(false);

	useEffect(() => {
		axios
			.get('http://localhost:3001/torneos')
			.then((response) => setTorneos(response.data))
			.catch((error) => console.error(error));

		axios
			.get('http://localhost:3001/inscriptos')
			.then((response) => setInscriptos(response.data))
			.catch((error) => console.error(error));

		const timer = setTimeout(() => {
			setLoading(false);
		}, 2000);

		return () => clearTimeout(timer);
	}, []);

	const actualDate = new Date();
	const twoMonthsAgo = subMonths(actualDate, 2);

	const filteredTorneos = useMemo(() => {
		return torneos.filter((torneo) => torneo.finalizado === 1 && parse(torneo.fech_ini, 'dd/MM/yyyy', new Date()) >= twoMonthsAgo).sort((a, b) => compareAsc(parse(a.fech_ini, 'dd/MM/yyyy', new Date()), parse(b.fech_ini, 'dd/MM/yyyy', new Date())));
	}, [torneos, twoMonthsAgo]);

	const handleTorneoClick = async (torneo) => {
		await setTorneoPass(torneo);
		setModal(true);
	};

	return (
		<div className='body_resultados'>
			<div id='clubes_home'>
				<div className='title_banner'>
					<h2>Mirá los últimos torneos y sus resultados.</h2>
				</div>
				<Suspense>
					<div className='clubes_banner_home'>
						<div className='torneos_home'>
							<Suspense>
								{loading ? (
									<CircularProgress />
								) : (
									filteredTorneos.map((torneo) => (
										<div key={torneo.id}>
											<div>
												<TorneosResultados sx={{ m: 0 }} torneo={torneo} jugadoresInit={inscriptos} />
											</div>
										</div>
									))
								)}
							</Suspense>
						</div>
					</div>
				</Suspense>

				<div>
					<h2>📅 Buscar Torneos:</h2>
					<form
						style={{ display: 'flex', alignItems: 'center', gap: 10 }}
						autoComplete='off'
						onSubmit={(e) => {
							e.preventDefault();
							setFiltro(e.target.inpfiltro.value.toLowerCase());
							setBandera(true);
							e.target.reset();
						}}
					>
						<input type='text' placeholder='🔎 Buscar por Nombre de Torneo:' id='inpfiltro' style={{ width: '350px', padding: '7px 5px' }} required />
						<Button type='submit' variant='outlined' size='medium'>
							Buscar 🔍
						</Button>
						{bandera && (
							<span onClick={() => setBandera(false)} style={{ cursor: 'pointer' }}>
								Limpiar filtro
							</span>
						)}
					</form>
					<div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
						{bandera &&
							torneos
								.filter((torneo) => torneo.nombre.toLowerCase().includes(filtro))
								.map((torneo) => (
									<Paper key={torneo.id} elevation={2} sx={{ padding: 2, cursor: 'pointer' }} onClick={() => handleTorneoClick(torneo)}>
										{torneo.nombre + ' ' + torneo.fech_ini}
									</Paper>
								))}
					</div>
				</div>
			</div>

			{modal && <EstadisticasTorneo torneo={torneoPass} jugadores={inscriptos} setModal={setModal} />}
		</div>
	);
});

export default Resultados;
