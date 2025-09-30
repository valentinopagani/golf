const express = require('express');
const { getCanchas, setCancha, setHoyos, deleteCancha } = require('../controllers/canchas');

const router = express.Router();

router.get('/', getCanchas);
router.post('/', setCancha);
router.put('/:id/hoyos', setHoyos);
router.delete('/:id', deleteCancha);

module.exports = router;
