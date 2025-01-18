document.addEventListener("DOMContentLoaded", () => {
    const butterCardsContainer = document.getElementById("butter-cards");
    const scrapeButton = document.getElementById("scrape-button");
    const dataTableBody = document.querySelector("#data-table tbody");
    const outputContainer = document.getElementById("output");

    // Načtení nejnovějších dat a vykreslení karet i textového výstupu
    async function loadLatestData() {
        try {
            const response = await fetch("https://butter-scraper.onrender.com/get_latest_data");
            const data = await response.json();

            // Vymazání existujících karet a výstupu
            butterCardsContainer.innerHTML = "";
            outputContainer.innerHTML = "";

            // Zpracuj každou položku dat
            data.forEach((item) => {
                // Vytvoření karty
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                    <img src="butter_image_placeholder.jpg" alt="Butter">
                    <h3>${item.product_name}</h3>
                    <hr>
                    <p>Shop: ${item.shop}</p>
                    <p>Price: ${item.price}</p>
                    <p>Quantity: ${item.quantity}</p>
                `;
                butterCardsContainer.appendChild(card);

                // Přidání textového výstupu
                const line = document.createElement("p");
                line.textContent = `LATEST: Name: ${item.product_name}, Shop: ${item.shop}, Price: ${item.price}, Quantity: ${item.quantity}`;
                outputContainer.appendChild(line);
            });
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    // Spuštění scrapování a vykreslení tabulky
    scrapeButton.addEventListener("click", async () => {
        try {
            const response = await fetch("https://butter-scraper.onrender.com/scrape_save", {
                method: "POST",
            });
            await response.json();

            // Aktualizace dat po scrapování
            loadLatestData();
        } catch (error) {
            console.error("Error scraping data:", error);
        }
    });

    // Načtení dat při načtení stránky
    loadLatestData();
});
