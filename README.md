# Butter Scraper

Butter Scraper is a web-based application designed to scrape and track butter prices from various online grocery stores. The application allows users to view the latest scraped data, price history, and detailed information about the products.

## Features

- Scrape butter prices from multiple online shops (Kosik, Billa, Albert, Globus).
- Display the latest scraped data in a tabular format.
- Visualize price history for specific products.
- Save scraped data to a database for historical tracking.
- Fully responsive frontend with dynamic rendering.

## Tech Stack

### Backend
- **FastAPI**: For building the API endpoints.
- **SQLAlchemy**: For database interaction.
- **PostgreSQL**: As the database backend.
- **Hosted on Render**: Note that the backend is hosted on a free Render tier, so loading the backend (server startup) may take a few moments.

### Frontend
- **HTML/CSS**: For structuring and styling the application.
- **JavaScript**: For dynamic rendering and API integration.
- **Chart.js**: For visualizing price history.

## File Structure

```
Butter_Scraper/
├── database/
│   ├── __init__.py
│   ├── crud.py
│   ├── database.py
│   ├── model.py
├── scraper/
│   ├── __init__.py
│   ├── config.py
│   ├── scraper.py
├── index.html
├── styles.css
├── script.js
├── main.py
├── README.md
├── requirements.txt
```

## How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Nyrew/Butter_scraper.git
   cd Butter_scraper
   ```

2. Set up a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory and add your PostgreSQL connection string:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database_name
   ```

5. Run the application:
   ```bash
   uvicorn main:app --reload
   ```

6. Open your browser and navigate to:
   ```
   http://127.0.0.1:8000
   ```

## How to Use

1. **Scrape Data**: Click the "Scrape and Save" button to fetch and save the latest butter prices.
2. **View Data**: The latest data is displayed in the table and as cards below.
3. **Check Price History**: Click on any product card to visualize its price history.

## API Endpoints

- `GET /get_all_data`: Fetch all scraped data.
- `GET /get_last_scrape_date`: Get the date of the last scrape.
- `GET /get_latest_data`: Fetch the latest scraped data.
- `GET /get_product_info`: Retrieve product information.
- `POST /scrape`: Perform scraping without saving to the database.
- `POST /scrape_save`: Perform scraping and save results to the database.
- `GET /get_price_history/{product_id}`: Get price history for a specific product.

## Deployment

The backend is deployed on [Render](https://render.com). Since it is running on the free tier, it may take a few seconds to spin up when accessed after inactivity.

The frontend is static and can be hosted on platforms like GitHub Pages.

## Limitations

- The application is designed for demo purposes and may require further optimization for production use.
- Backend hosting on the free tier may introduce delays.

## Future Enhancements

- Add support for more shops.
- Implement user authentication.
- Allow users to set alerts for price drops.

## License

This project is open-source and available under the MIT License.
