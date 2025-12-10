# ReDI-AI: Customer Segmentation E-Commerce Platform

A full-stack customer segmentation and personalization platform that uses K-Means clustering to classify customers into behavioral segments and provide personalized shopping experiences.

**Live Demo**: https://raw.githack.com/jkyamaguchi/ReDI-AI/main/Project/src/web/html/index.html

---

## 🎯 Project Overview

This project demonstrates:

- **Machine Learning**: K-Means customer segmentation with 3 behavioral clusters
- **Data Analysis**: Customer behavioral analysis using Python (pandas, scikit-learn, matplotlib)
- **Web Development**: Modern vanilla JavaScript with template-based architecture
- **Full-Stack Integration**: ML model predictions on the client-side using JavaScript

### Key Features

✅ **Customer Segmentation** - Real-time customer classification based on purchase history  
✅ **Personalization** - Segment-specific strategies and recommendations  
✅ **Shopping Cart** - Full e-commerce cart with multiple product categories  
✅ **Checkout Flow** - Order review with customer segment prediction  
✅ **Responsive Design** - Mobile-friendly interface with CSS Grid/Flexbox

---

## 📊 Customer Segments

The model identifies three distinct customer clusters:

### Cluster 0: Low Web Engagement (22.3%)

- **Profile**: Low wine preference, balanced product mix, minimal web presence
- **Strategy**: Convert to web with UX optimization, first-purchase discounts
- **Characteristics**: Few web purchases, low deal sensitivity, moderate spenders

### Cluster 1: High-Value Web Enthusiast (28.7%)

- **Profile**: Premium wine lover, frequent web user, highest spenders
- **Strategy**: Upsell/cross-sell premium wines, exclusive subscriptions, loyalty rewards
- **Characteristics**: High wine share, strong spending intensity, deal-sensitive

### Cluster 2: Deal-Seeker (49.0%)

- **Profile**: Price-conscious, moderate spender, balanced product preference
- **Strategy**: Flash sales, targeted coupons, time-limited bundles
- **Characteristics**: Low web purchases, moderate intensity, deal-seeking behavior

---

## 🏗️ Project Structure

```
Project/
├── README.md                          # This file
├── data/
│   ├── customer_segmentation.csv      # Training dataset (2,240 customers)
│   └── new_customers.csv              # Test dataset for inference
├── notebooks/
│   └── customer_segmentation.ipynb    # ML analysis & model training
├── models/                            # Trained models (future)
└── src/web/
    ├── html/
    │   ├── index.html                 # Home page
    │   ├── fish.html                  # Fish products catalog
    │   ├── fruits.html                # Fruits products catalog
    │   ├── meat.html                  # Meat products catalog
    │   ├── gold.html                  # Gold jewelry catalog
    │   ├── wine.html                  # Wine products catalog
    │   ├── sweet.html                 # Sweets products catalog
    │   ├── cart.html                  # Shopping cart page
    │   ├── checkout.html              # Checkout & order review
    │   └── templates/
    │       ├── header.html            # Navigation header template
    │       ├── checkout-content.html  # Checkout content template
    │       └── cluster-profile.html   # Customer segment display template
    ├── css/
    │   ├── base.css                   # Global styles & cluster styling
    │   ├── products.css               # Product catalog styles
    │   ├── cart.css                   # Cart layout styles
    │   ├── checkout.css               # Checkout page styles
    │   ├── category.css               # Category page styles
    │   └── index.css                  # Home page styles
    └── js/
        ├── header.js                  # Navigation header controller
        ├── products.js                # Shopping cart & catalog management
        ├── cart.js                    # Cart page functionality
        ├── checkout.js                # Checkout page controller
        └── segmentation_model.js      # K-Means classifier & visualization
```

---

## 🔧 Technology Stack

### Frontend

- **Vanilla JavaScript (ES6+)** - No frameworks, pure modern JS
- **HTML5** - Semantic markup
- **CSS3** - Grid, Flexbox, animations, gradients
- **Template-based Architecture** - HTML templates loaded dynamically

### Backend/ML

- **Python 3** - Data processing & model training
- **pandas** - Data manipulation and analysis
- **scikit-learn** - K-Means clustering, RobustScaler, PCA
- **matplotlib/seaborn** - Data visualization
- **Jupyter** - Interactive analysis notebooks

### Storage

- **localStorage** - Client-side cart persistence
- **CSV** - Training and test data

---

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.8+ (for ML notebook)
- Jupyter Notebook

### Installation & Running

#### Option 1: Open Live Demo

Visit the live demo URL in your browser - no installation needed!

#### Option 2: Local Development

1. Clone the repository:

```bash
git clone https://github.com/jkyamaguchi/ReDI-AI.git
cd ReDI-AI/Project
```

2. Serve the web application:

```bash
# Using Python 3
python -m http.server 8000

# Then visit: http://localhost:8000/src/web/html/index.html
```

#### Option 3: Machine Learning Analysis

1. Install dependencies:

```bash
pip install pandas numpy scikit-learn matplotlib seaborn jupyter
```

2. Open the notebook:

```bash
jupyter notebook notebooks/customer_segmentation.ipynb
```

---

## 📖 How It Works

### 1. **Data Analysis Phase** (Jupyter Notebook)

- Load customer dataset with 29 features
- Remove outliers (Year_Birth > 1935, Income > 600K)
- Perform K-Means clustering with silhouette score optimization
- Generate cluster profiles with characteristics and strategies
- Export model parameters (centroids, scalers) to JavaScript

### 2. **Web Shopping Phase** (JavaScript)

- User browses product catalogs
- Adds items to shopping cart
- Cart data stored in `localStorage`

### 3. **Segmentation Prediction Phase** (Client-side ML)

When user proceeds to checkout:

1. **Feature Engineering**: Extract 9 features from cart data

   - `spend_intensity` = log(total_spend + 1)
   - Product category shares (wines, fruits, fish, sweets)
   - Web behavior defaults

2. **Feature Scaling**: Apply RobustScaler normalization

   - `scaled = (x - center) / scale`
   - Uses parameters trained on full dataset

3. **Classification**: Find nearest cluster centroid

   - Calculate Euclidean distance to all 3 centroids
   - Assign to closest cluster

4. **Visualization**: Display cluster profile with:
   - Segment name and characteristics
   - Key metrics with color-coded z-scores
   - Recommended strategy
   - Customer population statistics

---

## 💻 JavaScript Architecture

All JavaScript modules follow best practices:

### **header.js** - Navigation Controller

- Loads `header.html` template asynchronously
- Injects dynamic category links
- Updates cart count badge
- Pure logic + template separation

### **products.js** - Cart & Catalog Manager

- Manages shopping cart (add, remove, clear)
- Persists cart to `localStorage`
- Renders product catalogs with DOM API (XSS-safe)
- Exports `cartAPI` for global access
- Segmentation sample conversion for ML

### **cart.js** - Cart Page Functionality

- Displays cart contents with item details
- Quantity controls with increment/decrement
- Category grouping and summary
- Checkout navigation

### **checkout.js** - Order Review Controller

- Loads `checkout-content.html` template
- Renders order summary
- Calls `renderClusterPrediction()` for segment display
- Handles order confirmation and cart clearing

### **segmentation_model.js** - ML Classification Engine

- **Model Data**: K-Means centroids, scaler parameters, cluster profiles
- **Feature Engineering**: Aggregates cart spend, computes shares and intensity
- **Classification**: Scales features, finds nearest centroid
- **Visualization**: Loads `cluster-profile.html` template, populates with results
- **XSS-Safe**: All dynamic content via `textContent` (no `innerHTML`)

---

## 🎨 Design Patterns & Best Practices

### Architecture

✅ **Template-Based Architecture** - HTML structure in templates, JS for logic only  
✅ **Separation of Concerns** - Modular functions with single responsibilities  
✅ **Module Pattern** - IIFE scoping to prevent global namespace pollution  
✅ **DocumentFragment** - Batched DOM updates for performance

### Security

✅ **XSS Prevention** - `textContent` instead of `innerHTML`  
✅ **DOM API** - `createElement()`, `appendChild()`, `replaceChildren()`  
✅ **Input Validation** - Safe data handling throughout

### Code Quality

✅ **JSDoc Comments** - Comprehensive function documentation  
✅ **Error Handling** - Try-catch blocks, console warnings  
✅ **Async/Await** - Promise-based template loading  
✅ **Event Delegation** - Efficient event listening  
✅ **Helper Functions** - Extracted, reusable utility functions

### Performance

✅ **Template Caching** - Loaded once, reused for subsequent renders  
✅ **Efficient Selectors** - `querySelector()` for single elements  
✅ **DOM Batching** - `DocumentFragment` for multiple items  
✅ **Lazy Loading** - Templates loaded on-demand

---

## 📊 Machine Learning Details

### Model: K-Means Clustering

- **Algorithm**: K-Means with k=3 clusters
- **Features**: 9 features engineered from customer behavior
- **Training Data**: 2,240 customers from e-commerce dataset
- **Silhouette Score**: 0.210 (moderate separation)
- **Client-Side Inference**: Full classification logic in JavaScript

### Feature Engineering

```
spend_intensity = log(total_spend + 1)
Wines_share = wines_spend / total_spend
Fruits_share = fruits_spend / total_spend
Fish_share = fish_spend / total_spend
Sweets_share = sweets_spend / total_spend
NumWebPurchases, NumWebVisitsMonth, web_share, NumDealsPurchases
```

### Scaling

- **Method**: RobustScaler (median/IQR-based)
- **Equation**: `scaled = (x - median) / IQR`
- **Benefits**: Robust to outliers (unlike StandardScaler)

### Cluster Centers

Stored as normalized vectors in `SEGMENTATION_MODEL.clusterCenters`

---

## 📈 Notebook Analysis

The Jupyter notebook (`customer_segmentation.ipynb`) includes:

1. **Data Loading & Exploration**

   - Dataset overview with 29 features
   - Missing value analysis
   - Outlier detection and removal

2. **Feature Engineering**

   - Recency, Frequency, Monetary (RFM) analysis
   - Product category spending shares
   - Web behavior metrics

3. **K-Means Clustering**

   - Silhouette score optimization (k=2-10)
   - Cluster visualization with PCA
   - Profile generation with characteristics

4. **Model Comparison**

   - K-Means vs Gaussian Mixture Model
   - Adjusted Rand Index (ARI) analysis
   - Recommendation: K-Means selected

5. **Model Export**
   - Centroids and scaler parameters
   - Cluster profile definitions
   - JavaScript-ready format

---

## 🧪 Testing the Application

### Test User Flows

**1. Browse Products**

- Navigate to each category (Fish, Fruits, Meat, Gold, Wine, Sweets)
- View product listings

**2. Add to Cart**

- Click "Add to Cart" on products
- Cart count updates in header
- Verify items persist on page reload

**3. View Cart**

- Click "My Cart" button
- Review items with quantities
- Modify quantities or remove items

**4. Checkout & Segmentation**

- Click "Checkout"
- View order summary
- Observe customer segment prediction
- See segment-specific strategy

**5. Order Confirmation**

- Click "Confirm Order"
- Cart clears automatically
- Redirected to home page

### Sample Test Cart

Try this cart to see different segments:

**Cluster 0 (Low Web Engagement)**

- Low total spend (~$20-50)
- Mixed product categories
- Few items

**Cluster 1 (High-Value Web Enthusiast)**

- High wine spending ($150+)
- Wines dominate share (>75%)
- Multiple premium items

**Cluster 2 (Deal-Seeker)**

- Moderate spend ($50-150)
- Balanced product mix
- Mid-range prices

---

## 🔄 Recent Refactoring

### Code Quality Improvements

**Separation of Concerns**

- Moved HTML structure to template files
- JavaScript focuses on logic and data population
- Reduced code duplication

**Security Hardening**

- Replaced all `innerHTML` with DOM API
- `textContent` prevents XSS vulnerabilities
- Safe event handling with proper validation

**Code Organization**

- Added section headers and JSDoc comments
- Extracted helper functions for reusability
- Clear initialization and event handling patterns

**Files Refactored**

- ✅ `header.js` - Template-based navigation
- ✅ `products.js` - Cart & catalog management
- ✅ `checkout.js` - Order review with templates
- ✅ `segmentation_model.js` - ML with template rendering

---

## 🐛 Debugging & Troubleshooting

### Common Issues

**Cart not persisting?**

- Check browser's localStorage is enabled
- Clear localStorage: `localStorage.clear()` in console

**Segmentation not displaying?**

- Verify `templates/cluster-profile.html` is accessible
- Check browser console for template loading errors
- Ensure `segmentation_model.js` loads after `products.js`

**Template not loading?**

- Verify file paths are relative to HTML files
- Check CORS if serving from different domain
- Use browser DevTools Network tab to debug

### Browser DevTools Tips

**Inspect Cart Data**

```javascript
// In console:
window.cartAPI.get(); // View current cart
```

**Manual Segmentation**

```javascript
// In console:
const sample = window.cartAPI.toSegmentationSample();
console.log(sample); // View feature extraction
window.renderClusterPrediction(); // Manually trigger render
```

---

## 📝 Future Enhancements

- [ ] Backend API integration (Node.js/Express)
- [ ] Database persistence (MongoDB/PostgreSQL)
- [ ] User authentication and profiles
- [ ] Recommendation engine for each segment
- [ ] A/B testing framework for strategies
- [ ] Real-time dashboard with customer metrics
- [ ] Advanced visualizations (D3.js)
- [ ] PWA features for offline shopping

## 🙏 Acknowledgments

- ReDI School for AI/ML curriculum
- scikit-learn for clustering algorithms
- Open-source JavaScript best practices community
