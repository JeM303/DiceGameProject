# SKUNK Dice Game & Classic PvC Dice Game - COMP 2132 Project

A JavaScript web application implementing both the classic SKUNK dice game 
and a Player vs Computer (PvC) 3-round dice game.
---
## Author: Jeremy Melegrito

## Game Overview

Getting Started

1. Open `Index.html` in a modern web browser
2. Select your preferred game mode (SKUNK or Classic)
3. Play according to the rules above
4. Try to maximize your score!

---

This website supports two game modes:
- **SKUNK Dice Game**: A strategic dice game with 5 sections (S-K-U-N-K) and risk management.
- **Classic PvC Dice Game**: A 3-round game where you play against the computer, highest score wins.
---

## Game Modes & Rules

### 1. SKUNK Dice Game
- **2 Dice Mode**
  - **Normal Roll**: Add the sum of both dice to your current section score
  - **Snake Eyes (1-1)**: Lose all points for the current section
  - **Double Snake Eyes**: Lose ALL points across all sections
- **3 Dice Mode**
  - **Normal Roll**: Add the sum of all three dice to your current section score
  - **Snake Eyes (any 1)**: Lose all points for the current section
  - **Double Snake Eyes**: Lose ALL points across all sections
  - **Triple Snake Eyes**: Lose ALL points across all sections
  - **Three of a Kind (any number except 1)**: +100 bonus points

### 2. Classic PvC Dice Game
- **Rounds**: 3 rounds, both player and computer roll 2 dice per round
- **Scoring per round**:
  - If either die is 1: score = 0 for that round
  - If both dice are the same: score = (sum × 2)
  - Else: score = sum of dice
- **After 3 rounds**: Highest total score wins
---

## How to Play

### SKUNK Dice Game
1. **Select Dice Count**: Choose between 2 or 3 dice using the dropdown
2. **Roll Dice**: Click the "Roll Dice" button to roll
3. **Watch Results**: See the dice values and any special effects
4. **Track Scoring**: Monitor your points in each section
5. **Reset Game**: Use "New Game" to start over

### Classic PvC Dice Game
1. **Switch to Classic Mode**: Use the mode selector at the top
2. **Roll Dice**: Click the "Roll Dice" button to roll for both player and computer
3. **Watch Results**: See both sets of dice, round scores, and totals
4. **After 3 rounds**: Winner is announced
5. **Reset Game**: Use "New Game" to play again

---

## Game Mechanics

### SKUNK Mode
- **Normal Rolls**: Sum of dice values added to current section
- **Special Combinations**: Bonus points or penalties based on dice patterns
- **Section Progression**: Points accumulate in the current section
- **Risk Management**: Players must decide when to stop rolling

### Classic Mode
- **Rounds**: 3 rounds, both player and computer roll each round
- **Scoring**: See rules above
- **Winner**: Highest total after 3 rounds

## Customization

The game is easily customizable through the SASS variables in `scss/main.scss`:
- Color schemes
- Typography settings
- Spacing and layout
- Animation timing

---

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

