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

        // Delegate event listener for delete and edit buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-meal-btn')) {
                const mealId = e.target.dataset.mealId;
                const mealName = e.target.dataset.mealName;
                this.deleteMeal(mealId, mealName);
            }
            if (e.target.classList.contains('edit-ingredients-btn')) {
                const mealId = e.target.dataset.mealId;
                this.editMealIngredients(mealId);
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

    editMealIngredients(mealId) {
        const meal = this.meals.find(m => m.id == mealId);
        if (!meal) return;

        const mealItem = document.querySelector(`[data-meal-id="${mealId}"]`);
        const ingredientsList = mealItem.querySelector('.meal-ingredients ul');
        const currentHTML = ingredientsList.innerHTML;
        
        // Create editable ingredient lines
        let editableHTML = meal.ingredients.map((ingredient, index) => `
            <li class="ingredient-line">
                <input type="text" class="ingredient-input" value="${ingredient}" data-index="${index}">
                <button class="remove-ingredient-btn" data-index="${index}">×</button>
            </li>
        `).join('');
        
        // Add a new empty ingredient line
        editableHTML += `
            <li class="ingredient-line">
                <input type="text" class="ingredient-input new-ingredient" placeholder="Add new ingredient...">
                <button class="remove-ingredient-btn" style="visibility: hidden;">×</button>
            </li>
        `;
        
        // Replace ingredients list with editable inputs
        ingredientsList.innerHTML = editableHTML;
        
        // Add save/cancel buttons below the list
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'edit-actions';
        actionsDiv.innerHTML = `
            <button class="btn btn-primary save-ingredients-btn">Save</button>
            <button class="btn btn-secondary cancel-edit-btn">Cancel</button>
        `;
        
        ingredientsList.parentNode.appendChild(actionsDiv);
        
        // Focus on first input
        const firstInput = ingredientsList.querySelector('.ingredient-input');
        firstInput.focus();
        
        // Add event listeners
        const saveBtn = actionsDiv.querySelector('.save-ingredients-btn');
        const cancelBtn = actionsDiv.querySelector('.cancel-edit-btn');
        
        // Handle ingredient input changes
        ingredientsList.addEventListener('input', (e) => {
            if (e.target.classList.contains('ingredient-input')) {
                // Auto-add new line if typing in the last input
                const inputs = ingredientsList.querySelectorAll('.ingredient-input');
                const lastInput = inputs[inputs.length - 1];
                
                if (e.target === lastInput && e.target.value.trim() !== '') {
                    const newLine = document.createElement('li');
                    newLine.className = 'ingredient-line';
                    newLine.innerHTML = `
                        <input type="text" class="ingredient-input new-ingredient" placeholder="Add new ingredient...">
                        <button class="remove-ingredient-btn" style="visibility: hidden;">×</button>
                    `;
                    ingredientsList.appendChild(newLine);
                }
            }
        });
        
        // Handle remove ingredient buttons
        ingredientsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-ingredient-btn')) {
                const line = e.target.closest('.ingredient-line');
                if (line) {
                    line.remove();
                }
            }
        });
        
        saveBtn.addEventListener('click', () => {
            const inputs = ingredientsList.querySelectorAll('.ingredient-input');
            const newIngredients = Array.from(inputs)
                .map(input => input.value.trim())
                .filter(ingredient => ingredient.length > 0);
            
            if (newIngredients.length === 0) {
                alert('Ingredients cannot be empty!');
                return;
            }
            
            meal.ingredients = newIngredients;
            this.saveData();
            this.renderMeals();
            this.renderWeeklyPlan();
        });
        
        cancelBtn.addEventListener('click', () => {
            // Restore original ingredients display
            ingredientsList.innerHTML = currentHTML;
            actionsDiv.remove();
        });
        
        // Handle Enter key to save, Escape to cancel
        ingredientsList.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                saveBtn.click();
            } else if (e.key === 'Escape') {
                cancelBtn.click();
            }
        });
    }

    updateWeeklyPlan(day, mealName) {
        if (mealName) {
            this.weeklyPlan[day] = mealName;
            const meal = this.meals.find(m => m.name === mealName);
            if (meal) {
                this.displayDayIngredients(day, meal);
            }
        } else {
            delete this.weeklyPlan[day];
            this.clearDayIngredients(day);
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



    renderMeals() {
        const mealsListDiv = document.getElementById('mealsList');
        
        if (this.meals.length === 0) {
            mealsListDiv.innerHTML = '<p>No meals available yet. Meals will load from the database.</p>';
            return;
        }

        const mealsHTML = this.meals.map(meal => `
            <div class="meal-item" data-meal-id="${meal.id}">
                <h3>${meal.name}</h3>
                <div class="meal-ingredients">
                    <strong>Ingredients:</strong>
                    <ul>
                        ${meal.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
                <button class="edit-ingredients-btn" data-meal-id="${meal.id}">Edit Ingredients</button>
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

        // Update ingredients display for each day
        Object.keys(this.weeklyPlan).forEach(day => {
            const mealName = this.weeklyPlan[day];
            if (mealName) {
                const meal = this.meals.find(m => m.name === mealName);
                if (meal) {
                    this.displayDayIngredients(day, meal);
                }
            } else {
                this.clearDayIngredients(day);
            }
        });
    }

    displayDayIngredients(day, meal) {
        const dayColumn = document.querySelector(`[data-day="${day}"]`).closest('.day-column');
        let ingredientsDiv = dayColumn.querySelector('.day-ingredients');
        
        // Create ingredients display if it doesn't exist
        if (!ingredientsDiv) {
            ingredientsDiv = document.createElement('div');
            ingredientsDiv.className = 'day-ingredients';
            dayColumn.appendChild(ingredientsDiv);
        }
        
        ingredientsDiv.innerHTML = `
            <div class="selected-meal-info">
                <h4>${meal.name}</h4>
                <div class="ingredients-preview">
                    <strong>Ingredients:</strong>
                    <ul>
                        ${meal.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    clearDayIngredients(day) {
        const dayColumn = document.querySelector(`[data-day="${day}"]`).closest('.day-column');
        const ingredientsDiv = dayColumn.querySelector('.day-ingredients');
        if (ingredientsDiv) {
            ingredientsDiv.remove();
        }
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