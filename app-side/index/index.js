import { BaseSideService } from "@zeppos/zml/base-side"

const log = Logger.getLogger("app-side-service")
const MATCH_HISTORY_KEY = "matchHistory"


function createMatchRecord(match) {
  return {
    timestamp: Date.now(),

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

  log.log(
    "Match saved. Total matches:",
    history.length
  )
}


AppSideService(
  BaseSideService({

    onInit(e) {
      log.log("Side Service started")
    },

    onRun(e) {
      log.log("Side Service running")
    },

    onDestroy() {
      log.log("Side Service destroyed")
    },

    onRequest(req, res) {
      log.log("Received request:", req.method)

      if (req.method === "MATCH_FINISHED") {
        const match = req.params.match

        log.log("MATCH FINISHED")
        log.log(JSON.stringify(match))

        const record = createMatchRecord(match)

        log.log("MATCH RECORD")
        log.log(JSON.stringify(record))

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
