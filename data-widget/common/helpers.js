import { POINTS } from './constants'
import { getMatch } from './match'
import { getSettings, SETS } from './settings'


export function getPointText(player) {
  if (getMatch().tieBreak === true || getSettings().pingPong) {
    return String(player.pointIndex)
  }
  return POINTS[getSettings().deuce][player.pointIndex]
}