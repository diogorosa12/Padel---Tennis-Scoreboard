import { getSettings } from "./settings"

let history = []

export function createNewMatch(firstServe = true, deuce = 0) {
  return {
    timestamp: Date.now(),
    player1: {
      pointIndex: 0,
      games: 0,
      sets: 0,
      result: []
    },
    player2: {
      pointIndex: 0,
      games: 0,
      sets: 0,
      result: []

    },
    advantage: null,
    serve: firstServe,
    tieBreak: false,
    firstServe: firstServe,
    deuce: deuce
  }
}

let match = createNewMatch()

export function setMatch(newMatch) {
    match = newMatch
}
export function getMatch() {
    return match
}
export function changeServe(){
  if(match.serve){
    match.serve = false
  }
  else{
    match.serve = true
  }
}
export function getServer() {
  if (match.serve){
    return {y: 124} 
  }
  else{
    return {y: 115 + 60*1.3/2 - 20 + 116 - 10}
  }
}
export function starPoint() {
  match.player1.pointIndex++
  match.player2.pointIndex++
}
export function advantage() {

  if (match.advantage === match.player2){
    match.player2.pointIndex = 5
    match.player1.pointIndex = 4
  }
  if (match.advantage === match.player1){
    match.player1.pointIndex = 5
    match.player2.pointIndex = 4
  }
  if(match.advantage === null){
    deuce()
  }

}
export function goldenPoint(){
  match.player1.pointIndex = 4
  match.player2.pointIndex = 4
}
export function resetPoints() {
  match.player1.pointIndex = 0
  match.player2.pointIndex = 0
  match.advantage = null
  match.tieBreak = false
}

export function awardGame(winner) {
  winner.games++
  changeServe()
  resetPoints()
}

export function saveSetScore(result1, result2) {
  match.player1.result.push(JSON.parse(JSON.stringify(result1)))
  match.player2.result.push(JSON.parse(JSON.stringify(result2)))
}

export function awardSet(winner) {
  winner.sets++
  if(match.firstServe === match.serve){
    changeServe()
  }
  match.firstServe = match.serve

  console.log('player 1', match.player1.result)
  console.log('player 2', match.player2.result)

  match.player1.games = 0
  match.player2.games = 0
  resetPoints()
}
export function deuce(){
  match.player1.pointIndex = 3
  match.player2.pointIndex = 3
}
export function resetMatch() {
  const settings = getSettings()
  match = createNewMatch(settings.firstServe, settings.deuce)
}
export function undoHelper() {

  const diff = match.player1.pointIndex - match.player2.pointIndex
  
  if (match.player1.pointIndex >= 3 && match.player2.pointIndex >= 3 && getSettings().pingPong === false){
    if(getSettings().deuce === 0){
      if(diff === 0 && (match.player1.pointIndex === 3 || match.player1.pointIndex === 4)){
        deuce()
      }
    }
    if(getSettings().deuce === 1){
      if(diff === 0){
        deuce()
      }
      if(diff > 0){
        match.advantage = match.player1
        advantage()
      }
      if(diff < 0){
        match.advantage = match.player2
        advantage()
      }
    }
    if(getSettings().deuce === 2){
      if(diff === 0){
        goldenPoint()
      }
      if(diff > 0){
        awardGame(match.player1)
      }
      if(diff < 0){
        awardGame(match.player2)
      }
    }
  }
  return
}


export function pingPongMode(winner, loser, diffPoints, deuce = false) {
  // Change serves in Ping-Pong
  if(deuce === false && (winner.pointIndex + loser.pointIndex)%2 === 0){
    changeServe()
  }
  if(deuce === true){
    changeServe()
  }
  // Award game to player
  if(winner.pointIndex >= getSettings().tieBreak && diffPoints >= 2){

    saveSetScore(match.player1.pointIndex, match.player2.pointIndex)

    awardSet(winner)
  }
}

export function playerWonPoint(player) {
  let deuceFlag = false
  const settings = getSettings()
  
  const winner = match[player]
  const loser = player === 'player1' ? match.player2 : match.player1
  
  // Increment winner point index
  winner.pointIndex++
  const diffPoints = Math.abs(winner.pointIndex - loser.pointIndex)
  
  // Tiebreak
  if(match.tieBreak === true){
    // Change serves in tiebreak
    if((winner.pointIndex + loser.pointIndex)%2 != 0){
      changeServe()
    }
    // Award set to player
    if(winner.pointIndex >= settings.tieBreak && diffPoints >= 2){
      winner.games++
      
      if(settings.tieBreakMode && Math.abs(winner.sets - loser.sets) === 0 && winner.sets === settings.bestOf/2 + 0.5 - 1) {
        saveSetScore(match.player1.pointIndex, match.player2.pointIndex)
      }
      else{
        saveSetScore(match.player1.games, match.player2.games)
      }
    
      awardSet(winner)
    }
  }
  else{ 
    // Ping-Pong
    if(settings.pingPong === true){
      if((winner.pointIndex + loser.pointIndex) >= settings.tieBreak * 2 - 2){
        deuceFlag = true
      }
      pingPongMode(winner, loser, diffPoints, deuceFlag)
    }
    // Normal game
    else{
      // Award game to player 
      if ((winner.pointIndex >= 4 && diffPoints >= 2)) {
          awardGame(winner)
      }
      
      // Handle deuce and advantage situations
      // Star Point
      if(settings.deuce === 0){
        if ((winner.pointIndex === 10)) {
          awardGame(winner)
        }
        if (winner.pointIndex >= 4 && diffPoints <= 1) {
          starPoint()
        }
      }
      // Advantage
      if(settings.deuce === 1){
        if (winner.pointIndex >= 3  && diffPoints === 0){
          match.advantage = null
          advantage()
        }
        if (winner.pointIndex >= 4 && diffPoints > 0){
          match.advantage = winner
          advantage()
        }
        
      }
      // Golden Point
      if(settings.deuce === 2){
        if ((winner.pointIndex === 3 || winner.pointIndex === 4) && diffPoints === 0){
          goldenPoint()
        }
        if (winner.pointIndex >= 5){
          awardGame(winner)
        }
      }

    }
    const diffGames = Math.abs(winner.games - loser.games)
    
    // Tiebreak flag
    if ((winner.games === settings.games && diffGames === 0)){
      match.tieBreak = true
    }
    // Award set to player
    if ((winner.games >= settings.games && diffGames >= Math.min(2, settings.games))){
      saveSetScore(match.player1.games, match.player2.games)
      awardSet(winner)
    }     

    const diffSets = Math.abs(winner.sets - loser.sets)
    // Last set TieBreak mode
    if(settings.tieBreakMode){
      if(diffSets === 0 && winner.sets === settings.bestOf/2 + 0.5 - 1) {
        match.tieBreak = true
      }
    }
  }
  
  // Win match
  if (winner.sets >= settings.bestOf/2 + 0.5){
    const finishedMatch = JSON.parse(JSON.stringify(match))
    finishedMatch.pingPong = settings.pingPong
    
    resetMatch()

    return finishedMatch
  }
}
export function saveState() {
    history.push(JSON.parse(JSON.stringify(match)))
}
export function undo() {
    if (history.length === 0) return
    match = history.pop()
}

