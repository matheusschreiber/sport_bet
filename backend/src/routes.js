const express = require('express');
const router = express.Router()

const SeasonController = require('./Controllers/SeasonController');
const TeamsController = require('./Controllers/TeamsController')


router.post('/newseason', SeasonController.createSeasonFile);
router.get('/matches', SeasonController.listGroupMatches);
router.get('/file', SeasonController.seasonFile);
router.put('/updateMatchFile', SeasonController.updateMatchesSeason);
router.put('/setup8', SeasonController.setupRoundOf8);
router.put('/setup4', SeasonController.setupQuarter);
router.put('/setup2', SeasonController.setupSemis);
router.put('/setupfinal', SeasonController.setupFinal);

router.post('/newteam', TeamsController.createTeam);
router.put('/match', TeamsController.playMatch);


module.exports = router;