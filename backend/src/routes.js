const express = require('express');
const MatchesController = require('./Controllers/MatchesController');
const router = express.Router()

const SeasonController = require('./Controllers/SeasonController');
const TeamsController = require('./Controllers/TeamsController');
const BetsController = require('./Controllers/BetsController');

router.post('/newseason', SeasonController.createSeasonFile);
router.put('/file', SeasonController.seasonFile);
router.put('/updateMatchFile', SeasonController.updateMatchesSeason);
router.put('/setup8', SeasonController.setupRoundOf8);
router.put('/setup4', SeasonController.setupQuarter);
router.put('/setup2', SeasonController.setupSemis);
router.put('/setupfinal', SeasonController.setupFinal);
router.put('/updateSeason', SeasonController.updateSeason);
router.get('/getBestSeason', SeasonController.getBestSeason);
router.get('/getbestWinstreak', SeasonController.getbestWinstreak);
router.put('/getGroup', SeasonController.getGroup);
router.put('/getSeason/:id', SeasonController.getSeason)
router.get('/getAnyFile', SeasonController.getAnyFile);

router.put('/updateOpponent', TeamsController.updateOpponents);
router.post('/newteam', TeamsController.createTeam);
router.put('/match', TeamsController.playMatch);
router.put('/penalties', TeamsController.penalties);
router.get('/teams', TeamsController.getTeams);
router.get('/allteams', TeamsController.getAllTeams)
router.get('/getBiggestWinner', TeamsController.getBiggestWinner);
router.get('/getTopScorer', TeamsController.getTopScorer);
router.get('/getTeamsJSON', TeamsController.getTeamsJSON);
router.get('/getTeam/:team',TeamsController.getTeam);

router.post('/rgmatch', MatchesController.registerMatch); 
router.put('/getGoalsOpponent', MatchesController.getScoresbyOpponent);

router.post('/createBet', BetsController.createBetOdd);
router.post('/registerBet', BetsController.registerBet);
router.post('/createPlayer/:name', BetsController.createPlayer);


//i am using a temporary method here, with 2 requests, to see if the server was
//started using nodemon or normal node. Thats because the auto-reload feature of 
//nodemon causes issues during code execution.

router.put('/connectionTest1', function(request,response){
  const fs = require('fs');
  let payload;
  try { payload = request.body; }
  catch(err) { return response.status(500); }
  fs.unlink(`./src/database/test.json`,()=>{});
  return response.json(payload.payload*1000)
})

router.get('/connectionTest2', function(request,response){
  const fs = require('fs');
  fs.writeFile(`./src/database/test.json`, "TRY", 'utf8', ()=>{});
  return response.json({});
})


module.exports = router;