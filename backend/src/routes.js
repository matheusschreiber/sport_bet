const express = require('express');
const router = express.Router()

const SeasonController = require('./Controllers/SeasonController');
const TeamsController = require('./Controllers/TeamsController')


router.post('/newseason', SeasonController.createSeasonFile);
router.get('/matches', SeasonController.listGroupMatches);
router.put('/updateMatchFile', SeasonController.updateMatchesSeason);

router.post('/newteam', TeamsController.createTeam);
router.put('/match', TeamsController.playMatch);


module.exports = router;