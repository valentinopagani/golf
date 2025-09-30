const express = require('express');
const { getCategorias, setCategorias, deleteCategorias } = require('../controllers/categorias');

const router = express.Router();

router.get('/', getCategorias);
router.post('/', setCategorias);
router.delete('/:id', deleteCategorias);

module.exports = router;
