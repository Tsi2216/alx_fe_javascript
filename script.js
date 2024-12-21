let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
    { text: "The best way to predict the future is to create it.", category: "Inspiration" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", category: "Wisdom" },
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "You miss 100% of the shots you don’t take.", category: "Sports" },
    { text: "Believe you can and you're halfway there.", category: "Motivation" }
];

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);
    
    if (filteredQuotes.length === 0) {
        console.error("No quotes available for this category.");
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.textContent = `${filteredQuotes[randomIndex].text} - ${filteredQuotes[randomIndex].category}`;
}

document.getElementById('newQuote').addEventListener('click', showRandomQuote);

function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;

    if (newQuoteText && newQuoteCategory) {
        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        saveQuotes();
        populateCategories(); // Update categories in the dropdown
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        showRandomQuote();
    }
}

function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = new Set(quotes.map(quote => quote.category));
    
    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('lastCategory', selectedCategory); // Save last selected category
    showRandomQuote(); // Show quote based on selected category
}

function exportToJson() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories(); // Update categories after import
        alert('Quotes imported successfully!');
        showRandomQuote();
    };
    fileReader.readAsText(event.target.files);
}

window.onload = function() {
    populateCategories(); // Populate categories on load
    const lastCategory = localStorage.getItem('lastCategory') || 'all';
    document.getElementById('categoryFilter').value = lastCategory;
    filterQuotes(); // Show quotes based on last selected category
};