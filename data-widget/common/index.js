import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device"
import { px } from "@zos/utils"
import { createWidget, widget, align, text_style, sport_data, edit_widget_group_type, prop } from '@zos/ui'
import { localStorage } from "@zos/storage"
import { undoHelper, getMatch, getServer, resetMatch, playerWonPoint, saveState, undo, clearHistory } from './match'
import { POINTS, PLAYER_1, PLAYER_2, SCREEN_WIDTH, SCREEN_HEIGHT } from './constants'
import { saveMatch, loadMatch } from './storage'
import { getPointText } from './helpers'
import { updateSettings, setDoubles, getSport, getSettings, loadSettings, saveSettings, setFirstServe, setDeuce, setSport, setSets, getSets, getGames, setGames, getTieBreak, setTieBreak } from "./settings"
import { BasePage } from "@zeppos/zml/base-page";

let menuGroup
let matchGroup
let settingsMenuGroup

let sportsGroup
let backAndAcceptGroup

let deuceGroup
let deuceOption

let serveGroup
let serveOption

let doublesGroup
let doublesOption


let bestOfGroup
let pointsGroup
let gamesGroup

let messageGroup
let matchFinishedGroup

let originalSettings
let newGameSettings
let settingsPage = 1
let newGameFlag = false
let finishedMatchFlag = false

let matchToSend

const UNSENT_MATCHES_KEY = "unsentMatches"

function getUnsentMatches() {
  const stored = localStorage.getItem(UNSENT_MATCHES_KEY)

  if (!stored) {
    return []
  }

  try {
    const matches = JSON.parse(stored)
    return Array.isArray(matches) ? matches : []
  } catch (error) {
    return []
  }
}

function saveUnsentMatches(matches) {
  localStorage.setItem(UNSENT_MATCHES_KEY, JSON.stringify(matches))
}

function storeUnsentMatch(match) {
  const matches = getUnsentMatches()
  const alreadyStored = matches.some((storedMatch) => storedMatch.timestamp === match.timestamp)

  if (!alreadyStored) {
    matches.push(match)
    saveUnsentMatches(matches)
  }
}

const { screenShape } = getDeviceInfo()

const TOP_OFFSET = screenShape === SCREEN_SHAPE_SQUARE ? 60 : 0

DataWidget(
  BasePage({
    init(page) {

      loadMatch()
      loadSettings()


      function updateMessage(text) {
        messageText.setProperty(prop.TEXT, text)
        messageGroup.setProperty(prop.VISIBLE, true)
        matchFinishedGroup.setProperty(prop.VISIBLE, false)
        backAndAcceptGroup.setProperty(prop.VISIBLE, false)
        menuGroup.setProperty(prop.VISIBLE, false)
      }

      function requestMatch(match) {
        return page.request({
          method: "MATCH_FINISHED",
          params: {
            match
          }
        }).then((result) => {
          if (!result || result.code !== 0) {
            throw result || { code: 1 }
          }

          return result
        })
      }

      function finishCurrentMatch() {
        clearHistory()
        resetMatch()
        saveMatch()
        finishedMatchFlag = false
      }

      function sendUnsentMatches() {
        const matches = getUnsentMatches()
        const total = matches.length

        if (total === 0) {
          updateMessage("NO MATCHES TO SEND")
          return
        }

        function sendNext() {
          if (matches.length === 0) {
            updateMessage(total === 1 ? "MATCH SENT" : `${total} MATCHES SENT`)
            return Promise.resolve()
          }

          return requestMatch(matches[0])
            .then(() => {
              matches.shift()
              saveUnsentMatches(matches)
              return sendNext()
            })
            .catch((error) => {
              page.log("Could not send queued match:", JSON.stringify(error))
              updateMessage(
                `COULD NOT SEND MATCHES\n\n${matches.length} STILL SAVED\nConnect the watch to the phone\nand try again.`
              )
            })
        }

        sendNext()
      }
      function updateMoreSettingsUI() {

        const setting = newGameFlag === true ? newGameSettings : getSettings()

        if(setting.sport === "padel" || setting.sport === "tennis") {
          gamesNumber.setProperty(prop.TEXT, `${setting.games}`)
          pointsGroup.setProperty(prop.VISIBLE, false)
          superTieBreakText.setProperty(prop.VISIBLE, true)
          superTieBreakOption.setProperty(prop.VISIBLE, true)
          gamesGroup.setProperty(prop.VISIBLE, true)
        }
        if(setting.sport === "tableTennis" || setting.sport === "pickleball" || setting.sport === "squash" || setting.sport === "badminton") {
          tieBreakText.setProperty(prop.VISIBLE, true)
          pointsGroup.setProperty(prop.VISIBLE, true)
          superTieBreakText.setProperty(prop.VISIBLE, false)
          superTieBreakOption.setProperty(prop.VISIBLE, false)
          gamesGroup.setProperty(prop.VISIBLE, false)
        }
      }
     
      function updateSettingsUI() {

        const setting = newGameFlag === true ? newGameSettings : getSettings()
        
        deuceOption.setProperty(prop.CHECKED, buttons[setting.deuce])

        if (setting.sport === "pickleball") {
          deuceOption.setProperty(prop.VISIBLE, false)
          deuceGroup.setProperty(prop.VISIBLE, false)
          doublesOption.setProperty(prop.VISIBLE, true)
          doublesGroup.setProperty(prop.VISIBLE, true)
        }
        else{
          deuceOption.setProperty(prop.VISIBLE, true)
          deuceGroup.setProperty(prop.VISIBLE, true)
          doublesOption.setProperty(prop.VISIBLE, false)
          doublesGroup.setProperty(prop.VISIBLE, false)
        }
      
      }

      function resetSport() {
        padelButton.setProperty(prop.MORE, {
          x: px(SCREEN_WIDTH / 2 - 215),
          y: px(140),
          w: px(210),
          h: px(55),
          normal_color: 0x252525,
          press_color: 0x252525,
        })

        tennisButton.setProperty(prop.MORE, {
          x: px(SCREEN_WIDTH / 2 + 5),
          y: px(140),
          w: px(210),
          h: px(55),
          normal_color: 0x252525,
          press_color: 0x252525,
        })

        tableTennisButton.setProperty(prop.MORE, {
          x: px(SCREEN_WIDTH / 2 - 215),
          y: px(205),
          w: px(210),
          h: px(55),
          normal_color: 0x252525,
          press_color: 0x252525,
        })

        pickleballButton.setProperty(prop.MORE, {
          x: px(SCREEN_WIDTH / 2 + 5),
          y: px(205),
          w: px(210),
          h: px(55),
          normal_color: 0x252525,
          press_color: 0x252525,
        })

        squashButton.setProperty(prop.MORE, {
          x: px(SCREEN_WIDTH / 2 - 215),
          y: px(270),
          w: px(210),
          h: px(55),
          normal_color: 0x252525,
          press_color: 0x252525,
        })

        badmintonButton.setProperty(prop.MORE, {
          x: px(SCREEN_WIDTH / 2 + 5),
          y: px(270),
          w: px(210),
          h: px(55),
          normal_color: 0x252525,
          press_color: 0x252525,
        })
      }     

      function colorSport() {
        if (newGameSettings.sport === "padel") {
          padelButton.setProperty(prop.MORE, {
            x: px(SCREEN_WIDTH / 2 - 215),
            y: px(140),
            w: px(210),
            h: px(55),
            normal_color: 0x05480d,
            press_color: 0x05480d,
          })
        }
        if (newGameSettings.sport === "tennis") {
          tennisButton.setProperty(prop.MORE, {
            x: px(SCREEN_WIDTH / 2 + 5),
            y: px(140),
            w: px(210),
            h: px(55),
            normal_color: 0x05480d,
            press_color: 0x05480d,
          })
        }
        if (newGameSettings.sport === "tableTennis") {
          tableTennisButton.setProperty(prop.MORE, {
            x: px(SCREEN_WIDTH / 2 - 215),
            y: px(205),
            w: px(210),
            h: px(55),
            normal_color: 0x05480d,
            press_color: 0x05480d,
          })
        }
        if (newGameSettings.sport === "pickleball") {
          pickleballButton.setProperty(prop.MORE, {
            x: px(SCREEN_WIDTH / 2 + 5),
            y: px(205),
            w: px(210),
            h: px(55),
            normal_color: 0x05480d,
            press_color: 0x05480d,
          })
        }
        if (newGameSettings.sport === "squash") {
          squashButton.setProperty(prop.MORE, {
            x: px(SCREEN_WIDTH / 2 - 215),
            y: px(270),
            w: px(210),
            h: px(55),
            normal_color: 0x05480d,
            press_color: 0x05480d,
          })
        }
        if (newGameSettings.sport === "badminton") {
          badmintonButton.setProperty(prop.MORE, {
            x: px(SCREEN_WIDTH / 2 + 5),
            y: px(270),
            w: px(210),
            h: px(55),
            normal_color: 0x05480d,
            press_color: 0x05480d,
          })
          
        }
      }
        
      // Create display groups
      matchGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })

      deuceGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })

      serveGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })

      bestOfGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })

      menuGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: px(0) + TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })

      settingsMenuGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })

      sportsGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })
      backAndAcceptGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })
      pointsGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })
      gamesGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })
      doublesGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })
      messageGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })
      matchFinishedGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })


      function showMenu() {
        settingsMenuGroup.setProperty(prop.VISIBLE, false)
        menuGroup.setProperty(prop.VISIBLE, true)
        matchGroup.setProperty(prop.VISIBLE, false)
        deuceGroup.setProperty(prop.VISIBLE, false)
        serveGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        serveOption.setProperty(prop.VISIBLE, false)
        bestOfGroup.setProperty(prop.VISIBLE, false)
        sportsGroup.setProperty(prop.VISIBLE, false)
        backAndAcceptGroup.setProperty(prop.VISIBLE, false)
        pointsGroup.setProperty(prop.VISIBLE, false)
        superTieBreakOption.setProperty(prop.VISIBLE, false)
        superTieBreakText.setProperty(prop.VISIBLE, false)
        settingsBackButton.setProperty(prop.VISIBLE, false)
        gamesGroup.setProperty(prop.VISIBLE, false)
        doublesOption.setProperty(prop.VISIBLE, false)
        doublesGroup.setProperty(prop.VISIBLE, false)
        backAndAcceptGroup.setProperty(prop.VISIBLE, false)
        messageGroup.setProperty(prop.VISIBLE, false)
        matchFinishedGroup.setProperty(prop.VISIBLE, false)
      }

      function showMatch() {
        settingsMenuGroup.setProperty(prop.VISIBLE, false)
        menuGroup.setProperty(prop.VISIBLE, false)
        matchGroup.setProperty(prop.VISIBLE, true)
        deuceGroup.setProperty(prop.VISIBLE, false)
        serveGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        serveOption.setProperty(prop.VISIBLE, false)
        bestOfGroup.setProperty(prop.VISIBLE, false)
        sportsGroup.setProperty(prop.VISIBLE, false)
        backAndAcceptGroup.setProperty(prop.VISIBLE, false)
        pointsGroup.setProperty(prop.VISIBLE, false)
        superTieBreakOption.setProperty(prop.VISIBLE, false)
        settingsBackButton.setProperty(prop.VISIBLE, false)
        gamesGroup.setProperty(prop.VISIBLE, false)
        superTieBreakText.setProperty(prop.VISIBLE, false)
        matchFinishedGroup.setProperty(prop.VISIBLE, false)

        
        undoHelper()
        saveMatch()
        refreshUI()
      }

      function showDeuceSettings() {
        
        updateSettingsUI()
        serveGroup.setProperty(prop.VISIBLE, true)
        serveOption.setProperty(prop.VISIBLE, true)

        settingsMenuGroup.setProperty(prop.VISIBLE, false)
        menuGroup.setProperty(prop.VISIBLE, false)
        matchGroup.setProperty(prop.VISIBLE, false)
        bestOfGroup.setProperty(prop.VISIBLE, false)
        bestOfGroup.setProperty(prop.VISIBLE, false)
        sportsGroup.setProperty(prop.VISIBLE, false)
        pointsGroup.setProperty(prop.VISIBLE, false)
        superTieBreakOption.setProperty(prop.VISIBLE, false)
        gamesGroup.setProperty(prop.VISIBLE, false)
        superTieBreakText.setProperty(prop.VISIBLE, false)
      }

      function showPointsSettings() {
        updateMoreSettingsUI()

        settingsMenuGroup.setProperty(prop.VISIBLE, false)
        deuceGroup.setProperty(prop.VISIBLE, false)
        serveGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        serveOption.setProperty(prop.VISIBLE, false)
        bestOfGroup.setProperty(prop.VISIBLE, true)
        sportsGroup.setProperty(prop.VISIBLE, false)
        doublesOption.setProperty(prop.VISIBLE, false)
        doublesGroup.setProperty(prop.VISIBLE, false)
      }

      function showSettingsPage(flag = false) {
        if(!flag){
          originalSettings = JSON.parse(JSON.stringify(getSettings()))
          saveMatch()
        }
        if(getMatch().sport === "pickleball") {
          deuceSettingsButton.setProperty(prop.TEXT, "DOUBLES/SERVE")
        }
        else{
          deuceSettingsButton.setProperty(prop.TEXT, "DEUCE/SERVE")
        }

        settingsMenuGroup.setProperty(prop.VISIBLE, true)
        menuGroup.setProperty(prop.VISIBLE, false)
        matchGroup.setProperty(prop.VISIBLE, false)
        deuceGroup.setProperty(prop.VISIBLE, false)
        serveGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        serveOption.setProperty(prop.VISIBLE, false)
        bestOfGroup.setProperty(prop.VISIBLE, false)
        sportsGroup.setProperty(prop.VISIBLE, false)
        pointsGroup.setProperty(prop.VISIBLE, false)
        superTieBreakOption.setProperty(prop.VISIBLE, false)
        settingsBackButton.setProperty(prop.VISIBLE, true)
        gamesGroup.setProperty(prop.VISIBLE, false)
        superTieBreakText.setProperty(prop.VISIBLE, false)
        doublesOption.setProperty(prop.VISIBLE, false)
        doublesGroup.setProperty(prop.VISIBLE, false)
      }

      function showSports() {

        resetSport()
        colorSport()
        backAndAcceptGroup.setProperty(prop.VISIBLE, true)
        sportsGroup.setProperty(prop.VISIBLE, true)
        settingsMenuGroup.setProperty(prop.VISIBLE, false)
        menuGroup.setProperty(prop.VISIBLE, false)
        matchGroup.setProperty(prop.VISIBLE, false)
        deuceGroup.setProperty(prop.VISIBLE, false)
        serveGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        serveOption.setProperty(prop.VISIBLE, false)
        bestOfGroup.setProperty(prop.VISIBLE, false)
        pointsGroup.setProperty(prop.VISIBLE, false)
        superTieBreakOption.setProperty(prop.VISIBLE, false)
        superTieBreakText.setProperty(prop.VISIBLE, false)
        doublesOption.setProperty(prop.VISIBLE, false)
        doublesGroup.setProperty(prop.VISIBLE, false)
      }

      function showSpecialSettings() {
        

        originalSettings = JSON.parse(JSON.stringify(getSettings()))
        saveMatch()

        
        serveGroup.setProperty(prop.VISIBLE, true)
        bestOfGroup.setProperty(prop.VISIBLE, true)
        serveOption.setProperty(prop.VISIBLE, true)
        pointsGroup.setProperty(prop.VISIBLE, true)
        
        gamesGroup.setProperty(prop.VISIBLE, false)
        deuceGroup.setProperty(prop.VISIBLE, false)
        settingsMenuGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        menuGroup.setProperty(prop.VISIBLE, false)
        matchGroup.setProperty(prop.VISIBLE, false)
        sportsGroup.setProperty(prop.VISIBLE, false)
        superTieBreakOption.setProperty(prop.VISIBLE, false)
        if (newGameFlag) {
          backAndAcceptGroup.setProperty(prop.VISIBLE, true)
          settingsBackButton.setProperty(prop.VISIBLE, false)
        }
        else{
          backAndAcceptGroup.setProperty(prop.VISIBLE, false)
          settingsBackButton.setProperty(prop.VISIBLE, true)
        }
      }

      function showMessage(match){
        if(match) {
          matchToSend = match
          finishedMatchFlag = true
          if((match.player1.sets - match.player2.sets) > 0){
            resultText.setProperty(prop.TEXT, "WIN")
            resultText.setProperty(prop.MORE, {
              x: px(0),
              y: px(90),
              w: px(SCREEN_WIDTH),
              h: px(100),
              color: 0x008cff
            })
          }
          else{
            resultText.setProperty(prop.TEXT, "LOSS")
            resultText.setProperty(prop.MORE, {
              x: px(0),
              y: px(90),
              w: px(SCREEN_WIDTH),
              h: px(100),
              color: 0xff3c3c
            })
          }
          const resultCount = Math.min(
            match.player1.result.length,
            match.player2.result.length,
            resultColumns.length
          )
          const resultStartX = 145
          const resultAreaWidth = SCREEN_WIDTH - resultStartX - 20
          const columnWidth = Math.min(45, resultAreaWidth / Math.max(resultCount, 1))
          const resultTextSize = resultCount > 9 ? 16 : resultCount > 7 ? 20 : 25

          resultColumns.forEach((column, index) => {
            if (index < resultCount) {
              column.setProperty(prop.MORE, {
                x: px(resultStartX + index * columnWidth),
                y: px(150),
                w: px(columnWidth),
                h: px(200),
                text: `${match.player1.result[index]}\n${match.player2.result[index]}`,
                text_size: px(resultTextSize),
                color: 0xffffff,
                align_h: align.CENTER_H,
                align_v: align.CENTER_V
              })
              column.setProperty(prop.VISIBLE, true)
            }
            else {
              column.setProperty(prop.VISIBLE, false)
            }
          })
        }
        backAndAcceptGroup.setProperty(prop.VISIBLE, true)
        messageGroup.setProperty(prop.VISIBLE, false)
        matchFinishedGroup.setProperty(prop.VISIBLE, true)
        
        settingsMenuGroup.setProperty(prop.VISIBLE, false)
        menuGroup.setProperty(prop.VISIBLE, false)
        matchGroup.setProperty(prop.VISIBLE, false)
        deuceGroup.setProperty(prop.VISIBLE, false)
        serveGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        serveOption.setProperty(prop.VISIBLE, false)
        bestOfGroup.setProperty(prop.VISIBLE, false)
        sportsGroup.setProperty(prop.VISIBLE, false)
        pointsGroup.setProperty(prop.VISIBLE, false)
        superTieBreakOption.setProperty(prop.VISIBLE, false)
        superTieBreakText.setProperty(prop.VISIBLE, false)
        settingsBackButton.setProperty(prop.VISIBLE, false)
        gamesGroup.setProperty(prop.VISIBLE, false)
        doublesOption.setProperty(prop.VISIBLE, false)
        doublesGroup.setProperty(prop.VISIBLE, false)

      }
      // MESSAGE PAGE
      const messageText = messageGroup.createWidget(widget.TEXT, {
        x: px(0),
        y: px(0),
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT - 50),
        text: ``,
        text_size: px(25),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const resultText = matchFinishedGroup.createWidget(widget.TEXT, {
        x: px(0),
        y: px(50),
        w: px(SCREEN_WIDTH),
        h: px(100),
        text: `WIN/LOSS`,
        text_size: px(60),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const matchFinishedText = matchFinishedGroup.createWidget(widget.TEXT, {
        x: px(SCREEN_WIDTH/10),
        y: px(150),
        w: px(SCREEN_WIDTH),
        h: px(200),
        text: `TEAM A\nTEAM B`,
        text_size: px(25),
        color: 0x777777,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      })

      const MAX_RESULT_COLUMNS = 7
      const resultColumns = []

      for (let index = 0; index < MAX_RESULT_COLUMNS; index++) {
        const resultColumn = matchFinishedGroup.createWidget(widget.TEXT, {
          x: px(145),
          y: px(150),
          w: px(45),
          h: px(200),
          text: ``,
          text_size: px(25),
          color: 0xffffff,
          align_h: align.CENTER_H,
          align_v: align.CENTER_V
        })

        resultColumn.setProperty(prop.VISIBLE, false)
        resultColumns.push(resultColumn)
      }

      const acceptMessage = messageGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 60),
        y: px(SCREEN_HEIGHT - 150),
        w: px(120),
        h: px(80),
        normal_src: 'check.png',
        press_src: 'check_selected.png',

        click_func: () => {
          showMenu()
        }
      })

      // SPORTS PAGE

      const padelButton = sportsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 205),
        y: px(140),
        w: px(200),
        h: px(50),
        text: `PADEL`,
        text_size: px(22),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0x05480d,
        color: 0xffffff,
        click_func: () => {

          newGameSettings.sport = "padel"
          resetSport()
          colorSport()          

        }
      })   

      const tennisButton = sportsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 + 5),
        y: px(140),
        w: px(200),
        h: px(50),
        text: `TENNIS`,
        text_size: px(22),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0x05480d,
        color: 0xffffff,        
        click_func: () => {

          newGameSettings.sport = "tennis"
          resetSport()
          colorSport()

        }
      }) 
      
      const tableTennisButton = sportsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 205),
        y: px(200),
        w: px(200),
        h: px(50),
        text: `TABLE TENNIS`,
        text_size: px(22),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0x05480d,
        color: 0xffffff,    
        click_func: () => {

          newGameSettings.sport = "tableTennis"
          resetSport()
          colorSport()
   
        }
      })

      const pickleballButton = sportsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 + 5),
        y: px(200),
        w: px(200),
        h: px(50),
        text: `PICKLEBALL`,
        text_size: px(22),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0x05480d,
        color: 0xffffff,        
        click_func: () => {

          newGameSettings.sport = "pickleball"
          resetSport()
          colorSport()

        }
      })

      const squashButton = sportsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 205),
        y: px(260),
        w: px(200),
        h: px(50),
        text: `SQUASH`,
        text_size: px(22),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0x05480d,
        color: 0xffffff,        
        click_func: () => {

          newGameSettings.sport = "squash"
          resetSport()
          colorSport()

        }
      })

      const badmintonButton = sportsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 + 5),
        y: px(260),
        w: px(200),
        h: px(50),
        text: `BADMINTON`,
        text_size: px(22),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0x05480d,
        color: 0xffffff,        
        click_func: () => {

          newGameSettings.sport = "badminton"
          resetSport()
          colorSport()

        }
      })

      const sportsBackButton = backAndAcceptGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 155),
        y: px(SCREEN_HEIGHT - 135),
        w: px(120),
        h: px(80),
        normal_src: 'backButton.png',
        press_src: 'backButton_selected.png',

        click_func: () => {
          if(finishedMatchFlag){
            finishedMatchFlag = false
            undo()
            showMatch()
          }
          else{
            if(settingsPage === 1) {
              showMenu()
              newGameFlag = false
              settingsPage = 1
              if (getSettings().firstServe){
                serveOption.setProperty(prop.CHECKED, true)
              }
              else{
                serveOption.setProperty(prop.CHECKED, false)
              }
              if (getSettings().tieBreakMode){
                superTieBreakOption.setProperty(prop.CHECKED, true)
              }
              else{
                superTieBreakOption.setProperty(prop.CHECKED, false)
              }
              if(getSettings().doubles){
                doublesOption.setProperty(prop.CHECKED, true)
              }
              else{
                doublesOption.setProperty(prop.CHECKED, false)
              }
            }
            
          }
          if(settingsPage === 2) {
            settingsPage--
            showSports()
          }
          if(settingsPage === 3) {
            settingsPage--
            showDeuceSettings()
            
          }
        }
      })

      const acceptSport = backAndAcceptGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 + 35),
        y: px(SCREEN_HEIGHT - 135),
        w: px(120),
        h: px(80),
        normal_src: 'check.png',
        press_src: 'check_selected.png',

        click_func: () => {
          if(finishedMatchFlag){
            storeUnsentMatch(matchToSend)
            finishCurrentMatch()
            sendUnsentMatches()
          }
          else{
            if (newGameSettings.sport === "padel" || newGameSettings.sport === "tennis" || newGameSettings.sport === "pickleball") {
              if(settingsPage === 1) {
                showDeuceSettings()
              }
              if(settingsPage === 2) {
                showPointsSettings()
              }
              if(settingsPage === 3) {
                updateSettings(newGameSettings)
                saveSettings()
                
                resetMatch()
                saveMatch()
                
                refreshUI()
                showMatch()
                newGameFlag = false
                settingsPage = 0
              }
            }
            if (newGameSettings.sport === "tableTennis" || newGameSettings.sport === "squash" || newGameSettings.sport === "badminton"){
              if(settingsPage === 1) {
                showSpecialSettings()
              }
              if(settingsPage === 2) {
                updateSettings(newGameSettings)
                saveSettings()
                
                resetMatch()
                saveMatch()
                
                refreshUI()
                showMatch()
                newGameFlag = false
                settingsPage = 0
              }
            }
          }
          /* if (getSport() === "pickleball") {

          } */
          settingsPage++}
      })


      // SETTINGS PAGE 

      const deuceSettingsButton = settingsMenuGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 140),
        y: px(130),
        w: px(280),
        h: px(60),
        text: `DEUCE/SERVE`,
        text_size: px(30),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0X444444,
        color: 0xffffff,
        click_func: () => {
          settingsPage = 2
          showDeuceSettings()
        }
      })   

      const pointsSettingsButton = settingsMenuGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 140),
        y: px(205),
        w: px(280),
        h: px(60),
        text: `POINTS`,
        text_size: px(30),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0X444444,
        color: 0xffffff,
        click_func: () => {
          settingsPage = 3
          showPointsSettings()
        }
      }) 
      
      /* const sportSettingsButton = settingsMenuGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 140),
        y: px(270),
        w: px(280),
        h: px(50),
        text: `SPORTS`,
        text_size: px(30),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0X444444,
        color: 0xffffff, 
        click_func: () => {
          showSports()
        }
      }) */

      const settingsBackButton = createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 60),
        y: px(SCREEN_HEIGHT - 145) + TOP_OFFSET,
        w: px(120),
        h: px(80),
        normal_src: 'backButton.png',
        press_src: 'backButton_selected.png',

        click_func: () => {
          if (settingsPage === 1) {
            saveSettings()
            refreshUI()
            showMatch()
          }
          //DEUCE SETTINGS
          if (settingsPage === 2) {
            if (originalSettings.firstServe != getSettings().firstServe || originalSettings.doubles != getSettings().doubles) {
              saveState()
              resetMatch()
              saveMatch()
            }
            saveSettings()            
            showSettingsPage(/* true */)
            settingsPage = 1
          }
          //POINTS SETTINGS
          if (settingsPage === 3) {
            saveSettings()
            showSettingsPage(/* true */)
            settingsPage = 1
          }
        }
      })

      // MORE SETTINGS SCREEN

      const setsText = bestOfGroup.createWidget(widget.TEXT, {
        x: px(60),
        y: px(35),
        w: px(233),
        h: px(170),
        text: `BEST OF`,
        text_size: px(30),
        color: 0xffffff,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      })

      const setsNumber = bestOfGroup.createWidget(widget.TEXT, {
        x: px(SCREEN_WIDTH * 5 / 8 - 12),
        y: px(95),
        w: px(60),
        h: px(50),
        text: `${getSets()}`,
        text_size: px(50),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const plusSetsButton = bestOfGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH * 3 / 4 + 5),
        y: px(85),
        w: px(80),
        h: px(70),
        text: `+`,
        text_size: px(40*1.3),
        color: 0xffffff,
        radius: px(20),
        normal_color: 0x000000,
        press_color: 0x777777,
        click_func: () => {
          if (newGameFlag && newGameSettings.bestOf < 7) {
            newGameSettings.bestOf += 2
            setsNumber.setProperty(prop.TEXT, `${newGameSettings.bestOf}`)
          }
          if (!newGameFlag){
            setSets(true)
            setsNumber.setProperty(prop.TEXT, `${getSets()}`)
          }
          
        }
      })

      const minusSetsButton = bestOfGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 45),
        y: px(80),
        w: px(80),
        h: px(70),
        text: `-`,
        text_size: px(80),
        color: 0xffffff,
        radius: px(20),
        normal_color: 0x000000,
        press_color: 0x777777,
        click_func: () => {

          if (newGameFlag && newGameSettings.bestOf > 1) {
            newGameSettings.bestOf -= 2
            setsNumber.setProperty(prop.TEXT, `${newGameSettings.bestOf}`)
          }
          if (!newGameFlag){
            setSets(false)
            setsNumber.setProperty(prop.TEXT, `${getSets()}`)
          }
        }
      })

      const gamesText = gamesGroup.createWidget(widget.TEXT, {
        x: px(15),
        y: px(105),
        w: px(200),
        h: px(170),
        text: `GAMES`,
        text_size: px(30),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const gamesNumber = gamesGroup.createWidget(widget.TEXT, {
        x: px(SCREEN_WIDTH * 5 / 8 - 15),
        y: px(165),
        w: px(60),
        h: px(50),
        text: `${getGames()}`,
        text_size: px(50),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const plusGamesButton = gamesGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH * 3 / 4 + 5),
        y: px(155),
        w: px(80),
        h: px(70),
        text: `+`,
        text_size: px(40*1.3),
        color: 0xffffff,
        radius: px(20),
        normal_color: 0x000000,
        press_color: 0x777777,
        click_func: () => {
          if (newGameFlag && newGameSettings.games < 20) {
            newGameSettings.games++
            gamesNumber.setProperty(prop.TEXT, `${newGameSettings.games}`)
          }
          if (!newGameFlag){
            setGames(true)
            gamesNumber.setProperty(prop.TEXT, `${getGames()}`)
          }
        }
      })

      const minusGamesButton = gamesGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 45),
        y: px(150),
        w: px(80),
        h: px(70),
        text: `-`,
        text_size: px(80),
        color: 0xffffff,
        radius: px(20),
        normal_color: 0x000000,
        press_color: 0x777777,
        click_func: () => {
          if (newGameFlag && newGameSettings.games > 1) {
            newGameSettings.games--
            gamesNumber.setProperty(prop.TEXT, `${newGameSettings.games}`)
          }
          if (!newGameFlag){
            setGames(false)
            gamesNumber.setProperty(prop.TEXT, `${getGames()}`)
          }
        }
      })

      
      const superTieBreakText = createWidget(widget.TEXT, {
        x: px(58),
        y: px(230) + TOP_OFFSET,
        w: px(250),
        h: px(70),
        text: `SUPER TIEBREAK`,
        text_size: px(30),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })
      
      superTieBreakOption = createWidget(widget.SLIDE_SWITCH, {
        x: px(SCREEN_WIDTH/2 + 100),
        y: px(235) + TOP_OFFSET,
        w: px(84),
        h: px(58),
        select_bg: 'switch_on.png',
        un_select_bg: 'switch_off.png',
        slide_src: 'radio_select.png',
        slide_select_x: px(34),
        slide_un_select_x: px(8),
        slide_y: px(-2),
        checked_change_func: (slideSwitch, checked) => {
          if (newGameFlag) {
            newGameSettings.tieBreakMode = checked
          }
          else{
            getSettings().tieBreakMode = checked
          }
        }
      })
      if (getSettings().tieBreakMode){
        superTieBreakOption.setProperty(prop.CHECKED, true)
      }
      else{
        superTieBreakOption.setProperty(prop.CHECKED, false)
      }
      
      const tieBreakText = pointsGroup.createWidget(widget.TEXT, {
        x: px(15),
        y: px(105),
        w: px(200),
        h: px(170),
        text: `POINTS`,
        text_size: px(30),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const tieBreakNumber = pointsGroup.createWidget(widget.TEXT, {
        x: px(SCREEN_WIDTH * 5 / 8 - 12),
        y: px(165),
        w: px(60),
        h: px(50),
        text: `${getTieBreak()}`,
        text_size: px(50),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const plusTieBreakButton = pointsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH * 3 / 4 + 5),
        y: px(155),
        w: px(80),
        h: px(70),
        text: `+`,
        text_size: px(40*1.3),
        color: 0xffffff,
        radius: px(20),
        normal_color: 0x000000,
        press_color: 0x777777,
        click_func: () => {
          if (newGameFlag && newGameSettings.tieBreak < 50) {
            newGameSettings.tieBreak++
            tieBreakNumber.setProperty(prop.TEXT, `${newGameSettings.tieBreak}`)
          }
          if(!newGameFlag){
            setTieBreak(true)
            tieBreakNumber.setProperty(prop.TEXT, `${getTieBreak()}`)
          }
        }
      })

      const minusTieBreakButton = pointsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 45),
        y: px(150),
        w: px(80),
        h: px(70),
        text: `-`,
        text_size: px(80),
        color: 0xffffff,
        radius: px(20),
        normal_color: 0x000000,
        press_color: 0x777777,
        click_func: () => {
          if (newGameFlag && newGameSettings.tieBreak > 1) {
            newGameSettings.tieBreak--
            tieBreakNumber.setProperty(prop.TEXT, `${newGameSettings.tieBreak}`)
          }
          if(!newGameFlag){
            setTieBreak(false)
            tieBreakNumber.setProperty(prop.TEXT, `${getTieBreak()}`)
          }
        }
      })


      // SETTINGS SCREEN

      const deuceText = deuceGroup.createWidget(widget.TEXT, {
        x: px(0),
        y: px(65),
        w: px(SCREEN_WIDTH),
        h: px(50),
        text: `DEUCE`,
        text_size: px(30),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })
      
      const deuceTypes = deuceGroup.createWidget(widget.TEXT, {
        x: px(SCREEN_WIDTH / 4 - 70),
        y: px(147),
        w: px(SCREEN_WIDTH),
        h: px(40),
        text: `SP              AD             GP`,
        text_size: px(30),
        color: 0xffffff,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      })
      
      deuceOption = createWidget(widget.RADIO_GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(60),
        select_src: 'selected.png',
        unselect_src: 'unselected.png',
        check_func: (group, index, checked) => {
          
          if (checked === true){     
            if (newGameFlag) {
              newGameSettings.deuce = index
            }
            else{
              setDeuce(index)
            }
          }
        }
      })
      
      const button1 = deuceOption.createWidget(widget.STATE_BUTTON, {
        x: px(SCREEN_WIDTH / 4 - 20),
        y: px(140),
        w: px(70),
        h: px(70)
      })
      const button2 = deuceOption.createWidget(widget.STATE_BUTTON, {
        x: px(SCREEN_WIDTH / 2),
        y: px(140),
        w: px(70),
        h: px(70)
      })
      const button3 = deuceOption.createWidget(widget.STATE_BUTTON, {
        x: px(SCREEN_WIDTH * 3 / 4 + 20),
        y: px(140),
        w: px(70),
        h: px(70)
      })

      const buttons = [button1, button2, button3]
      deuceOption.setProperty(prop.INIT, buttons[getSettings().deuce])
      
      const serveTypes = serveGroup.createWidget(widget.TEXT, {
        x: px(70),
        y: px(280),
        w: px(SCREEN_WIDTH),
        h: px(50),
        text: `My team`,
        text_size: px(26),
        color: 0x777777,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      })

      const serveText = serveGroup.createWidget(widget.TEXT, {
        x: px(0),
        y: px(220),
        w: px(SCREEN_WIDTH),
        h: px(40),
        text: `FIRST SERVE`,
        text_size: px(30),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })
      
      serveOption = createWidget(widget.SLIDE_SWITCH, {
        x: px(SCREEN_WIDTH/2 + 90),
        y: px(275) + TOP_OFFSET,
        w: px(84),
        h: px(58),
        select_bg: 'switch_on.png',
        un_select_bg: 'switch_off.png',
        slide_src: 'radio_select.png',
        slide_select_x: px(34),
        slide_un_select_x: px(8),
        slide_y: px(-2),
        checked_change_func: (slideSwitch, checked) => {
          if (newGameFlag) {
            newGameSettings.firstServe = checked
          }
          else{
            setFirstServe(checked)
          }
          if(checked){
            serveTypes.setProperty(prop.TEXT, 'My team')
          }
          else{
            serveTypes.setProperty(prop.TEXT, 'Opponent Team')            
          }
        }
      })
      if (getSettings().firstServe){
        serveOption.setProperty(prop.CHECKED, true)
      }
      else{
        serveOption.setProperty(prop.CHECKED, false)
        serveTypes.setProperty(prop.TEXT, 'Team 2')
      }


      const doublesTypes = doublesGroup.createWidget(widget.TEXT, {
        x: px(70),
        y: px(147),
        w: px(SCREEN_WIDTH),
        h: px(40),
        text: `Singles`,
        text_size: px(26),
        color: 0x777777,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      })

      const doublesText = doublesGroup.createWidget(widget.TEXT, {
        x: px(0),
        y: px(65),
        w: px(SCREEN_WIDTH),
        h: px(50),
        text: `DOUBLES`,
        text_size: px(30),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      doublesOption = createWidget(widget.SLIDE_SWITCH, {
        x: px(SCREEN_WIDTH/2 + 90),
        y: px(142) + TOP_OFFSET,
        w: px(84),
        h: px(58),
        select_bg: 'switch_on.png',
        un_select_bg: 'switch_off.png',
        slide_src: 'radio_select.png',
        slide_select_x: px(34),
        slide_un_select_x: px(8),
        slide_y: px(-2),
        checked_change_func: (slideSwitch, checked) => {
          if (newGameFlag) {
            newGameSettings.doubles = checked
          }
          else{
            setDoubles(checked)
          }
          if(checked){
            doublesTypes.setProperty(prop.TEXT, 'Doubles')
          }
          else{
            doublesTypes.setProperty(prop.TEXT, 'Singles')            
          }
        }
      })
      if (getSettings().doubles){
        doublesOption.setProperty(prop.CHECKED, true)
      }
      else{
        doublesOption.setProperty(prop.CHECKED, false)
        doublesTypes.setProperty(prop.TEXT, 'Singles')
      }

      function refreshUI() {
        
        const match = getMatch()

        
        player1Button.setProperty(prop.TEXT, getPointText(match.player1))
        player2Button.setProperty(prop.TEXT, getPointText(match.player2))
        
        const serverPosition = getServer()
        
        serveImg.setProperty(prop.MORE, {
          y: px(serverPosition.y)
        })
        if(getSport() === "padel" || getSport() === "tennis"){
          pointText.setProperty(
            prop.TEXT,
            `${match.player1.games}\n${match.player1.sets}\n\n${match.player2.games}\n${match.player2.sets}`
          )
        }
        else{
          pointText.setProperty(
            prop.TEXT,
            `${match.player1.sets}\n0\n\n${match.player2.sets}\n0`
          )
        }

        server.setProperty(prop.TEXT, `SERVER: ${match.doubles}`)
        if(getSettings().doubles){
          server.setProperty(prop.VISIBLE, true)
        }
        else{
          server.setProperty(prop.VISIBLE, false)
        }
      }

      // Match screen
      // Core text
      const server = matchGroup.createWidget(widget.TEXT, {
        x: px(0),
        y: px(65),
        w: px(SCREEN_WIDTH),
        h: px(30),
        text: `SERVER: ${getMatch().doubles}`,
        text_size: px(22),
        color: 0x777777,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const baseText = matchGroup.createWidget(widget.TEXT, {
        x: px(SCREEN_WIDTH / 2 - 135),
        y: px(115),
        w: px(100),
        h: px(178),
        text: `GAME\nSET\n\nGAME\nSET`,
        text_size: px(26),
        color: 0x777777,
        align_h: align.RIGHT,
        align_v: align.CENTER_V
      })

      // Score text
      const pointText = matchGroup.createWidget(widget.TEXT, {
        x: px(SCREEN_WIDTH / 2 - 35),
        y: px(115),
        w: px(30),
        h: px(178),
        text: `${getMatch().player1.games}\n${getMatch().player1.sets}\n\n${getMatch().player2.games}\n${getMatch().player2.sets}`,
        text_size: px(26),
        color: 0xffffff,
        align_h: align.RIGHT,
        align_v: align.CENTER_V
      })

      const serveImg = matchGroup.createWidget(widget.IMG, {
        x: px(SCREEN_WIDTH / 2 - 180),
        y: px(124),
        src: 'serve.png'
      })
      
      // Player 1 button
      const player1Button = matchGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 + 40),
        y: px(99),
        w: px(130),
        h: px(90),
        text: `${POINTS[getSettings().deuce][getMatch().player1.pointIndex]}`,
        text_size: px(40*1.3),
        color: 0x000000,
        radius: px(20),
        normal_color: 0xff00ff,
        press_color: 0xff85ff,
        click_func: () => {
          saveState()

          const finishedMatch = playerWonPoint(PLAYER_1)
          
          if (finishedMatch) {
            showMessage(finishedMatch)
            /* page.request({
              method: "MATCH_FINISHED",
              params: {
                match: finishedMatch
              }
            }).catch((error) => {
              page.log("Could not send match:", error)
            }) */
          }

          saveMatch()
          refreshUI()
        }
      })

      // Player 2 button
      const player2Button = matchGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 + 40),
        y: px(214),
        w: px(130),
        h: px(90),
        text: `${POINTS[getSettings().deuce][getMatch().player2.pointIndex]}`,
        text_size: px(40*1.3),
        color: 0x000000,
        radius: px(20),
        normal_color: 0x2fabff,
        press_color: 0x6dc4ff,

        click_func: () => {
          saveState()
          const finishedMatch = playerWonPoint(PLAYER_2)
          
          if (finishedMatch) {
            showMessage(finishedMatch)
            /* page.request({
              method: "MATCH_FINISHED",
              params: {
                match: finishedMatch
              }
            }).catch((error) => {
              page.log("Could not send match:", error)
            }) */
          }
          saveMatch()
          refreshUI()
        }
      })

      const undoButton = matchGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 60),
        y: px(SCREEN_HEIGHT - 150),
        w: px(120),
        h: px(80),
        normal_src: 'undo_normal.png',
        press_src: 'undo_press.png',
        
        click_func: () => {
          undo()
          if(getMatch().tieBreak === false){
            undoHelper()
          }
          saveMatch()
          refreshUI()
        },longpress_func: () => {
          saveState()
          resetMatch()
          saveMatch()
          refreshUI()
        }
      })

      const settingsButton = matchGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 + 60),
        y: px(SCREEN_HEIGHT - 150),
        w: px(100),
        h: px(80),
        normal_src: 'settings.png',
        press_src: 'settings_pressed.png',

        click_func: () => {
          if(getSport() === "badminton" || getSport() === "squash" || getSport() === "tableTennis"/*  || getSport() === "pickleball" */){
            showSpecialSettings()
          }
          else{
            showSettingsPage()
          }
        }
      })

      const widgetOptionalArray2 = [sport_data.HR]
      const heartRate = createWidget(widget.SPORT_DATA, {
        edit_id: 1,
        category: edit_widget_group_type.SPORTS,
        default_type: sport_data.HR,
        optional_types: widgetOptionalArray2,
        count: widgetOptionalArray2.length,
        x: px(SCREEN_WIDTH / 2 - 50),
        y: px(SCREEN_HEIGHT - 62) + TOP_OFFSET,
        w: px(150),
        h: px(50),
        rect_visible: false,
        line_color: 0x0000ff,
        text_size: px(33),

      })

      const hrImg = createWidget(widget.IMG, {
        x: px(SCREEN_WIDTH / 2 - 50),
        y: px(SCREEN_HEIGHT - 54) + TOP_OFFSET,
        src: 'heart.png'
      })

      const matchBackButton = matchGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 190),
        y: px(SCREEN_HEIGHT - 150),
        w: px(120),
        h: px(80),
        normal_src: 'backButton.png',
        press_src: 'backButton_selected.png',

        click_func: () => {
          showMenu()
        }
      })

      //MENU SCREEN
      
      const logo = menuGroup.createWidget(widget.IMG, {
        x: px(SCREEN_WIDTH / 2 - 50),
        y: px(80),
        src: 'logo.png'
      })

      const newGameButton = menuGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 140),
        y: px(200),
        w: px(280),
        h: px(60),
        text: `NEW GAME`,
        text_size: px(30),
        radius: px(15),
        normal_color: 0xff00ff,
        press_color: 0xff85ff,
        color: 0x000000,
        click_func: () => {
          
          newGameFlag = true
          newGameSettings = {
            ...getSettings()
          }
          showSports()
          
        }
      })   

      const resumeGameButton = menuGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 140),
        y: px(275),
        w: px(280),
        h: px(60),
        text: `RESUME GAME`,
        text_size: px(30),
        radius: px(15),
        normal_color: 0x2fabff,
        press_color: 0x6dc4ff,
        color: 0x000000,
        click_func: () => {
          showMatch()
          refreshUI()
        }
      }) 
      
      const sendMatch = menuGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 140),
        y: px(350),
        w: px(280),
        h: px(60),
        text: `SEND MATCH`,
        text_size: px(30),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0X444444,
        color: 0xffffff,
        click_func: () => {
          sendUnsentMatches()
        }
      })
      
      showMenu()
    },

    build() {
      this.init(this)
    },
    
    onInit() {
    },

    onDestroy() {},
  })
);
