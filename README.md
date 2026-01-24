# Four Player Score Tracker

A beautiful, interactive score tracking application for four players with a dynamic visual leaderboard. Available as a native macOS application or web app.

## Features

- **Four Player Support**: Track scores for up to 4 players simultaneously
- **Visual Leaderboard**: Real-time leaderboard with visual rankings
  - 🥇 Gold medal for 1st place
  - 🥈 Silver medal for 2nd place
  - 🥉 Bronze medal for 3rd place
  - Rank number for 4th place
  - Animated bar chart showing score leads
  - Color-coded bars matching rank gradients
- **Customizable Player Names**: Personalize each player's name
- **Flexible Score Adjustments**:
  - Add/subtract 1 point
  - Add/subtract 5 points
- **Individual Reset**: Reset any player's score individually
- **Global Reset**: Reset all players at once
- **Persistent Storage**: Scores and names are saved automatically using localStorage
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Smooth Animations**: Visual feedback for score updates and leaderboard changes
- **Native macOS App**: Run as a standalone application on your Mac mini or MacBook

## Installation

### Option 1: macOS Native App (Recommended for Mac mini)

1. **Install Node.js** (if not already installed):
   - Download from [nodejs.org](https://nodejs.org/)
   - Or install via Homebrew: `brew install node`

2. **Clone or download this repository**

3. **Install dependencies**:
   ```bash
   cd Score-Tracker
   npm install
   ```

4. **Run the app**:
   ```bash
   npm start
   ```

5. **Build a standalone app** (optional):
   ```bash
   npm run build:mac
   ```
   This creates a `.dmg` installer in the `dist/` folder that you can install on your Mac mini.

### Option 2: Web Browser

Simply open `index.html` in any web browser. No installation required!

## How to Use

### Getting Started

1. Open `index.html` in your web browser
2. Enter player names in the input fields (optional - defaults to "Player 1", "Player 2", etc.)
3. Start tracking scores!

### Updating Scores

Each player card has four buttons:
- **-5**: Subtract 5 points
- **-1**: Subtract 1 point
- **+1**: Add 1 point
- **+5**: Add 5 points

### Resetting Scores

- **Reset** (on individual player card): Reset that player's score to 0
- **Reset All Players**: Reset all players' scores to 0 (keeps player names)

### Leaderboard

The leaderboard automatically updates in real-time and shows:
- Current ranking with medal/position indicator
- Player name
- Status message (leading, points behind leader, etc.)
- Visual bar chart showing relative score
- Current score

Rankings are color-coded:
- **Gold gradient**: 1st place with gold bar
- **Silver gradient**: 2nd place with silver bar
- **Bronze gradient**: 3rd place with bronze bar
- **Gray gradient**: 4th place with gray bar

The bar chart scales relative to the leader's score (always 100%), making it easy to visualize score differences at a glance.

### Keyboard Shortcuts

- **Ctrl/Cmd + R**: Reset all players (you'll be prompted to confirm)

## Technical Details

### Files

**Core Application:**
- `index.html`: Main HTML structure
- `styles.css`: Styling and visual design
- `script.js`: Score tracking logic and interactivity

**macOS App (Electron):**
- `main.js`: Electron app configuration and window management
- `package.json`: Node.js dependencies and build configuration
- `.gitignore`: Git ignore rules for node_modules and build files

### Data Persistence

The application uses browser localStorage to automatically save:
- All player scores
- All player names

Your data persists between sessions until you clear your browser data.

### Platform Compatibility

**macOS App:**
- macOS 10.13 (High Sierra) or later
- Runs natively on Mac mini, MacBook, iMac, etc.
- Apple Silicon (M1/M2/M3) and Intel Macs supported

**Web Browser:**
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera
- Any modern browser on Windows, Linux, or macOS

## Use Cases

Perfect for:
- Board game nights
- Card games
- Trivia contests
- Sport competitions
- Classroom activities
- Team building exercises
- Any competitive activity with 4 participants

## Customization

The app is built with vanilla HTML, CSS, and JavaScript, making it easy to customize:

- **Change color schemes**: Edit the gradient values in `styles.css`
- **Adjust point increments**: Modify button values in `index.html`
- **Add more players**: Extend the grid and update the JavaScript player count
- **Add sound effects**: Include audio files and play them on score updates

## License

Free to use and modify for personal and commercial projects.
