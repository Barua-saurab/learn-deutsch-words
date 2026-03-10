document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Data + Load LocalStorage
    // Note: 'origin' tag helps us identify 'self' added words
    const defaultWords = [
        { de: "Hallo", en: "Hello", mastered: false, origin: "system" },
        { de: "Apfel", en: "Apple", mastered: false, origin: "system" },
        { de: "Tisch", en: "Table", mastered: false, origin: "system" }
    ];

    let words = JSON.parse(localStorage.getItem('deutschWords')) || defaultWords;
    let filteredWords = [];
    let currentIndex = 0;

    const rangeSelect = document.getElementById('rangeSelect');
    const card = document.getElementById('card');
    const germanText = document.getElementById('germanText');
    const englishText = document.getElementById('englishText');
    const remainingCount = document.getElementById('remainingCount');

    // 2. Build Dynamic Ranges (1-50, 51-100, etc.)
    function buildRanges() {
        // Clear existing dynamic ranges (but keep 'all' and 'self')
        rangeSelect.innerHTML = '<option value="all">All Words</option><option value="self">Self (My Added Words)</option>';
        
        const batchSize = 50;
        const totalSystemWords = words.filter(w => w.origin === "system").length;
        const numBatches = Math.ceil(totalSystemWords / batchSize);

        for (let i = 0; i < numBatches; i++) {
            let start = i * batchSize;
            let end = (i + 1) * batchSize;
            let option = document.createElement('option');
            option.value = `${start}-${end}`;
            option.textContent = `${start + 1} - ${end > totalSystemWords ? totalSystemWords : end}`;
            rangeSelect.appendChild(option);
        }
    }

    // 3. Filtering Logic
    function filterWords() {
        const selection = rangeSelect.value;
        let baseList = words.filter(w => !w.mastered);

        if (selection === 'all') {
            filteredWords = baseList;
        } else if (selection === 'self') {
            filteredWords = baseList.filter(w => w.origin === 'self');
        } else {
            const [start, end] = selection.split('-').map(Number);
            // Slice the system words specifically
            let systemWords = words.filter(w => w.origin === 'system');
            filteredWords = systemWords.slice(start, end).filter(w => !w.mastered);
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
            germanText.innerText = "No Cards Left!";
            englishText.innerText = "Switch levels or reset progress.";
        }
    }

    // 4. Event Listeners
    card.addEventListener('click', () => card.classList.toggle('flipped'));

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (filteredWords.length > 0) {
            currentIndex = (currentIndex + 1) % filteredWords.length;
            updateUI();
        }
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        if (filteredWords.length > 0) {
            currentIndex = (currentIndex - 1 + filteredWords.length) % filteredWords.length;
            updateUI();
        }
    });

    document.getElementById('learnedBtn').addEventListener('click', () => {
        if (filteredWords.length === 0) return;
        const currentDe = filteredWords[currentIndex].de;
        const targetIndex = words.findIndex(w => w.de === currentDe);
        words[targetIndex].mastered = true;
        localStorage.setItem('deutschWords', JSON.stringify(words));
        filterWords();
    });

    document.getElementById('forgotBtn').addEventListener('click', () => {
        if (filteredWords.length > 0) {
            currentIndex = (currentIndex + 1) % filteredWords.length;
            updateUI();
        }
    });

    // Add New Word Logic
    document.getElementById('addBtn').addEventListener('click', () => {
        const de = document.getElementById('newGerman').value.trim();
        const en = document.getElementById('newEnglish').value.trim();

        if (de && en) {
            words.push({ de, en, mastered: false, origin: 'self' });
            localStorage.setItem('deutschWords', JSON.stringify(words));
            document.getElementById('newGerman').value = '';
            document.getElementById('newEnglish').value = '';
            alert("Saved to Self!");
            buildRanges(); 
            filterWords();
        }
    });

    document.getElementById('resetMastered').addEventListener('click', () => {
        words.forEach(w => w.mastered = false);
        localStorage.setItem('deutschWords', JSON.stringify(words));
        filterWords();
    });

    rangeSelect.addEventListener('change', filterWords);

    // 5. Run on Startup
    buildRanges();
    filterWords();
});
