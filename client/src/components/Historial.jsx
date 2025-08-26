import { useEffect, useState, useMemo } from 'react';
import ModalEst from './ModalEst';
import axios from 'axios';

function Historial({ jugador }) {
	const [jugadoresTorneos, setJugadoresTorneos] = useState([]);
	const [torneos, setTorneos] = useState([]);
	const [canchas, setCanchas] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [torneoDatos, setTorneoDatos] = useState([]);
	const [jugadorDatos, setJugadorDatos] = useState([]);

	useEffect(() => {
		axios
			.get('http://localhost:3001/canchas')
			.then((response) => setCanchas(response.data))
			.catch((error) => console.error(error));

		axios
			.get('http://localhost:3001/torneos')
			.then((response) => setTorneos(response.data))
			.catch((error) => console.error(error));

		axios
			.get('http://localhost:3001/inscriptos')
			.then((response) => setJugadoresTorneos(response.data))
			.catch((error) => console.error(error));
	}, []);

	const jugados = useMemo(() => {
		return jugadoresTorneos.filter((torneo) => torneo.dni === jugador.dni);
	}, [jugadoresTorneos, jugador.dni]);

	const renderJugados = () => {
		return jugados.map((jugado) => {
			const torneo = torneos.find((torneo) => torneo.id === jugado.torneo);
			if (torneo) {
				const cancha = canchas.find((cancha) => cancha.id === torneo.cancha);
				if (cancha) {
					const total = jugado.categoria.toLowerCase().includes('gross') || jugado.categoria.toLowerCase().includes('scratch') ? jugado.totalScore : jugado.totalScore - jugado.handicap * torneo.rondas;
					return (
						<tr key={jugado.id}>
							<td>{torneo.fech_ini}</td>
							<td
								className='pointer'
								onClick={() => {
									setTorneoDatos(torneo);
									setJugadorDatos(jugado);
									setIsOpen(true);
								}}
							>
								<b style={{ color: 'brown', fontWeight: 900 }}>+</b> {torneo.nombre}
							</td>
							<td>{jugado.categoria}</td>
							<td>{torneo.nombreClubVinculo}</td>
							<td>{total}</td>
							<td>{total - cancha.parCancha * torneo.rondas}</td>
						</tr>
					);
				}
			}
			return null;
		});
	};

	return (
		<div className='table_container'>
			<table>
				<caption>{jugados.length} TORNEOS</caption>
				<thead>
					<tr>
						<th>Fecha</th>
						<th>Torneo</th>
						<th>Categoría</th>
						<th>Club</th>
						<th>Total</th>
						<th>Contra el Par</th>
					</tr>
				</thead>
				<tbody>{renderJugados()}</tbody>
			</table>
			{isOpen && <ModalEst torneo={torneoDatos} jugadorDatos={jugadorDatos} canchas={canchas} setIsOpen={setIsOpen} condicion={true} />}
		</div>
	);
}

export default Historial;
