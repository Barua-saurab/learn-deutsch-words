// Select elements
const wordInput = document.getElementById('wordInput');
const genderSelect = document.getElementById('genderSelect');
const addBtn = document.getElementById('addBtn');
const wordList = document.getElementById('wordList');

// Load words from localStorage or start with empty array
let words = JSON.parse(localStorage.getItem('myGermanWords')) || [];

// Function to render the list
function renderWords() {
    wordList.innerHTML = '';
    words.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="${item.gender}">${item.gender}</span> ${item.text}
            <button onclick="deleteWord(${index})">Delete</button>
        `;
        wordList.appendChild(li);
    });
}

// Function to add a word
addBtn.addEventListener('click', () => {
    const text = wordInput.value.trim();
    const gender = genderSelect.value;

    // Validation: Check for empty input or duplicates
    if (text === '') return alert('Please enter a word');
    if (words.some(w => w.text.toLowerCase() === text.toLowerCase())) {
        return alert('Word already in list!');
    }

    // Capitalize first letter (German nouns)
    const formattedText = text.charAt(0).toUpperCase() + text.slice(1);

    words.push({ text: formattedText, gender: gender });
    saveAndRender();
    wordInput.value = ''; // Clear input
});

// Function to delete a word
function deleteWord(index) {
    words.splice(index, 1);
    saveAndRender();
}

// Save to LocalStorage and update UI
function saveAndRender() {
    localStorage.setItem('myGermanWords', JSON.stringify(words));
    renderWords();
}

// Initial render on page load
renderWords();
