import { getDeviceInfo, SCREEN_SHAPE_SQUARE } from "@zos/device"
import { px } from "@zos/utils"
import { createWidget, widget, align, text_style, sport_data, edit_widget_group_type, prop } from '@zos/ui'
import { localStorage } from "@zos/storage"
import { undoHelper, getMatch, getServer, resetMatch, playerWonPoint, saveState, undo } from './match'
import { POINTS, PLAYER_1, PLAYER_2, SCREEN_WIDTH, SCREEN_HEIGHT } from './constants'
import { saveMatch, loadMatch } from './storage'
import { getPointText } from './helpers'
import { updateSettings, getSettings, loadSettings, saveSettings, setFirstServe, setDeuce, setSport, setSets, getSets, getGames, setGames, getTieBreak, setTieBreak } from "./settings"
import { BasePage } from "@zeppos/zml/base-page";

let matchGroup
let settingsGroup
let deuceOption
let serveOption
let sportOption
let originalSettings
let moreSettingsGroup
let menuGroup
let settingsPageGroup
let sportsPageGroup
let tieBreakGroup
let gamesGroup
let newGameFlag = false
let menuFlag = false
let newGameSettings
let settingsPage = 1
let backAndAcceptGroup
/* let newGameSettings = {
  sport: getSettings().sport,
  firstServe: getSettings().firstServe,
  deuce: getSettings().deuce,
  bestOf: getSettings().bestOf,
  games: getSettings().games,
  tieBreak: getSettings().tieBreak,
  tieBreakMode: getSettings().tieBreakMode,
} */



const { screenShape } = getDeviceInfo()

const TOP_OFFSET = screenShape === SCREEN_SHAPE_SQUARE ? 60 + px(0) : 0

DataWidget(
  BasePage({
    init(page) {

      loadMatch()
      loadSettings()


      function updateMoreSettingsUI() {

        const setting = newGameFlag === true ? newGameSettings : getSettings()
        //const setting = newGameSettings

        if(setting.sport === "padel" || setting.sport === "tennis") {
          /* setting.tieBreak = 7
          setting.games = 6 */
          gamesNumber.setProperty(prop.TEXT, `${setting.games}`)
          tieBreakGroup.setProperty(prop.VISIBLE, false)
          superTieBreakText.setProperty(prop.VISIBLE, true)
          superTieBreakOption.setProperty(prop.VISIBLE, true)
          gamesGroup.setProperty(prop.VISIBLE, true)
        }
        if(setting.sport === "tableTennis" || setting.sport === "pickleball" || setting.sport === "squash" || setting.sport === "badminton") {
          //setting.tieBreak = 11
          tieBreakText.setProperty(prop.VISIBLE, true)
          tieBreakText.setProperty(prop.TEXT, "POINTS")
          tieBreakGroup.setProperty(prop.VISIBLE, true)
          superTieBreakText.setProperty(prop.VISIBLE, false)
          superTieBreakOption.setProperty(prop.VISIBLE, false)
          gamesGroup.setProperty(prop.VISIBLE, false)
        }
        /* if(setting.sport === "pickleball") {
          //setting.tieBreak = 11
          tieBreakText.setProperty(prop.VISIBLE, true)
          tieBreakText.setProperty(prop.TEXT, "POINTS")
          tieBreakGroup.setProperty(prop.VISIBLE, true)
          superTieBreakText.setProperty(prop.VISIBLE, false)
        }
        if(setting.sport === "squash") {
          //setting.tieBreak = 11
          tieBreakText.setProperty(prop.VISIBLE, true)
          tieBreakText.setProperty(prop.TEXT, "POINTS")
          tieBreakGroup.setProperty(prop.VISIBLE, true)
          superTieBreakText.setProperty(prop.VISIBLE, false)
        }
        if(setting.sport === "badminton") {
          //setting.tieBreak = 21
          tieBreakText.setProperty(prop.VISIBLE, true)
          tieBreakText.setProperty(prop.TEXT, "POINTS")
          tieBreakGroup.setProperty(prop.VISIBLE, true)
          superTieBreakText.setProperty(prop.VISIBLE, false)
        } */
      }
     
      function updateSettingsUI() {

        const setting = newGameFlag === true ? newGameSettings : getSettings()
        
        deuceOption.setProperty(prop.CHECKED, buttons[setting.deuce])
      
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
          console.log("padel")
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
          console.log("tennis")
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
          console.log("tableTennis")
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
          console.log("pickleball")
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
          console.log("squash")
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
          console.log("badminton")
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

      settingsGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })

      moreSettingsGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })

      menuGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })

      settingsPageGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })

      sportsPageGroup = createWidget(widget.GROUP, {
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
      tieBreakGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: px(0) + TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })
      gamesGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: px(0) + TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })


      function showMenu() {
        settingsPageGroup.setProperty(prop.VISIBLE, false)
        menuGroup.setProperty(prop.VISIBLE, true)
        matchGroup.setProperty(prop.VISIBLE, false)
        settingsGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        serveOption.setProperty(prop.VISIBLE, false)
        moreSettingsGroup.setProperty(prop.VISIBLE, false)
        //tieBreakOption.setProperty(prop.VISIBLE, false)
        sportsPageGroup.setProperty(prop.VISIBLE, false)
        backAndAcceptGroup.setProperty(prop.VISIBLE, false)
        tieBreakGroup.setProperty(prop.VISIBLE, false)
        superTieBreakOption.setProperty(prop.VISIBLE, false)
        settingsBackButton.setProperty(prop.VISIBLE, false)
        gamesGroup.setProperty(prop.VISIBLE, false)
      }

      function showMatch() {
        settingsPageGroup.setProperty(prop.VISIBLE, false)
        menuGroup.setProperty(prop.VISIBLE, false)
        matchGroup.setProperty(prop.VISIBLE, true)
        settingsGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        serveOption.setProperty(prop.VISIBLE, false)
        moreSettingsGroup.setProperty(prop.VISIBLE, false)
        //tieBreakOption.setProperty(prop.VISIBLE, false)
        sportsPageGroup.setProperty(prop.VISIBLE, false)
        backAndAcceptGroup.setProperty(prop.VISIBLE, false)
        tieBreakGroup.setProperty(prop.VISIBLE, false)
        superTieBreakOption.setProperty(prop.VISIBLE, false)
        settingsBackButton.setProperty(prop.VISIBLE, false)
        gamesGroup.setProperty(prop.VISIBLE, false)
        undoHelper()
        saveMatch()
        refreshUI()
      }

      function showSettings() {
        
        updateSettingsUI()
        settingsPageGroup.setProperty(prop.VISIBLE, false)
        menuGroup.setProperty(prop.VISIBLE, false)
        matchGroup.setProperty(prop.VISIBLE, false)
        settingsGroup.setProperty(prop.VISIBLE, true)
        deuceOption.setProperty(prop.VISIBLE, true)
        serveOption.setProperty(prop.VISIBLE, true)
        moreSettingsGroup.setProperty(prop.VISIBLE, false)
        moreSettingsGroup.setProperty(prop.VISIBLE, false)
        //tieBreakOption.setProperty(prop.VISIBLE, false)
        sportsPageGroup.setProperty(prop.VISIBLE, false)
        tieBreakGroup.setProperty(prop.VISIBLE, false)
        superTieBreakOption.setProperty(prop.VISIBLE, false)
        gamesGroup.setProperty(prop.VISIBLE, false)
        /* if (newGameFlag) {
          backButton.setProperty(prop.VISIBLE, false)
        }
        else {
          backButton.setProperty(prop.VISIBLE, true)
        } */
      }

      function showMoreSettings() {
        updateMoreSettingsUI()

        settingsPageGroup.setProperty(prop.VISIBLE, false)
        settingsGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        serveOption.setProperty(prop.VISIBLE, false)
        moreSettingsGroup.setProperty(prop.VISIBLE, true)
        sportsPageGroup.setProperty(prop.VISIBLE, false)
        
        /* if (newGameFlag) {
          backButton2.setProperty(prop.VISIBLE, false)
        }
        else {
          backButton2.setProperty(prop.VISIBLE, true)
        } */
      }

      function showSettingsPage(flag = false) {
        if(!flag){
          originalSettings = JSON.parse(JSON.stringify(getSettings()))
          saveMatch()
        }

        settingsPageGroup.setProperty(prop.VISIBLE, true)
        menuGroup.setProperty(prop.VISIBLE, false)
        matchGroup.setProperty(prop.VISIBLE, false)
        settingsGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        serveOption.setProperty(prop.VISIBLE, false)
        moreSettingsGroup.setProperty(prop.VISIBLE, false)
        //tieBreakOption.setProperty(prop.VISIBLE, false)
        sportsPageGroup.setProperty(prop.VISIBLE, false)
        tieBreakGroup.setProperty(prop.VISIBLE, false)
        superTieBreakOption.setProperty(prop.VISIBLE, false)
        settingsBackButton.setProperty(prop.VISIBLE, true)
        gamesGroup.setProperty(prop.VISIBLE, false)
      }

      function showSportsPage() {

        resetSport()
        colorSport()
        backAndAcceptGroup.setProperty(prop.VISIBLE, true)
        sportsPageGroup.setProperty(prop.VISIBLE, true)
        settingsPageGroup.setProperty(prop.VISIBLE, false)
        menuGroup.setProperty(prop.VISIBLE, false)
        matchGroup.setProperty(prop.VISIBLE, false)
        settingsGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        serveOption.setProperty(prop.VISIBLE, false)
        moreSettingsGroup.setProperty(prop.VISIBLE, false)
        //tieBreakOption.setProperty(prop.VISIBLE, false)        
        tieBreakGroup.setProperty(prop.VISIBLE, false)
        superTieBreakOption.setProperty(prop.VISIBLE, false)
      }
      
      // SPORTS PAGE

      const padelButton = sportsPageGroup.createWidget(widget.BUTTON, {
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

      const tennisButton = sportsPageGroup.createWidget(widget.BUTTON, {
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
      
      const tableTennisButton = sportsPageGroup.createWidget(widget.BUTTON, {
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

      const pickleballButton = sportsPageGroup.createWidget(widget.BUTTON, {
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

      const squashButton = sportsPageGroup.createWidget(widget.BUTTON, {
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

      const badmintonButton = sportsPageGroup.createWidget(widget.BUTTON, {
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

      /* const otherButton = sportsPageGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 + 5),
        y: px(260),
        w: px(200),
        h: px(50),
        text: `OTHER`,
        text_size: px(22),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0x05480d,
        color: 0xffffff,        
        click_func: () => {

          setSport("other")

          padelButton.setProperty(prop.MORE, {
            x: px(SCREEN_WIDTH / 2 - 205),
            y: px(140),
            w: px(200),
            h: px(50),
            normal_color: 0x252525,
            press_color: 0x05480d,
          })

          tennisButton.setProperty(prop.MORE, {
            x: px(SCREEN_WIDTH / 2 + 5),
            y: px(140),
            w: px(200),
            h: px(50),
            normal_color: 0x252525,
            press_color: 0x05480d,
          })

          tableTennisButton.setProperty(prop.MORE, {
            x: px(SCREEN_WIDTH / 2 - 205),
            y: px(200),
            w: px(200),
            h: px(50),
            normal_color: 0x252525,
            press_color: 0x05480d,
          })

          pickleballButton.setProperty(prop.MORE, {
            x: px(SCREEN_WIDTH / 2 + 5),
            y: px(200),
            w: px(200),
            h: px(50),
            normal_color: 0x252525,
            press_color: 0x05480d,
          })

          squashButton.setProperty(prop.MORE, {
            x: px(SCREEN_WIDTH / 2 - 205),
            y: px(260),
            w: px(200),
            h: px(50),
            normal_color: 0x252525,
            press_color: 0x05480d,
          })

          otherButton.setProperty(prop.MORE, {
            x: px(SCREEN_WIDTH / 2 + 5),
            y: px(260),
            w: px(200),
            h: px(50),
            normal_color: 0x05480d,
            press_color: 0x05480d,
          })
        }
      }) */


      /* const sportsBackButton = sportsPageGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 60),
        y: px(SCREEN_HEIGHT - 145),
        w: px(120),
        h: px(80),
        normal_src: 'backButton.png',
        press_src: 'backButton_selected.png',

        click_func: () => {
          updateSettings()
          saveSettings()
          
          showSettingsPage(true)
        }
      }) */

      const sportsBackButton = backAndAcceptGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 155),
        y: px(SCREEN_HEIGHT - 135),
        w: px(120),
        h: px(80),
        normal_src: 'backButton.png',
        press_src: 'backButton_selected.png',

        click_func: () => {
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
            
          }
          if(settingsPage === 2) {
            settingsPage--
            showSportsPage()
          }
          if(settingsPage === 3) {
            settingsPage--
            showSettings()
            
          }
        }
      })

      const acceptSport = backAndAcceptGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 + 35),
        y: px(SCREEN_HEIGHT - 135),
        w: px(120),
        h: px(80),
        normal_src: 'check.png',
        press_src: 'Imagem4.png',

        click_func: () => {
          if(settingsPage === 1) {
            showSettings()
          }
          if(settingsPage === 2) {
            showMoreSettings()
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
          settingsPage++
        }
      })


      // SETTINGS PAGE 

      /* const settingsTitle = settingsPageGroup.createWidget(widget.TEXT, {
        x: px(0),
        y: px(35),
        w: px(SCREEN_WIDTH),
        h: px(170),
        text: `SETTINGS`,
        text_size: px(40),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      }) */

      const deuceSettingsButton = settingsPageGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 140),
        y: px(130),
        w: px(280),
        h: px(50),
        text: `DEUCE/SERVE`,
        text_size: px(30),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0X444444,
        color: 0xffffff,
        click_func: () => {
          settingsPage = 2
          showSettings()
        }
      })   

      const pointsSettingsButton = settingsPageGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 140),
        y: px(200),
        w: px(280),
        h: px(50),
        text: `POINTS`,
        text_size: px(30),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0X444444,
        color: 0xffffff,
        click_func: () => {
          settingsPage = 3
          showMoreSettings()
        }
      }) 
      
      /* const sportSettingsButton = settingsPageGroup.createWidget(widget.BUTTON, {
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
          showSportsPage()
        }
      }) */

      const settingsBackButton = createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 60),
        y: px(SCREEN_HEIGHT - 145),
        w: px(120),
        h: px(80),
        normal_src: 'backButton.png',
        press_src: 'backButton_selected.png',

        click_func: () => {
          if (settingsPage === 1) {

            if (originalSettings.firstServe != getSettings().firstServe /* || originalSettings.pingPong != getSettings().pingPong */) {
              resetMatch()
              saveMatch()
            }
  
            if(menuFlag){
              showMenu()
              menuFlag = false
            }
            else{
              refreshUI()
              showMatch()
            }
          }
          //DEUCE SETTINGS
          if (settingsPage === 2) {
            saveSettings()            
            showSettingsPage(true)
            settingsPage = 1
          }
          //POINTS SETTINGS
          if (settingsPage === 3) {
            saveSettings()
            showSettingsPage(true)
            settingsPage = 1
          }
        }
      })

      /* const sendMatch = settingsPageGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 140),
        y: px(380),
        w: px(280),
        h: px(50),
        text: `SEND MATCH`,
        text_size: px(30),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0x05480d,
        color: 0xffffff,        
        click_func: () => {
        }
      }) */

      // MORE SETTINGS SCREEN

      /* const pointsBackButton = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 160),
        y: px(SCREEN_HEIGHT - 145),
        w: px(120),
        h: px(80),
        normal_src: 'backButton.png',
        press_src: 'backButton_selected.png',

        click_func: () => {
          showSettings()
        }
      }) */

      /* const acceptPointsButton = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 + 60),
        y: px(SCREEN_HEIGHT - 145),
        w: px(120),
        h: px(80),
        normal_src: 'backButton.png',
        press_src: 'backButton_selected.png',

        click_func: () => {
          updateSettings(newGameSettings)
          saveSettings()
          
          resetMatch()
          saveMatch()
          
          refreshUI()
          showMatch()
          newGameFlag = false
        }
      }) */


      const setsText = moreSettingsGroup.createWidget(widget.TEXT, {
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

      const setsNumber = moreSettingsGroup.createWidget(widget.TEXT, {
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

      const plusSetsButton = moreSettingsGroup.createWidget(widget.BUTTON, {
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
          if (newGameFlag && newGameSettings.bestOf < 15) {
            newGameSettings.bestOf += 2
            setsNumber.setProperty(prop.TEXT, `${newGameSettings.bestOf}`)
          }
          if (!newGameFlag){
            setSets(true)
            setsNumber.setProperty(prop.TEXT, `${getSets()}`)
          }
          
        }
      })

      const minusSetsButton = moreSettingsGroup.createWidget(widget.BUTTON, {
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
        y: px(115),
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
        y: px(175),
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
        y: px(165),
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
        y: px(160),
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

      
      const superTieBreakText = moreSettingsGroup.createWidget(widget.TEXT, {
        x: px(58),
        y: px(250),
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
        y: px(255),
        w: px(84),
        h: px(58),
        select_bg: 'switch_on.png',
        un_select_bg: 'switch_off.png',
        slide_src: 'radio_select.png',
        slide_select_x: 32,
        slide_un_select_x: 8,
        //checked: true,
        checked_change_func: (slideSwitch, checked) => {
          if (newGameFlag) {
            newGameSettings.tieBreakMode = checked
          }
          else{
            getSettings().tieBreakMode = checked
            //saveSettings()
          }
        }
      })
      if (getSettings().tieBreakMode){
        superTieBreakOption.setProperty(prop.CHECKED, true)
      }
      else{
        superTieBreakOption.setProperty(prop.CHECKED, false)
      }
      
      const tieBreakText = tieBreakGroup.createWidget(widget.TEXT, {
        x: px(15),
        y: px(115),
        w: px(200),
        h: px(170),
        text: `POINTS`,
        text_size: px(30),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const tieBreakNumber = tieBreakGroup.createWidget(widget.TEXT, {
        x: px(SCREEN_WIDTH * 5 / 8 - 12),
        y: px(175),
        w: px(60),
        h: px(50),
        text: `${getTieBreak()}`,
        text_size: px(50),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const plusTieBreakButton = tieBreakGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH * 3 / 4 + 5),
        y: px(165),
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

      const minusTieBreakButton = tieBreakGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 45),
        y: px(160),
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

      /* const tieBreakTypes = moreSettingsGroup.createWidget(widget.TEXT, {
        x: px(140),
        y: px(320),
        w: px(SCREEN_WIDTH),
        h: px(50),
        text: `On`,
        text_size: px(26),
        color: 0x777777,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      }) */

      /* tieBreakOption = createWidget(widget.CHECKBOX_GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(64),
        select_src: 'selected.png',
        unselect_src: 'unselected.png',
        check_func: (group, index, checked) => {
        
          getSettings().tieBreakMode = checked
          //saveSettings()
          if(checked){
            tieBreakTypes.setProperty(prop.TEXT, 'On')
            setTieBreak(10)
            tieBreakNumber.setProperty(prop.TEXT, `${getTieBreak()}`)

          }
          else{
            tieBreakTypes.setProperty(prop.TEXT, 'Off')
            setTieBreak(7)
            tieBreakNumber.setProperty(prop.TEXT, `${getTieBreak()}`)
          }
        }
      }) */ 

      /* const button5 = tieBreakOption.createWidget(widget.STATE_BUTTON, {
        x: px(70),
        y: px(320),
        w: px(70),
        h: px(70)
      })
      tieBreakOption.setProperty(prop.INIT, button5)
      if(getSettings().tieBreakMode === false){
        tieBreakOption.setProperty(prop.UNCHECKED, button5)
      } */

      /* pingPongOption = createWidget(widget.CHECKBOX_GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(SCREEN_WIDTH),
        h: px(64),
        select_src: 'selected.png',
        unselect_src: 'unselected.png',
        check_func: (group, index, checked) => {
          getSettings().pingPong = checked
          if(checked){
            tieBreakOption.setProperty(prop.UNCHECKED, button5)
            tieBreakText.setProperty(prop.TEXT, 'POINTS')
            tieBreakOption.setProperty(prop.VISIBLE, false) 
            tieBreakTypes.setProperty(prop.VISIBLE, false)  

            setTieBreak(11)
            tieBreakNumber.setProperty(prop.TEXT, `${getTieBreak()}`)
            setGames(2)
            gamesNumber.setProperty(prop.TEXT, `${getGames()}`)
          }
          if(checked === false){
            tieBreakText.setProperty(prop.TEXT, 'TIEBREAK')
            tieBreakOption.setProperty(prop.VISIBLE, true)        
            tieBreakTypes.setProperty(prop.VISIBLE, true)     
            setTieBreak(7)
            tieBreakNumber.setProperty(prop.TEXT, `${getTieBreak()}`)
            setGames(7)
            gamesNumber.setProperty(prop.TEXT, `${getGames()}`)
          }
          saveSettings()     
          
        }
      })

      const button6 = pingPongOption.createWidget(widget.STATE_BUTTON, {
        x: px(SCREEN_WIDTH - 120),
        y: px(320),
        w: px(70),
        h: px(70),
      })

      if(getSettings().pingPong === false){
        pingPongOption.setProperty(prop.INIT, button6)
        pingPongOption.setProperty(prop.UNCHECKED, button6)
      }
      else{
        pingPongOption.setProperty(prop.INIT, button6)
      } */

      /* const pingPongText = moreSettingsGroup.createWidget(widget.TEXT, {
        x: px(SCREEN_WIDTH - 190),
        y: px(320),
        w: px(100),
        h: px(54),
        text: `TABLE\nTENNIS`,
        text_size: px(18),
        color: 0x777777,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      }) */

      /* const backButton2 = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 60),
        y: px(SCREEN_HEIGHT - 145),
        w: px(120),
        h: px(80),
        normal_src: 'backButton.png',
        press_src: 'backButton_selected.png',

        click_func: () => {
          saveSettings()
          //refreshUI()
          showSettingsPage(true)
          //showSettings(true, newGameFlag)
        }
      }) */


      // SETTINGS SCREEN
      /* const moreSettingsButton = settingsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 + 60),
        y: px(SCREEN_HEIGHT - 150),
        w: px(100),
        h: px(80),
        normal_src: 'settings.png',
        press_src: 'settings_pressed.png',

        click_func: () => {
          showMoreSettings(newGameFlag)
        }
      }) */

      /* const deuceBackButton = settingsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 160),
        y: px(SCREEN_HEIGHT - 145),
        w: px(120),
        h: px(80),
        normal_src: 'backButton.png',
        press_src: 'backButton_selected.png',

        click_func: () => {
          showSportsPage()
        }
      }) */

      /* const acceptDeuce = settingsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 + 60),
        y: px(SCREEN_HEIGHT - 145),
        w: px(120),
        h: px(80),
        normal_src: 'backButton.png',
        press_src: 'backButton_selected.png',

        click_func: () => {

          showMoreSettings()
        }
      }) */

      const deuceText = settingsGroup.createWidget(widget.TEXT, {
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
      
      const deuceTypes = settingsGroup.createWidget(widget.TEXT, {
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
              //console.log("new", newGameSettings.deuce)
            }
            else{
              setDeuce(index)
            }
            //console.log("deuce", getSettings().deuce)
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
      
      const serveTypes = settingsGroup.createWidget(widget.TEXT, {
        x: px(70),
        y: px(280),
        w: px(SCREEN_WIDTH),
        h: px(50),
        text: `Player 1`,
        text_size: px(26),
        color: 0x777777,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      })

      const serveText = settingsGroup.createWidget(widget.TEXT, {
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
        y: px(275),
        w: px(84),
        h: px(58),
        select_bg: 'switch_on.png',
        un_select_bg: 'switch_off.png',
        slide_src: 'radio_select.png',
        slide_select_x: 32,
        slide_un_select_x: 8,
        //checked: true,
        checked_change_func: (slideSwitch, checked) => {
          if (newGameFlag) {
            newGameSettings.firstServe = checked
          }
          else{
            setFirstServe(checked)
          }
          if(checked){
            serveTypes.setProperty(prop.TEXT, 'Player 1')
          }
          else{
            serveTypes.setProperty(prop.TEXT, 'Player 2')            
          }
        }
      })
      if (getSettings().firstServe){
        serveOption.setProperty(prop.CHECKED, true)
      }
      else{
        serveOption.setProperty(prop.CHECKED, false)
        serveTypes.setProperty(prop.TEXT, 'Player 2')
      }

      /* serveOption = createWidget(widget.CHECKBOX_GROUP, {
        x: px(0),
        y: TOP_OFFSET,
        w: px(480),
        h: px(64),
        select_src: 'selected.png',
        unselect_src: 'unselected.png',
        check_func: (group, index, checked) => {
          if (newGameFlag) {
            newGameSettings.firstServe = checked
          }
          else{
            setFirstServe(checked)
            saveSettings()  
          }
          if(checked){
            serveTypes.setProperty(prop.TEXT, 'Player 1')
          }
          else{
            serveTypes.setProperty(prop.TEXT, 'Player 2')
          }
        }
      })

      const button4 = serveOption.createWidget(widget.STATE_BUTTON, {
        x: px(60),
        y: px(270),
        w: px(70),
        h: px(70)
      })
      
      serveOption.setProperty(prop.INIT, button4)
      if(getSettings().firstServe === false){
        serveOption.setProperty(prop.UNCHECKED, button4)
      } */

      function refreshUI() {
        
        const match = getMatch()

        
        player1Button.setProperty(prop.TEXT, getPointText(match.player1))
        player2Button.setProperty(prop.TEXT, getPointText(match.player2))
        
        const serverPosition = getServer()
        
        serveImg.setProperty(prop.MORE, {
          y: px(serverPosition.y)
        })
        
        pointText.setProperty(
          prop.TEXT,
          `${match.player1.games}\n${match.player1.sets}\n\n${match.player2.games}\n${match.player2.sets}`
        )
      }

      /* const backButton = settingsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 60),
        y: px(SCREEN_HEIGHT - 145),
        w: px(120),
        h: px(80),
        normal_src: 'backButton.png',
        press_src: 'backButton_selected.png',

        click_func: () => {
          saveSettings()
          
          /* if (originalSettings.firstServe != getSettings().firstServe || originalSettings.pingPong != getSettings().pingPong) {
            resetMatch()
            saveMatch()
          } 
          
          showSettingsPage(true)
          
        }
      }) */

      //SCOREBOARD SCREEN
      // Core text
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
            page.request({
              method: "MATCH_FINISHED",
              params: {
                match: finishedMatch
              }
            }).catch((error) => {
              page.log("Could not send match:", error)
            })
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
            page.request({
              method: "MATCH_FINISHED",
              params: {
                match: finishedMatch
              }
            }).catch((error) => {
              page.log("Could not send match:", error)
            })
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
          showSettingsPage()
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
      
      const title = menuGroup.createWidget(widget.TEXT, {
        x: px(0),
        y: px(35),
        w: px(SCREEN_WIDTH),
        h: px(170),
        text: `PADEL & TENNIS`,
        text_size: px(40),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const newGameButton = menuGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 140),
        y: px(170),
        w: px(280),
        h: px(50),
        text: `NEW GAME`,
        text_size: px(30),
        radius: px(15),
        /* color: 0xffffff,
        normal_color: 0x000000,
        press_color: 0xffffff, */
        normal_color: 0xff00ff,
        press_color: 0xff85ff,
        color: 0x000000,
        click_func: () => {
          
          newGameFlag = true
          newGameSettings = {
            ...getSettings()
          }
          showSportsPage()

          //remove
          /* resetMatch()
          saveMatch()
          
          refreshUI()
          showMatch() */
          
        }
      })   

      const resumeGameButton = menuGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 140),
        y: px(240),
        w: px(280),
        h: px(50),
        text: `RESUME GAME`,
        text_size: px(30),
        radius: px(15),
        /* color: 0xffffff,
        normal_color: 0x000000,
        press_color: 0xffffff, */
        normal_color: 0x2fabff,
        press_color: 0x6dc4ff,
        color: 0x000000,
        click_func: () => {
          showMatch()
          refreshUI()
        }
      }) 
      
      /* const menuSettingsButton = menuGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 140),
        y: px(310),
        w: px(280),
        h: px(50),
        text: `SETTINGS`,
        text_size: px(30),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0X444444,
        color: 0xffffff,
        click_func: () => {
          showSettingsPage()
          menuFlag = true
        }
      }) */

      const sendMatch = menuGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 140),
        y: px(310),
        w: px(280),
        h: px(50),
        text: `SEND MATCH`,
        text_size: px(30),
        radius: px(15),
        normal_color: 0x252525,
        press_color: 0X444444,
        color: 0xffffff,
        click_func: () => {
        }
      })
      
      showMenu()
      //showSportsPage()
    },

    build() {
      this.init(this)
    },
    
    onInit() {
    },

    onDestroy() {},
  })
);
