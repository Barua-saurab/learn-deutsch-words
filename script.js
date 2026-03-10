// Default word list
let words = JSON.parse(localStorage.getItem('deutschWords')) || [
    { de: "Hallo", en: "Hello" },
    { de: "Apfel", en: "Apple" },
    { de: "Brot", en: "Bread" }
];

let currentIndex = 0;
let filteredWords = [...words];

const card = document.getElementById('card');
const germanText = document.getElementById('germanText');
const englishText = document.getElementById('englishText');
const rangeSelect = document.getElementById('rangeSelect');

// Initialize UI
function updateCard() {
    card.classList.remove('flipped');
    if (filteredWords.length > 0) {
        germanText.innerText = filteredWords[currentIndex].de;
        englishText.innerText = filteredWords[currentIndex].en;
    } else {
        germanText.innerText = "No words found";
        englishText.innerText = "Add some!";
    }
}

// Flip Card
card.addEventListener('click', () => {
    card.classList.toggle('flipped');
});

// Range Logic
rangeSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'all') {
        filteredWords = [...words];
    } else {
        const [start, end] = val.split('-').map(Number);
        filteredWords = words.slice(start, end);
    }
    currentIndex = 0;
    updateCard();
});

// Next/Prev
document.getElementById('nextBtn').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % filteredWords.length;
    updateCard();
});

document.getElementById('prevBtn').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + filteredWords.length) % filteredWords.length;
    updateCard();
});

// Add New Word
document.getElementById('addBtn').addEventListener('click', () => {
    const de = document.getElementById('newGerman').value;
    const en = document.getElementById('newEnglish').value;

    if (de && en) {
        words.push({ de, en });
        localStorage.setItem('deutschWords', JSON.stringify(words));
        alert("Word added!");
        location.reload(); // Refresh to update list
    }
});

updateCard();
