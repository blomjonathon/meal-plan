async function loadMealsForDropdown(dropdownId) {
    try {
        const response = await fetch('/api/meals'); // Call the API
        if (!response.ok) throw new Error('Failed to fetch meals');

        const meals = await response.json(); // Array of meals
        const dropdown = document.getElementById(dropdownId);

        // Add meals dynamically
        meals.forEach(meal => {
            const option = document.createElement('option');
            option.value = meal.name;
            option.textContent = meal.name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error(error);
    }
}

// Populate the Friday dropdown when page loads
window.addEventListener('DOMContentLoaded', () => {
    loadMealsForDropdown('mealFridayDropdown');
});
