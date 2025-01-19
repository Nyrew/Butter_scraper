document.addEventListener("DOMContentLoaded", () => {
    const butterCardsContainer = document.getElementById("butter-cards");
    const scrapeButton = document.getElementById("scrape-button");
    const dataTable = document.querySelector("#data-table");
    const dataTableBody = document.querySelector("#data-table tbody");
    const lastScrapeDateElement = document.getElementById("last-scrape-date");

    let isFetching = false;

    // Skryjte tabulku při načtení stránky
    dataTable.style.display = "none";

    // Funkce pro zobrazení/skrytí loading indikátoru
    function toggleLoadingIndicator(show) {
        let loadingIndicator = document.querySelector(".loading-indicator");
        if (show) {
            if (!loadingIndicator) {
                loadingIndicator = document.createElement("div");
                loadingIndicator.textContent = "Loading...";
                loadingIndicator.className = "loading-indicator";
                document.body.appendChild(loadingIndicator);
            }
        } else if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    async function loadLatestData() {
        try {
            const response = await fetch("https://butter-scraper.onrender.com/get_latest_data");
            const data = await response.json();

            butterCardsContainer.innerHTML = "";

            data.forEach((item) => {
                const card = document.createElement("div");
                card.className = "card";

                const shopsHtml = item.shops
                    .map(
                        (shop) => `
                        <div class="shop-item">
                            <p class="shop-name">${shop.shop}</p>
                            <p class="shop-price">${shop.price} Kč</p>
                        </div>`
                    )
                    .join("");

                card.innerHTML = `
                    <img src="butter_image_placeholder.jpg" alt="Butter">
                    <h3>${item.product_name}</h3>
                    <p>Quantity: ${item.quantity} g</p>
                    <hr>
                    <div class="shops-container">${shopsHtml}</div>
                `;
                butterCardsContainer.appendChild(card);
            });

            // Fetch and display the last scrape date
            const scrapeResponse = await fetch("https://butter-scraper.onrender.com/get_last_scrape_date");
            const scrapeData = await scrapeResponse.json();

            if (scrapeData.date) {
                const lastScrapeDate = new Date(scrapeData.date); // Převeďte string na Date objekt
                const formattedDate = lastScrapeDate.toLocaleString("cs-CZ", { // Použijte český formát
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                });
                lastScrapeDateElement.textContent = `Last scrape: ${formattedDate}`;
            } else {
                lastScrapeDateElement.textContent = "Last scrape: Unknown";
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    scrapeButton.addEventListener("click", async () => {
        if (isFetching) return;

        isFetching = true;
        scrapeButton.disabled = true;
        toggleLoadingIndicator(true);

        try {
            dataTable.style.display = "none"; // Ujistěte se, že je tabulka skryta před načtením nových dat
            dataTableBody.innerHTML = "";

            const response = await fetch("https://butter-scraper.onrender.com/scrape_save", { method: "POST" });
            const data = await response.json();

            const fragment = document.createDocumentFragment();

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

                fragment.appendChild(row);
            });

            dataTableBody.appendChild(fragment);
            dataTable.style.display = "table"; // Zobrazí tabulku po načtení dat

            loadLatestData();
        } catch (error) {
            console.error("Error scraping data:", error);
        } finally {
            isFetching = false;
            scrapeButton.disabled = false;
            toggleLoadingIndicator(false);
        }
    });

    loadLatestData();
});
