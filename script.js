document.addEventListener('DOMContentLoaded', () => {
    // 1. Load data from LocalStorage or use defaults
    let words = JSON.parse(localStorage.getItem('deutschWords')) || [
        { de: "Hallo", en: "Hello" },
        { de: "Apfel", en: "Apple" },
        { de: "Brot", en: "Bread" },
        { de: "Katze", en: "Cat" },
        { de: "Hund", en: "Dog" }
    ];

    let currentIndex = 0;
    let filteredWords = [...words];

    // 2. Select DOM Elements
    const card = document.getElementById('card');
    const germanText = document.getElementById('germanText');
    const englishText = document.getElementById('englishText');
    const rangeSelect = document.getElementById('rangeSelect');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const addBtn = document.getElementById('addBtn');

    // 3. UI Update Function
    function updateCard() {
        // Reset flip state when moving to a new word
        card.classList.remove('flipped');
        
        if (filteredWords.length > 0) {
            germanText.innerText = filteredWords[currentIndex].de;
            englishText.innerText = filteredWords[currentIndex].en;
        } else {
            germanText.innerText = "Empty List";
            englishText.innerText = "Add words below!";
        }
    }

    // 4. Event Listeners
    
    // Flip Logic
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });

    // Range Logic (1-50, 51-100, etc)
    rangeSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'all') {
            filteredWords = [...words];
        } else {
            // Converts "0-50" string into numbers [0, 50]
            const [start, end] = val.split('-').map(Number);
            // .slice(0, 50) takes index 0 up to 49
            filteredWords = words.slice(start, end);
        }
        currentIndex = 0;
        updateCard();
    });

    // Navigation
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents card from flipping when clicking button
        if (filteredWords.length === 0) return;
        currentIndex = (currentIndex + 1) % filteredWords.length;
        updateCard();
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents card from flipping when clicking button
        if (filteredWords.length === 0) return;
        currentIndex = (currentIndex - 1 + filteredWords.length) % filteredWords.length;
        updateCard();
    });

    // Add Word Logic
    addBtn.addEventListener('click', () => {
        const deInput = document.getElementById('newGerman');
        const enInput = document.getElementById('newEnglish');
        const deValue = deInput.value.trim();
        const enValue = enInput.value.trim();

        if (deValue && enValue) {
            words.push({ de: deValue, en: enValue });
            localStorage.setItem('deutschWords', JSON.stringify(words));
            
            // Clear inputs
            deInput.value = '';
            enInput.value = '';
            
            alert(`Added: ${deValue}`);
            location.reload(); // Simplest way to refresh ranges and list
        } else {
            alert("Please fill in both fields!");
        }
    });

    // 5. Initial Call
    updateCard();
});
