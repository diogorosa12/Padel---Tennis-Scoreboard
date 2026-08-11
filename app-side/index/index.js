import { BaseSideService } from "@zeppos/zml/base-side";
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
        log.log("MATCH FINISHED")
        log.log(JSON.stringify(req.params))

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



/* AppSettingsPage(
  BaseSideService({
    onInit(e) {
      log.log("app-side-service onInit invoked", e);
    },

    onRun(e) {
      log.log("app-side-service onEvent invoked", e);
    },

    onDestroy() {
      log.log("app-side-service onDestroy invoked");
    },

    onRequest(req, res) {
      switch (req.method) {
        case 'your-method':
          res(null, {
            code: 0,
            message: 'success',
          })
      }
    }
  })
); */