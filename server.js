const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Data storage (in-memory for simplicity, can be replaced with database)
let meals = {};
let categories = [];
let favorites = [];
let shoppingLists = {};

// Load initial data
const loadInitialData = async () => {
    try {
        // Load default categories
        categories = [
            { id: 'breakfast', name: 'Breakfast', color: '#FF9800' },
            { id: 'lunch', name: 'Lunch', color: '#4CAF50' },
            { id: 'dinner', name: 'Dinner', color: '#2196F3' },
            { id: 'snack', name: 'Snack', color: '#9C27B0' },
            { id: 'dessert', name: 'Dessert', color: '#E91E63' },
            { id: 'vegetarian', name: 'Vegetarian', color: '#8BC34A' },
            { id: 'vegan', name: 'Vegan', color: '#4CAF50' },
            { id: 'gluten-free', name: 'Gluten-Free', color: '#FFC107' }
        ];

        // Try to load existing data from files
        try {
            const mealsData = await fs.readFile(path.join(__dirname, 'data', 'meals.json'), 'utf8');
            meals = JSON.parse(mealsData);
        } catch (error) {
            meals = {};
        }

        try {
            const categoriesData = await fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8');
            const savedCategories = JSON.parse(categoriesData);
            if (savedCategories.length > 0) {
                categories = savedCategories;
            }
        } catch (error) {
            // Use default categories
        }

        try {
            const favoritesData = await fs.readFile(path.join(__dirname, 'data', 'favorites.json'), 'utf8');
            favorites = JSON.parse(favoritesData);
        } catch (error) {
            favorites = [];
        }

        try {
            const shoppingListsData = await fs.readFile(path.join(__dirname, 'data', 'shoppingLists.json'), 'utf8');
            shoppingLists = JSON.parse(shoppingListsData);
        } catch (error) {
            shoppingLists = {};
        }

        // Ensure data directory exists
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
        
        console.log('Initial data loaded successfully');
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
};

// Save data to files
const saveData = async () => {
    try {
        await fs.writeFile(path.join(__dirname, 'data', 'meals.json'), JSON.stringify(meals, null, 2));
        await fs.writeFile(path.join(__dirname, 'data', 'categories.json'), JSON.stringify(categories, null, 2));
        await fs.writeFile(path.join(__dirname, 'data', 'favorites.json'), JSON.stringify(favorites, null, 2));
        await fs.writeFile(path.join(__dirname, 'data', 'shoppingLists.json'), JSON.stringify(shoppingLists, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
    }
};

// Utility function to generate IDs
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Routes

// Get all meals for a specific week
app.get('/api/meals/:weekKey', (req, res) => {
    try {
        const { weekKey } = req.params;
        const weekMeals = meals[weekKey] || {};
        res.json(weekMeals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch meals' });
    }
});

// Add or update a meal
app.post('/api/meals', async (req, res) => {
    try {
        const { weekKey, day, meal, mealData } = req.body;
        
        if (!weekKey || !day || !meal || !mealData) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!meals[weekKey]) meals[weekKey] = {};
        if (!meals[weekKey][day]) meals[weekKey][day] = {};

        const newMeal = {
            id: mealData.id || generateId(),
            name: mealData.name,
            category: mealData.category,
            ingredients: mealData.ingredients || [],
            instructions: mealData.instructions || '',
            prepTime: mealData.prepTime || 0,
            servings: mealData.servings || 4,
            createdAt: mealData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        meals[weekKey][day][meal] = newMeal;
        await saveData();

        res.json({ success: true, meal: newMeal });
    } catch (error) {
        console.error('Error adding meal:', error);
        res.status(500).json({ error: 'Failed to add meal' });
    }
});

// Delete a meal
app.delete('/api/meals/:weekKey/:day/:meal', async (req, res) => {
    try {
        const { weekKey, day, meal } = req.params;
        
        if (meals[weekKey]?.[day]?.[meal]) {
            delete meals[weekKey][day][meal];
            
            // Clean up empty objects
            if (Object.keys(meals[weekKey][day]).length === 0) {
                delete meals[weekKey][day];
            }
            if (Object.keys(meals[weekKey]).length === 0) {
                delete meals[weekKey];
            }
            
            await saveData();
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Meal not found' });
        }
    } catch (error) {
        console.error('Error deleting meal:', error);
        res.status(500).json({ error: 'Failed to delete meal' });
    }
});

// Get all meals (for dropdown population)
app.get('/api/meals', (req, res) => {
    try {
        // Return all meals from the meals.json file
        const mealsFilePath = path.join(__dirname, 'data', 'meals.json');
        if (fsSync.existsSync(mealsFilePath)) {
            const mealsData = fsSync.readFileSync(mealsFilePath, 'utf8');
            const allMeals = JSON.parse(mealsData);
            res.json(allMeals);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching meals:', error);
        res.status(500).json({ error: 'Failed to fetch meals' });
    }
});

// Get all categories
app.get('/api/categories', (req, res) => {
    try {
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Add a new category
app.post('/api/categories', async (req, res) => {
    try {
        const { name, color } = req.body;
        
        if (!name || !color) {
            return res.status(400).json({ error: 'Name and color are required' });
        }

        const newCategory = {
            id: generateId(),
            name: name.trim(),
            color: color
        };

        categories.push(newCategory);
        await saveData();

        res.json({ success: true, category: newCategory });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ error: 'Failed to add category' });
    }
});

// Update a category
app.put('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color } = req.body;
        
        const categoryIndex = categories.findIndex(cat => cat.id === id);
        if (categoryIndex === -1) {
            return res.status(404).json({ error: 'Category not found' });
        }

        categories[categoryIndex] = {
            ...categories[categoryIndex],
            name: name || categories[categoryIndex].name,
            color: color || categories[categoryIndex].color,
            updatedAt: new Date().toISOString()
        };

        await saveData();
        res.json({ success: true, category: categories[categoryIndex] });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Delete a category
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const categoryIndex = categories.findIndex(cat => cat.id === id);
        if (categoryIndex === -1) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Remove category from categories array
        categories.splice(categoryIndex, 1);

        // Update meals to remove this category
        Object.values(meals).forEach(weekMeals => {
            Object.values(weekMeals).forEach(dayMeals => {
                Object.values(dayMeals).forEach(meal => {
                    if (meal.category === id) {
                        meal.category = '';
                        meal.updatedAt = new Date().toISOString();
                    }
                });
            });
        });

        await saveData();
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// Get favorites
app.get('/api/favorites', (req, res) => {
    try {
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

// Add to favorites
app.post('/api/favorites', async (req, res) => {
    try {
        const { mealData } = req.body;
        
        if (!mealData) {
            return res.status(400).json({ error: 'Meal data is required' });
        }

        const existingIndex = favorites.findIndex(fav => fav.id === mealData.id);
        if (existingIndex !== -1) {
            return res.status(400).json({ error: 'Meal already in favorites' });
        }

        const favoriteMeal = {
            ...mealData,
            favoritedAt: new Date().toISOString()
        };

        favorites.push(favoriteMeal);
        await saveData();

        res.json({ success: true, favorite: favoriteMeal });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ error: 'Failed to add to favorites' });
    }
});

// Remove from favorites
app.delete('/api/favorites/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const favoriteIndex = favorites.findIndex(fav => fav.id === id);
        if (favoriteIndex === -1) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        favorites.splice(favoriteIndex, 1);
        await saveData();

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ error: 'Failed to remove from favorites' });
    }
});

// Get shopping list for a week
app.get('/api/shopping-list/:weekKey', (req, res) => {
    try {
        const { weekKey } = req.params;
        const weekShoppingList = shoppingLists[weekKey] || [];
        res.json(weekShoppingList);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch shopping list' });
    }
});

// Generate shopping list for a week
app.post('/api/shopping-list/generate', async (req, res) => {
    try {
        const { weekKey } = req.body;
        
        if (!weekKey) {
            return res.status(400).json({ error: 'Week key is required' });
        }

        const weekMeals = meals[weekKey] || {};
        const ingredients = {};
        
        Object.values(weekMeals).forEach(dayMeals => {
            Object.values(dayMeals).forEach(meal => {
                if (meal.ingredients) {
                    meal.ingredients.forEach(ingredient => {
                        const cleanIngredient = ingredient.trim().toLowerCase();
                        if (cleanIngredient) {
                            ingredients[cleanIngredient] = (ingredients[cleanIngredient] || 0) + 1;
                        }
                    });
                }
            });
        });
        
        const shoppingList = Object.entries(ingredients).map(([ingredient, count]) => ({
            id: generateId(),
            name: ingredient,
            count: count,
            completed: false,
            createdAt: new Date().toISOString()
        }));
        
        shoppingLists[weekKey] = shoppingList;
        await saveData();

        res.json({ success: true, shoppingList });
    } catch (error) {
        console.error('Error generating shopping list:', error);
        res.status(500).json({ error: 'Failed to generate shopping list' });
    }
});

// Update shopping list item
app.put('/api/shopping-list/:weekKey/:itemId', async (req, res) => {
    try {
        const { weekKey, itemId } = req.params;
        const { completed } = req.body;
        
        if (!shoppingLists[weekKey]) {
            return res.status(404).json({ error: 'Shopping list not found' });
        }

        const itemIndex = shoppingLists[weekKey].findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found' });
        }

        shoppingLists[weekKey][itemIndex].completed = completed;
        shoppingLists[weekKey][itemIndex].updatedAt = new Date().toISOString();
        
        await saveData();
        res.json({ success: true, item: shoppingLists[weekKey][itemIndex] });
    } catch (error) {
        console.error('Error updating shopping list item:', error);
        res.status(500).json({ error: 'Failed to update shopping list item' });
    }
});

// Clear shopping list for a week
app.delete('/api/shopping-list/:weekKey', async (req, res) => {
    try {
        const { weekKey } = req.params;
        
        if (shoppingLists[weekKey]) {
            delete shoppingLists[weekKey];
            await saveData();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error clearing shopping list:', error);
        res.status(500).json({ error: 'Failed to clear shopping list' });
    }
});

// Get meal statistics
app.get('/api/stats', (req, res) => {
    try {
        const totalMeals = Object.values(meals).reduce((total, weekMeals) => {
            return total + Object.values(weekMeals).reduce((weekTotal, dayMeals) => {
                return weekTotal + Object.keys(dayMeals).length;
            }, 0);
        }, 0);

        const categoryStats = {};
        Object.values(meals).forEach(weekMeals => {
            Object.values(weekMeals).forEach(dayMeals => {
                Object.values(dayMeals).forEach(meal => {
                    if (meal.category) {
                        categoryStats[meal.category] = (categoryStats[meal.category] || 0) + 1;
                    }
                });
            });
        });

        const stats = {
            totalMeals,
            totalCategories: categories.length,
            totalFavorites: favorites.length,
            categoryStats,
            totalWeeks: Object.keys(meals).length
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Search meals
app.get('/api/search', (req, res) => {
    try {
        const { query, category, limit = 20 } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const searchResults = [];
        const searchQuery = query.toLowerCase();

        Object.values(meals).forEach(weekMeals => {
            Object.values(weekMeals).forEach(dayMeals => {
                Object.values(dayMeals).forEach(meal => {
                    const matchesQuery = meal.name.toLowerCase().includes(searchQuery) ||
                                       meal.ingredients.some(ing => ing.toLowerCase().includes(searchQuery)) ||
                                       meal.instructions.toLowerCase().includes(searchQuery);
                    
                    const matchesCategory = !category || meal.category === category;

                    if (matchesQuery && matchesCategory) {
                        searchResults.push({
                            ...meal,
                            searchScore: calculateSearchScore(meal, searchQuery)
                        });
                    }
                });
            });
        });

        // Sort by search score and limit results
        searchResults.sort((a, b) => b.searchScore - a.searchScore);
        const limitedResults = searchResults.slice(0, parseInt(limit));

        res.json(limitedResults);
    } catch (error) {
        console.error('Error searching meals:', error);
        res.status(500).json({ error: 'Failed to search meals' });
    }
});

// Calculate search score for relevance
const calculateSearchScore = (meal, query) => {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Exact name match gets highest score
    if (meal.name.toLowerCase() === queryLower) {
        score += 100;
    } else if (meal.name.toLowerCase().includes(queryLower)) {
        score += 50;
    }
    
    // Ingredient matches
    meal.ingredients.forEach(ingredient => {
        if (ingredient.toLowerCase().includes(queryLower)) {
            score += 10;
        }
    });
    
    // Instruction matches
    if (meal.instructions.toLowerCase().includes(queryLower)) {
        score += 5;
    }
    
    return score;
};

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const startServer = async () => {
    await loadInitialData();
    
    app.listen(PORT, () => {
        console.log(`MealPan server running on port ${PORT}`);
        console.log(`Open http://localhost:${PORT} in your browser`);
    });
};

startServer().catch(console.error);

module.exports = app; 