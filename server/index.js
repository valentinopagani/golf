const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { default: MercadoPagoConfig, Preference } = require('mercadopago');
const axios = require('axios');

app.use(cors());
app.use(express.json());

const torneos = require('./routes/torneos');
const categoriasTorneo = require('./routes/categoriasTorneo');
const clubes = require('./routes/clubes');
const categorias = require('./routes/categorias');
const canchas = require('./routes/canchas');
const jugadores = require('./routes/jugadores');
const golpes = require('./routes/golpes');
const inscriptos = require('./routes/inscriptos');
const categoryStats = require('./routes/categoryStats');

app.use('/torneos', torneos);
app.use('/categorias_torneo', categoriasTorneo);
app.use('/clubes', clubes);
app.use('/categorias', categorias);
app.use('/canchas', canchas);
app.use('/jugadores', jugadores);
app.use('/golpes', golpes);
app.use('/inscriptos', inscriptos);
app.use(`/estadisticas`, categoryStats);

// MERCADO PAGO
const client = new MercadoPagoConfig({ accessToken: process.env.accessToken });
app.post('/create_preference', async (req, res) => {
	try {
		const preference = new Preference(client);
		const result = await preference.create({
			header: {
				XIdempotencyKey: new Date().toISOString()
			},
			body: {
				payment_methods: {
					excluded_payment_methods: [{ id: 'amex' }, { id: 'argencard' }, { id: 'cabal' }, { id: 'cmr' }, { id: 'cencosud' }, { id: 'diners' }, { id: 'tarshop' }, { id: 'debcabal' }, { id: 'maestro' }],
					installments: 1
				},
				items: [
					{
						title: req.body.title,
						quantity: 1,
						unit_price: req.body.price,
						description: req.body.description,
						currency_id: 'ARS',
						category_id: 'sports'
					}
				],
				payer: {
					name: req.body.formulario.nombre,
					surname: req.body.formulario.apellido,
					email: req.body.formulario.email,
					phone: {
						area_code: '54',
						number: req.body.formulario.telefono
					}
				},
				back_urls: {
					success: 'http://127.0.0.1:3000/inscripciones?status=success',
					failure: 'http://127.0.0.1:3000/inscripciones?status=failure'
				},
				binary_mode: true,
				statement_descriptor: 'GolfPoint'
			}
		});
		res.json({
			id: result.id
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: 'error al crear preferencia'
		});
	}
});

app.post('/webhook', async (req, res) => {
	try {
		if (signature !== process.env.webhookSecret) {
			console.log('Webhook no autorizado');
			return res.sendStatus(401);
		}

		const { type, data } = req.body;
		if (type === 'payment') {
			const paymentId = data.id;
			// Consulta el pago en Mercado Pago
			const mpResponse = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, { headers: { Authorization: `Bearer ${process.env.accessToken}` } });
			const payment = mpResponse.data;
			if (payment.status === 'approved') {
				const preferenceId = payment.preference_id;
				// Aquí actualizas tu DB usando el preferenceId
				// db.query('UPDATE inscripciones SET estado = "aprobado" WHERE preference_id = ?', [preferenceId])
			}
		}
		res.sendStatus(200);
	} catch (error) {
		console.error(error);
		res.sendStatus(500);
	}
});

app.listen(3001, () => {
	console.log('corriendo en puerto 3001');
});
