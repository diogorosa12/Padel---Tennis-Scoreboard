import { localStorage } from '@zos/storage'
import { STORAGE_KEY, SETTINGS_KEY } from './constants'
import { getMatch, setMatch, createNewMatch } from './match'

export function saveMatch() {
  const match = getMatch()

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(match)
  )
}


export function loadMatch() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (saved) {
    setMatch(JSON.parse(saved))
  } else {
    setMatch(createNewMatch())
  }
}
