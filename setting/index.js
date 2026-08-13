AppSettingsPage({
  build(props) {
    const stored = props.settingsStorage.getItem("matchHistory")
    const pendingDelete = props.settingsStorage.getItem("pendingMatchDelete")
    let history = []

    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        history = Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.log("Could not parse match history")
      }
    }

    if (history.length === 0) {
      return Section({}, [
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
        const date = new Date(match.timestamp)
        const dateText = Number.isNaN(date.getTime())
          ? "Unknown date"
          : date.toLocaleString()
        const player1 = match.player1 || {}
        const player2 = match.player2 || {}
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
              `Player 1   ${p1Games}`
            ),
            Text(
              {
                paragraph: true
              },
              `Player 2   ${p2Games}`
            ),
            Text(
              {
                paragraph: true
              },
              `Sets: ${player1.sets ?? 0} - ${player2.sets ?? 0}`
            ),
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

    return Section({}, matchItems)
  }
})
