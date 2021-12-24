const express = require('express');
const MatchesController = require('./Controllers/MatchesController');
const router = express.Router()

const SeasonController = require('./Controllers/SeasonController');
const TeamsController = require('./Controllers/TeamsController')


router.post('/newseason', SeasonController.createSeasonFile);
router.get('/file', SeasonController.seasonFile);
router.put('/updateMatchFile', SeasonController.updateMatchesSeason);
router.put('/setup8', SeasonController.setupRoundOf8);
router.put('/setup4', SeasonController.setupQuarter);
router.put('/setup2', SeasonController.setupSemis);
router.put('/setupfinal', SeasonController.setupFinal);
router.post('/registerSeason', SeasonController.registerSeason);
router.get('/getBestSeason', SeasonController.getBestSeason);
router.get('/getbestWinstreak', SeasonController.getbestWinstreak);
router.get('/getGroup', SeasonController.getGroup);

router.put('/bgOpponent', TeamsController.setBiggestOpponent);
router.get('/bgOpponent/:team', TeamsController.getBiggestOpponent);
router.put('/wkOpponent', TeamsController.setWeakestOpponent);
router.get('/wkOpponent/:team', TeamsController.getWeakestOpponent);
router.post('/newteam', TeamsController.createTeam);
router.put('/match', TeamsController.playMatch);
router.get('/teams', TeamsController.getTeams);
router.get('/allteams', TeamsController.getAllTeams)
router.get('/getBiggestWinner', TeamsController.getBiggestWinner);
router.get('/getTopScorer', TeamsController.getTopScorer);

router.post('/rgmatch', MatchesController.registerMatch);
router.get('/getGoalsOpponent', MatchesController.getScoresbyOpponent);


module.exports = router;