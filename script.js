
const board = document.getElementById('board');
const timerElement = document.getElementById('timer');
const restartBtn = document.getElementById('restartBtn');
const cardCountSelect = document.getElementById('cardCount');
const gameTypeSelect = document.getElementById('gameType');

let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, 20);
let numbers = Array.from({length: 20}, (_, i) => (i + 1).toString());
let colors = ['#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A1', '#33FFFF', '#FFDB33', '#FF5733', '#A1FF33', '#5733FF', '#33FF84', '#FF9333', '#9F33FF', '#FF33C7', '#FFFF33', '#33A1FF', '#FF33F1', '#F133FF', '#F1FF33', '#FF33B5'];

let cards = [];
let flippedCards = [];
let matchedCards = 0;
let gameStarted = false;
let startTime, timerInterval;

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
        cardBack.textContent = '';
    } else {
        cardBack.textContent = cardValue;
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
                alert(`Συγχαρητήρια! Κέρδισες! Χρόνος: ${timeTaken} δευτερόλεπτα.`);
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
    const cardPairsCount = selectedCardCount / 2;
    const gameType = gameTypeSelect.value;

    let selectedCharacters = [];

    if (gameType === 'letters') {
        selectedCharacters = letters.slice(0, cardPairsCount);
    } else if (gameType === 'numbers') {
        selectedCharacters = numbers.slice(0, cardPairsCount);
    } else if (gameType === 'colors') {
        selectedCharacters = colors.slice(0, cardPairsCount);
    }

    const shuffled = shuffle(selectedCharacters.concat(selectedCharacters));
    cards = shuffle(shuffled);

    matchedCards = 0;
    flippedCards = [];
    board.innerHTML = '';
    board.setAttribute('data-size', selectedCardCount);

    cards.forEach(val => {
        const color = gameType === 'colors' ? val : "#ccc";
        const card = createCard(val, color);
        board.appendChild(card);
    });

    if (gameStarted) clearInterval(timerInterval);
    gameStarted = false;
    timerElement.innerText = 'Χρόνος: 0';
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timerElement.innerText = `Χρόνος: ${elapsed}`;
    }, 1000);
}

restartBtn.addEventListener('click', () => {
    gameStarted = false;
    initializeGame();
});

cardCountSelect.addEventListener('change', initializeGame);
gameTypeSelect.addEventListener('change', initializeGame);

initializeGame();
