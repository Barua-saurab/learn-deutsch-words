document.addEventListener('DOMContentLoaded', async () => 
    const defaultWords = [
        { de: "Hallo", en: "Hello", mastered: false, origin: "system" },
        { de: "Voraussetzung", en: "Requirement", mastered: false, origin: "b2" }
    ];

    let words = JSON.parse(localStorage.getItem('deutschWords'));
    
    // If words are null, it means we need to fetch
    if (!words) {
        try {
            const response = await fetch('./B1word.json');
            if (!response.ok) throw new Error("Could not find B1word.json");
            
            const b1Data = await response.json();
            console.log("Fetched B1 data:", b1Data);

            // Merge everything
            words = [...defaultWords, ...b1Data];
            localStorage.setItem('deutschWords', JSON.stringify(words));
        } catch (error) {
            console.error("Fetch failed:", error);
            words = defaultWords;
        }
    }

    let filteredWords = [];
    let currentIndex = 0;

    const rangeSelect = document.getElementById('rangeSelect');
    const card = document.getElementById('card');
    const germanText = document.getElementById('germanText');
    const englishText = document.getElementById('englishText');
    const remainingCount = document.getElementById('remainingCount');

    function buildRanges() {
        const staticOptions = `
            <option value="all">All Words</option>
            <option value="self">Self (My Added Words)</option>
            <option value="b1">B1 (Intermediate)</option>
            <option value="b2">B2 (Upper Intermediate)</option>
        `;
        rangeSelect.innerHTML = staticOptions;
        
        const systemWords = words.filter(w => w.origin === "system");
        const batchSize = 50;
        for (let i = 0; i < Math.ceil(systemWords.length / batchSize); i++) {
            let start = i * batchSize;
            let end = Math.min((i + 1) * batchSize, systemWords.length);
            let option = document.createElement('option');
            option.value = `range-${start}-${end}`;
            option.textContent = `Range: ${start + 1} - ${end}`;
            rangeSelect.appendChild(option);
        }
    }

    function filterWords() {
        const selection = rangeSelect.value;
        let baseList = words.filter(w => !w.mastered);

        if (selection === 'all') {
            filteredWords = baseList;
        } else if (selection === 'self' || selection === 'b1' || selection === 'b2') {
            filteredWords = baseList.filter(w => w.origin === selection);
        } else if (selection.startsWith('range-')) {
            const [_, start, end] = selection.split('-').map(Number);
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
            germanText.innerText = "Set Complete!";
            englishText.innerText = "Zero words left here.";
        }
    }

    // --- Events ---
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
        const idx = words.findIndex(w => w.de === currentDe);
        words[idx].mastered = true;
        localStorage.setItem('deutschWords', JSON.stringify(words));
        filterWords();
    });

    document.getElementById('forgotBtn').addEventListener('click', () => {
    if (filteredWords.length === 0) return;
    
    // 1. Flip the card back to the German side
    card.classList.remove('flipped');
    
    // 2. Wait a split second for the flip animation, then go to the next word
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % filteredWords.length;
        updateUI();
    }, 300);
});

    document.getElementById('addBtn').addEventListener('click', () => {
        const de = document.getElementById('newGerman').value.trim();
        const en = document.getElementById('newEnglish').value.trim();
        if (de && en) {
            words.push({ de, en, mastered: false, origin: 'self' });
            localStorage.setItem('deutschWords', JSON.stringify(words));
            document.getElementById('newGerman').value = '';
            document.getElementById('newEnglish').value = '';
            filterWords();
        }
    });

    document.getElementById('resetMastered').addEventListener('click', () => {
        words.forEach(w => w.mastered = false);
        localStorage.setItem('deutschWords', JSON.stringify(words));
        filterWords();
    });

    rangeSelect.addEventListener('change', filterWords);

    buildRanges();
    filterWords();
});
