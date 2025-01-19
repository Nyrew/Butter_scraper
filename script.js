document.addEventListener("DOMContentLoaded", () => {
    const butterCardsContainer = document.getElementById("butter-cards");
    const scrapeButton = document.getElementById("scrape-button");
    const dataTable = document.querySelector("#data-table");
    const dataTableBody = document.querySelector("#data-table tbody");
    const lastScrapeDateElement = document.getElementById("last-scrape-date");
    const loadingBackendElement = document.getElementById("loading-backend");
    const priceHistoryChartElement = document.getElementById("price-history-chart");

    let isFetching = false;

    // Skryjte tabulku při načtení stránky
    dataTable.style.display = "none";

    // Funkce pro zobrazení/skrytí loading indikátoru
    function toggleLoadingIndicator(show) {
        let loadingIndicator = document.querySelector(".loading-indicator");
        if (show) {
            if (!loadingIndicator) {
                loadingIndicator = document.createElement("div");
                loadingIndicator.textContent = "Scraping...";
                loadingIndicator.className = "loading-indicator";
                document.body.appendChild(loadingIndicator);
            }
        } else if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    async function loadLatestData() {
        try {
            loadingBackendElement.style.display = "block"; 
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

                card.addEventListener('click', async () => {
                    console.log('Selected product:', item.product_name);
                
                    const response = await fetch(`https://butter-scraper.onrender.com/get_price_history/${item.product_name}`);
                    const url = `https://butter-scraper.onrender.com/get_price_history/${encodeURIComponent(item.product_name)}`;
                    fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                    })
                    .catch(error => console.error('Error:', error));
                    const history = await response.json();
                    displayPriceHistoryChart(history);  // Use displayPriceHistoryChart
                });
                
                butterCardsContainer.appendChild(card);
            });

            // Fetch and display the last scrape date
            const scrapeResponse = await fetch("https://butter-scraper.onrender.com/get_last_scrape_date");
            const scrapeData = await scrapeResponse.json();

            if (scrapeData.date) {
                const lastScrapeDate = new Date(scrapeData.date);
                const formattedDate = lastScrapeDate.toLocaleString("cs-CZ", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                });
                lastScrapeDateElement.innerHTML  = ` 
                    Last saved scrape: ${formattedDate}<br> 
                    Scraping can only be saved to the database once a day, but the scrape results are displayed in the table below.
                `;
            } else {
                lastScrapeDateElement.innerHTML  = "Last saved scrape: Unknown";
            }
            loadingBackendElement.style.display = "none";
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    function displayPriceHistoryChart(history) {
        const ctx = document.getElementById('price-history-chart').getContext('2d');
    
        // Ensure the date values are valid and convert them to ISO strings
        const labels = history.map((entry) => new Date(entry.date).toISOString());
        const prices = history.map((entry) => entry.price);
    
        // Destroy any existing chart before creating a new one
        if (window.priceHistoryChart) {
            window.priceHistoryChart.destroy();
        }
    
        window.priceHistoryChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price History',
                    data: prices,
                    borderColor: '#4CAF50',
                    fill: false,
                }]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        type: 'time',  // Ensure that Chart.js uses time scale for the x-axis
                        time: {
                            unit: 'day',  // Can be adjusted based on the range of your data
                            tooltipFormat: 'll',
                        },
                        title: {
                            display: true,
                            text: 'Date',
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price (Kč)',
                        }
                    }
                }
            }
        });
    }

    // Helper function to generate a random color for each shop
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    scrapeButton.addEventListener("click", async () => {
        if (isFetching) return;

        isFetching = true;
        scrapeButton.disabled = true;
        toggleLoadingIndicator(true);

        try {
            dataTable.style.display = "none";
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
            dataTable.style.display = "table";

            loadLatestData();
        } catch (error) {
            console.error("Error scraping data:", error);
        } finally {
            isFetching = false;
            scrapeButton.disabled = false;
            toggleLoadingIndicator(false);
        }
    });

    // Load latest data and price history on page load
    loadLatestData();
});
