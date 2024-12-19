// script.js

// Utility Functions
const getElement = (selector) => document.querySelector(selector);
const getElements = (selector) => document.querySelectorAll(selector);
const hideElement = (element) => element.classList.add('hidden');
const showElement = (element) => element.classList.remove('hidden');


// Variables
let serverCode = '';
let players = [];
let questions = [
    "What's the funniest thing you've ever seen?",
    "If you could be an animal, which one would you be and why?",
    "What's the weirdest thing you've ever eaten?",
    "If you could live anywhere, where would it be?",
    "What's your dream superpower?"
];
let answers = [];
let currentQuestion = '';
let currentPlayerIndex = 0;
let scores = {};

// Pages
const pageProfile = getElement('#page-profile');
const pageLobby = getElement('#page-lobby');
const pageGame = getElement('#page-game');
const pageVoting = getElement('#page-voting');
const pageScoreboard = getElement('#page-scoreboard');

// Profile Page Elements
const createServerButton = getElement('.create-server');
const joinServerButton = getElement('.join-server');
const joinInput = getElement('.join-input');
const joinButton = getElement('.join');
const nameInput = getElement('.name');

// Lobby Page Elements
const playerList = getElement('.player-list');
const serverCodeDisplay = getElement('.server-code-display');
const startGameButton = getElement('.start-game');

// Game Page Elements
const timerDisplay = getElement('.timer');
const questionDisplay = getElement('.question');
const answerInput = getElement('.answer');
const submitAnswerButton = getElement('.submit-answer');

// Voting Page Elements
const answerDisplay = getElement('.answer-display');
const voteOptions = getElements('.vote');

// Scoreboard Page Elements
const scoreboardList = getElement('.scoreboard');

// Navigation
const navigateToPage = (page) => {
    console.log("Navigating to Page:", page.id); // Debug log
    // Hide all pages
    [pageProfile, pageLobby, pageGame, pageVoting, pageScoreboard].forEach((p) => {
        if (p) p.classList.remove('active');
    });

    // Show the target page
    if (page) page.classList.add('active');
};


// Generate Random Server Code
const generateServerCode = () => {
    return Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Event Handlers
createServerButton.addEventListener('click', () => {
    const playerName = nameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name.');
        return;
    }

    console.log(`Player Name Entered: ${playerName}`); // Debug
    console.log("Server code being generated...");
    
    serverCode = generateServerCode();
    console.log(`Server Code: ${serverCode}`);

    players.push({ name: playerName, isHost: true });
    console.log("Players:", players); // Debug
    
    serverCodeDisplay.textContent = serverCode;
    updatePlayerList();
    startGameButton.classList.remove('hidden');

    console.log("Navigating to Lobby...");
    navigateToPage(pageLobby);
});



joinServerButton.addEventListener('click', () => {
    showElement(joinInput);
});

joinButton.addEventListener('click', () => {
    const playerName = nameInput.value.trim();
    const enteredCode = getElement('.server-code').value.trim();
    if (!playerName || !enteredCode) {
        alert('Please enter your name and a valid server code.');
        return;
    }

    if (enteredCode === serverCode) {
        players.push({ name: playerName, isHost: false });
        updatePlayerList();
        navigateToPage(pageLobby);
    } else {
        alert('Invalid server code.');
    }
});

startGameButton.addEventListener('click', () => {
    if (players.length < 2) {
        alert('At least 2 players are required to start the game.');
        return;
    }
    
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    questionDisplay.textContent = currentQuestion;
    navigateToPage(pageGame);
    startTimer(300, () => {
        alert('Time Over');
        navigateToPage(pageVoting);
        loadVoting();
    });
});

submitAnswerButton.addEventListener('click', () => {
    const answer = answerInput.value.trim();
    if (!answer) {
        alert('Please write an answer.');
        return;
    }
    
    answers.push({ player: players[currentPlayerIndex].name, answer, votes: [] });
    answerInput.value = '';
    currentPlayerIndex++;

    if (currentPlayerIndex === players.length) {
        navigateToPage(pageVoting);
        loadVoting();
    } else {
        questionDisplay.textContent = `${players[currentPlayerIndex].name}'s turn to answer.`;
    }
});

voteOptions.forEach((button) => {
    button.addEventListener('click', (e) => {
        const points = parseInt(e.target.dataset.points, 10);
        const voter = players[currentPlayerIndex].name;
        const answer = answers[currentPlayerIndex];

        if (voter === answer.player) {
            alert("You cannot vote for your own answer.");
            return;
        }

        answer.votes.push({ voter, points });
        currentPlayerIndex++;

        if (currentPlayerIndex === players.length) {
            calculateScores();
            navigateToPage(pageScoreboard);
            displayScoreboard();
        } else {
            loadVoting();
        }
    });
});

// Helper Functions
const updatePlayerList = () => {
    playerList.innerHTML = '';
    players.forEach((player) => {
        const listItem = document.createElement('li');
        listItem.textContent = player.isHost ? `${player.name} 👑` : player.name;
        playerList.appendChild(listItem);
    });
};

const startTimer = (seconds, callback) => {
    let remaining = seconds;
    const interval = setInterval(() => {
        const minutes = Math.floor(remaining / 60);
        const secs = remaining % 60;
        timerDisplay.textContent = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        remaining--;
        if (remaining < 0) {
            clearInterval(interval);
            callback();
        }
    }, 1000);
};

const loadVoting = () => {
    const currentAnswer = answers[currentPlayerIndex];
    answerDisplay.textContent = currentAnswer.answer;
};

const calculateScores = () => {
    scores = {};
    answers.forEach(({ player, votes }) => {
        votes.forEach(({ points }) => {
            scores[player] = (scores[player] || 0) + points;
        });
    });
};

const displayScoreboard = () => {
    scoreboardList.innerHTML = '';
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    sortedScores.slice(0, 3).forEach(([player, score]) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `${player}: ${score} <button class="show-answer">Show Answer</button>`;
        scoreboardList.appendChild(listItem);
    });
};
