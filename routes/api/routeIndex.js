//Load Dependencies
const express = require("express");
const router = express.Router();

router.get('/', (req, res) => res.send('Index route working!'));

module.exports = router;