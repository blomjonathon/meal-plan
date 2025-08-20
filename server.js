// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Path to meals JSON file
const mealsFilePath = path.join(__dirname,'data', 'meals.json');

const mealsData = fs.readFileSync(mealsFilePath, 'utf-8');
console.log(mealsData);

// Helper function to read meals
const readMeals = () => {
  const data = fs.readFileSync(mealsFilePath, 'utf-8');
  return JSON.parse(data).meals;
};

// Helper function to write meals
const writeMeals = (meals) => {
  fs.writeFileSync(mealsFilePath, JSON.stringify({ meals }, null, 2));
};

// GET all meals
app.get('/api/meals', (req, res) => {
  const meals = readMeals();
  res.json(meals);
});

// GET a single meal by name
app.get('/api/meals/:name', (req, res) => {
  const meals = readMeals();
  const meal = meals.find(m => m.name.toLowerCase() === req.params.name.toLowerCase());
  if (!meal) return res.status(404).json({ message: 'Meal not found' });
  res.json(meal);
});

// CREATE a new meal
app.post('/api/meals', (req, res) => {
  const meals = readMeals();
  const { name, ingredients } = req.body;
  if (!name || !ingredients) return res.status(400).json({ message: 'Name and ingredients are required' });

  meals.push({ name, ingredients });
  writeMeals(meals);
  res.status(201).json({ message: 'Meal added', meal: { name, ingredients } });
});

// UPDATE a meal by name
app.put('/api/meals/:name', (req, res) => {
  const meals = readMeals();
  const mealIndex = meals.findIndex(m => m.name.toLowerCase() === req.params.name.toLowerCase());
  if (mealIndex === -1) return res.status(404).json({ message: 'Meal not found' });

  const { name, ingredients } = req.body;
  if (name) meals[mealIndex].name = name;
  if (ingredients) meals[mealIndex].ingredients = ingredients;

  writeMeals(meals);
  res.json({ message: 'Meal updated', meal: meals[mealIndex] });
});

// DELETE a meal by name
app.delete('/api/meals/:name', (req, res) => {
  const meals = readMeals();
  const updatedMeals = meals.filter(m => m.name.toLowerCase() !== req.params.name.toLowerCase());
  if (updatedMeals.length === meals.length) return res.status(404).json({ message: 'Meal not found' });

  writeMeals(updatedMeals);
  res.json({ message: 'Meal deleted' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
