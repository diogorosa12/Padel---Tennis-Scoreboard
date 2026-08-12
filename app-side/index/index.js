import { BaseSideService } from "@zeppos/zml/base-side";
//import * as settings from "@zos/settings";
const log = Logger.getLogger("app-side-service");


//const log = Logger.getLogger("padel-tennis-side-service")

AppSideService(
  BaseSideService({
    onInit(e) {
      log.log("Side Service started", e)
    },

    onRun(e) {
      log.log("Side Service running", e)
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

        res(null, {
          code: 0,
          message: "Match received",
        })

        return
      }

      res(null, {
        code: 1,
        message: "Unknown method",
      })
    },
  })
)
