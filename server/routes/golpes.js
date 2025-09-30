const express = require('express');
const { getGolpes } = require('../controllers/golpes');

const router = express.Router();

router.get('/', getGolpes);

module.exports = router;
