document.addEventListener('DOMContentLoaded', () => {
    // Initial Word Bank
    let words = JSON.parse(localStorage.getItem('deutschWords')) || [
        { de: "Hallo", en: "Hello", level: "A1", mastered: false },
        { de: "Apfel", en: "Apple", level: "A1", mastered: false },
        { de: "Herausforderung", en: "Challenge", level: "B2", mastered: false }
    ];

    let currentIndex = 0;
    let filteredWords = [];

    const card = document.getElementById('card');
    const levelSelect = document.getElementById('levelSelect');
    const rangeSelect = document.getElementById('rangeSelect');

    function filterWords() {
        const level = levelSelect.value;
        const range = rangeSelect.value;

        // 1. Filter by Level and Mastery
        let base = words.filter(w => w.level === level && !w.mastered);

        // 2. Filter by Range
        if (range !== 'all') {
            const [start, end] = range.split('-').map(Number);
            filteredWords = base.slice(start, end);
        } else {
            filteredWords = base;
        }

        currentIndex = 0;
        updateUI();
    }

    function updateUI() {
        card.classList.remove('flipped');
        document.getElementById('remainingCount').innerText = filteredWords.length;

        if (filteredWords.length > 0) {
            document.getElementById('germanText').innerText = filteredWords[currentIndex].de;
            document.getElementById('englishText').innerText = filteredWords[currentIndex].en;
        } else {
            document.getElementById('germanText').innerText = "Empty!";
            document.getElementById('englishText').innerText = "Add more words or change level.";
        }
    }

    // Buttons
    document.getElementById('learnedBtn').addEventListener('click', () => {
        if (filteredWords.length === 0) return;
        const wordDe = filteredWords[currentIndex].de;
        const idx = words.findIndex(w => w.de === wordDe);
        words[idx].mastered = true;
        localStorage.setItem('deutschWords', JSON.stringify(words));
        filterWords();
    });

    document.getElementById('forgotBtn').addEventListener('click', () => {
        if (filteredWords.length === 0) return;
        currentIndex = (currentIndex + 1) % filteredWords.length;
        updateUI();
    });

    document.getElementById('addBtn').addEventListener('click', () => {
        const de = document.getElementById('newGerman').value;
        const en = document.getElementById('newEnglish').value;
        const level = levelSelect.value;
        if (de && en) {
            words.push({ de, en, level, mastered: false });
            localStorage.setItem('deutschWords', JSON.stringify(words));
            document.getElementById('newGerman').value = '';
            document.getElementById('newEnglish').value = '';
            filterWords();
        }
    });

    card.addEventListener('click', () => card.classList.toggle('flipped'));
    levelSelect.addEventListener('change', filterWords);
    rangeSelect.addEventListener('change', filterWords);
    document.getElementById('nextBtn').addEventListener('click', () => { currentIndex = (currentIndex + 1) % filteredWords.length; updateUI(); });
    document.getElementById('prevBtn').addEventListener('click', () => { currentIndex = (currentIndex - 1 + filteredWords.length) % filteredWords.length; updateUI(); });
    document.getElementById('resetMastered').addEventListener('click', () => { words.forEach(w => w.mastered = false); localStorage.setItem('deutschWords', JSON.stringify(words)); filterWords(); });

    filterWords();
});
