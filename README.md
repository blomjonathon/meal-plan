# MealPan - Weekly Meal Planner

A comprehensive, mobile-friendly meal planning application that helps you organize your weekly meals, manage custom categories, save favorites, and generate shopping lists.

## 🌟 Features

### 📅 Weekly Meal Planning
- **7-day view** with breakfast, lunch, and dinner slots
- **Week navigation** to plan ahead or review past weeks
- **Drag & drop** meal assignment (coming soon)
- **Date display** for each day of the week

### 🏷️ Custom Categories
- **Pre-built categories** (Breakfast, Lunch, Dinner, Snack, etc.)
- **Add custom categories** with personalized colors
- **Category management** - edit, delete, and organize
- **Visual category indicators** with color coding

### 🍽️ Meal Management
- **Detailed meal information** including ingredients, instructions, prep time, and servings
- **Ingredient lists** for easy shopping list generation
- **Cooking instructions** for step-by-step guidance
- **Meal details modal** for comprehensive information

### ❤️ Favorites System
- **Save favorite meals** for quick access
- **Favorite management** - add, remove, and organize
- **Quick meal assignment** from favorites

### 🛒 Shopping List Generation
- **Automatic ingredient compilation** from weekly meals
- **Checkbox tracking** for shopping progress
- **Print-friendly format** for offline use
- **Clear and organize** shopping lists

### 📱 Mobile-First Design
- **Responsive layout** that works on all devices
- **Touch-friendly interface** for mobile users
- **Optimized navigation** for small screens
- **Progressive Web App** features

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14.0.0 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download** the project files
2. **Navigate to the project directory**:
   ```bash
   cd meal-pan
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Open your browser** and go to:
   ```
   http://localhost:3000
   ```

### Development Mode
For development with auto-restart:
```bash
npm run dev
```

## 📁 Project Structure

```
meal-pan/
├── index.html          # Main application HTML
├── styles.css          # CSS styles and responsive design
├── script.js           # Frontend JavaScript functionality
├── server.js           # Node.js backend server
├── package.json        # Node.js dependencies and scripts
├── README.md           # This file
└── data/               # Data storage directory (auto-created)
    ├── meals.json      # Meal data
    ├── categories.json # Category data
    ├── favorites.json  # Favorite meals
    └── shoppingLists.json # Shopping lists
```

## 🎯 Usage Guide

### Adding Meals
1. Click on any empty meal slot (breakfast, lunch, or dinner)
2. Fill in the meal details:
   - **Meal Name**: Enter the name of your dish
   - **Category**: Select from existing categories or create new ones
   - **Ingredients**: List ingredients (one per line)
   - **Instructions**: Add cooking instructions (optional)
   - **Prep Time**: Estimated preparation time in minutes
   - **Servings**: Number of people the meal serves
3. Click "Save Meal" to add it to your plan

### Managing Categories
1. Click the "Categories" button in the header
2. **View existing categories** with meal counts
3. **Add new categories** with custom names and colors
4. **Delete categories** (meals will become uncategorized)

### Creating Shopping Lists
1. Plan your meals for the week
2. Click "View Shopping List" button
3. **Automatic generation** from your meal ingredients
4. **Check off items** as you shop
5. **Print the list** for offline use

### Week Navigation
- Use **left/right arrows** to navigate between weeks
- **Current week** is displayed prominently
- **Date information** shows for each day

## 🔧 API Endpoints

The backend provides RESTful API endpoints for:

- **Meals**: `GET`, `POST`, `DELETE` operations
- **Categories**: `GET`, `POST`, `PUT`, `DELETE` operations
- **Favorites**: `GET`, `POST`, `DELETE` operations
- **Shopping Lists**: `GET`, `POST`, `PUT`, `DELETE` operations
- **Statistics**: `GET` meal and category statistics
- **Search**: `GET` meal search functionality

## 💾 Data Storage

- **Local Storage**: Frontend data persistence
- **File System**: Backend data storage in JSON files
- **Auto-save**: Automatic data persistence
- **Data Migration**: Easy to upgrade to database storage

## 🎨 Customization

### Adding New Meal Types
Edit the `getDefaultCategories()` function in `script.js` to add new default categories.

### Styling Changes
Modify `styles.css` to customize colors, fonts, and layout.

### Backend Extensions
Add new API endpoints in `server.js` for additional functionality.

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode

## 🔒 Security Features

- **Input validation** on all forms
- **XSS protection** through proper escaping
- **CORS configuration** for API access
- **Error handling** for robust operation

## 📱 Mobile Optimization

- **Responsive grid layout** that adapts to screen size
- **Touch-friendly buttons** and interactions
- **Optimized typography** for mobile reading
- **Progressive enhancement** for better mobile experience

## 🧪 Testing

The application includes:
- **Form validation** for data integrity
- **Error handling** for robust operation
- **Responsive testing** across device sizes
- **Browser compatibility** testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Font Awesome** for beautiful icons
- **Express.js** for the robust backend framework
- **Modern CSS** features for responsive design

## 📞 Support

For questions, issues, or feature requests:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔮 Future Features

- **Recipe import** from popular recipe sites
- **Nutritional information** calculation
- **Meal sharing** between users
- **Calendar integration** with external calendars
- **Shopping list sharing** with family members
- **Meal photo uploads** for visual meal planning

---

**Happy Meal Planning! 🍽️✨** 