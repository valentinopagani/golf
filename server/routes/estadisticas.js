const express = require('express');
const { getInscriptosStats } = require('../controllers/inscriptosStats');
const { getCanchasStats } = require('../controllers/canchasStats');

const router = express.Router();

router.get('/inscriptosStats', getInscriptosStats);
router.get('/canchasStats', getCanchasStats);

module.exports = router;
