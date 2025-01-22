document.addEventListener("DOMContentLoaded", () => {
    const butterCardsContainer = document.getElementById("butter-cards");
    const scrapeButton = document.getElementById("scrape-button");
    const dataTable = document.querySelector("#data-table");
    const dataTableBody = document.querySelector("#data-table tbody");
    const lastScrapeDateElement = document.getElementById("last-scrape-date");
    const loadingBackendElement = document.getElementById("loading-backend");
    const priceHistoryChartElement = document.getElementById("price-history-chart");
    const placeholderMessage = document.getElementById("chart-placeholder");

    let isFetching = false;

    // Hide table when the page loads
    dataTable.style.display = "none";

    // Toggle loading indicator
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

    // Fetch latest data and display
    async function loadLatestData() {
        try {
            loadingBackendElement.style.display = "block";
            const response = await fetch("https://butter-scraper.onrender.com/get_latest_data");

            const data = await response.json();

            butterCardsContainer.innerHTML = "";

            data.forEach((item) => {
                const card = document.createElement("div");
                card.className = "card";

                const imagePath = `images/${item.product_id}.jpg`;
                const defaultImagePath = `images/default.jpg`;

                const imgElement = document.createElement("img");
                imgElement.src = imagePath;
                imgElement.alt = item.product_name;
                imgElement.onerror = () => {
                    imgElement.src = defaultImagePath;
                };

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
                    <h3>${item.product_name}</h3>
                    <p>Quantity: ${item.quantity} g</p>
                    <hr>
                    <div class="shops-container">${shopsHtml}</div>
                `;

                card.prepend(imgElement);
                
                card.addEventListener('click', async () => {
                    const response = await fetch(`https://butter-scraper.onrender.com/get_price_history/${item.product_id}`);
                    const history = await response.json();
                    displayPriceHistoryChart(history); 
                });

                butterCardsContainer.appendChild(card);
            });

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
                lastScrapeDateElement.innerHTML = `
                    Last saved scrape: ${formattedDate}<br> 
                    Scraping can only be saved to the database once a day, but the scrape results are displayed in the table below.
                `;
            } else {
                lastScrapeDateElement.innerHTML = "Last saved scrape: Unknown";
            }
            loadingBackendElement.style.display = "none";
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    function displayPriceHistoryChart(history) {
        const ctx = priceHistoryChartElement.getContext('2d');
        const placeholderMessage = document.getElementById("chart-placeholder");
    
        if (!history || history.length === 0) {
            priceHistoryChartElement.style.display = "none";
            placeholderMessage.style.display = "block";
            return;
        }
    
        priceHistoryChartElement.style.display = "block";
        placeholderMessage.style.display = "none";
    
        // Group data by shop
        const groupedByShop = history.reduce((acc, entry) => {
            if (!acc[entry.shop]) {
                acc[entry.shop] = [];
            }
            acc[entry.shop].push({
                date: new Date(entry.date),
                price: entry.price,
            });
            return acc;
        }, {});
    
        // Prepare datasets for Chart.js
        const datasets = Object.entries(groupedByShop).map(([shop, data], index) => {
            return {
                label: shop,
                data: data.map(entry => ({ x: entry.date, y: entry.price })),
                borderColor: getColor(index), // Assign a unique color
                tension: 0.1,
                fill: false,
                pointBackgroundColor: getColor(index),
                pointBorderColor: getColor(index),
            };
        });
    
        // Destroy the existing chart instance if it exists
        if (window.priceHistoryChart) {
            window.priceHistoryChart.destroy();
        }
    
        // Create the new chart
        window.priceHistoryChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets,
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.dataset.label}: ${context.raw.y} Kč`;
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'P',
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
    
    // Utility function to generate colors
    function getColor(index) {
        const colors = [
            '#4CAF50', '#FF5733', '#2196F3', '#FFC107', '#9C27B0',
            '#FF9800', '#E91E63', '#00BCD4', '#8BC34A', '#795548'
        ];
        return colors[index % colors.length];
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

                const nameCell = document.createElement("td");
                nameCell.textContent = item.product_name;
                row.appendChild(nameCell);

                const priceCell = document.createElement("td");
                priceCell.textContent = `${item.price} Kč`;
                row.appendChild(priceCell);

                const quantityCell = document.createElement("td");
                quantityCell.textContent = item.quantity;
                row.appendChild(quantityCell);

                fragment.appendChild(row);
            });

            dataTableBody.appendChild(fragment);
            dataTable.style.display = "table";

            loadingBackendElement.style.display = "none";
        } catch (error) {
            console.error("Scraping error:", error);
            loadingBackendElement.textContent = "Error scraping data.";
        } finally {
            isFetching = false;
            scrapeButton.disabled = false;
            toggleLoadingIndicator(false);
        }
    });

    loadLatestData();
});
