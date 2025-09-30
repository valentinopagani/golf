const express = require('express');
const { getClubes, setClub } = require('../controllers/clubes');

const router = express.Router();

router.get('/', getClubes);
router.post('/', setClub);

module.exports = router;
