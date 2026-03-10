document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initial System/B2 words
    const defaultWords = [
        { de: "Hallo", en: "Hello", mastered: false, origin: "system" },
        { de: "Tisch", en: "Table", mastered: false, origin: "system" },
        { de: "Voraussetzung", en: "Requirement", mastered: false, origin: "b2" },
        { de: "Beeinflussen", en: "To influence", mastered: false, origin: "b2" }
    ];

    let words = JSON.parse(localStorage.getItem('deutschWords'));
    
    // 2. Fetch B1 words ONLY if we haven't saved them yet
    if (!words) {
        try {
            console.log("Fetching B1word.json...");
            const response = await fetch('B1word.json');
            if (!response.ok) throw new Error("File not found");
            
            const b1Data = await response.json();
            
            // Map B1 data to ensure they have the correct properties
            const formattedB1 = b1Data.map(w => ({
                ...w,
                mastered: false,
                origin: "b1"
            }));

            words = [...defaultWords, ...formattedB1];
            localStorage.setItem('deutschWords', JSON.stringify(words));
            console.log("B1 Words loaded successfully!");
        } catch (error) {
            console.error("Error fetching JSON:", error);
            words = defaultWords; // Fallback if fetch fails
        }
    }

    let filteredWords = [];
    let currentIndex = 0;

    const rangeSelect = document.getElementById('rangeSelect');
    const card = document.getElementById('card');
    const germanText = document.getElementById('germanText');
    const englishText = document.getElementById('englishText');
    const remainingCount = document.getElementById('remainingCount');

    // 3. Dynamic Range Builder
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
            englishText.innerText = "No words left in this category.";
        }
    }

    // --- Button Event Listeners ---
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

    // Initial Start
    buildRanges();
    filterWords();
});
