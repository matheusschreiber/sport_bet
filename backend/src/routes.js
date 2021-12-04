const express = require('express');
const router = express.Router()

const SeasonController = require('./Controllers/SeasonController');
const TeamsController = require('./Controllers/TeamsController')


router.post('/newteam', TeamsController.createTeam);
router.post('/newseason', SeasonController.createSeason);

router.put('/match', TeamsController.playMatch);

module.exports = router;