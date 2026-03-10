let allWords = [];
let filteredWords = [];
let currentIndex = 0;

const card = document.getElementById('flashcard');
const germanEl = document.getElementById('wordGerman');
const englishEl = document.getElementById('wordEnglish');
const exampleEl = document.getElementById('wordExample');
const progressEl = document.getElementById('progress');

// 1. Load Data
async function loadWords() {
    try {
        const response = await fetch('B1word.json');
        allWords = await response.json();
        filteredWords = [...allWords];
        updateCard();
    } catch (error) {
        germanEl.textContent = "Error loading data.";
    }
}

// 2. Update UI
function updateCard() {
    if (filteredWords.length === 0) return;
    
    const word = filteredWords[currentIndex];
    germanEl.textContent = word.german;
    englishEl.textContent = word.english;
    exampleEl.textContent = word.example;
    
    progressEl.textContent = `Card ${currentIndex + 1} / ${filteredWords.length}`;
    card.classList.remove('flipped');
}

// 3. Navigation
function nextCard() {
    currentIndex = (currentIndex + 1) % filteredWords.length;
    updateCard();
}

function prevCard() {
    currentIndex = (currentIndex - 1 + filteredWords.length) % filteredWords.length;
    updateCard();
}

function randomCard() {
    currentIndex = Math.floor(Math.random() * filteredWords.length);
    updateCard();
}

// 4. Events
card.addEventListener('click', () => card.classList.toggle('flipped'));

document.getElementById('nextBtn').addEventListener('click', nextCard);
document.getElementById('prevBtn').addEventListener('click', prevCard);
document.getElementById('randomBtn').addEventListener('click', randomCard);

// Filtering
document.getElementById('categoryFilter').addEventListener('change', (e) => {
    const cat = e.target.value;
    filteredWords = cat === 'all' ? allWords : allWords.filter(w => w.category === cat);
    currentIndex = 0;
    updateCard();
});

// Dark Mode
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Keyboard Nav
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextCard();
    if (e.key === 'ArrowLeft') prevCard();
    if (e.key === ' ') card.classList.toggle('flipped');
});

loadWords();
