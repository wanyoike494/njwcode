// Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Get DOM elements
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const cards = document.querySelectorAll(".card");
    const noResults = document.querySelector(".no-results");

    // Search function
    function searchProjects() {
        const query = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        cards.forEach(card => {
            const title = card.querySelector(".card_title").innerText.toLowerCase();
            const description = card.querySelector(".card_text").innerText.toLowerCase();

            if (title.includes(query) || description.includes(query)) {
                card.style.display = "block";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        // Show/hide no results message
        if (visibleCount === 0 && query !== "") {
            noResults.style.display = "block";
        } else {
            noResults.style.display = "none";
        }
    }

    // Event listeners
    searchButton.addEventListener("click", searchProjects);
    searchInput.addEventListener("keyup", searchProjects);
    
    // Search on Enter key
    searchInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            searchProjects();
        }
    });