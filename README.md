# Padel & Tennis Scoreboard

A Zepp OS 3.6 Workout Extension for scoring padel, tennis, and table tennis matches. It supports round and square watches and includes a phone Settings App for viewing completed matches.

## Features

- Tracks points, games, sets, serves, deuce modes, and tiebreaks
- Supports padel, tennis, and table tennis scoring
- Saves the active match and watch settings locally
- Offers new-game and resume-game options
- Adapts its layout for round and square watch screens
- Sends completed matches to the phone using ZML
- Stores a reduced match history in persistent phone storage
- Displays completed matches as clickable cards in the Zepp phone app
- Opens each match on a separate details page
- Allows the saved sport to be changed and individual matches to be deleted

## Requirements

- [Node.js](https://nodejs.org/) and npm
- Zepp OS CLI (`zeus`)
- Zepp OS Simulator or a compatible Zepp OS device
- The Zepp phone app with Developer Mode enabled when testing on a physical device

Install the CLI globally if it is not already available:

```powershell
npm install --global @zeppos/zeus-cli
```

## Install

Open PowerShell in the project directory and install the dependencies:

```powershell
npm install
```

This installs the Zepp OS type definitions and ZML dependency declared in `package.json`.

## Run in development

Start the Zepp OS development workflow:

```powershell
zeus dev
```

Select a compatible watch in Zepp OS Simulator, or follow the CLI preview workflow to install the extension on a physical device.

The watch Workout Extension runs in the context of an active workout. The phone Settings App runs inside the Zepp phone app; it is not a standalone web page and cannot be run directly with Node.js.

## Build

Create an installable `.zab` package:

```powershell
zeus build
```

Build output is written to `dist`.

## Project structure

- `app.json` — Zepp OS manifest, permissions, modules, and round/square targets
- `app.js` — application lifecycle entry point
- `data-widget/common/index.js` — watch interface and interaction handling
- `data-widget/common/match.js` — scoring rules and match state
- `data-widget/common/settings.js` — watch settings state and persistence
- `data-widget/common/storage.js` — active-match persistence
- `data-widget/common/constants.js` — scoring and screen constants
- `app-side/index/index.js` — receives and stores completed matches on the phone
- `setting/index.js` — phone Settings App and match-history interface
- `setting/styles.js` — reusable Settings App style objects
- `assets/common.r` — assets for round displays
- `assets/common.s` — assets for square displays

## Permissions

The application declares:

- `device:os.local_storage` for active-match and watch-setting persistence
- `data:os.device.info` to detect the screen shape and adapt the watch layout

## Tests

There is currently no automated test suite. The `npm test` script is a placeholder and intentionally exits with an error. Use `zeus build`, the simulator, and a physical device to verify changes.
