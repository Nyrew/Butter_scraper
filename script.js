document.addEventListener("DOMContentLoaded", () => {
    const butterCardsContainer = document.getElementById("butter-cards");
    const scrapeButton = document.getElementById("scrape-button");
    const dataTableBody = document.querySelector("#data-table tbody");

    // Load the latest data and render the table, cards, and output
    async function loadLatestData() {
        try {
            const response = await fetch("https://butter-scraper.onrender.com/get_latest_data");
            const data = await response.json();
            
            butterCardsContainer.innerHTML = "";
    
            data.forEach((item) => {
                const card = document.createElement("div");
                card.className = "card";
                
                let shopsHtml = '';
                for (let i = 0; i < item.shops.length; i++) {
                    const shop = item.shops[i];
                    shopsHtml += `
                        <div class="shop-item">
                            <p class="shop-name">${shop.shop}</p>
                            <p class="shop-price">${shop.price} Kč</p>
                        </div>
                    `;
                }
            
                card.innerHTML = `
                    <img src="butter_image_placeholder.jpg" alt="Butter">
                    <h3>${item.product_name}</h3>
                    <p>Quantity: ${item.quantity} g</p>
                    <hr>
                    <div class="shops-container">${shopsHtml}</div>
                `;
                butterCardsContainer.appendChild(card);
            });
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
