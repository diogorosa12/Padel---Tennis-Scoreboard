const SPORT_NAMES = {
  unknown: "Unknown",
  padel: "Padel",
  tennis: "Tennis",
  tableTennis: "Table Tennis"
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
      return Section({}, [
        defaultSportSelector,
        Text(
          {
            paragraph: true
          },
          "No matches saved yet."
        )
      ])
    }

    const matchItems = history
      .slice()
      .reverse()
      .map((match, index) => {
        const historyIndex = history.length - 1 - index
        const date = new Date(match.startTime)
        const duration = formatDuration(match.duration)
        const durationText = 'Duration: ' + duration
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

        return Section(
          {
            title: `Match ${history.length - index}`
          },
          [
            Text(
              {
                paragraph: true
              },
              dateText
            ),
            Text(
              {
                paragraph: true
              },
              durationText,
            ),
            Text(
              {
                paragraph: true
              },
              `Player 1:   ${p1Games}`
            ),
            Text(
              {
                paragraph: true
              },
              `Player 2:   ${p2Games}`
            ),
            Text(
              {
                paragraph: true
              },
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
                { name: "Table Tennis", value: "tableTennis" }
              ],
              onChange: (selection) => {
                const value = getSelectedValue(selection)

                if (!SPORT_NAMES[value]) {
                  return
                }

                const updatedHistory = history.slice()
                updatedHistory[historyIndex] = {
                  ...updatedHistory[historyIndex],
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
                  String(historyIndex)
                )
              }
            })
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
      return Section(
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
            }
          })
        ]
      )
    }

    return Section({}, [defaultSportSelector, ...matchItems])
  }
})
