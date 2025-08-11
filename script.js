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
        this.loadMealsFromAPI();
    }

    async loadMealsFromAPI() {
        try {
            const response = await fetch('/api/meals');
            if (response.ok) {
                const apiMeals = await response.json();
                // Merge API meals with localStorage meals, avoiding duplicates
                const existingMealNames = this.meals.map(m => m.name);
                apiMeals.forEach(meal => {
                    if (!existingMealNames.includes(meal.name)) {
                        this.meals.push(meal);
                    }
                });
                this.saveData();
                this.renderMeals();
                this.renderWeeklyPlan();
            }
        } catch (error) {
            console.log('Could not load meals from API, using local data only');
        }
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

        // Delegate event listener for delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-meal-btn')) {
                const mealId = e.target.dataset.mealId;
                const mealName = e.target.dataset.mealName;
                this.deleteMeal(mealId, mealName);
            }
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
            <ul class="shopping-items">
                ${shoppingList.map((item, index) => `
                    <li class="shopping-item" data-index="${index}">
                        <input type="checkbox" id="item-${index}" class="shopping-checkbox">
                        <label for="item-${index}" class="shopping-label">${item}</label>
                    </li>
                `).join('')}
            </ul>
            <div class="shopping-actions">
                <button class="btn btn-secondary" id="clearChecked">Clear Checked Items</button>
                <button class="btn btn-primary" id="printList">Print List</button>
            </div>
        `;
        shoppingListDiv.innerHTML = listHTML;

        // Add event listeners for checkboxes
        this.setupShoppingListListeners();
        
        // Load saved state
        this.loadShoppingListState();
    }

    setupShoppingListListeners() {
        // Checkbox change events
        document.querySelectorAll('.shopping-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateShoppingItemState(e.target);
            });
        });

        // Clear checked items button
        const clearCheckedBtn = document.getElementById('clearChecked');
        if (clearCheckedBtn) {
            clearCheckedBtn.addEventListener('click', () => {
                this.clearCheckedItems();
            });
        }

        // Print list button
        const printListBtn = document.getElementById('printList');
        if (printListBtn) {
            printListBtn.addEventListener('click', () => {
                this.printShoppingList();
            });
        }
    }

    updateShoppingItemState(checkbox) {
        const item = checkbox.closest('.shopping-item');
        const label = item.querySelector('.shopping-label');
        
        if (checkbox.checked) {
            item.classList.add('checked');
            label.style.textDecoration = 'line-through';
            label.style.color = '#999';
        } else {
            item.classList.remove('checked');
            label.style.textDecoration = 'none';
            label.style.color = '#333';
        }

        // Save state to localStorage
        this.saveShoppingListState();
    }

    saveShoppingListState() {
        const checkedItems = [];
        document.querySelectorAll('.shopping-checkbox:checked').forEach(checkbox => {
            const item = checkbox.closest('.shopping-item');
            const index = item.dataset.index;
            checkedItems.push(parseInt(index));
        });
        
        localStorage.setItem('shoppingListChecked', JSON.stringify(checkedItems));
    }

    loadShoppingListState() {
        try {
            const checkedItems = JSON.parse(localStorage.getItem('shoppingListChecked') || '[]');
            checkedItems.forEach(index => {
                const checkbox = document.getElementById(`item-${index}`);
                if (checkbox) {
                    checkbox.checked = true;
                    this.updateShoppingItemState(checkbox);
                }
            });
        } catch (e) {
            console.warn('Failed to load shopping list state');
        }
    }

    clearCheckedItems() {
        const checkedItems = document.querySelectorAll('.shopping-checkbox:checked');
        if (checkedItems.length === 0) {
            alert('No items are checked to clear!');
            return;
        }

        if (confirm(`Clear ${checkedItems.length} checked item(s)?`)) {
            checkedItems.forEach(checkbox => {
                const item = checkbox.closest('.shopping-item');
                item.remove();
            });
            
            // Update indices for remaining items
            document.querySelectorAll('.shopping-item').forEach((item, newIndex) => {
                item.dataset.index = newIndex;
                const checkbox = item.querySelector('.shopping-checkbox');
                const label = item.querySelector('.shopping-label');
                checkbox.id = `item-${newIndex}`;
                label.htmlFor = `item-${newIndex}`;
            });

            // Clear localStorage state
            localStorage.removeItem('shoppingListChecked');
        }
    }

    printShoppingList() {
        const uncheckedItems = document.querySelectorAll('.shopping-checkbox:not(:checked)');
        if (uncheckedItems.length === 0) {
            alert('All items are checked! Nothing to print.');
            return;
        }

        const printWindow = window.open('', '_blank');
        const items = Array.from(uncheckedItems).map(checkbox => {
            const label = checkbox.nextElementSibling;
            return label.textContent;
        });

        printWindow.document.write(`
            <html>
                <head>
                    <title>Shopping List</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px; 
                            font-size: 16px;
                        }
                        h1 { 
                            color: #4CAF50; 
                            border-bottom: 2px solid #4CAF50;
                            padding-bottom: 10px;
                        }
                        .item { 
                            padding: 8px 0; 
                            border-bottom: 1px solid #eee; 
                            font-size: 18px;
                        }
                        .date {
                            color: #666;
                            margin-bottom: 20px;
                        }
                    </style>
                </head>
                <body>
                    <h1>Shopping List</h1>
                    <div class="date">Generated on ${new Date().toLocaleDateString()}</div>
                    ${items.map(item => `
                        <div class="item">
                            <input type="checkbox" style="transform: scale(1.5); margin-right: 10px;"> ${item}
                        </div>
                    `).join('')}
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }

    renderMeals() {
        const mealsListDiv = document.getElementById('mealsList');
        
        if (this.meals.length === 0) {
            mealsListDiv.innerHTML = '<p>No meals available yet. Meals will load from the database.</p>';
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
                ${meal.instructions ? `<p><strong>Instructions:</strong> ${meal.instructions}</p>` : ''}
                ${meal.prepTime ? `<p><strong>Prep Time:</strong> ${meal.prepTime} minutes</p>` : ''}
                ${meal.servings ? `<p><strong>Servings:</strong> ${meal.servings}</p>` : ''}
                ${meal.category ? `<p><strong>Category:</strong> ${meal.category}</p>` : ''}
                <button class="delete-meal-btn" data-meal-id="${meal.id}" data-meal-name="${meal.name}">Delete Meal</button>
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

    deleteMeal(mealId, mealName) {
        if (confirm(`Are you sure you want to delete "${mealName}"? This will also remove it from your weekly plan if it's scheduled.`)) {
            // Remove from meals array
            this.meals = this.meals.filter(meal => meal.id != mealId);
            
            // Remove from weekly plan if it's scheduled
            Object.keys(this.weeklyPlan).forEach(day => {
                if (this.weeklyPlan[day] === mealName) {
                    delete this.weeklyPlan[day];
                }
            });
            
            this.saveData();
            this.renderMeals();
            this.renderWeeklyPlan();
            
            alert(`"${mealName}" has been deleted successfully!`);
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SimpleMealPlanner();
}); 