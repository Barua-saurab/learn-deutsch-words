document.addEventListener('DOMContentLoaded', async () => {
    // ১. ডিফল্ট শব্দগুলো (System এবং B2 ঠিক রাখা হয়েছে)
    const defaultWords = [
        { de: "Hallo", en: "Hello", mastered: false, origin: "system" },
        { de: "Tisch", en: "Table", mastered: false, origin: "system" },
        { de: "Voraussetzung", en: "Requirement/Condition", mastered: false, origin: "b2" },
        { de: "Beeinflussen", en: "To influence", mastered: false, origin: "b2" }
    ];

    let words = JSON.parse(localStorage.getItem('deutschWords'));

    // ২. যদি LocalStorage খালি থাকে, তবে B1word.json থেকে ডেটা লোড করবে
    if (!words) {
        try {
            const response = await fetch('B1word.json');
            const b1Data = await response.json();
            
            // ডিফল্ট শব্দের সাথে JSON-এর B1 শব্দগুলো যুক্ত করা হচ্ছে
            words = [...defaultWords, ...b1Data];
            localStorage.setItem('deutschWords', JSON.stringify(words));
        } catch (error) {
            console.error("B1word.json লোড করতে সমস্যা হয়েছে:", error);
            words = defaultWords; // ফেইল করলে শুধু ডিফল্টগুলো থাকবে
        }
    }

    let filteredWords = [];
    let currentIndex = 0;

    const rangeSelect = document.getElementById('rangeSelect');
    const card = document.getElementById('card');
    const germanText = document.getElementById('germanText');
    const englishText = document.getElementById('englishText');
    const remainingCount = document.getElementById('remainingCount');

    // ৩. ড্রপডাউন রেঞ্জ তৈরি করা (System words এর ওপর ভিত্তি করে)
    function buildRanges() {
        const staticOptions = `
            <option value="all">All Words</option>
            <option value="self">Self (My Added Words)</option>
            <option value="b1">B1 (Intermediate)</option>
            <option value="b2">B2 (Upper Intermediate)</option>
        `;
        rangeSelect.innerHTML = staticOptions;
        
        const systemWordsCount = words.filter(w => w.origin === "system").length;
        const batchSize = 50;
        const numBatches = Math.ceil(systemWordsCount / batchSize);

        for (let i = 0; i < numBatches; i++) {
            let start = i * batchSize;
            let end = (i + 1) * batchSize;
            let option = document.createElement('option');
            option.value = `range-${start}-${end}`;
            option.textContent = `Range: ${start + 1} - ${end > systemWordsCount ? systemWordsCount : end}`;
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
            englishText.innerText = "Choose another level.";
        }
    }

    // শিখে ফেলা শব্দের লজিক
    document.getElementById('learnedBtn').addEventListener('click', () => {
        if (filteredWords.length === 0) return;
        const currentDe = filteredWords[currentIndex].de;
        const idx = words.findIndex(w => w.de === currentDe);
        words[idx].mastered = true;
        localStorage.setItem('deutschWords', JSON.stringify(words));
        filterWords();
    });

    // নেভিগেশন এবং ফ্লিপ
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

    // নতুন শব্দ যোগ করার লজিক
    document.getElementById('addBtn').addEventListener('click', () => {
        const de = document.getElementById('newGerman').value.trim();
        const en = document.getElementById('newEnglish').value.trim();
        if (de && en) {
            words.push({ de, en, mastered: false, origin: 'self' });
            localStorage.setItem('deutschWords', JSON.stringify(words));
            document.getElementById('newGerman').value = '';
            document.getElementById('newEnglish').value = '';
            alert("Added to 'Self' level!");
            filterWords();
        }
    });

    document.getElementById('resetMastered').addEventListener('click', () => {
        words.forEach(w => w.mastered = false);
        localStorage.setItem('deutschWords', JSON.stringify(words));
        filterWords();
    });

    rangeSelect.addEventListener('change', filterWords);

    // অ্যাপ চালু করা
    buildRanges();
    filterWords();
});
