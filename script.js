document.addEventListener('DOMContentLoaded', () => {
    let words = JSON.parse(localStorage.getItem('deutschWords')) || [
        { de: "Hallo", en: "Hello", mastered: false },
        { de: "Apfel", en: "Apple", mastered: false }
    ];

    let currentIndex = 0;
    let filteredWords = [];

    const card = document.getElementById('card');
    const germanText = document.getElementById('germanText');
    const englishText = document.getElementById('englishText');
    const rangeSelect = document.getElementById('rangeSelect');
    const remainingCount = document.getElementById('remainingCount');

    function filterWords() {
        const val = rangeSelect.value;
        let baseList = words.filter(w => !w.mastered);
        
        if (val === 'all') filteredWords = baseList;
        else {
            const [start, end] = val.split('-').map(Number);
            filteredWords = words.slice(start, end).filter(w => !w.mastered);
        }
        currentIndex = 0;
        updateUI();
    }

    function updateUI() {
        card.classList.remove('flipped');
        remainingCount.innerText = filteredWords.length;
        if (filteredWords.length > 0) {
            germanText.innerText = filteredWords[currentIndex].de;
            englishText.innerText = filteredWords[currentIndex].en;
        } else {
            germanText.innerText = "All Done! 🎉";
            englishText.innerText = "Great job!";
        }
    }

    document.getElementById('learnedBtn').addEventListener('click', () => {
        if (filteredWords.length === 0) return;
        const currentWord = filteredWords[currentIndex];
        const wordIndex = words.findIndex(w => w.de === currentWord.de);
        words[wordIndex].mastered = true;
        localStorage.setItem('deutschWords', JSON.stringify(words));
        filterWords();
    });

    document.getElementById('forgotBtn').addEventListener('click', () => {
        if (filteredWords.length === 0) return;
        currentIndex = (currentIndex + 1) % filteredWords.length;
        updateUI();
    });

    document.getElementById('resetMastered').addEventListener('click', () => {
        words.forEach(w => w.mastered = false);
        localStorage.setItem('deutschWords', JSON.stringify(words));
        filterWords();
    });

    card.addEventListener('click', () => card.classList.toggle('flipped'));
    rangeSelect.addEventListener('change', filterWords);
    document.getElementById('addBtn').addEventListener('click', () => {
        const de = document.getElementById('newGerman').value;
        const en = document.getElementById('newEnglish').value;
        if (de && en) {
            words.push({ de, en, mastered: false });
            localStorage.setItem('deutschWords', JSON.stringify(words));
            location.reload();
        }
    });

    filterWords();
});
