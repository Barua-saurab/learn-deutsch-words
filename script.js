let words = [];
let currentWordIndex = 0;
let srsData = JSON.parse(localStorage.getItem('germanSrsData')) || {};
let quizScore = 0;
let currentQuizWord = null;

// DOM Elements
const flashcardSection = document.getElementById('flashcard-section');
const quizSection = document.getElementById('quiz-section');
const flashcard = document.getElementById('flashcard');
const wordGerman = document.getElementById('word-german');
const wordEnglish = document.getElementById('word-english');
const wordExample = document.getElementById('word-example');
const quizWord = document.getElementById('quiz-word');
const quizOptions = document.getElementById('quiz-options');
const quizFeedback = document.getElementById('quiz-feedback');
const quizScoreDisplay = document.getElementById('quiz-score');

// Navigation
document.getElementById('btn-flashcards').addEventListener('click', () => {
    flashcardSection.classList.remove('hidden');
    quizSection.classList.add('hidden');
});

document.getElementById('btn-quiz').addEventListener('click', () => {
    flashcardSection.classList.add('hidden');
    quizSection.classList.remove('hidden');
    loadQuizQuestion();
});

// Fetch Vocabulary
fetch('words.json')
    .then(res => res.json())
    .then(data => {
        words = data;
        loadNextFlashcard();
    })
    .catch(err => console.error("Error loading words:", err));

// --- Flashcard Logic ---
flashcard.addEventListener('click', () => flashcard.classList.toggle('flipped'));

document.getElementById('btn-audio').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevents the card from flipping
    const utterance = new SpeechSynthesisUtterance(words[currentWordIndex].german);
    utterance.lang = 'de-DE';
    window.speechSynthesis.speak(utterance);
});

// SRS Logic: Weights determine appearance frequency
function loadNextFlashcard() {
    if (words.length === 0) return;
    flashcard.classList.remove('flipped');
    
    let pool = [];
    words.forEach((word, index) => {
        let weight = srsData[word.german] || 2; // Default weight is 2 (Medium)
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
    wordExample.textContent = word.example;
}

document.getElementById('btn-next').addEventListener('click', loadNextFlashcard);
document.getElementById('btn-prev').addEventListener('click', () => {
    currentWordIndex = currentWordIndex > 0 ? currentWordIndex - 1 : words.length - 1;
    updateFlashcardUI();
});

// Difficulty Buttons
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const level = e.target.dataset.level;
        const currentWord = words[currentWordIndex].german;
        
        // Easy = weight 1, Medium = weight 2, Hard = weight 4
        if (level === 'easy') srsData[currentWord] = 1;
        if (level === 'medium') srsData[currentWord] = 2;
        if (level === 'hard') srsData[currentWord] = 4;
        
        localStorage.setItem('germanSrsData', JSON.stringify(srsData));
        loadNextFlashcard();
    });
});

// --- Quiz Logic ---
function loadQuizQuestion() {
    quizFeedback.textContent = '';
    document.getElementById('btn-next-quiz').classList.add('hidden');
    quizOptions.innerHTML = '';
    
    if (words.length < 4) {
        quizWord.textContent = "Need at least 4 words in JSON.";
        return;
    }

    currentQuizWord = words[Math.floor(Math.random() * words.length)];
    quizWord.textContent = currentQuizWord.german;

    let options = [currentQuizWord.english];
    while (options.length < 4) {
        let randomWord = words[Math.floor(Math.random() * words.length)].english;
        if (!options.includes(randomWord)) options.push(randomWord);
    }

    // Shuffle options array
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
        srsData[currentQuizWord.german] = 1; // Mark easy
    } else {
        btn.classList.add('incorrect');
        quizFeedback.textContent = `Incorrect. The answer is ${currentQuizWord.english}.`;
        srsData[currentQuizWord.german] = 4; // Mark hard
    }
    
    localStorage.setItem('germanSrsData', JSON.stringify(srsData));
    quizScoreDisplay.textContent = quizScore;
    document.getElementById('btn-next-quiz').classList.remove('hidden');
}

document.getElementById('btn-next-quiz').addEventListener('click', loadQuizQuestion);
