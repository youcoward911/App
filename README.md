# AppLock - The App That Roasts You For Having No Self Control

A mobile app that locks users out of apps they choose, then charges them a small fee to unlock while mercilessly roasting their lack of willpower.

## Features

- **Lock any app** - Choose which apps you want to lock yourself out of
- **Custom unlock fees** - Set your own price for weakness ($0.25 - $5.00+)
- **Escalating roasts** - The app tracks how quickly you cave and roasts you accordingly
- **Time-based taunts** - "Jesus Christ it's been like 3 minutes lmao"
- **Repeat offender tracking** - Gets meaner the more you unlock in a day
- **Hall of Shame** - Stats dashboard quantifying your failures
- **Shame levels** - From "Rookie Addict" to "Hopeless Case"

## Tech Stack

- React Native (Expo)
- React Navigation
- AsyncStorage for persistence

## Getting Started

```bash
cd AppLock
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `a` for Android / `i` for iOS simulator.

## Project Structure

```
AppLock/
  src/
    context/     - App state management (AppLockContext)
    data/        - Roast messages & app definitions
    screens/     - Home, AddApps, Unlock, Stats, Settings
    utils/       - Theme colors & fonts
```
