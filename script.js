// Simple Meal Planner App
class SimpleMealPlanner {
    constructor() {
        this.meals = [];
        this.weeklyPlan = {};
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderMeals();
        this.renderWeeklyPlan();
    }

    loadData() {
        try {
            this.meals = JSON.parse(localStorage.getItem('meals') || '[]');
        } catch (e) {
            console.warn('Failed to parse meals from localStorage, resetting to empty array');
            this.meals = [];
        }

        try {
            this.weeklyPlan = JSON.parse(localStorage.getItem('weeklyPlan') || '{}');
        } catch (e) {
            console.warn('Failed to parse weekly plan from localStorage, resetting to empty object');
            this.weeklyPlan = {};
        }
    }

    saveData() {
        localStorage.setItem('meals', JSON.stringify(this.meals));
        localStorage.setItem('weeklyPlan', JSON.stringify(this.weeklyPlan));
    }

    setupEventListeners() {
        // Add meal form
        document.getElementById('addMealForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMeal();
        });

        // Generate shopping list button
        document.getElementById('generateShoppingList').addEventListener('click', () => {
            this.generateShoppingList();
        });

        // Weekly plan select changes
        document.querySelectorAll('.meal-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const day = e.target.dataset.day;
                const mealName = e.target.value;
                this.updateWeeklyPlan(day, mealName);
            });
        });
    }

    addMeal() {
        const mealName = document.getElementById('mealName').value.trim();
        const ingredientsText = document.getElementById('mealIngredients').value.trim();

        if (!mealName || !ingredientsText) {
            alert('Please fill in both meal name and ingredients');
            return;
        }

        const ingredients = ingredientsText.split('\n')
            .map(ingredient => ingredient.trim())
            .filter(ingredient => ingredient.length > 0);

        const meal = {
            id: Date.now(),
            name: mealName,
            ingredients: ingredients
        };

        this.meals.push(meal);
        this.saveData();
        this.renderMeals();
        this.renderWeeklyPlan();

        // Clear form
        document.getElementById('addMealForm').reset();
        
        alert('Meal added successfully!');
    }

    updateWeeklyPlan(day, mealName) {
        if (mealName) {
            this.weeklyPlan[day] = mealName;
        } else {
            delete this.weeklyPlan[day];
        }
        this.saveData();
    }

    generateShoppingList() {
        const shoppingList = [];
        const mealCounts = {};

        // Count ingredients from weekly plan
        Object.values(this.weeklyPlan).forEach(mealName => {
            const meal = this.meals.find(m => m.name === mealName);
            if (meal) {
                meal.ingredients.forEach(ingredient => {
                    if (mealCounts[ingredient]) {
                        mealCounts[ingredient]++;
                    } else {
                        mealCounts[ingredient] = 1;
                    }
                });
            }
        });

        // Convert to shopping list
        Object.entries(mealCounts).forEach(([ingredient, count]) => {
            if (count > 1) {
                shoppingList.push(`${ingredient} (${count}x)`);
            } else {
                shoppingList.push(ingredient);
            }
        });

        this.displayShoppingList(shoppingList);
    }

    displayShoppingList(shoppingList) {
        const shoppingListDiv = document.getElementById('shoppingList');
        
        if (shoppingList.length === 0) {
            shoppingListDiv.innerHTML = '<p>No meals planned for this week. Add some meals to your weekly plan!</p>';
            return;
        }

        const listHTML = `
            <ul>
                ${shoppingList.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        shoppingListDiv.innerHTML = listHTML;
    }

    renderMeals() {
        const mealsListDiv = document.getElementById('mealsList');
        
        if (this.meals.length === 0) {
            mealsListDiv.innerHTML = '<p>No meals added yet. Add your first meal above!</p>';
            return;
        }

        const mealsHTML = this.meals.map(meal => `
            <div class="meal-item">
                <h3>${meal.name}</h3>
                <div class="meal-ingredients">
                    <strong>Ingredients:</strong>
                    <ul>
                        ${meal.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');

        mealsListDiv.innerHTML = mealsHTML;
    }

    renderWeeklyPlan() {
        // Update all meal select dropdowns
        document.querySelectorAll('.meal-select').forEach(select => {
            const day = select.dataset.day;
            const currentMeal = this.weeklyPlan[day] || '';
            
            // Clear existing options except the first one
            select.innerHTML = '<option value="">Select a meal</option>';
            
            // Add meal options
            this.meals.forEach(meal => {
                const option = document.createElement('option');
                option.value = meal.name;
                option.textContent = meal.name;
                option.selected = meal.name === currentMeal;
                select.appendChild(option);
            });
        });
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SimpleMealPlanner();
}); 