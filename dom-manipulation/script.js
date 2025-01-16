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

// Function to fetch quotes from the server with POST method
async function fetchQuotesFromServer() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST', // Specify the method
            headers: {
                'Content-Type': 'application/json' // Specify the content type
            },
            body: JSON.stringify({ quotes }) // Sending the quotes array as the body
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // Update local quotes array with fetched data
        quotes = data.map(post => ({
            text: post.title, // Use post title as the quote text
            category: 'General' // Assign a default category
        }));
        console.log('Fetched quotes from server:', quotes); // For demonstration
        showRandomQuote(); // Show a random quote after fetching
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

// Call fetchQuotesFromServer immediately to load quotes on startup
fetchQuotesFromServer();

// Set up periodic fetching every 10 seconds
setInterval(fetchQuotesFromServer, 10000);

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
    fileReader.readAsText(event.target.files[0]);
}

// Syncing logic
async function syncQuotes() {
    const newQuotes = await fetchQuotesFromServer(); // Fetch new quotes from the server
    if (newQuotes.length > 0) {
        // Simple conflict resolution: replace local quotes with server data
        quotes = newQuotes; // Replace local quotes with server data
        saveQuotes(); // Save updated quotes to local storage
        notifyUser("Quotes updated from server."); // Notify user of update
    }
}

// Notify user of updates
function notifyUser(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000); // Remove notification after 3 seconds
}

// Create the "Add Quote" form
function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.id = 'addQuoteForm';

    const quoteInput = document.createElement('input');
    quoteInput.type = 'text';
    quoteInput.id = 'newQuoteText';
    quoteInput.placeholder = 'Enter your quote here...';
    
    const categoryInput = document.createElement('select');
    categoryInput.id = 'newQuoteCategory';
    const categories = [...new Set(quotes.map(quote => quote.category))]; // Get unique categories

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryInput.appendChild(option);
    });

    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.onclick = addQuote; // Use existing addQuote function

    formContainer.appendChild(quoteInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);

    document.body.appendChild(formContainer); // Add the form to the body
}

// Call createAddQuoteForm to display the form on page load
window.onload = function() {
    populateCategories(); // Populate categories on load
    createAddQuoteForm(); // Create and display the add quote form
    const lastCategory = localStorage.getItem('lastCategory') || 'all';
    document.getElementById('categoryFilter').value = lastCategory;
    filterQuotes(); // Show quotes based on last selected category
};

// Call syncQuotes immediately to load quotes on startup
syncQuotes();

// Set up periodic syncing every 10 seconds
setInterval(syncQuotes, 10000);