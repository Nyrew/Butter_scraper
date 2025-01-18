document.addEventListener("DOMContentLoaded", () => {
    const butterCardsContainer = document.getElementById("butter-cards");
    const scrapeButton = document.getElementById("scrape-button");
    const dataTableBody = document.querySelector("#data-table tbody");

    // Load the latest data and render the table, cards, and output
    async function loadLatestData() {
        try {
            const response = await fetch("https://butter-scraper.onrender.com/get_latest_data");
            const data = await response.json();

            // Clear existing data
            butterCardsContainer.innerHTML = "";  // Clear butter cards container

            // Check if the data is in the correct format
            if (data && Array.isArray(data)) {
                // Render the butter cards
                data.forEach((item) => {
                    const card = document.createElement("div");
                    card.className = "card";
                    card.innerHTML = `
                        <img src="butter_image_placeholder.jpg" alt="Butter">
                        <h3>${item.product_name}</h3>
                        <hr>
                        <p>Shop: ${item.shop}</p>
                        <p>Price: ${item.price} Kč</p>
                        <p>Quantity: ${item.quantity} g</p>
                    `;
                    butterCardsContainer.appendChild(card);
                });
            } else {
                console.error("Received invalid data format:", data);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    // Handle scraping and updating the table
    scrapeButton.addEventListener("click", async () => {
        try {
            const response = await fetch("https://butter-scraper.onrender.com/scrape_save", {
                method: "POST",
            });
            const data = await response.json();

            // Clear existing data in the table
            dataTableBody.innerHTML = "";

            // Render the table rows
            data.forEach((item) => {
                const row = document.createElement("tr");

                const shopCell = document.createElement("td");
                shopCell.textContent = item.shop;
                row.appendChild(shopCell);

                const productNameCell = document.createElement("td");
                productNameCell.textContent = item.product_name;
                row.appendChild(productNameCell);

                const priceCell = document.createElement("td");
                priceCell.textContent = `${item.price} Kč`;
                row.appendChild(priceCell);

                const quantityCell = document.createElement("td");
                quantityCell.textContent = `${item.quantity} g`;
                row.appendChild(quantityCell);

                dataTableBody.appendChild(row);
            });

            // Reload the latest data to show the updated butter cards
            loadLatestData();
        } catch (error) {
            console.error("Error scraping data:", error);
        }
    });

    // Load latest data on page load
    loadLatestData();
});
