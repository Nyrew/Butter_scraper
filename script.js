document.addEventListener("DOMContentLoaded", () => {
    const butterCardsContainer = document.getElementById("butter-cards");
    const scrapeButton = document.getElementById("scrape-button");
    const dataTableBody = document.querySelector("#data-table tbody");
    const lastScrapeDateElement = document.getElementById("last-scrape-date");

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

            // Fetch and display the last scrape date
            const scrapeResponse = await fetch("https://butter-scraper.onrender.com/get_last_scrape_date");
            const scrapeData = await scrapeResponse.json();
            lastScrapeDateElement.textContent = `Last scrape: ${scrapeData.date}`;
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    let isFetching = false; // Zamezí opakovaným požadavkům

    scrapeButton.addEventListener("click", async () => {
        if (isFetching) return; // Pokud již probíhá požadavek, nic nedělej
    
        isFetching = true; // Nastav příznak, že požadavek probíhá
        scrapeButton.disabled = true; // Deaktivuj tlačítko během načítání
        const loadingIndicator = document.createElement("div"); // Vytvoř loading ikonu
        loadingIndicator.textContent = "Loading...";
        loadingIndicator.className = "loading-indicator"; // Přidej třídu pro stylování
        document.body.appendChild(loadingIndicator); // Přidej ikonu do dokumentu
    
        try {
            // Skryj tabulku, dokud nebudou data načtena
            dataTable.style.display = "none";
            dataTableBody.innerHTML = ""; // Vyčisti obsah tabulky
    
            // Odeslání požadavku na backend
            const response = await fetch("https://butter-scraper.onrender.com/scrape_save", {
                method: "POST",
            });
            const data = await response.json();
    
            // Naplň tabulku daty
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
    
            // Zobraz tabulku po úspěšném načtení dat
            dataTable.style.display = "table";
            // Načti nejnovější data pro aktualizaci
            loadLatestData();
        } catch (error) {
            console.error("Error scraping data:", error);
        } finally {
            // Vrať stav tlačítka a odeber loading ikonu
            isFetching = false;
            scrapeButton.disabled = false;
            loadingIndicator.remove();
        }
    });
    // Load latest data on page load
    loadLatestData();
});
