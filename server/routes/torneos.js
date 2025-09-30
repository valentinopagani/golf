const express = require('express');
const { getTorneos, setTorneo, closeTorneo, reopenTorneo, editTorneo, deleteTorneo } = require('../controllers/torneos');

const router = express.Router();

router.get('/', getTorneos);
router.post('/', setTorneo);
router.put('/:id/finalizar', closeTorneo);
router.put('/:id/reabrir', reopenTorneo);
router.put('/:id', editTorneo);
router.delete('/:id', deleteTorneo);

module.exports = router;
