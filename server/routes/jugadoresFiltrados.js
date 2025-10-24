const express = require('express');
const { getJugadoresFiltrados } = require('../controllers/jugadoresFiltrados');

const router = express.Router();

router.get('/:id', getJugadoresFiltrados);

module.exports = router;
