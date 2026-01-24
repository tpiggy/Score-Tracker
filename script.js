// Player scores storage
let scores = {
    1: 0,
    2: 0,
    3: 0,
    4: 0
};

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
});

// Update a player's score
function updateScore(player, points) {
    scores[player] += points;

    // Update the display
    const scoreElement = document.getElementById(`score${player}`);
    scoreElement.textContent = scores[player];

    // Add animation
    scoreElement.classList.add('score-update');
    setTimeout(() => {
        scoreElement.classList.remove('score-update');
    }, 300);

    // Update leaderboard
    updateLeaderboard();

    // Save to localStorage
    saveToLocalStorage();
}

// Reset a single player
function resetPlayer(player) {
    if (confirm(`Reset ${getPlayerName(player)}'s score?`)) {
        scores[player] = 0;
        document.getElementById(`score${player}`).textContent = 0;
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

        item.innerHTML = `
            <div class="rank-number">${rankEmoji}</div>
            <div class="player-info">
                <div class="name">${player.name}</div>
                <div class="status">${statusText}</div>
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
