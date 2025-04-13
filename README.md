# 🌿 Green Cart

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0.0-red)](https://nestjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-38B2AC)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.10-yellow)](https://www.python.org/)

**Shop Sustainably. Live Responsibly.**

![Image](https://github.com/user-attachments/assets/25ed8f50-cab5-41ea-a0df-83c57e53850b)

## 🌎 Vision

In a world overwhelmed by fast consumerism, Green Cart empowers people to shop more responsibly. We bridge the gap between consumer choices and environmental impact by providing transparent sustainability information and creating a marketplace for eco-friendly products.

## ✨ Features

### 🔍 Sustainability Analyzer
- Real-time analysis of product sustainability based on materials, manufacturing processes, and environmental impact
- Product scoring system from 1-100 to quickly assess eco-friendliness
- Detailed breakdown of sustainability factors for informed decision-making

### 🔄 Sustainable Alternatives
- Smart recommendation engine suggests eco-friendly alternatives to conventional products
- Side-by-side comparison of environmental impact metrics
- Price and quality comparisons to make sustainable shopping accessible

### 🛒 Eco-Marketplace
- Buy and sell pre-owned sustainable products
- Verified eco-friendly product listings
- Support for circular economy principles
- Community-driven sustainability ratings

### 🧩 Browser Extension
- Seamless integration with popular shopping sites (Amazon, eBay, Walmart, etc.)
- Instant sustainability scores while browsing
- One-click access to eco-friendly alternatives

## 🛠️ Technology Stack

### Frontend
- **React 18** for a responsive and dynamic user interface
- **Tailwind CSS** for modern, utility-first styling
- **Redux** for state management
- **React Router** for seamless navigation

### Backend
- **NestJS** framework for scalable API development
- **TypeScript** for type-safe code
- **MongoDB** for flexible data storage
- **Swagger** for API documentation

### AI & Data Processing
- **Google Gemini models** for intelligent product analysis
- **Python** data processing pipeline
- **BeautifulSoup & Scrapy** for efficient web scraping
- **TensorFlow** for custom sustainability models

## 📊 How It Works

1. **Data Collection**: Our web scrapers collect product information from major e-commerce platforms
2. **AI Analysis**: Our trained models analyze product descriptions, images, and specifications
3. **Sustainability Scoring**: Products receive comprehensive sustainability scores
4. **User Interface**: Results are presented through our intuitive web interface and browser extension
5. **Marketplace**: Users can buy and sell eco-friendly products through our integrated platform

## 📷 Screenshots

<div style="display: flex; justify-content: space-between;">
    <img src="https://via.placeholder.com/400x250" width="48%" alt="Product Analysis View" />
    <img src="https://via.placeholder.com/400x250" width="48%" alt="Marketplace View" />
</div>
<div style="display: flex; justify-content: space-between; margin-top: 20px;">
    <img src="https://via.placeholder.com/400x250" width="48%" alt="Browser Extension" />
    <img src="https://via.placeholder.com/400x250" width="48%" alt="Sustainability Comparison" />
</div>

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python 3.10+
- MongoDB
- Chrome/Firefox (for extension development)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/green-cart.git
cd green-cart
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up Python environment
```bash
cd ../analysis
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

5. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

6. Start development servers
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - Analysis Service (optional)
cd analysis
python app.py
```

7. Build and install browser extension
```bash
cd extension
npm install
npm run build
# Load the 'dist' folder as an unpacked extension in your browser
```

## 🧪 Running Tests

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 🤝 Contributing

We welcome contributions to Green Cart! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- Thanks to all the open-source projects that made this possible
- Special thanks to the environmental organizations providing sustainability data
- Gratitude to our growing community of eco-conscious users and contributors

## 🔮 What's Next for Green Cart

- **Brand Partnerships**: Collaborating with eco-friendly brands for verified sustainable products
- **Community Features**: Forums, upcycling ideas, and sustainability challenges
- **Impact Tracking**: Personal and community environmental impact dashboards
- **Mobile App**: Native mobile experience for on-the-go sustainable shopping
- **Enhanced AI**: More sophisticated product analysis incorporating lifecycle assessments

---

<p align="center">
  <i>Built with 💚 for a greener future</i>
</p>
