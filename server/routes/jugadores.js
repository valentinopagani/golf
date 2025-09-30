const express = require('express');
const { getJugadores, setJugadores, editJugador } = require('../controllers/jugadores');

const router = express.Router();

router.get('/', getJugadores);
router.post('/', setJugadores);
router.put('/:id', editJugador);

module.exports = router;
