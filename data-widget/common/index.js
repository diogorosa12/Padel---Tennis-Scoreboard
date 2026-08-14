import { px } from "@zos/utils"
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
        x: px(0),
        y: px(0),
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })

      settingsGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: px(0),
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })

      moreSettingsGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: px(0),
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
      })

      menuGroup = createWidget(widget.GROUP, {
        x: px(0),
        y: px(0),
        w: px(SCREEN_WIDTH),
        h: px(SCREEN_HEIGHT)
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
        x: px(SCREEN_WIDTH * 5 / 8 - 10),
        y: px(95),
        w: px(50),
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
        press_color: 0xffffff,
        click_func: () => {
          setSets(true)
          setsNumber.setProperty(prop.TEXT, `${getSets()}`)
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
        press_color: 0xffffff,
        click_func: () => {
          setSets(false)
          setsNumber.setProperty(prop.TEXT, `${getSets()}`)
        }
      })

      const gamesText = moreSettingsGroup.createWidget(widget.TEXT, {
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

      const gamesNumber = moreSettingsGroup.createWidget(widget.TEXT, {
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

      const plusGamesButton = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH * 3 / 4 + 5),
        y: px(165),
        w: px(80),
        h: px(70),
        text: `+`,
        text_size: px(40*1.3),
        color: 0xffffff,
        radius: px(20),
        normal_color: 0x000000,
        press_color: 0xffffff,
        click_func: () => {
          setGames(true)
          gamesNumber.setProperty(prop.TEXT, `${getGames()}`)
        }
      })

      const minusGamesButton = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 45),
        y: px(160),
        w: px(80),
        h: px(70),
        text: `-`,
        text_size: px(80),
        color: 0xffffff,
        radius: px(20),
        normal_color: 0x000000,
        press_color: 0xffffff,
        click_func: () => {
          setGames(false)
          gamesNumber.setProperty(prop.TEXT, `${getGames()}`)
        }
      })

      const tieBreakText = moreSettingsGroup.createWidget(widget.TEXT, {
        x: px(15),
        y: px(195),
        w: px(200),
        h: px(170),
        text: `TIEBREAK`,
        text_size: px(30),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const tieBreakNumber = moreSettingsGroup.createWidget(widget.TEXT, {
        x: px(SCREEN_WIDTH * 5 / 8 - 15),
        y: px(255),
        w: px(60),
        h: px(50),
        text: `${getTieBreak()}`,
        text_size: px(50),
        color: 0xffffff,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })

      const plusTieBreakButton = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH * 3 / 4 + 5),
        y: px(245),
        w: px(80),
        h: px(70),
        text: `+`,
        text_size: px(40*1.3),
        color: 0xffffff,
        radius: px(20),
        normal_color: 0x000000,
        press_color: 0xffffff,
        click_func: () => {
          setTieBreak(true)
          tieBreakNumber.setProperty(prop.TEXT, `${getTieBreak()}`)
        }
      })

      const minusTieBreakButton = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 45),
        y: px(240),
        w: px(80),
        h: px(70),
        text: `-`,
        text_size: px(80),
        color: 0xffffff,
        radius: px(20),
        normal_color: 0x000000,
        press_color: 0xffffff,
        click_func: () => {
          setTieBreak(false)
          tieBreakNumber.setProperty(prop.TEXT, `${getTieBreak()}`)
        }
      })

      const tieBreakTypes = moreSettingsGroup.createWidget(widget.TEXT, {
        x: px(140),
        y: px(320),
        w: px(SCREEN_WIDTH),
        h: px(50),
        text: `On`,
        text_size: px(26),
        color: 0x777777,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      })

      tieBreakOption = createWidget(widget.CHECKBOX_GROUP, {
        x: px(0),
        y: px(0),
        w: px(SCREEN_WIDTH),
        h: px(64),
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
        x: px(70),
        y: px(320),
        w: px(70),
        h: px(70)
      })
      if(getSettings().tieBreakMode === false){
        tieBreakOption.setProperty(prop.INIT, button5)
        tieBreakOption.setProperty(prop.UNCHECKED, button5)
      }
      else{
        tieBreakOption.setProperty(prop.INIT, button5)
      }

      pingPongOption = createWidget(widget.CHECKBOX_GROUP, {
        x: px(0),
        y: px(0),
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
      }

      const pingPongText = moreSettingsGroup.createWidget(widget.TEXT, {
        x: px(SCREEN_WIDTH - 190),
        y: px(320),
        w: px(100),
        h: px(54),
        text: `TABLE\nTENNIS`,
        text_size: px(16),
        color: 0x777777,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      })

      const backButton2 = moreSettingsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 60),
        y: px(SCREEN_HEIGHT - 135),
        w: px(120),
        h: px(80),
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
        x: px(SCREEN_WIDTH / 2 + 60),
        y: px(SCREEN_HEIGHT - 150),
        w: px(100),
        h: px(80),
        normal_src: 'settings6.png',
        press_src: 'settings_pressed.png',

        click_func: () => {
          showMoreSettings(newGameFlag)
        }
      })

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
        y: px(0),
        w: px(SCREEN_WIDTH),
        h: px(60),
        select_src: 'selected.png',
        unselect_src: 'unselected.png',
        check_func: (group, index, checked) => {
          
          if (checked === true){     
            setDeuce(index)
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
        x: px(120),
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

      serveOption = createWidget(widget.CHECKBOX_GROUP, {
        x: px(0),
        y: px(0),
        w: px(480),
        h: px(64),
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
        x: px(40),
        y: px(280),
        w: px(70),
        h: px(70)
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
        
        const serverPosition = getServer()
        
        serveImg.setProperty(prop.MORE, {
          y: px(serverPosition.y)
        })
        //serveImg.setProperty(prop.MORE, getServer())
        
        pointText.setProperty(
          prop.TEXT,
          `${match.player1.games}\n${match.player1.sets}\n\n${match.player2.games}\n${match.player2.sets}`
        )
      }

      const backButton = settingsGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 60),
        y: px(SCREEN_HEIGHT - 135),
        w: px(120),
        h: px(80),
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
            }).then((data) => {
              page.log("Match sent:", data)
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
        x: px(SCREEN_WIDTH / 2 - 50),
        y: px(SCREEN_HEIGHT - 62),
        w: px(150),
        h: px(50),
        rect_visible: false,
        line_color: 0x0000ff,
        text_size: px(33),

      })

      const hrImg = createWidget(widget.IMG, {
        x: px(SCREEN_WIDTH / 2 - 50),
        y: px(SCREEN_HEIGHT - 54),
        src: 'heart.png'
      })
      
      /* showMatch()
      refreshUI() */

      //MENU SCREEN
      
      const title = menuGroup.createWidget(widget.TEXT, {
        x: px(SCREEN_WIDTH / 2 - 150),
        y: px(35),
        w: px(350),
        h: px(170),
        text: `PADEL & TENNIS`,
        text_size: px(40),
        color: 0xffffff,
        align_h: align.LEFT,
        align_v: align.CENTER_V
      })

      const newGameButton = menuGroup.createWidget(widget.BUTTON, {
        x: px(SCREEN_WIDTH / 2 - 80),
        y: px(160),
        w: px(160),
        h: px(50),
        text: `NEW GAME`,
        text_size: px(30),
        color: 0xffffff,
        radius: px(20),
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
        x: px(SCREEN_WIDTH / 2 - 125),
        y: px(230),
        w: px(250),
        h: px(50),
        text: `RESUME GAME`,
        text_size: px(30),
        color: 0xffffff,
        radius: px(20),
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
