document.addEventListener("DOMContentLoaded", () => {
    const butterCardsContainer = document.getElementById("butter-cards");
    const scrapeButton = document.getElementById("scrape-button");
    const dataTableBody = document.querySelector("#data-table tbody");
    const outputContainer = document.getElementById("output");

    // Načtení nejnovějších dat a vykreslení karet a textového výstupu
    async function loadLatestData() {
        try {
            const response = await fetch("https://butter-scraper.onrender.com/get_latest_data");
            const data = await response.json();

            // Vymazání existujících karet a textového výstupu
            butterCardsContainer.innerHTML = "";
            outputContainer.innerHTML = "";

            // Zpracuj každou položku dat pro karty a textový výstup
            data.forEach((item) => {
                // Vytvoření karty
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

                // Přidání textového výstupu
                const line = document.createElement("p");
                line.textContent = `LATEST: Name: ${item.product_name}, Shop: ${item.shop}, Price: ${item.price} Kč, Quantity: ${item.quantity} g`;
                outputContainer.appendChild(line);
            });
        } catch (error) {
            console.error("Error loading latest data:", error);
        }
    }

    // Načtení tabulky při kliknutí na tlačítko
    async function loadTableData() {
        try {
            const response = await fetch("https://butter-scraper.onrender.com/get_latest_data");
            const data = await response.json();

            // Vymazání existujících dat v tabulce
            dataTableBody.innerHTML = "";

            // Zpracuj každou položku dat a vykresli ji v tabulce
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
        } catch (error) {
            console.error("Error loading table data:", error);
        }
    }

    // Spuštění scrapování a aktualizace dat
    scrapeButton.addEventListener("click", async () => {
        try {
            const response = await fetch("https://butter-scraper.onrender.com/scrape_save", {
                method: "POST",
            });
            await response.json();

            // Aktualizace dat po scrapování
            loadTableData();
        } catch (error) {
            console.error("Error scraping data:", error);
        }
    });

    // Načtení dat pro karty a textový výstup při načtení stránky
    loadLatestData();
});
