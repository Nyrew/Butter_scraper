document.addEventListener("DOMContentLoaded", () => {
    const butterCardsContainer = document.getElementById("butter-cards");
    const scrapeButton = document.getElementById("scrape-button");
    const dataTableBody = document.querySelector("#data-table tbody");

    // Načtení nejnovějších dat a vykreslení karet
    async function loadLatestData() {
        try {
            const response = await fetch("https://butter-scraper.onrender.com/get_latest_data");
            const data = await response.json();

            // Vymazání existujících karet
            butterCardsContainer.innerHTML = "";

            data.forEach((item) => {
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                    <img src="butter_image_placeholder.jpg" alt="Butter">
                    <h3>${item.product_name}</h3>
                    <p>Shop: ${item.shop}</p>
                    <p>Price: ${item.price}</p>
                    <p>Quantity: ${item.quantity}</p>
                `;
                butterCardsContainer.appendChild(card);
            });
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    // Spuštění scrapování a vykreslení tabulky
    scrapeButton.addEventListener("click", async () => {
        try {
            const response = await fetch("https://butter-scraper.onrender.com/scrape_save");
            const data = await response.json();

            // Vymazání existující tabulky
            dataTableBody.innerHTML = "";

            data.forEach((item) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${item.shop}</td>
                    <td>${item.product_name}</td>
                    <td>${item.price}</td>
                    <td>${item.quantity}</td>
                `;
                dataTableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error scraping data:", error);
        }
    });

    // Načtení dat při načtení stránky
    loadLatestData();
});
