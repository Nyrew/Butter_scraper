document.addEventListener("DOMContentLoaded", () => {
    const butterCardsContainer = document.getElementById("butter-cards");
    const scrapeButton = document.getElementById("scrape-button");
    const dataTableBody = document.querySelector("#data-table tbody");

    // Načtení nejnovějších dat a vykreslení tabulky, karet i textového výstupu
    async function loadLatestData() {
        try {
            const response = await fetch("https://butter-scraper.onrender.com/get_latest_data");
            const data = await response.json();

            // Vymazání existujících dat
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
                    <p>Price: ${item.price} Kč</p>
                    <p>Quantity: ${item.quantity} g</p>
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
            const response = await fetch("https://butter-scraper.onrender.com/scrape_save", {
                method: "POST",
            });
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
            console.error("Error scraping data:", error);
        }
    });


    // Načtení dat při načtení stránky
    loadLatestData();
});
