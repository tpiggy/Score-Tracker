// Player scores storage
let scores = {
    1: 0,
    2: 0,
    3: 0,
    4: 0
};

// Score history for undo functionality
let scoreHistory = [];
const MAX_HISTORY = 50;

// Round history for tracking each round
let roundHistory = [];
const MAX_ROUNDS = 100;

// Debounce state
let isUpdating = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data from localStorage
    loadFromLocalStorage();

    // Update leaderboard on load
    updateLeaderboard();

    // Add event listeners for player name changes
    for (let i = 1; i <= 4; i++) {
        const nameInput = document.getElementById(`player${i}-name`);
        nameInput.addEventListener('input', function() {
            saveToLocalStorage();
            updateLeaderboard();
        });
    }

    // Add keyboard shortcuts
    setupKeyboardShortcuts();

    // Add touch/swipe support for mobile
    setupTouchSupport();

    // Render round history on load
    renderRoundHistory();
});

// Update a player's score with enhanced feedback
function updateScore(player, points) {
    // Prevent rapid clicking (debounce)
    if (isUpdating) return;
    isUpdating = true;
    setTimeout(() => isUpdating = false, 100);

    // Store previous score for undo
    scoreHistory.unshift({
        player: player,
        previousScore: scores[player],
        newScore: scores[player] + points,
        timestamp: Date.now()
    });

    // Limit history size
    if (scoreHistory.length > MAX_HISTORY) {
        scoreHistory.pop();
    }

    // Update score
    const previousScore = scores[player];
    scores[player] += points;

    // Update the displays
    const scoreElement = document.getElementById(`score${player}`);
    const prevElement = document.getElementById(`score-prev${player}`);
    const arrowElement = document.getElementById(`score-arrow${player}`);
    const changeElement = document.getElementById(`score-change${player}`);

    // Show previous score
    prevElement.textContent = previousScore;
    scoreElement.textContent = scores[player];

    // Update change indicator
    const changeText = points > 0 ? `+${points}` : `${points}`;
    changeElement.textContent = changeText;
    changeElement.className = `score-change ${points > 0 ? 'change-positive' : points < 0 ? 'change-negative' : 'change-neutral'}`;

    // Update arrow based on change
    arrowElement.textContent = points > 0 ? '↑' : points < 0 ? '↓' : '→';
    arrowElement.className = `score-arrow ${points > 0 ? 'arrow-up' : points < 0 ? 'arrow-down' : ''}`;

    // Enhanced animation with direction-aware feedback
    scoreElement.classList.remove('score-up', 'score-down', 'score-update');
    prevElement.classList.remove('score-up', 'score-down');
    void scoreElement.offsetWidth; // Trigger reflow
    scoreElement.classList.add(points > 0 ? 'score-up' : 'score-down');

    // Pulse effect on the player card
    const playerCard = document.querySelector(`.player-card[data-player="${player}"]`);
    playerCard.classList.add('card-pulse');
    setTimeout(() => playerCard.classList.remove('card-pulse'), 300);

    // Update leaderboard
    updateLeaderboard();

    // Save to localStorage
    saveToLocalStorage();

    // Play sound effect (optional)
    playScoreSound(points);
}

// Undo last score change
function undoLastScore() {
    if (scoreHistory.length === 0) {
        showNotification('No actions to undo');
        return;
    }

    const lastChange = scoreHistory.shift();
    scores[lastChange.player] = lastChange.previousScore;

    // Update display
    document.getElementById(`score${lastChange.player}`).textContent = lastChange.previousScore;

    // Update leaderboard
    updateLeaderboard();

    // Save to localStorage
    saveToLocalStorage();

    showNotification(`Undo: ${getPlayerName(lastChange.player)}'s score restored`);
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ignore if typing in an input
        if (e.target.tagName === 'INPUT') {
            // Allow Ctrl+Z for undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undoLastScore();
            }
            return;
        }

        // Player number + modifier for score changes
        const playerNum = parseInt(e.key);
        if (playerNum >= 1 && playerNum <= 4) {
            if (e.shiftKey) {
                updateScore(playerNum, 5); // Shift + number = +5
            } else if (e.altKey) {
                updateScore(playerNum, -5); // Alt + number = -5
            } else {
                updateScore(playerNum, 1); // Number alone = +1
            }
        }

        // Arrow keys for quick navigation
        if (e.key === 'ArrowLeft') {
            navigateToPlayer(-1);
        } else if (e.key === 'ArrowRight') {
            navigateToPlayer(1);
        } else if (e.key === 'ArrowUp') {
            updateScore(getCurrentPlayer(), 1);
        } else if (e.key === 'ArrowDown') {
            updateScore(getCurrentPlayer(), -1);
        }

        // Ctrl/Cmd + R = reset all
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            resetAll();
        }

        // Ctrl/Cmd + Z = undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undoLastScore();
        }
    });
}

// Track current player for arrow key navigation
let currentPlayer = 1;

function getCurrentPlayer() {
    return currentPlayer;
}

function navigateToPlayer(direction) {
    currentPlayer += direction;
    if (currentPlayer > 4) currentPlayer = 1;
    if (currentPlayer < 1) currentPlayer = 4;

    // Highlight current player
    document.querySelectorAll('.player-card').forEach(card => {
        card.classList.remove('current-player');
    });
    document.querySelector(`.player-card[data-player="${currentPlayer}"]`).classList.add('current-player');
}

// Touch/swipe support for mobile
function setupTouchSupport() {
    let touchStartX = 0;
    let touchStartY = 0;

    document.querySelectorAll('.player-card').forEach(card => {
        let startX = 0, startY = 0;

        card.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        card.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = endX - startX;
            const diffY = endY - startY;

            // Minimum swipe distance
            if (Math.abs(diffX) < 50 && Math.abs(diffY) < 50) return;

            // Horizontal swipe = +/- 5, Vertical = +/- 1
            const player = parseInt(card.dataset.player);
            if (Math.abs(diffX) > Math.abs(diffY)) {
                updateScore(player, diffX > 0 ? 5 : -5);
            } else {
                updateScore(player, diffY > 0 ? 1 : -1);
            }
        }, { passive: true });
    });
}

// Play sound effect (optional)
function playScoreSound(points) {
    // Sound effects are disabled by default
    // To enable, uncomment below and add audio files
    /*
    const audio = new Audio(points > 0 ? 'sounds/score-up.mp3' : 'sounds/score-down.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore errors if audio not available
    */
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        animation: fadeInOut 2s ease forwards;
    `;

    document.body.appendChild(notification);

    // Add animation keyframes if not exists
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                15%, 85% { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    // Remove after animation
    setTimeout(() => notification.remove(), 2000);
}

// ===== ROUND HISTORY FUNCTIONS =====

// Start a new round - saves current scores as a round entry
function startNewRound() {
    const round = {
        number: roundHistory.length + 1,
        timestamp: Date.now(),
        scores: { ...scores },
        names: {}
    };

    // Store player names
    for (let i = 1; i <= 4; i++) {
        round.names[i] = getPlayerName(i);
    }

    // Add to history
    roundHistory.unshift(round);

    // Limit history size
    if (roundHistory.length > MAX_ROUNDS) {
        roundHistory.pop();
    }

    // Save to localStorage
    saveRoundHistory();

    // Render the history
    renderRoundHistory();

    // Show notification
    showNotification(`Round ${round.number} saved!`);
}

// Render round history in the UI
function renderRoundHistory() {
    const container = document.getElementById('round-history-list');
    container.innerHTML = '';

    if (roundHistory.length === 0) {
        container.innerHTML = '<div class="no-history">No rounds recorded yet. Click "New Round" to save the current scores.</div>';
        return;
    }

    roundHistory.forEach((round, index) => {
        const roundElement = document.createElement('div');
        roundElement.className = 'round-entry';

        // Format timestamp
        const date = new Date(round.timestamp);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

        // Build scores HTML
        let scoresHtml = '';
        for (let i = 1; i <= 4; i++) {
            const name = round.names[i] || `Player ${i}`;
            const score = round.scores[i] || 0;
            scoresHtml += `<span class="round-score-item"><strong>${name}:</strong> ${score}</span>`;
        }

        roundElement.innerHTML = `
            <div class="round-header">
                <span class="round-number">Round ${round.number}</span>
                <span class="round-time">${dateStr} ${timeStr}</span>
            </div>
            <div class="round-scores">
                ${scoresHtml}
            </div>
        `;

        container.appendChild(roundElement);
    });
}

// Clear round history
function clearRoundHistory() {
    if (confirm('Clear all round history? This cannot be undone.')) {
        roundHistory = [];
        saveRoundHistory();
        renderRoundHistory();
        showNotification('Round history cleared');
    }
}

// Save round history to localStorage
function saveRoundHistory() {
    localStorage.setItem('scoreTrackerRoundHistory', JSON.stringify(roundHistory));
}

// Load round history from localStorage
function loadRoundHistory() {
    const saved = localStorage.getItem('scoreTrackerRoundHistory');
    if (saved) {
        try {
            roundHistory = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading round history:', e);
            roundHistory = [];
        }
    }
}

// Modify loadFromLocalStorage to also load round history
const originalLoadFromLocalStorage = loadFromLocalStorage;
loadFromLocalStorage = function() {
    originalLoadFromLocalStorage();
    loadRoundHistory();
};

// Reset a single player
function resetPlayer(player) {
    if (confirm(`Reset ${getPlayerName(player)}'s score?`)) {
        scores[player] = 0;
        document.getElementById(`score${player}`).textContent = 0;
        document.getElementById(`score-prev${player}`).textContent = 0;
        document.getElementById(`score-change${player}`).textContent = '+0';
        document.getElementById(`score-arrow${player}`).textContent = '→';
        document.getElementById(`score-change${player}`).className = 'score-change change-neutral';
        updateLeaderboard();
        saveToLocalStorage();
    }
}

// Reset all players
function resetAll() {
    if (confirm('Reset all players? This will clear all scores but keep player names.')) {
        for (let i = 1; i <= 4; i++) {
            scores[i] = 0;
            document.getElementById(`score${i}`).textContent = 0;
            document.getElementById(`score-prev${i}`).textContent = 0;
            document.getElementById(`score-change${i}`).textContent = '+0';
            document.getElementById(`score-arrow${i}`).textContent = '→';
            document.getElementById(`score-change${i}`).className = 'score-change change-neutral';
        }
        updateLeaderboard();
        saveToLocalStorage();
    }
}

// Get player name or default
function getPlayerName(player) {
    const nameInput = document.getElementById(`player${player}-name`);
    return nameInput.value.trim() || nameInput.placeholder;
}

// Update the leaderboard
function updateLeaderboard() {
    // Create array of players with their scores
    const playerData = [];
    for (let i = 1; i <= 4; i++) {
        playerData.push({
            id: i,
            name: getPlayerName(i),
            score: scores[i]
        });
    }

    // Sort by score (descending)
    playerData.sort((a, b) => b.score - a.score);

    // Handle ties - players with same score get same rank
    let currentRank = 1;
    for (let i = 0; i < playerData.length; i++) {
        if (i > 0 && playerData[i].score < playerData[i - 1].score) {
            currentRank = i + 1;
        }
        playerData[i].rank = currentRank;
    }

    // Update rank badges on player cards
    for (let i = 1; i <= 4; i++) {
        const player = playerData.find(p => p.id === i);
        const rankBadge = document.getElementById(`rank${i}`);

        if (player.rank === 1) {
            rankBadge.textContent = '🥇';
        } else if (player.rank === 2) {
            rankBadge.textContent = '🥈';
        } else if (player.rank === 3) {
            rankBadge.textContent = '🥉';
        } else {
            rankBadge.textContent = `#${player.rank}`;
        }
    }

    // Update leaderboard display
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';

    // Find max score for bar chart scaling
    const maxScore = Math.max(...playerData.map(p => p.score), 1); // Minimum 1 to avoid division by zero

    playerData.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = `leaderboard-item rank-${player.rank}`;

        let rankEmoji;
        if (player.rank === 1) {
            rankEmoji = '🥇';
        } else if (player.rank === 2) {
            rankEmoji = '🥈';
        } else if (player.rank === 3) {
            rankEmoji = '🥉';
        } else {
            rankEmoji = player.rank;
        }

        let statusText = '';
        if (player.rank === 1 && player.score > 0) {
            statusText = '🔥 Leading!';
        } else if (index === playerData.length - 1 && player.score < playerData[0].score) {
            statusText = 'Keep going!';
        } else if (player.score === 0) {
            statusText = 'No score yet';
        } else {
            const diff = playerData[0].score - player.score;
            if (diff > 0) {
                statusText = `${diff} behind leader`;
            }
        }

        // Calculate bar width percentage
        const barPercentage = maxScore > 0 ? (player.score / maxScore) * 100 : 0;
        const barWidth = Math.max(barPercentage, 0);

        item.innerHTML = `
            <div class="rank-number">${rankEmoji}</div>
            <div class="player-info">
                <div class="name">${player.name}</div>
                <div class="status">${statusText}</div>
            </div>
            <div class="bar-chart-container">
                <div class="bar-chart">
                    <div class="bar-fill" style="width: ${barWidth}%">
                        ${barWidth >= 25 ? `<span class="bar-percentage">${Math.round(barPercentage)}%</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="leaderboard-score">${player.score}</div>
        `;

        leaderboardList.appendChild(item);
    });
}

// Save to localStorage
function saveToLocalStorage() {
    const data = {
        scores: scores,
        names: {}
    };

    for (let i = 1; i <= 4; i++) {
        const nameInput = document.getElementById(`player${i}-name`);
        data.names[i] = nameInput.value;
    }

    localStorage.setItem('scoreTrackerData', JSON.stringify(data));
}

// Load from localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('scoreTrackerData');
    if (saved) {
        try {
            const data = JSON.parse(saved);

            // Restore scores
            if (data.scores) {
                scores = data.scores;
                for (let i = 1; i <= 4; i++) {
                    document.getElementById(`score${i}`).textContent = scores[i];
                    document.getElementById(`score-prev${i}`).textContent = 0;
                    document.getElementById(`score-change${i}`).textContent = '+0';
                    document.getElementById(`score-arrow${i}`).textContent = '→';
                }
            }

            // Restore names
            if (data.names) {
                for (let i = 1; i <= 4; i++) {
                    const nameInput = document.getElementById(`player${i}-name`);
                    if (data.names[i]) {
                        nameInput.value = data.names[i];
                    }
                }
            }
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + R to reset all (prevent default browser refresh)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetAll();
    }
});
