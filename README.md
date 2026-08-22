# Padel & Tennis Scoreboard

A Zepp OS 3.6 Workout Extension for scoring padel, tennis, table tennis, pickleball, squash, and badminton matches. It supports round and square watches and includes a phone Settings App for viewing completed matches.

## Features

- Tracks points, games, sets, serves, deuce modes, and tiebreaks
- Supports padel, tennis, table tennis, pickleball, squash, and badminton scoring
- Saves the active match and watch settings locally
- Offers new-game and resume-game options
- Adapts its layout for round and square watch screens
- Sends completed matches to the phone using ZML
- Queues multiple unsent matches persistently when the phone is unavailable
- Retries queued matches from oldest to newest using the Send Match button
- Preserves the actual match duration even when sending is delayed
- Prevents retried matches from being duplicated in phone history
- Stores match history in persistent phone storage
- Displays match history from most recent to oldest in the Zepp phone app
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

For simulator testing:

1. Open Zepp OS Simulator.
2. Start the Device Simulator and wait for it to finish loading.
3. Run the development command from the project directory:

   ```powershell
   zeus dev
   ```

4. Open the Settings App Simulator when testing match history.
5. Use the Side Service log to verify watch-to-phone requests.

The watch Workout Extension runs in the context of an active workout. The phone Settings App runs inside the Zepp phone app; it is not a standalone web page and cannot be run directly with Node.js.

Completed matches are transferred through Bluetooth to the Side Service running in the Zepp phone app. Internet access is not required, but the watch must be connected to the phone and the Zepp app must be allowed to run its service. If sending fails, the match remains in the watch queue and can be retried later with **Send Match**.

## Build

Create an installable `.zab` package:

```powershell
zeus build
```

Build output is written to `dist`.

## Project structure

- `app.json` — Zepp OS manifest, permissions, modules, and round/square targets
- `app.js` — application lifecycle entry point
- `data-widget/common/index.js` — watch interface, interaction handling, and unsent-match queue
- `data-widget/common/match.js` — scoring rules, match state, and completed-match duration
- `data-widget/common/settings.js` — watch settings state and persistence
- `data-widget/common/storage.js` — active-match persistence
- `data-widget/common/constants.js` — scoring and screen constants
- `app-side/index/index.js` — receives, deduplicates, sorts, and stores completed matches on the phone
- `setting/index.js` — phone Settings App and match-history interface
- `setting/styles.js` — reusable Settings App style objects
- `assets/common.r` — assets for round displays
- `assets/common.s` — assets for square displays

## Permissions

The application declares:

- `device:os.local_storage` for active-match, watch-setting, and unsent-match persistence
- `data:os.device.info` to detect the screen shape and adapt the watch layout

## Verification

There is currently no committed automated test suite. The `npm test` script is a placeholder and intentionally exits with an error.

Before release, verify the project with:

```powershell
zeus build
```

Then use the simulator or a physical device to test scoring, round and square layouts, completed-match confirmation, offline queueing, retry behavior, and the phone match-history interface.
