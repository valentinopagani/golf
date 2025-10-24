const express = require('express');
const { getInscriptos, setInscriptos, setScores, editScores, getHistorial, deleteInscripto } = require('../controllers/inscriptos');

const router = express.Router();

router.get('/', getInscriptos);
router.post('/', setInscriptos);
router.put('/score', setScores);
router.put('/score', editScores);
router.get('/historial', getHistorial);
router.delete('/:id', deleteInscripto);

module.exports = router;
