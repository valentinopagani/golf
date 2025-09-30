const express = require('express');
const { setCategoriasTorneo, deleteCategoriasTorneo } = require('../controllers/categoriasTorneo');

const router = express.Router();

router.post('/', setCategoriasTorneo);
router.delete('/torneo/:id', deleteCategoriasTorneo);

module.exports = router;
