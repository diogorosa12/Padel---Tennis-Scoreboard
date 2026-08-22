import { styles } from "./styles"

const SPORT_NAMES = {
  unknown: "Unknown",
  padel: "Padel",
  tennis: "Tennis",
  tableTennis: "Table Tennis",
  pickleball: "Pickleball",
  squash: "Squash",
  badminton: "Badminton"
}


function formatDuration(duration) {
  const totalSeconds = Math.floor(duration / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }

  return `${minutes}m ${seconds}s`
}

function getSelectedValue(selection) {
  let value = selection

  if (Array.isArray(value)) {
    value = value[0]
  }

  if (value && typeof value === "object") {
    value = value.value
  }

  return typeof value === "string" ? value : ""
}

AppSettingsPage({
  build(props) {

    
    const stored = props.settingsStorage.getItem("matchHistory")
    const pendingDelete = props.settingsStorage.getItem("pendingMatchDelete")
    const defaultSport = props.settingsStorage.getItem("defaultSport") || "padel"
    const selectedMatch = props.settingsStorage.getItem("selectedMatch")    
    
    let history = []

    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        history = Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.log("Could not parse match history")
      }
    }
  

    const defaultSportSelector = Section(
      {
        title: "Default sport"
        
      },
      [
        Text(
          {
            paragraph: true,
            bold: true
          },
          `Current: ${SPORT_NAMES[defaultSport] || "Padel"}`
        ),
        Select({
          label: "Sport for new matches",
          color: "white",
          value: defaultSport,
          options: [
            { name: "Padel", value: "padel" },
            { name: "Tennis", value: "tennis" }
          ],
          onChange: (selection) => {
            const value = getSelectedValue(selection)

            if (value === "padel" || value === "tennis") {
              props.settingsStorage.setItem("defaultSport", value)
            }
          }
        })
      ]
    )

    if (history.length === 0) {
      return View(
        { style: styles.page },
        [
          Section({}, [
            defaultSportSelector,
            Text(
              {
                paragraph: true
              },
              "No matches saved yet."
            )
          ])
        ]
      )
    }

    const matchItems = history
      .slice()
      .reverse()
      .map((match, index) => {
        const historyIndex = history.length - 1 - index
        const result = (match.player1.sets - match.player2.sets) > 0 ? "Win" : "Loss"
        const resultColor = result === "Win" ? "#008cff" : "#ff3c3c"
        const date = new Date(match.startTime)
      const dateText = Number.isNaN(date.getTime())
        ? "Unknown date"
        : date.toLocaleString([], {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        })
        return View(
          {
            style: styles.matchButton,
            onClick: () => {
              props.settingsStorage.setItem(
                "selectedMatch",
                String(historyIndex)
              )
            }
          },
          [
            View(
              {
                style: styles.matchInfo
              },
              [
                View(
                  {
                    style: styles.result
                  },
                  [
                    Text(
                      {
                        bold: true,
                        style: {
                          ...styles.matchResult,
                          color: resultColor
                        }
                      },
                      result
                    ),
                    Text(
                      {
                        bold: true,
                        style: styles.matchResult
                      },
                      `${match.player1.sets} - ${match.player2.sets}`
                    )
                  ]
                ),
                Text(
                  {
                    paragraph: true,
                    style: styles.matchDate
                  },
                  dateText
                )
              ]
            ),
            View(
              {
                style: styles.matchRight
              },
              [
                Text(
                  {
                    bold: true,
                    style: styles.matchRightText
                  },
                  SPORT_NAMES[match.sport || "unknown"] || "Unknown"
                ),
                Text(
                  {
                    style: styles.matchArrow
                  },
                  "❯"
                )
              ]
            )
          ]
        )
      })

    const pendingIndex = Number(pendingDelete)
    const hasPendingDelete =
      pendingDelete !== null &&
      pendingDelete !== undefined &&
      pendingDelete !== "" &&
      Number.isInteger(pendingIndex) &&
      pendingIndex >= 0 &&
      pendingIndex < history.length

    if (hasPendingDelete) {
      return View(
        { style: styles.page },
        [
          Section(
            {
              title: `Delete Match ${pendingIndex + 1}?`
            },
            [
          Text(
            {
              paragraph: true,
              bold: true
            },
            "Are you sure you want to delete this match?"
          ),
          Text(
            {
              paragraph: true
            },
            "This cannot be undone."
          ),
          Button({
            label: "Cancel",
            color: "secondary",
            onClick: () => {
              props.settingsStorage.removeItem("pendingMatchDelete")
            }
          }),
          Button({
            label: "Delete",
            style: {
              color: "#000000"
            },
            onClick: () => {
              const updatedHistory = history.slice()
              updatedHistory.splice(pendingIndex, 1)

              props.settingsStorage.setItem(
                "matchHistory",
                JSON.stringify(updatedHistory)
              )
              props.settingsStorage.removeItem("pendingMatchDelete")
              props.settingsStorage.removeItem("selectedMatch")
            }
              })
            ]
          )
        ]
      )
    }

    const selectedIndex = Number(selectedMatch)
    const hasSelectedMatch =
      selectedMatch !== null &&
      selectedMatch !== undefined &&
      selectedMatch !== "" &&
      Number.isInteger(selectedIndex) &&
      selectedIndex >= 0 &&
      selectedIndex < history.length

    if (hasSelectedMatch) {
      const match = history[selectedIndex]
      const durationText = `Duration: ${formatDuration(match.duration)}`
      const date = new Date(match.startTime)
      const dateText = Number.isNaN(date.getTime())
        ? "Unknown date"
        : date.toLocaleString()
      const player1 = match.player1 || {}
      const player2 = match.player2 || {}
      const sport = match.sport || "unknown"
      const p1Games = Array.isArray(player1.games)
        ? player1.games.join("  ")
        : "-"
      const p2Games = Array.isArray(player2.games)
        ? player2.games.join("  ")
        : "-"

      return View(
        { style: styles.page },
        [
          Section(
            {
              title: `Match ${selectedIndex + 1}`
            },
            [
          Text({ paragraph: true }, dateText),
          Text({ paragraph: true }, durationText),
          Text({ paragraph: true }, `Player 1:   ${p1Games}`),
          Text({ paragraph: true }, `Player 2:   ${p2Games}`),
          Text(
            { paragraph: true },
            `Sets: ${player1.sets ?? 0} - ${player2.sets ?? 0}`
          ),
          Text(
            {
              paragraph: true,
              bold: true
            },
            `Sport: ${SPORT_NAMES[sport] || "Unknown"}`
          ),
          Select({
            label: "Change sport",
            value: sport,
            options: [
              { name: "Unknown", value: "unknown" },
              { name: "Padel", value: "padel" },
              { name: "Tennis", value: "tennis" },
              { name: "Table Tennis", value: "tableTennis" },
              { name: "Pickleball", value: "pickleball" },
              { name: "Squash", value: "squash" },
              { name: "Badminton", value: "badminton" }
            ],
            onChange: (selection) => {
              const value = getSelectedValue(selection)

              if (!SPORT_NAMES[value]) {
                return
              }

              const updatedHistory = history.slice()
              updatedHistory[selectedIndex] = {
                ...updatedHistory[selectedIndex],
                sport: value
              }
              props.settingsStorage.setItem(
                "matchHistory",
                JSON.stringify(updatedHistory)
              )
            }
          }),
          Button({
            label: "Delete match",
            color: "secondary",
            style: {
              color: "#000000"
            },
            onClick: () => {
              props.settingsStorage.setItem(
                "pendingMatchDelete",
                String(selectedIndex)
              )
            }
          }),
          Button({
            label: "Back",
            onClick: () => {
              props.settingsStorage.removeItem("selectedMatch")
            }
              })
            ]
          )
        ]
      )
    }

    return View({style: styles.page}, [defaultSportSelector, ...matchItems])
  }
})
