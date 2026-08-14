import { createWidget, widget, align, text_style, sport_data, edit_widget_group_type, prop } from '@zos/ui'
import { localStorage } from "@zos/storage"
import { undoHelper, getMatch, getServer, resetMatch, playerWonPoint, saveState, undo } from './match'
import { POINTS, PLAYER_1, PLAYER_2, SCREEN_WIDTH, SCREEN_HEIGHT } from './constants'
import { saveMatch, loadMatch } from './storage'
import { getPointText } from './helpers'
import {getSettings, loadSettings, saveSettings, setFirstServe, setDeuce, setSets, getSets, getGames, setGames, getTieBreak, setTieBreak } from "./settings"
import { BasePage } from "@zeppos/zml/base-page";

let matchGroup
let settingsGroup
let deuceOption
let serveOption
let originalSettings
let moreSettingsGroup
let menuGroup

DataWidget(
  BasePage({
    init(page) {

      loadMatch()
      loadSettings()

      // Create display groups
      matchGroup = createWidget(widget.GROUP, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT
      })

      settingsGroup = createWidget(widget.GROUP, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT
      })

      moreSettingsGroup = createWidget(widget.GROUP, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT
      })

      menuGroup = createWidget(widget.GROUP, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT
      })

      function showMenu() {
        menuGroup.setProperty(prop.VISIBLE, true)
        matchGroup.setProperty(prop.VISIBLE, false)
        settingsGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        serveOption.setProperty(prop.VISIBLE, false)
        moreSettingsGroup.setProperty(prop.VISIBLE, false)
        tieBreakOption.setProperty(prop.VISIBLE, false)
        pingPongOption.setProperty(prop.VISIBLE, false)
      }

      function showMatch() {
        menuGroup.setProperty(prop.VISIBLE, false)
        matchGroup.setProperty(prop.VISIBLE, true)
        settingsGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        serveOption.setProperty(prop.VISIBLE, false)
        moreSettingsGroup.setProperty(prop.VISIBLE, false)
        tieBreakOption.setProperty(prop.VISIBLE, false)
        pingPongOption.setProperty(prop.VISIBLE, false)
        undoHelper()
        saveMatch()
        refreshUI()
      }

      function showSettings(flag = false) {
        
        if(!flag){
          originalSettings = JSON.parse(JSON.stringify(getSettings()))
          saveMatch()
        }
        menuGroup.setProperty(prop.VISIBLE, false)
        matchGroup.setProperty(prop.VISIBLE, false)
        settingsGroup.setProperty(prop.VISIBLE, true)
        deuceOption.setProperty(prop.VISIBLE, true)
        serveOption.setProperty(prop.VISIBLE, true)
        moreSettingsGroup.setProperty(prop.VISIBLE, false)
        moreSettingsGroup.setProperty(prop.VISIBLE, false)
        tieBreakOption.setProperty(prop.VISIBLE, false)
        pingPongOption.setProperty(prop.VISIBLE, false)
      }

      function showMoreSettings() {

        settingsGroup.setProperty(prop.VISIBLE, false)
        deuceOption.setProperty(prop.VISIBLE, false)
        serveOption.setProperty(prop.VISIBLE, false)
        moreSettingsGroup.setProperty(prop.VISIBLE, true)
        if(getSettings().pingPong === false){
          tieBreakOption.setProperty(prop.VISIBLE, true)
          tieBreakTypes.setProperty(prop.VISIBLE, true)
        }
        pingPongOption.setProperty(prop.VISIBLE, true)
      }
      
      // MORE SETTINGS SCREEN
      const setsText = moreSettingsGroup.createWidget(widget.TEXT, {
        x: 60,
        y: 35,
        w: 233,
        h: 170,
        text: `BEST OF`,
        text_size: 30,
        color: 0xffffff,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      })

      const setsNumber = moreSettingsGroup.createWidget(widget.TEXT, {
        x: SCREEN_WIDTH * 5 / 8 - 10,
        y: 95,
        w: 50,
        h: 50,
        text: `${getSets()}`,
        text_size: 50,
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const plusSetsButton = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: SCREEN_WIDTH * 3 / 4 + 15,
        y: 95,
        w: 60,
        h: 50,
        text: `+`,
        text_size: 40*1.3,
        color: 0xffffff,
        radius: 20,
        normal_color: 0x000000,
        press_color: 0xffffff,
        click_func: () => {
          setSets(true)
          setsNumber.setProperty(prop.TEXT, `${getSets()}`)
        }
      })

      const minusSetsButton = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: SCREEN_WIDTH / 2 - 35,
        y: 90,
        w: 60,
        h: 50,
        text: `-`,
        text_size: 80,
        color: 0xffffff,
        radius: 20,
        normal_color: 0x000000,
        press_color: 0xffffff,
        click_func: () => {
          setSets(false)
          setsNumber.setProperty(prop.TEXT, `${getSets()}`)
        }
      })

      const gamesText = moreSettingsGroup.createWidget(widget.TEXT, {
        x: 15,
        y: 115,
        w: 200,
        h: 170,
        text: `GAMES`,
        text_size: 30,
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const gamesNumber = moreSettingsGroup.createWidget(widget.TEXT, {
        x: SCREEN_WIDTH * 5 / 8 - 12,
        y: 175,
        w: 54,
        h: 50,
        text: `${getGames()}`,
        text_size: 50,
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const plusGamesButton = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: SCREEN_WIDTH * 3 / 4 + 15,
        y: 175,
        w: 60,
        h: 50,
        text: `+`,
        text_size: 40*1.3,
        color: 0xffffff,
        radius: 20,
        normal_color: 0x000000,
        press_color: 0xffffff,
        click_func: () => {
          setGames(true)
          gamesNumber.setProperty(prop.TEXT, `${getGames()}`)
        }
      })

      const minusGamesButton = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: SCREEN_WIDTH / 2 - 35,
        y: 170,
        w: 60,
        h: 50,
        text: `-`,
        text_size: 80,
        color: 0xffffff,
        radius: 20,
        normal_color: 0x000000,
        press_color: 0xffffff,
        click_func: () => {
          setGames(false)
          gamesNumber.setProperty(prop.TEXT, `${getGames()}`)
        }
      })

      const tieBreakText = moreSettingsGroup.createWidget(widget.TEXT, {
        x: 15,
        y: 195,
        w: 200,
        h: 170,
        text: `TIEBREAK`,
        text_size: 30,
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const tieBreakNumber = moreSettingsGroup.createWidget(widget.TEXT, {
        x: SCREEN_WIDTH * 5 / 8 - 12,
        y: 255,
        w: 56,
        h: 50,
        text: `${getTieBreak()}`,
        text_size: 50,
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const plusTieBreakButton = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: SCREEN_WIDTH * 3 / 4 + 15,
        y: 255,
        w: 60,
        h: 50,
        text: `+`,
        text_size: 40*1.3,
        color: 0xffffff,
        radius: 20,
        normal_color: 0x000000,
        press_color: 0xffffff,
        click_func: () => {
          setTieBreak(true)
          tieBreakNumber.setProperty(prop.TEXT, `${getTieBreak()}`)
        }
      })

      const minusTieBreakButton = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: SCREEN_WIDTH / 2 - 35,
        y: 250,
        w: 60,
        h: 50,
        text: `-`,
        text_size: 80,
        color: 0xffffff,
        radius: 20,
        normal_color: 0x000000,
        press_color: 0xffffff,
        click_func: () => {
          setTieBreak(false)
          tieBreakNumber.setProperty(prop.TEXT, `${getTieBreak()}`)
        }
      })

      const tieBreakTypes = moreSettingsGroup.createWidget(widget.TEXT, {
        x: 140,
        y: 320,
        w: SCREEN_WIDTH,
        h: 50,
        text: `On`,
        text_size: 26,
        color: 0x777777,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      })

      tieBreakOption = createWidget(widget.CHECKBOX_GROUP, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: 64,
        select_src: 'selected.png',
        unselect_src: 'unselected.png',
        check_func: (group, index, checked) => {
        
          getSettings().tieBreakMode = checked
          saveSettings()
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
      }) 

      const button5 = tieBreakOption.createWidget(widget.STATE_BUTTON, {
        x: 70,
        y: 320,
        w: 64,
        h: 54
      })
      if(getSettings().tieBreakMode === false){
        tieBreakOption.setProperty(prop.INIT, button5)
        tieBreakOption.setProperty(prop.UNCHECKED, button5)
      }
      else{
        tieBreakOption.setProperty(prop.INIT, button5)
      }

      pingPongOption = createWidget(widget.CHECKBOX_GROUP, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: 64,
        select_color: 0xffffff,
        unselect_color: 0x00000,
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
        x: 300,
        y: 320,
        w: 64,
        h: 54
      })

      if(getSettings().pingPong === false){
        pingPongOption.setProperty(prop.INIT, button6)
        pingPongOption.setProperty(prop.UNCHECKED, button6)
      }
      else{
        pingPongOption.setProperty(prop.INIT, button6)
      }

      const backButton2 = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: SCREEN_WIDTH / 2 - 60,
        y: SCREEN_HEIGHT - 135,
        w: 120,
        h: 80,
        normal_src: 'serve.png',
        press_src: 'undo_press.png',

        click_func: () => {
          saveSettings()
          
          refreshUI()
          showSettings(true, newGameFlag)
        }
      })


      // SETTINGS SCREEN
      const moreSettingsButton = settingsGroup.createWidget(widget.BUTTON, {
        x: SCREEN_WIDTH / 2 + 60,
        y: SCREEN_HEIGHT - 150,
        w: 100,
        h: 80,
        normal_src: 'settings6.png',
        press_src: 'settings_pressed.png',

        click_func: () => {
          showMoreSettings(newGameFlag)
        }
      })

      const deuceText = settingsGroup.createWidget(widget.TEXT, {
        x: 0,
        y: 65,
        w: SCREEN_WIDTH,
        h: 50,
        text: `DEUCE`,
        text_size: 30,
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })
      
      const deuceTypes = settingsGroup.createWidget(widget.TEXT, {
        x: SCREEN_WIDTH / 4 - 70,
        y: 147,
        w: SCREEN_WIDTH,
        h: 40,
        text: `SP              AD             GP`,
        text_size: 30,
        color: 0xffffff,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      })
      
      deuceOption = createWidget(widget.RADIO_GROUP, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: 60,
        select_src: 'selected.png',
        unselect_src: 'unselected.png',
        check_func: (group, index, checked) => {
          
          if (checked === true){     
            setDeuce(index)
          }
        }
      })
      
      const button1 = deuceOption.createWidget(widget.STATE_BUTTON, {
        x: SCREEN_WIDTH / 4 - 20,
        y: 140,
        w: 64,
        h: 64
      })
      const button2 = deuceOption.createWidget(widget.STATE_BUTTON, {
        x: SCREEN_WIDTH / 2,
        y: 140,
        w: 64,
        h: 64
      })
      const button3 = deuceOption.createWidget(widget.STATE_BUTTON, {
        x: SCREEN_WIDTH * 3 / 4 + 20,
        y: 140,
        w: 64,
        h: 64
      })

      const buttons = [button1, button2, button3]
      deuceOption.setProperty(prop.INIT, buttons[getSettings().deuce])
      
      const serveTypes = settingsGroup.createWidget(widget.TEXT, {
        x: 120,
        y: 280,
        w: SCREEN_WIDTH,
        h: 50,
        text: `Player 1`,
        text_size: 26,
        color: 0x777777,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      })

      const serveText = settingsGroup.createWidget(widget.TEXT, {
        x: 0,
        y: 220,
        w: SCREEN_WIDTH,
        h: 40,
        text: `FIRST SERVE`,
        text_size: 30,
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      serveOption = createWidget(widget.CHECKBOX_GROUP, {
        x: 0,
        y: 0,
        w: 480,
        h: 64,
        select_src: 'selected.png',
        unselect_src: 'unselected.png',
        check_func: (group, index, checked) => {
          setFirstServe(checked)
          saveSettings()
          if(checked){
            serveTypes.setProperty(prop.TEXT, 'Player 1')
          }
          else{
            serveTypes.setProperty(prop.TEXT, 'Player 2')
          }
        }
      })

      const button4 = serveOption.createWidget(widget.STATE_BUTTON, {
        x: 40,
        y: 280,
        w: 64,
        h: 54
      })
      
      if(getSettings().firstServe === false){
        serveOption.setProperty(prop.INIT, button4)
        serveOption.setProperty(prop.UNCHECKED, button4)
      }
      else{
        serveOption.setProperty(prop.INIT, button4)
      }

      function refreshUI() {
        
        const match = getMatch()

        player1Button.setProperty(prop.TEXT, getPointText(match.player1))
        player2Button.setProperty(prop.TEXT, getPointText(match.player2))
        serveImg.setProperty(prop.MORE, getServer())
        
        pointText.setProperty(
          prop.TEXT,
          `${match.player1.games}\n${match.player1.sets}\n\n${match.player2.games}\n${match.player2.sets}`
        )
      }

      const backButton = settingsGroup.createWidget(widget.BUTTON, {
        x: SCREEN_WIDTH / 2 - 60,
        y: SCREEN_HEIGHT - 135,
        w: 120,
        h: 80,
        normal_src: 'serve.png',
        press_src: 'undo_press.png',

        click_func: () => {
          saveSettings()
          
          if (originalSettings.firstServe != getSettings().firstServe || originalSettings.pingPong != getSettings().pingPong) {
            resetMatch()
            saveMatch()
          }
          
          refreshUI()
          showMatch()
        }
      })

      //SCOREBOARD SCREEN
      // Core text
      const baseText = matchGroup.createWidget(widget.TEXT, {
        x: SCREEN_WIDTH / 2 - 135,
        y: 116,
        w: 100,
        h: 173,
        text: `GAME\nSET\n\nGAME\nSET`,
        text_size: 26,
        color: 0x777777,
        align_h: align.RIGHT,
        align_v: align.CENTER_V
      })

      // Score text
      const pointText = matchGroup.createWidget(widget.TEXT, {
        x: SCREEN_WIDTH / 2 - 35,
        y: 116,
        w: 30,
        h: 173,
        text: `${getMatch().player1.games}\n${getMatch().player1.sets}\n\n${getMatch().player2.games}\n${getMatch().player2.sets}`,
        text_size: 26,
        color: 0xffffff,
        align_h: align.RIGHT,
        align_v: align.CENTER_V
      })

      const serveImg = matchGroup.createWidget(widget.IMG, {
        x: SCREEN_WIDTH / 2 - 180,
        y: 124,
        src: 'serve.png'
      })
      
      // Player 1 button
      const player1Button = matchGroup.createWidget(widget.BUTTON, {
        x: SCREEN_WIDTH / 2 + 40,
        y: 105,
        w: 130,
        h: 78,
        text: `${POINTS[getSettings().deuce][getMatch().player1.pointIndex]}`,
        text_size: 40*1.3,
        color: 0x000000,
        radius: 20,
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
            }).then((data) => {
              page.log("Match sent:", data)
            })
          }

          saveMatch()
          refreshUI()
        }
      })

      // Player 2 button
      const player2Button = matchGroup.createWidget(widget.BUTTON, {
        x: SCREEN_WIDTH / 2 + 40,
        y: 220,
        w: 130,
        h: 78,
        text: `${POINTS[getSettings().deuce][getMatch().player2.pointIndex]}`,
        text_size: 40*1.3,
        color: 0x000000,
        radius: 20,
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
            }).then((data) => {
              page.log("Match sent:", data)
            })
          }
          saveMatch()
          refreshUI()
        }
      })

      const undoButton = matchGroup.createWidget(widget.BUTTON, {
        x: SCREEN_WIDTH / 2 - 60,
        y: SCREEN_HEIGHT - 150,
        w: 120,
        h: 80,
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
        x: SCREEN_WIDTH / 2 + 60,
        y: SCREEN_HEIGHT - 150,
        w: 100,
        h: 80,
        normal_src: 'settings6.png',
        press_src: 'settings_pressed.png',

        click_func: () => {
          showSettings()
        }
      })

      const widgetOptionalArray2 = [sport_data.HR]
      const heartRate = createWidget(widget.SPORT_DATA, {
        edit_id: 1,
        category: edit_widget_group_type.SPORTS,
        default_type: sport_data.HR,
        optional_types: widgetOptionalArray2,
        count: widgetOptionalArray2.length,
        x: SCREEN_WIDTH / 2 - 50,
        y: SCREEN_HEIGHT - 62,
        w: 150,
        h: 50,
        rect_visible: false,
        line_color: 0x0000ff,
        text_size: 33,

      })

      const hrImg = createWidget(widget.IMG, {
        x: SCREEN_WIDTH / 2 - 50,
        y: SCREEN_HEIGHT - 54,
        src: 'heart.png'
      })
      
      /* showMatch()
      refreshUI() */

      //MENU SCREEN
      
      const title = menuGroup.createWidget(widget.TEXT, {
        x: SCREEN_WIDTH / 2 - 150,
        y: 35,
        w: 350,
        h: 170,
        text: `PADEL & TENNIS`,
        text_size: 40,
        color: 0xffffff,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      })

      const newGameButton = menuGroup.createWidget(widget.BUTTON, {
        x: SCREEN_WIDTH / 2 - 80,
        y: 160,
        w: 160,
        h: 50,
        text: `NEW GAME`,
        text_size: 30,
        color: 0xffffff,
        radius: 20,
        normal_color: 0x000000,
        press_color: 0xffffff,
        click_func: () => {
          
          resetMatch()
          saveMatch()
          
          refreshUI()
          showMatch()
          
        }
      })   

      const resumeGameButton = menuGroup.createWidget(widget.BUTTON, {
        x: SCREEN_WIDTH / 2 - 125,
        y: 230,
        w: 250,
        h: 50,
        text: `RESUME GAME`,
        text_size: 30,
        color: 0xffffff,
        radius: 20,
        normal_color: 0x000000,
        press_color: 0xffffff,
        click_func: () => {
          showMatch()
          refreshUI()
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