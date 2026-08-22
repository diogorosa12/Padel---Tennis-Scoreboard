import { localStorage } from "@zos/storage"

import {SETTINGS_KEY, SETS} from "./constants"

let settings = {
  deuce: 0,
  firstServe: true,
  bestOf: 1,
  games: 6,
  tieBreak: 7,
  tieBreakMode: false,
  sport: "padel",
  normalPoints: false,
  doubles: false
}


export function updateSettings(newSettings) {
  Object.assign(settings, newSettings)
  if (newSettings.sport === "padel" || newSettings.sport === "tennis"){
    settings.normalPoints = false
    settings.doubles = false
  }
  if (newSettings.sport === "tableTennis"|| newSettings.sport === "squash" || newSettings.sport === "badminton"){
    settings.normalPoints = true
    settings.tieBreakMode = false    
    settings.doubles = false
  }
  if (newSettings.sport === "pickleball"){
    settings.normalPoints = true
    settings.tieBreakMode = false
  }
  if (newSettings.sport === "squash"){
  }
  if (newSettings.sport === "badminton"){
  }
}
export function getTieBreak() {
  return settings.tieBreak
}
export function setTieBreak(signal) {
  if(signal === true && settings.tieBreak < 50){
    settings.tieBreak++
  }
  else if(signal === false && settings.tieBreak > 1){
    settings.tieBreak--
  }
  else if(signal != true && signal != false){
    settings.tieBreak = signal
  }
}

export function getSets() {
  return settings.bestOf
}
export function setSets(signal) {
    if(signal === true && settings.bestOf < 7){

    settings.bestOf = settings.bestOf + 2
  }
  if(signal === false && settings.bestOf > 1){
    settings.bestOf = settings.bestOf - 2
  }
}

export function setDoubles(value){
  settings.doubles = value
}
export function setSport(value){
  settings.sport = value
}
export function getSport() {
  return settings.sport
}
export function getGames() {
  return settings.games
}
export function setGames(signal) {
  if(signal === true && settings.games < 20){
    settings.games++
  }
  else if(signal === false && settings.games > 1){
    settings.games--
  }
  else if(signal != true && signal != false){
    settings.games = signal - 1
  }

}
export function setFirstServe(value){
  settings.firstServe = value
}
export function setDeuce(value){
  settings.deuce = value
}

export function getSettings() {
  return settings
}

export function loadSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY)

  if (saved) {
    Object.assign(settings, JSON.parse(saved))
  }
}

export function saveSettings() {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(settings)
  )
}