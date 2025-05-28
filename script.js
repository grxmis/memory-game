
const board = document.getElementById('board');
const timerElement = document.getElementById('timer');
const restartBtn = document.getElementById('restartBtn');
const cardCountSelect = document.getElementById('cardCount');
const gameTypeSelect = document.getElementById('gameType');

let letters = [...'ABCDEFGHIJKLMNOPQRST'];
let numbers = [...Array(20).keys()].map(n => (n + 1).toString());
let colors = ['#FF5733','#33FF57','#3357FF','#F033FF','#FF33A1','#33FFFF','#FFDB33','#FF5733','#A1FF33','#5733FF','#33FF84','#FF9333','#9F33FF','#FF33C7','#FFFF33','#33A1FF','#FF33F1','#F133FF','#F1FF33','#FF33B5'];
let cards = [];
let flippedCards = [];
let matchedCards = 0;
let gameStarted = false;
let startTime, timerInterval;
let defaultColor = "#ccc";

function createCard(cardValue, cardColor) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = cardValue;
    card.dataset.color = cardColor;

    const cardInner = document.createElement('div');
    cardInner.classList.add('card-inner');

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');
    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');

    if (gameTypeSelect.value === 'colors') {
        cardBack.style.backgroundColor = cardColor;
    } else {
        cardBack.innerText = cardValue;
    }

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);

    card.addEventListener('click', () => flipCard(card));

    return card;
}

function flipCard(card) {
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
        card.classList.add('flipped');
        flippedCards.push(card);
        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }
}

function checkForMatch() {
    const [firstCard, secondCard] = flippedCards;

    if (firstCard.dataset.value === secondCard.dataset.value) {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        matchedCards += 2;
        flippedCards = [];

        if (matchedCards === cards.length) {
            clearInterval(timerInterval);
            setTimeout(() => {
                const timeTaken = Math.floor((Date.now() - startTime) / 1000);
                const msgEl = document.getElementById("game-message");
                msgEl.classList.remove("hidden");
                msgEl.innerText = `🎉 Συγχαρητήρια! Κέρδισες! Χρόνος: ${timeTaken} δευτερόλεπτα.`;
                disableCards();
            }, 500);
        }
    } else {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function initializeGame() {
    const selectedCardCount = parseInt(cardCountSelect.value);
    const gameType = gameTypeSelect.value;

    let selectedCharacters = [];
    if (gameType === 'letters') {
        selectedCharacters = letters.slice(0, selectedCardCount / 2);
    } else if (gameType === 'numbers') {
        selectedCharacters = numbers.slice(0, selectedCardCount / 2);
    } else if (gameType === 'colors') {
        selectedCharacters = colors.slice(0, selectedCardCount / 2);
    }

    cards = shuffle([...selectedCharacters, ...selectedCharacters]);
    matchedCards = 0;
    flippedCards = [];
    board.innerHTML = '';

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    cards.forEach(cardValue => {
        const cardColor = gameType === 'colors' ? cardValue : defaultColor;
        const card = createCard(cardValue, cardColor);
        board.appendChild(card);
    });

    board.setAttribute('data-size', selectedCardCount);
    gameStarted = false;
    timerElement.innerText = 'Χρόνος: 0';
    document.getElementById("game-message").classList.add("hidden");
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timerElement.innerText = `Χρόνος: ${elapsed}`;
    }, 1000);
}

function disableCards() {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.removeEventListener('click', () => flipCard(card));
    });
}

restartBtn.addEventListener('click', () => {
    initializeGame();
});

cardCountSelect.addEventListener('change', initializeGame);
gameTypeSelect.addEventListener('change', initializeGame);

initializeGame();
