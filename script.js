let allWords = [];
let filteredWords = [];
let currentIndex = 0;

const card = document.getElementById('flashcard');
const wordText = document.getElementById('wordText');
const translationText = document.getElementById('translationText');
const exampleText = document.getElementById('exampleText');
const progress = document.getElementById('progress');

// 1. Fetch Data
async function loadWords() {
    try {
        const response = await fetch('B1word.json');
        allWords = await response.json();
        filteredWords = [...allWords];
        updateCard();
    } catch (err) {
        wordText.innerText = "Error loading JSON";
    }
}

// 2. UI Updates
function updateCard() {
    if (filteredWords.length === 0) return;
    
    const current = filteredWords[currentIndex];
    wordText.innerText = current.word;
    translationText.innerText = current.translation;
    exampleText.innerText = `"${current.example}"`;
    
    progress.innerText = `Card ${currentIndex + 1} / ${filteredWords.length}`;
    card.classList.remove('flipped');
}

// 3. Navigation Functions
function nextCard() {
    currentIndex = (currentIndex + 1) % filteredWords.length;
    updateCard();
}

function prevCard() {
    currentIndex = (currentIndex - 1 + filteredWords.length) % filteredWords.length;
    updateCard();
}

// 4. Event Listeners
card.addEventListener('click', () => card.classList.toggle('flipped'));

document.getElementById('nextBtn').addEventListener('click', nextCard);
document.getElementById('prevBtn').addEventListener('click', prevCard);

document.getElementById('randomBtn').addEventListener('click', () => {
    currentIndex = Math.floor(Math.random() * filteredWords.length);
    updateCard();
});

document.getElementById('shuffleBtn').addEventListener('click', () => {
    filteredWords.sort(() => Math.random() - 0.5);
    currentIndex = 0;
    updateCard();
});

document.getElementById('categoryFilter').addEventListener('change', (e) => {
    const cat = e.target.value;
    filteredWords = cat === 'all' ? [...allWords] : allWords.filter(w => w.category === cat);
    currentIndex = 0;
    updateCard();
});

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
