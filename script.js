let decks = {
    b1: [],
    b2: [],
    myWords: JSON.parse(localStorage.getItem('myGermanWords')) || [],
    travel: [], // New theme
    food: []    // New theme
};
let currentDeck = 'b1';
let words = []; 
let currentWordIndex = 0;
let srsData = JSON.parse(localStorage.getItem('germanSrsData')) || {};
let quizScore = 0;
let currentQuizWord = null;

// DOM Elements
const views = document.querySelectorAll('.view-section');
const navBtns = document.querySelectorAll('.nav-btn');
const deckBtns = document.querySelectorAll('.deck-btn');

const flashcard = document.getElementById('flashcard');
const wordGerman = document.getElementById('word-german');
const wordEnglish = document.getElementById('word-english');
const wordExample = document.getElementById('word-example');

// Switch Views (Flashcard, Quiz, Add Word)
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        views.forEach(view => view.classList.add('hidden'));
        document.getElementById(btn.dataset.target).classList.remove('hidden');
        if (btn.dataset.target === 'quiz-section') loadQuizQuestion();
    });
});

// Switch Decks (B1, B2, My Words)
deckBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        deckBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDeck = btn.dataset.deck;
        words = decks[currentDeck];
        loadNextFlashcard();
    });
});

// Load JSON Files
Promise.all([
    fetch('b1.json').then(res => res.json()).catch(() => []),
    fetch('b2.json').then(res => res.json()).catch(() => []),
    fetch('travel.json').then(res => res.json()).catch(() => []),
    fetch('food.json').then(res => res.json()).catch(() => [])
]).then(([b1Data, b2Data, travelData, foodData]) => {
    decks.b1 = b1Data;
    decks.b2 = b2Data;
    decks.travel = travelData;
    decks.food = foodData;
    words = decks.b1; // Default start
    loadNextFlashcard();
});

// --- Flashcard Logic ---
flashcard.addEventListener('click', () => flashcard.classList.toggle('flipped'));

document.getElementById('btn-audio').addEventListener('click', (e) => {
    e.stopPropagation();
    if (!words[currentWordIndex]) return;
    const utterance = new SpeechSynthesisUtterance(words[currentWordIndex].german);
    utterance.lang = 'de-DE';
    
    // Set the speed rate (1 is default, 0.5 is half speed, 2 is double speed)
    utterance.rate = 0.8; 

    window.speechSynthesis.speak(utterance);
});

function loadNextFlashcard() {
    if (words.length === 0) {
        wordGerman.textContent = "No words here yet!";
        wordEnglish.textContent = "";
        wordExample.textContent = "";
        return;
    }
    
    let pool = [];
    words.forEach((word, index) => {
        let weight = srsData[word.german] || 2; 
        for (let i = 0; i < weight; i++) pool.push(index);
    });
    
    currentWordIndex = pool[Math.floor(Math.random() * pool.length)];
    updateFlashcardUI();
}

function updateFlashcardUI() {
    flashcard.classList.remove('flipped');
    const word = words[currentWordIndex];
    wordGerman.textContent = word.german;
    wordEnglish.textContent = word.english;
    wordExample.textContent = word.example || "";
}

document.getElementById('btn-next').addEventListener('click', loadNextFlashcard);
document.getElementById('btn-prev').addEventListener('click', () => {
    if (words.length === 0) return;
    currentWordIndex = currentWordIndex > 0 ? currentWordIndex - 1 : words.length - 1;
    updateFlashcardUI();
});

// Difficulty Buttons
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (words.length === 0) return;
        const level = e.target.dataset.level;
        const currentWord = words[currentWordIndex].german;
        
        if (level === 'easy') srsData[currentWord] = 1;
        if (level === 'medium') srsData[currentWord] = 2;
        if (level === 'hard') srsData[currentWord] = 4;
        
        localStorage.setItem('germanSrsData', JSON.stringify(srsData));
        loadNextFlashcard();
    });
});

// --- Add New Word Logic ---
document.getElementById('btn-save-word').addEventListener('click', () => {
    const ger = document.getElementById('new-german').value.trim();
    const eng = document.getElementById('new-english').value.trim();
    const ex = document.getElementById('new-example').value.trim();
    const msg = document.getElementById('save-msg');

    if (!ger || !eng) {
        msg.textContent = "German and English fields are required.";
        msg.style.color = "red";
        return;
    }

    decks.myWords.push({ german: ger, english: eng, example: ex });
    localStorage.setItem('myGermanWords', JSON.stringify(decks.myWords));
    
    if (currentDeck === 'myWords') words = decks.myWords;

    document.getElementById('new-german').value = '';
    document.getElementById('new-english').value = '';
    document.getElementById('new-example').value = '';
    
    msg.textContent = "Word saved successfully!";
    msg.style.color = "green";
    setTimeout(() => msg.textContent = "", 2000);
    
    if (currentDeck === 'myWords') loadNextFlashcard();
});

// --- Quiz Logic ---
const quizWord = document.getElementById('quiz-word');
const quizOptions = document.getElementById('quiz-options');
const quizFeedback = document.getElementById('quiz-feedback');
const quizScoreDisplay = document.getElementById('quiz-score');

function loadQuizQuestion() {
    quizFeedback.textContent = '';
    document.getElementById('btn-next-quiz').classList.add('hidden');
    quizOptions.innerHTML = '';
    
    if (words.length < 4) {
        quizWord.textContent = "Need at least 4 words in this deck.";
        return;
    }

    currentQuizWord = words[Math.floor(Math.random() * words.length)];
    quizWord.textContent = currentQuizWord.german;

    let options = [currentQuizWord.english];
    while (options.length < 4) {
        let randomWord = words[Math.floor(Math.random() * words.length)].english;
        if (!options.includes(randomWord)) options.push(randomWord);
    }

    options.sort(() => Math.random() - 0.5);

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = option;
        btn.addEventListener('click', () => handleQuizAnswer(btn, option));
        quizOptions.appendChild(btn);
    });
}

function handleQuizAnswer(btn, selected) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);

    if (selected === currentQuizWord.english) {
        btn.classList.add('correct');
        quizFeedback.textContent = 'Correct!';
        quizScore++;
        srsData[currentQuizWord.german] = 1; 
    } else {
        btn.classList.add('incorrect');
        quizFeedback.textContent = `Incorrect. Answer is ${currentQuizWord.english}.`;
        srsData[currentQuizWord.german] = 4; 
    }
    
    localStorage.setItem('germanSrsData', JSON.stringify(srsData));
    quizScoreDisplay.textContent = quizScore;
    document.getElementById('btn-next-quiz').classList.remove('hidden');
}

document.getElementById('btn-next-quiz').addEventListener('click', loadQuizQuestion);
document.getElementById('external-link-btn').addEventListener('click', () => {
    window.open('https://barua-saurab.github.io/Deutsch/', '_blank');

document.getElementById('theme-dropdown').addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    
    if (selectedTheme) {
        // Turn off the other buttons
        document.querySelectorAll('.deck-btn').forEach(b => b.classList.remove('active'));
        
        // Switch the deck
        currentDeck = selectedTheme;
        words = decks[currentDeck];
        loadNextFlashcard();
    }
});
});
