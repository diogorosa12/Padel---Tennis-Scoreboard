import { BaseSideService } from "@zeppos/zml/base-side"

const log = Logger.getLogger("app-side-service")
const MATCH_HISTORY_KEY = "matchHistory"
const DEFAULT_SPORT_KEY = "defaultSport"
const RACKET_SPORTS = ["padel", "tennis"]


function getDefaultSport(service) {
  const stored = service.settings.getItem(DEFAULT_SPORT_KEY)

  return RACKET_SPORTS.includes(stored) ? stored : "padel"
}


function createMatchRecord(service, match) {
  return {
    startTime: match.timestamp,
    duration: Date.now() - match.timestamp,
    
    sport: match.sport,

    player1: {
      sets: match.player1.sets,
      games: match.player1.result
    },

    player2: {
      sets: match.player2.sets,
      games: match.player2.result
    }
  }
}


function getMatchHistory(service) {
  const stored = service.settings.getItem(MATCH_HISTORY_KEY)

  if (!stored) {
    return []
  }

  try {
    return JSON.parse(stored)
  } catch (e) {
    log.log("Could not parse match history")
    return []
  }
}


function saveMatchToHistory(service, match) {
  const history = getMatchHistory(service)

  history.push(match)

  service.settings.setItem(
    MATCH_HISTORY_KEY,
    JSON.stringify(history)
  )
}


AppSideService(
  BaseSideService({
    onRequest(req, res) {
      if (req.method === "MATCH_FINISHED") {
        const match = req.params.match
        const record = createMatchRecord(this, match)

        saveMatchToHistory(this, record)

        res(null, {
          code: 0,
          message: "Match saved"
        })

        return
      }

      res(null, {
        code: 1,
        message: "Unknown method"
      })
    }

  })
)
