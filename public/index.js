

document.addEventListener("DOMContentLoaded", function () {
    
    const searchInput = document.getElementById('searchInput');
    const dropdownList = document.getElementById('dropdownList');
    // Function to handle the debounced input event
    function debounce(func, timeout = 500){
        let timer;
        return (args) => {
          clearTimeout(timer);
          timer = setTimeout(() => { func(args); }, timeout);
        };
      };


    const debounceinput = async function() {
        const searchTerm = searchInput.value.trim();
        try {
            const { bookTitle, bookAuthor, coverId } = await fetchData(searchTerm);            
            // Update the dropdown list
            await updateDropdown(bookTitle, coverId, bookAuthor, dropdownList);
        } catch (error) {
            console.error('Error updating dropdown:', error);
        }
    };
    searchInput.addEventListener('input', debounce(debounceinput));

    document.addEventListener('click', function (event) {
        // Close dropdown when clicking outside the search container
        if (!event.target.closest('.dropdown')) {
            dropdownList.style.display = 'none';
        }
    });
 
    
});

async function fetchData(searchTerm) {
    try {
        const response = await axios.get(`https://openlibrary.org/search.json?q=${searchTerm}&limit=5`);
        if (!response) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = response.data.docs;
        const bookTitle = result.map((book) => book.title);
        const bookAuthor = result.map((book) => book.author_name ? book.author_name[0] : 'Unknown');
        const coverId = result.map((book) => book.cover_i);        

        return {
            bookTitle: bookTitle,
            bookAuthor: bookAuthor,
            coverId: coverId,
        };
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}

async function updateDropdown(items, coverId, bookAuthor, dropdownList) {
    //create list items based on the fetch results. 
       
    const html = items.map((item, index) =>
        `<a href="/book?title=${item}&author=${bookAuthor[index]}&coverId=${coverId[index]? coverId[index]: 0}">
        <li class="listItem">
        <img src="https://covers.openlibrary.org/b/id/${coverId[index]}-S.jpg?default=https://openlibrary.org/static/images/icons/avatar_book-sm.png" width="40" height="60" alt="book picture">
        <div>
        <p><strong>${item}</strong></p>
        <p>By ${bookAuthor[index]}</p>
        </div>
        </li>
        </a>`).join('');
    dropdownList.innerHTML = html;    

    // Show/hide dropdown
    if (items.length > 0) {
        console.log("block");
        dropdownList.style.display = 'block';
        
    } else {
        console.log("none");
        dropdownList.style.display = 'none';
        
    }

}

async function deleteconfirmation() {
    const confirmed = window.confirm("Are you sure you want to delete this item?");

        // Check if the user confirmed
        if (!confirmed) {
            console.log('Operation canceled by user.');
            return;
        }
    
}