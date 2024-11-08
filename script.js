const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API URL
const quotes = [];

// Load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes.push(...JSON.parse(storedQuotes));
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate categories dynamically
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = new Set(quotes.map(quote => quote.category));
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Show a random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = '<p>No quotes available.</p>';
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `<p>${quote.text}</p><p><em>${quote.category}</em></p>`;
}

// Add a new quote
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value;
    const quoteCategory = document.getElementById('newQuoteCategory').value;

    if (quoteText && quoteCategory) {
        quotes.push({ text: quoteText, category: quoteCategory });
        saveQuotes(); // Save to local storage
        populateCategories(); // Update categories in the dropdown
        filterQuotes(); // Refresh displayed quotes
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        alert('Quote added successfully!');
    } else {
        alert('Please fill in both fields.');
    }
}

// Fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        const serverQuotes = await response.json();
        syncQuotes(serverQuotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
    }
}

// Sync quotes with local storage
function syncQuotes(serverQuotes) {
    const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
    
    // Simple conflict resolution: server data takes precedence
    const updatedQuotes = serverQuotes.map(serverQuote => {
        const existingQuote = localQuotes.find(localQuote => localQuote.id === serverQuote.id);
        return existingQuote ? { ...existingQuote, ...serverQuote } : serverQuote;
    });

    // Save updated quotes to local storage
    localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
    document.getElementById('notification').innerText = 'Quotes updated from server.';
    populateCategories(); // Refresh categories if needed
    filterQuotes(); // Refresh displayed quotes
}

// Call fetchQuotesFromServer periodically
setInterval(fetchQuotesFromServer, 10000); // Fetch every 10 seconds

// Filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    // Clear current quotes
    quoteDisplay.innerHTML = '';

    const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);
    
    filteredQuotes.forEach(quote => {
        quoteDisplay.innerHTML += `<p>${quote.text}</p><p><em>${quote.category}</em></p>`;
    });

    // Save the last selected category to local storage
    localStorage.setItem('lastSelectedCategory', selectedCategory);
}

// Load last selected category
function loadLastSelectedCategory() {
    const lastSelectedCategory = localStorage.getItem('lastSelectedCategory');
    if (lastSelectedCategory) {
        document.getElementById('categoryFilter').value = lastSelectedCategory;
        filterQuotes(); // Filter quotes based on the last selected category
    }
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuoteButton').addEventListener('click', addQuote);

// Load quotes and categories when the page is loaded
window.onload = function() {
    loadQuotes();
    populateCategories();
    loadLastSelectedCategory();
};