// Game Object - Main game controller
class SkunkGame {
    constructor() {

        this.currentSection     = 1;
        this.totalScore         = 0;
        this.roundScore         = 0;
        this.diceCount          = 2;
        this.sectionScores      = [0, 0, 0, 0, 0];
        this.sectionNames       = ['S', 'K', 'U', 'N', 'K'];
        this.isRolling          = false;
        this.hasGameStarted     = false; // Track if game has been played
        this.firstRollInSection = true;  // Track if it's the first roll in the section
        this.isFinalized        = false; // Track if game is finalized
        
        this.initializeGame();
    }

    // Initialize the game
    initializeGame() {

        this.setupEventListeners();
        this.updateDisplay();
        this.showMessage('Welcome to SKUNK Dice Game!', 'success');
    }

    // Setup event listeners
    setupEventListeners() {

        this.rollBtn         = document.getElementById('roll-btn');
        this.resetBtn        = document.getElementById('reset-btn');
        this.holdBtn         = document.getElementById('hold-btn');
        this.diceCountSelect = document.getElementById('dice-count');

        this.rollBtn.addEventListener ('click', () => this.rollDice());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.holdBtn.addEventListener ('click', () => this.holdPoints());

        this.diceCountSelect.addEventListener('change', (e) => {
            this.handleDiceCountChange(e);
        });
    }

    // Handle dice count change with confirmation
    handleDiceCountChange(event) {

        const newDiceCount = parseInt(event.target.value);
        // Always allow changing dice mode, even if finalized
        if (!this.hasGameStarted) {
            this.diceCount = newDiceCount;
            this.updateDiceDisplay();
            return;
        }
        const currentDiceCount = this.diceCount;

        const confirmMessage   = `Changing from ${currentDiceCount} dice to ${newDiceCount}

         dice will reset your current game session. All progress will be lost. Do you want to proceed?`;

        if (confirm(confirmMessage)) {

            this.diceCount = newDiceCount;
            this.resetGame();
            this.showMessage(`Switched to ${newDiceCount} dice mode! Game reset.`, 'info');

        } else {
            event.target.value = currentDiceCount;
        }
    }

    // Roll dice function
    rollDice() {

        if (this.isRolling || this.isFinalized) return;
        this.isRolling      = true;
        this.hasGameStarted = true; // Mark that game has started
        this.addRollingAnimation();

        setTimeout(() => {
            
            const diceValues = this.generateDiceValues();
            this.updateDiceDisplay(diceValues);
            this.evaluateRoll(diceValues);
            this.removeRollingAnimation();
            this.isRolling = false;
        }, 800);
    }

    // Hold points function - new feature
    holdPoints() {

        if (this.isFinalized) return;

        if (this.roundScore === 0) {

            this.showMessage('No points to hold! Roll the dice first.', 'warning');
            return;
        }
        // If on last section, finalize the game
        if (this.currentSection === 5) {
            
            this.roundScore  = 0;
            this.isFinalized = true;
            this.updateDisplay();
            this.showMessage('The Game has Ended', 'success');
            this.disableControls();
            return;
        }
        // Move to next section and reset round score
        if (this.currentSection < 5) {

            this.currentSection++;
            this.roundScore = 0;
            this.firstRollInSection = true;
            this.showMessage(`Points held! Moving to section ${this.sectionNames[this.currentSection - 1]}`, 'info');
        }
        this.updateDisplay();
    }

    // Generate random dice values
    generateDiceValues() {

        const values = [];

        for (let i = 0; i < this.diceCount; i++) {
            values.push(Math.floor(Math.random() * 6) + 1);
        }
        return values;
    }

    // Update dice visual display
    updateDiceDisplay(values = [1, 1, 1]) {

        const diceElements = [

            document.getElementById('dice1'),
            document.getElementById('dice2'),
            document.getElementById('dice3')
        ];
        const valueElements = [

            document.getElementById('dice-value1'),
            document.getElementById('dice-value2'),
            document.getElementById('dice-value3')
        ];

        // Show/hide third dice based on dice count
        if (this.diceCount === 2) {
            diceElements[2].style.display = 'none';
            valueElements[2].style.display = 'none';
        } else {
            diceElements[2].style.display = 'block';
            valueElements[2].style.display = 'inline';
        }

        // Update dice faces and values
        for (let i = 0; i < this.diceCount; i++) {
            this.updateDiceFace(diceElements[i], values[i]);
            valueElements[i].textContent = values[i];
        }
    }

    // Update individual dice face with image
    updateDiceFace(diceElement, value) {

        const diceImage = diceElement.querySelector('.dice-image');

        diceImage.src   = `images/dice${value}.png`;
        diceImage.alt   = `Dice ${value}`;
    }

    // Add rolling animation
    addRollingAnimation() {
        const diceElements = [
            document.getElementById('dice1'),
            document.getElementById('dice2'),
            document.getElementById('dice3')
        ];

        diceElements.forEach((dice, index) => {
            if (index < this.diceCount) {
                dice.classList.add('rolling');
            }
        });
    }

    // Remove rolling animation
    removeRollingAnimation() {

        const diceElements = [

            document.getElementById('dice1'),
            document.getElementById('dice2'),
            document.getElementById('dice3')
        ];

        diceElements.forEach(dice => {
            dice.classList.remove('rolling');
        });
    }

    // Evaluate the roll and apply game rules
    evaluateRoll(diceValues) {

        const snakeEyes         = diceValues.filter(value => value === 1).length;
        const totalSnakeEyes    = snakeEyes;
        const isThreeOfAKind    = this.diceCount === 3 && this.isThreeOfAKind(diceValues);
        const isTripleSnakeEyes = this.diceCount === 3 && totalSnakeEyes === 3;

        let message             = '';
        let messageType         = 'success';

        // On first roll of section, only auto-reroll if exactly one die is 1
        if (this.firstRollInSection && this.sectionScores[this.currentSection - 1] === 0 && snakeEyes === 1) {

            this.showMessage('Snake eye on first roll! Rerolling...','warning');
            setTimeout(() => {
                this.rollDice();
            }, 900);
            return;
        }

        // After first roll, set flag to false
        this.firstRollInSection = false;

        // Apply game rules
        if (isTripleSnakeEyes) {
            // Triple snake eyes - lose all points and move to next section
            this.loseAllPoints();

            message     = 'Triple Snake Eyes! All points lost! Moving to next section.';
            messageType = 'error';

            this.moveToNextSection();

        } else if (totalSnakeEyes === 2) {
            // Double snake eyes - lose all points and move to next section
            this.loseAllPoints();

            message     = 'Double Snake Eyes! All points lost! Moving to next section.';
            messageType = 'error';

            this.moveToNextSection();

        } else if (totalSnakeEyes === 1) {
            // Single snake eye - lose current section points only and move to next section
            this.loseCurrentSectionPoints();

            message     = `Snake Eye! Lost points for section ${this.sectionNames[this.currentSection - 1]}! Moving to next section.`;
            messageType = 'warning';

            this.moveToNextSection();

        } else if (isThreeOfAKind) {
            // Three of a kind (not snake eyes) - +100 points
            this.addPoints(100);

            message     = 'Three of a Kind! +100 points!';
            messageType = 'success';

        } else {
            // Normal roll - add sum of dice
            const sum   = diceValues.reduce((a, b) => a + b, 0);

            this.addPoints(sum);

            message     = `Rolled ${diceValues.join(', ')} = ${sum} points!`;
            messageType = 'success';
        }

        this.showMessage(message, messageType);
        this.updateDisplay();
    }

    // Move to next section and reset round score
    moveToNextSection() {

        if (this.currentSection < 5) {
            this.currentSection++;
            this.roundScore = 0;
            this.firstRollInSection = true;
        } else {
            this.showMessage('Game completed! All sections finished.', 'success');
        }
    }

    // Check if three dice are the same (three of a kind)
    isThreeOfAKind(diceValues) {

        if (this.diceCount !== 3) return false;

        return diceValues[0] === diceValues[1] && diceValues[1] === diceValues[2] && diceValues[0] !== 1;
    }

    // Add points to current section
    addPoints(points) {

        this.roundScore += points;
        this.sectionScores[this.currentSection - 1] += points;
        this.totalScore += points;
    }

    // Lose points for current section only
    loseCurrentSectionPoints() {

        const lostPoints = this.sectionScores[this.currentSection - 1];

        this.sectionScores[this.currentSection - 1] = 0;
        this.totalScore -= lostPoints;
        this.roundScore = 0;
    }

    // Lose all points
    loseAllPoints() {

        this.sectionScores = [0, 0, 0, 0, 0];
        this.totalScore = 0;
        this.roundScore = 0;
    }

    // Update all display elements
    updateDisplay() {
        // Update section scores
        const sectionElements        = document.querySelectorAll('.section');

        sectionElements.forEach((section, index) => {
            const scoreElement       = section.querySelector('.section-score');
            scoreElement.textContent = this.sectionScores[index];
            
            // Highlight current section
            if (index === this.currentSection - 1) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Update game info
        document.getElementById('current-section').textContent = this.sectionNames[this.currentSection - 1];
        document.getElementById('round-score').textContent = this.roundScore;
        document.getElementById('total-score').textContent = this.totalScore;

        // Update hold button state
        this.updateHoldButtonState();
        // If finalized, disable controls
        if (this.isFinalized) {
            this.disableControls();
        }
        // Change Hold Points button text to End Game on section 5
        const holdBtn = document.getElementById('hold-btn');

        if (this.currentSection === 5 && !this.isFinalized) {
            holdBtn.textContent = 'End Game';
        } else {
            holdBtn.textContent = 'Hold Points';
        }
    }

    // Update hold button state based on game conditions
    updateHoldButtonState() {

        const holdBtn = document.getElementById('hold-btn');
        
        if (this.roundScore === 0) {
            
            holdBtn.disabled      = true;
            holdBtn.style.opacity = '0.5';
            holdBtn.style.cursor  = 'not-allowed';
        } else {
            holdBtn.disabled      = false;
            holdBtn.style.opacity = '1';
            holdBtn.style.cursor  = 'pointer';
        }
    }

    // Show message with animation
    showMessage(message, type = 'success') {

        const messageElement       = document.getElementById('message');

        messageElement.textContent = message;
        messageElement.className   = `message ${type} show`;

        // Hide message after 3 seconds
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }

    // Enable all controls (used on reset)
    enableControls() {

        this.rollBtn.disabled              = false;
        this.holdBtn.disabled              = false;
        this.rollBtn.style.opacity         = '1';
        this.holdBtn.style.opacity         = '1';
        this.rollBtn.style.cursor          = 'pointer';
        this.holdBtn.style.cursor          = 'pointer';
        this.resetBtn.disabled             = false;
        this.diceCountSelect.disabled      = false;
        this.resetBtn.style.opacity        = '1';
        this.diceCountSelect.style.opacity = '1';
        this.resetBtn.style.cursor         = 'pointer';
        this.diceCountSelect.style.cursor  = 'pointer';
        // Also update hold button state based on roundScore
        this.updateHoldButtonState();
    }

    // Reset game
    resetGame() {
        this.currentSection     = 1;
        this.totalScore         = 0;
        this.roundScore         = 0;
        this.sectionScores      = [0, 0, 0, 0, 0];
        this.hasGameStarted     = false; // Reset game state
        this.firstRollInSection = true;
        this.isFinalized        = false;
        this.enableControls    ();
        this.updateDisplay     ();
        this.updateDiceDisplay ();
        this.showMessage('Game reset!', 'success');
    }
}

// Dice Object - Represents a single die
class Die {
    constructor(value = 1) {
        this.value = value;
        this.element = null;
    }

    roll() {
        this.value = Math.floor(Math.random() * 6) + 1;
        return this.value;
    }

    getValue() {
        return this.value;
    }

    setElement(element) {
        this.element = element;
    }

    updateDisplay() {
        if (this.element) {
            this.updateFace();
        }
    }

    updateFace() {
        // Update dice face display with image
        const diceImage = this.element.querySelector('.dice-image');

        diceImage.src   = `images/dice${this.value}.png`;
        diceImage.alt   = `Dice ${this.value}`;
    }
}

// Game Score Object - Manages scoring logic
class GameScore {

    constructor() {

        this.sectionScores  = [0, 0, 0, 0, 0];
        this.totalScore     = 0;
        this.currentSection = 1;
    }

    addPoints(points, section = null) {
        const targetSection = section || this.currentSection;

        this.sectionScores[targetSection - 1] += points;
        this.totalScore += points;
    }

    loseSectionPoints(section = null) {

        const targetSection = section || this.currentSection;
        
        const lostPoints    = this.sectionScores[targetSection - 1];

        this.sectionScores[targetSection - 1] = 0;
        this.totalScore -= lostPoints;

        return lostPoints;
    }

    loseAllPoints() {
        this.sectionScores = [0, 0, 0, 0, 0];
        this.totalScore = 0;
    }

    getSectionScore(section) {
        return this.sectionScores[section - 1];
    }

    getTotalScore() {
        return this.totalScore;
    }

    setCurrentSection(section) {
        this.currentSection = section;
    }
}

// Mode switching and classic PvC dice game logic

document.addEventListener('DOMContentLoaded', () => {
    // Mode switching
    const modeSelector = document.getElementById('game-mode');
    const skunkUI      = document.getElementById('skunk-game-ui');
    const classicUI    = document.getElementById('classic-game-ui');
    let classicGame    = null;
    let skunkGame      = null;

    // Helper to clean up SKUNK game event listeners.
    function destroySkunkGame() {
        // Not strictly necessary if you hide the UI, but could be implemented if needed
        // For now, just set to null
        skunkGame = null;
    }

    modeSelector.addEventListener('change', (e) => {
        if (e.target.value === 'classic') {
            skunkUI.style.display = 'none';
            classicUI.style.display = '';
            destroySkunkGame();
            if (!classicGame) classicGame = new DiceGame();
        } else {
            skunkUI.style.display = '';
            classicUI.style.display = 'none';
            if (!skunkGame) skunkGame = new SkunkGame();
        }
    });

    // Instantiate SkunkGame on page load by default
    skunkGame = new SkunkGame();
    skunkUI.style.display = '';
    classicUI.style.display = 'none';

    // Classic PvC Dice Game implementation
    class DiceGame {
        constructor() {
            this.round          = 1;
            this.maxRounds      = 3;
            this.playerScores   = [];
            this.computerScores = [];
            this.isFinalized    = false;
            this.init();
        }
        init() {
            this.updateRoundDisplay();
            this.updateScores      ();
            this.enableControls    ();
            document.getElementById('classic-roll-btn').onclick  = () => this.playRound();
            document.getElementById('classic-reset-btn').onclick = () => this.resetGame();
        }
        
        playRound() {
            
            if (this.isFinalized || this.round > this.maxRounds) return;
            // Animate dice for both player and computer
            this.animateDice('player');
            this.animateDice('computer');
            // Player roll
            const playerRoll    = [this.randomDie(), this.randomDie()];
            const playerScore   = this.evaluateRoll(playerRoll);
            this.playerScores.push(playerScore);
            // Computer roll
            const computerRoll  = [this.randomDie(), this.randomDie()];
            const computerScore = this.evaluateRoll(computerRoll);
            this.computerScores.push(computerScore);
            // After animation, update dice faces and scores
            setTimeout(() => {
                
                this.updateDiceDisplay('player', playerRoll);
                this.updateDiceDisplay('computer', computerRoll);
                this.updateScores();
                // Show message
                showMessage(`Round ${this.round}: You rolled [${playerRoll.join(', ')}] (${playerScore}), 
                Computer rolled [${computerRoll.join(', ')}] (${computerScore})`, 'info');
                // Next round or end game
                if (this.round === this.maxRounds) {
                    this.endGame();
                } else {
                    this.round++;
                    this.updateRoundDisplay();
                }
            }, 800);
        }
        evaluateRoll(diceValues) {
            
            if (diceValues.includes(1)) return 0;
            if (new Set(diceValues).size === 1)
                return diceValues.reduce((a, b) => a + b) * 2;
            return diceValues.reduce((a, b) => a + b);
        }
        updateDiceDisplay(who, values) {
            
            if (who === 'player') {
                document.getElementById('classic-player-dice1').querySelector('img').src   = `images/dice${values[0]}.png`;
                document.getElementById('classic-player-dice2').querySelector('img').src   = `images/dice${values[1]}.png`;
            } else {
                document.getElementById('classic-computer-dice1').querySelector('img').src = `images/dice${values[0]}.png`;
                document.getElementById('classic-computer-dice2').querySelector('img').src = `images/dice${values[1]}.png`;
            }
        }
        updateScores() {
            // Current round score
            document.getElementById('classic-player-round-score').textContent   = this.playerScores[this.round-1] || 0;
            document.getElementById('classic-computer-round-score').textContent = this.computerScores[this.round-1] || 0;
            // Total
            document.getElementById('classic-player-total-score').textContent   = this.playerScores.reduce((a,b)=>a+b,0);
            document.getElementById('classic-computer-total-score').textContent = this.computerScores.reduce((a,b)=>a+b,0);
        }
        updateRoundDisplay() {
            
            for (let i = 1; i <= this.maxRounds; i++) {
                const el = document.getElementById('round'+i);
                if (i === this.round) {
                    el.style.background = '#3498db';
                    el.style.color = '#fff';
                } else {
                    el.style.background = '#f1f1f1';
                    el.style.color = '#2c3e50';
                }
            }
        }
        endGame() {
            
            this.isFinalized    = true;
            this.disableControls();
            const playerTotal   = this.playerScores.reduce((a,b)=>a+b,0);
            const computerTotal = this.computerScores.reduce((a,b)=>a+b,0);
            let msg = '';
            if (playerTotal > computerTotal) msg      = 'You win!';
            else if (playerTotal < computerTotal) msg = 'Computer wins!';
            else msg = "It's a tie!";
            showMessage(`Game Over! ${msg} (You: ${playerTotal}, Computer: ${computerTotal})`, 'success');
        }
        resetGame() {
            
            this.round          = 1;
            this.playerScores   = [];
            this.computerScores = [];
            this.isFinalized    = false;
            this.updateRoundDisplay();
            this.updateScores();
            this.enableControls();
            // Reset dice images
            this.updateDiceDisplay('player', [1,1]);
            this.updateDiceDisplay('computer', [1,1]);
            showMessage('New game started!', 'success');
        }
        randomDie() {
            
            return Math.floor(Math.random()*6)+1;
        }
        disableControls() {
            
            document.getElementById('classic-roll-btn').disabled      = true;
            document.getElementById('classic-roll-btn').style.opacity = '0.5';
            document.getElementById('classic-roll-btn').style.cursor  = 'not-allowed';
        }
        enableControls() {
            
            document.getElementById('classic-roll-btn').disabled      = false;
            document.getElementById('classic-roll-btn').style.opacity = '1';
            document.getElementById('classic-roll-btn').style.cursor  = 'pointer';
        }
        animateDice(who) {
            
            if (who === 'player') {
                
                document.getElementById('classic-player-dice1').classList.add('rolling');
                document.getElementById('classic-player-dice2').classList.add('rolling');
                setTimeout(() => {
                    
                    document.getElementById('classic-player-dice1').classList.remove('rolling');
                    document.getElementById('classic-player-dice2').classList.remove('rolling');
                }, 800);
            } else {
                
                document.getElementById('classic-computer-dice1').classList.add('rolling');
                document.getElementById('classic-computer-dice2').classList.add('rolling');
                setTimeout(() => {
                    
                    document.getElementById('classic-computer-dice1').classList.remove('rolling');
                    document.getElementById('classic-computer-dice2').classList.remove('rolling');
                }, 800);
            }
        }
    }

    // Message display system (shared)
    function showMessage(message, type = 'success') {

        const messageElement       = document.getElementById('message');

        messageElement.textContent = message;
        messageElement.className   = `message ${type} show`;

        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }
}); 


//Me tired, folks : 2:54AM 2025-07-29 -Jem
