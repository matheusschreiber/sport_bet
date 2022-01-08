const express = require('express');
const MatchesController = require('./Controllers/MatchesController');
const router = express.Router()

const SeasonController = require('./Controllers/SeasonController');
const TeamsController = require('./Controllers/TeamsController')


router.post('/newseason', SeasonController.createSeasonFile);
router.put('/file', SeasonController.seasonFile);
router.put('/updateMatchFile', SeasonController.updateMatchesSeason);
router.put('/setup8', SeasonController.setupRoundOf8);
router.put('/setup4', SeasonController.setupQuarter);
router.put('/setup2', SeasonController.setupSemis);
router.put('/setupfinal', SeasonController.setupFinal);
router.post('/updateSeason', SeasonController.updateSeason);
router.get('/getBestSeason', SeasonController.getBestSeason);
router.get('/getbestWinstreak', SeasonController.getbestWinstreak);
router.post('/getGroup', SeasonController.getGroup);
router.put('/getSeason/:id', SeasonController.getSeason)

router.put('/bgOpponent', TeamsController.setBiggestOpponent);
router.get('/bgOpponent/:team', TeamsController.getBiggestOpponent);
router.put('/wkOpponent', TeamsController.setWeakestOpponent);
router.get('/wkOpponent/:team', TeamsController.getWeakestOpponent);
router.post('/newteam', TeamsController.createTeam);
router.put('/match', TeamsController.playMatch);
router.put('/penalties', TeamsController.penalties);
router.get('/teams', TeamsController.getTeams);
router.get('/allteams', TeamsController.getAllTeams)
router.get('/getBiggestWinner', TeamsController.getBiggestWinner);
router.get('/getTopScorer', TeamsController.getTopScorer);
router.get('/getTeamsJSON', TeamsController.getTeamsJSON);
router.get('/getTeam/:team',TeamsController.getTeam);

router.post('/rgmatch', MatchesController.registerMatch); //REMOVER DEPOIS
router.get('/getGoalsOpponent', MatchesController.getScoresbyOpponent);


module.exports = router;