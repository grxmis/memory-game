const board = document.getElementById('board');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const cardCountSelect = document.getElementById('cardCount'); // (πλέον δεν χρησιμοποιείται)
const gameTypeSelect = document.getElementById('gameType');
const difficultySelect = document.getElementById('difficulty');

const successSound = new Audio('success.mp3');
const failSound = new Audio('fail.mp3');
const winSound = new Audio('win.mp3');

let letters = [...'ABCDEFGHIJKLMNOPQRST'];
let numbers = [...Array(20).keys()].map(n => (n + 1).toString());
let colors = ['#FF5733','#33FF57','#3357FF','#F033FF','#FF33A1','#33FFFF','#FFDB33','#FF5733','#A1FF33','#5733FF','#33FF84','#FF9333','#9F33FF','#FF33C7','#FFFF33','#33A1FF','#FF33F1','#F133FF','#F1FF33','#FF33B5'];
let images = ['images/fr1.png', 'images/fr2.png', 'images/fr3.png', 'images/fr4.png', 'images/fr5.png', 'images/fr6.png', 'images/fr7.png', 'images/fr8.png', 'images/fr9.png', 'images/fr10.png','images/fr11.png','images/fr12.png'];

let cards = [];
let flippedCards = [];
let matchedCards = 0;
let gameStarted = false;
let startTime, timerInterval;
let defaultColor = "#ccc";
let score = 0;

function getCardCountByDifficulty() {
    const difficulty = difficultySelect.value;
    if (difficulty === 'easy') return 8;
    if (difficulty === 'medium') return 12;
    if (difficulty === 'hard') return 16;
    return 8;
}

function createCard(cardValue, cardColor, isImage = false) {
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

    if (isImage) {
        const img = document.createElement('img');
        img.src = cardValue;
        img.alt = "";
        img.style.maxWidth = "80%";
        img.style.maxHeight = "80%";
        cardBack.appendChild(img);
    } else if (gameTypeSelect.value === 'colors') {
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
        successSound.currentTime = 0;
        successSound.play();

        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        matchedCards += 2;
        score += 10;
        scoreElement.innerText = `Σκορ: ${score}`;
        flippedCards = [];

        if (matchedCards === cards.length) {
            clearInterval(timerInterval);
            setTimeout(() => {
                winSound.currentTime = 0;
                winSound.play();

                const timeTaken = Math.floor((Date.now() - startTime) / 1000);
                alert(`Συγχαρητήρια! Κέρδισες! Χρόνος: ${timeTaken} δευτερόλεπτα. Σκορ: ${score}`);
                disableCards();
            }, 500);
        }
    } else {
        setTimeout(() => {
            failSound.currentTime = 0;
            failSound.play();

            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            score = Math.max(0, score - 2);
            scoreElement.innerText = `Σκορ: ${score}`;
            flippedCards = [];
        }, 1000);
    }
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function initializeGame() {
    const cardCount = getCardCountByDifficulty();
    const gameType = gameTypeSelect.value;

    let selectedItems = [];
    let isImageType = false;

    if (gameType === 'letters') {
        selectedItems = letters.slice(0, cardCount / 2);
    } else if (gameType === 'numbers') {
        selectedItems = numbers.slice(0, cardCount / 2);
    } else if (gameType === 'colors') {
        selectedItems = colors.slice(0, cardCount / 2);
    } else if (gameType === 'images') {
        selectedItems = images.slice(0, cardCount / 2);
        isImageType = true;
    }

    cards = shuffle([...selectedItems, ...selectedItems]);
    matchedCards = 0;
    flippedCards = [];
    score = 0;
    board.innerHTML = '';
    scoreElement.innerText = 'Σκορ: 0';

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    cards.forEach(cardValue => {
        const cardColor = gameType === 'colors' ? cardValue : defaultColor;
        const card = createCard(cardValue, cardColor, isImageType);
        board.appendChild(card);
    });

    board.setAttribute('data-size', cardCount);
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

function disableCards() {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.replaceWith(card.cloneNode(true));
    });
}

restartBtn.addEventListener('click', initializeGame);
gameTypeSelect.addEventListener('change', initializeGame);
difficultySelect.addEventListener('change', initializeGame);

initializeGame();