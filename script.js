
const translations = {
  el: {
    title: "Παιχνίδι Μνήμης",
    restart: "Ξεκίνα ξανά",
    time: "Χρόνος",
    score: "Σκορ",
    win: "🎉 Συγχαρητήρια! Χρόνος: {time} δευτ. | Σκορ: {score}",
    letters: "Γράμματα",
    numbers: "Αριθμοί",
    colors: "Χρώματα",
    images: "Εικόνες",
    easy: "Εύκολο",
    medium: "Μεσαίο",
    hard: "Δύσκολο"
  },
  en: {
    title: "Memory Game",
    restart: "Restart",
    time: "Time",
    score: "Score",
    win: "🎉 Congratulations! Time: {time} sec | Score: {score}",
    letters: "Letters",
    numbers: "Numbers",
    colors: "Colors",
    images: "Images",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard"
  },
  de: {
    title: "Gedächtnisspiel",
    restart: "Neu starten",
    time: "Zeit",
    score: "Punkte",
    win: "🎉 Glückwunsch! Zeit: {time} Sek. | Punkte: {score}",
    letters: "Buchstaben",
    numbers: "Zahlen",
    colors: "Farben",
    images: "Bilder",
    easy: "Einfach",
    medium: "Mittel",
    hard: "Schwer"
  },
  fr: {
    title: "Jeu de Mémoire",
    restart: "Redémarrer",
    time: "Temps",
    score: "Score",
    win: "🎉 Félicitations ! Temps : {time} sec | Score : {score}",
    letters: "Lettres",
    numbers: "Nombres",
    colors: "Couleurs",
    images: "Images",
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile"
  },
  it: {
    title: "Gioco di Memoria",
    restart: "Riavvia",
    time: "Tempo",
    score: "Punteggio",
    win: "🎉 Complimenti! Tempo: {time} sec | Punteggio: {score}",
    letters: "Lettere",
    numbers: "Numeri",
    colors: "Colori",
    images: "Immagini",
    easy: "Facile",
    medium: "Medio",
    hard: "Difficile"
  }
};

let currentLang = "el";

function setLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];
  document.querySelector("h1").innerText = t.title;
  restartBtn.innerText = t.restart;
  timerElement.innerText = `${t.time}: 0`;
  scoreElement.innerText = `${t.score}: 0`;
  document.querySelector("#gameType option[value='letters']").innerText = t.letters;
  document.querySelector("#gameType option[value='numbers']").innerText = t.numbers;
  document.querySelector("#gameType option[value='colors']").innerText = t.colors;
  document.querySelector("#gameType option[value='images']").innerText = t.images;
  document.querySelector("#difficulty option[value='easy']").innerText = t.easy;
  document.querySelector("#difficulty option[value='medium']").innerText = t.medium;
  document.querySelector("#difficulty option[value='hard']").innerText = t.hard;
}

document.getElementById('languageSelect').addEventListener('change', (e) => {
  setLanguage(e.target.value);
  initializeGame();
});


const board = document.getElementById('board');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const cardCountSelect = document.getElementById('cardCount'); // (πλέον δεν χρησιμοποιείται)
const gameTypeSelect = document.getElementById('gameType');
const difficultySelect = document.getElementById('difficulty');

const successSound = new Audio('mutch2.mp3');
const failSound = new Audio('wrong2.mp3');
const winSound = new Audio('win.mp3');
const flipSound = new Audio('flip2.mp3');

let soundEnabled = true;
const soundToggle = document.getElementById("soundToggle");
soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? "🔊" : "🔇";
  soundToggle.title = soundEnabled ? "Ήχος ενεργός" : "Ήχος απενεργοποιημένος";
});

flipSound.preload = 'auto';

let letters = [...'ABCDEFGHIJKLMNOPQRSTWYZ'];
let numbers = [...Array(20).keys()].map(n => (n + 1).toString());
let colors = ['#FF5733','#33FF57','#3357FF','#F033FF','#FF33A1','#33FFFF','#FFDB33','#FF5733','#A1FF33','#5733FF','#33FF84','#FF9333','#9F33FF','#FF33C7','#FFFF33','#33A1FF','#FF33F1','#F133FF','#F1FF33','#FF33B5'];
let images = ['images/fr1.png', 'images/fr2.png', 'images/fr3.png', 'images/fr4.png', 'images/fr5.png', 'images/fr6.png', 'images/fr7.png', 'images/fr8.png', 'images/fr9.png', 'images/fr10.png','images/fr11.png','images/fr12.png'];
let animals = ['animals/animals1.png','animals/animals2.png','animals/animals3.png','animals/animals4.png','animals/animals5.png','animals/animals6.png','animals/animals7.png','animals/animals8.png','animals/animals9.png','animals/animals10.png','animals/animals11.png','animals/animals12.png','animals/animals13.png','animals/animals14.png'];
let notes = ["sounds/s1.mp3","sounds/s2.mp3","sounds/s3.mp3","sounds/s4.mp3","sounds/s5.mp3","sounds/s6.mp3","sounds/s7.mp3","sounds/s8.mp3","sounds/s9.mp3","sounds/s10.mp3"];

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
	} else if (gameTypeSelect.value === 'notes') {
    cardBack.innerText = "♪"; // Μπορείς να βάλεις και 🎵
	} else {
    cardBack.innerText = cardValue;
	}

	cardInner.appendChild(cardFront);
	cardInner.appendChild(cardBack);
	card.appendChild(cardInner);

// ✅ Προσθήκη ήχου αν είναι θεματολογία notes
	card.addEventListener('click', () => {
    if (gameTypeSelect.value === 'notes') {
        const audio = new Audio(card.dataset.value);
        audio.play();
    }
    flipCard(card);
	});

return card;

}

function flipCard(card) {
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
        flipSound.currentTime = 0;
        //if (soundEnabled) flipSound.play().catch(() => {});
		if (soundEnabled && gameTypeSelect.value !== 'notes') flipSound.play()
        card.classList.add('flipped');
        flippedCards.push(card);

        // ✅ Αναπαραγωγή ήχου για θεματολογία "Νότες"
        if (gameTypeSelect.value === 'notes') {
            const audio = new Audio(card.dataset.value);
            audio.play();
        }

        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }
}

function checkForMatch() {
    const [firstCard, secondCard] = flippedCards;

    if (firstCard.dataset.value === secondCard.dataset.value) {
        successSound.currentTime = 0;
        //if (soundEnabled) successSound.play();
		if (soundEnabled && gameTypeSelect.value !== 'notes') successSound.play()
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        matchedCards += 2;
        score += 10;
        scoreElement.innerText = `${translations[currentLang].score}: ${score}`;
        flippedCards = [];

        if (matchedCards === cards.length) {
            clearInterval(timerInterval);
            setTimeout(() => {
                winSound.currentTime = 0;
                if (soundEnabled) winSound.play();

                const elapsed = Math.floor((Date.now() - startTime) / 1000);
				timerElement.innerText = `${translations[currentLang].time}: ${elapsed}`;
				const timeTaken = elapsed;
				const winMessage = document.getElementById('win-message');
                winMessage.style.display = 'block';
                winMessage.innerText = translations[currentLang].win.replace('{time}', timeTaken).replace('{score}', score);
				launchFireworks();
                disableCards();
            }, 500);
        }
    } else {
        setTimeout(() => {
            failSound.currentTime = 0;
            //if (soundEnabled) failSound.play();
			if (soundEnabled && gameTypeSelect.value !== 'notes') failSound.play()
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            score = Math.max(0, score - 2);
            scoreElement.innerText = `${translations[currentLang].score}: ${score}`;
            flippedCards = [];
        }, 1000);
    }
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function initializeGame() {
    document.getElementById('win-message').style.display = 'none';
	const cardCount = getCardCountByDifficulty();
    const gameType = gameTypeSelect.value;

    let selectedItems = [];
    let isImageType = false;
	let isSoundType = false;

	if (gameType === 'letters') {
    selectedItems = shuffle([...letters]).slice(0, cardCount / 2);
	} else if (gameType === 'numbers') {
    selectedItems = shuffle([...numbers]).slice(0, cardCount / 2);
	} else if (gameType === 'colors') {
    selectedItems = shuffle([...colors]).slice(0, cardCount / 2);
	} else if (gameType === 'images') {
    selectedItems = shuffle([...images]).slice(0, cardCount / 2);
    isImageType = true;
	} else if (gameType === 'animals') {
	selectedItems = shuffle([...animals]).slice(0, cardCount / 2);
	isImageType = true;
	}else if (gameType === 'notes') {
	selectedItems = shuffle([...notes]).slice(0, cardCount / 2);
	isSoundType = true;
	}



    cards = shuffle([...selectedItems, ...selectedItems]);
    matchedCards = 0;
    flippedCards = [];
    score = 0;
    board.innerHTML = '';
    scoreElement.innerText = `${translations[currentLang].score}: 0`;

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
    timerElement.innerText = `${translations[currentLang].time}: 0`;
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timerElement.innerText = `${translations[currentLang].time}: ${elapsed}`;
    }, 1000);
}

function disableCards() {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.replaceWith(card.cloneNode(true));
    });
}
function launchFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#ff3', '#f06', '#0cf', '#f90', '#fff'];

  for (let i = 0; i < 100; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      dx: (Math.random() - 0.5) * 8,
      dy: (Math.random() - 0.5) * 8,
      life: 100
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.life--;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    particles.filter(p => p.life > 0);
    if (particles.some(p => p.life > 0)) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}

restartBtn.addEventListener('click', initializeGame);
gameTypeSelect.addEventListener('change', initializeGame);
difficultySelect.addEventListener('change', initializeGame);

initializeGame();
