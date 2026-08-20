import { POINTS } from './constants'
import { getMatch } from './match'
import { getSettings } from './settings'


export function getPointText(player) {
  if (getMatch().tieBreak === true || getSettings().normalPoints/* getSettings().pingPong */) {
    return String(player.pointIndex)
  }
  return POINTS[getSettings().deuce][player.pointIndex]
}