# PayPig - Pay For Your Weakness

A mobile app that locks users out of apps they choose, then charges them a small fee to unlock while mercilessly roasting their lack of willpower.

## Features

- **Lock any app** - Choose which apps you want to lock yourself out of
- **Custom unlock fees** - Set your own price for weakness ($0.25 - $10.00+)
- **Escalating roasts** - Tracks how quickly you cave and roasts you accordingly
- **Shame receipts** - See exactly how much you've wasted and how many times you've caved
- **Shame levels** - From "Baby Pig" to "Full PayPig"
- **Roast intensity** - Mild, Medium, or Savage
- **Dark premium UI** - Hot pink + gold on deep black

## Tech Stack

- React Native (Expo SDK 54)
- React Navigation v7
- AsyncStorage for persistence
- expo-linear-gradient for gradient effects

## Getting Started

```bash
cd AppLock
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

## Project Structure

```
AppLock/
  src/
    context/     - App state management
    data/        - Roast messages & app catalog
    screens/     - Home, AddApps, Unlock, Stats, Settings
    utils/       - Theme system (colors, gradients, shadows, typography)
```
