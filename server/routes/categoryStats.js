const express = require('express');
const { getCategoryStats } = require('../controllers/categoryStats');

const router = express.Router();

router.get('/categoryStats', getCategoryStats);

module.exports = router;
