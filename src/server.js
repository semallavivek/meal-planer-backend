import express from 'express';
import cors from 'cors';
import { connectToDB, db } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// Route to add recipes
app.post('/admin/recipes', async (req, res) => {
  const { name, calories, protein, carbs, fat, mealType, imageUrl, amazonFreshUrl } = req.body;

  if (!name || !calories || !protein || !carbs || !fat || !mealType || !imageUrl || !amazonFreshUrl) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }

  try {
    const newRecipe = {
      name,
      calories: parseInt(calories),
      protein: parseInt(protein),
      carbs: parseInt(carbs),
      fat: parseInt(fat),
      mealType,
      imageUrl,
      amazonFreshUrl,
    };

    const result = await db.collection('mealplanner').insertOne(newRecipe);
    res.status(201).json({ message: 'Recipe added successfully!', result });
  } catch (e) {
    console.error('Error inserting recipe:', e);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Route to insert multiple documents
app.post('/insertmany', async (req, res) => {
  try {
    const result = await db.collection('ast').insertMany(req.body);
    res.json(result);
  } catch (e) {
    console.error('Error inserting documents:', e);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Sign Up route
app.post('/signup', async (req, res) => {
  const { email, password, confirmpassword, phone, branch, bmi } = req.body;

  if (!email || !password || !confirmpassword || !phone || !branch || !bmi) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }

  if (password !== confirmpassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    const newUser = {
      email,
      password,
      phone,
      branch,
      bmi: parseFloat(bmi),  // Store BMI as a float
    };

    const result = await db.collection('login_info').insertOne(newUser);
    res.status(201).json({ message: 'Sign up successful!', result });
  } catch (e) {
    console.error('Error during sign up:', e);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});


// Sign In route
app.post('/signin', async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  try {
    const user = await db.collection('login_info').findOne({ email: name });

    if (user && user.password === password) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid email or password.' });
    }
  } catch (e) {
    console.error('Error during sign in:', e);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Route to handle forget password
app.post('/forget-password', async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'Please provide email, new password, and confirm password.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    const user = await db.collection('login_info').findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await db.collection('login_info').updateOne(
      { email },
      { $set: { password: newPassword } }
    );

    res.json({ message: 'Password updated successfully.' });
  } catch (e) {
    console.error('Error updating password:', e);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

app.post('/recipes', async (req, res) => {
  try {
    const { targetCalories, mealDistribution } = req.body;

    if (typeof targetCalories === 'undefined' || typeof mealDistribution === 'undefined') {
      return res.status(400).json({ message: 'targetCalories or mealDistribution parameter is missing' });
    }

    const target = parseInt(targetCalories);

    if (isNaN(target) || target <= 0) {
      return res.status(400).json({ message: 'Invalid targetCalories parameter' });
    }

    const tolerance = 50;

    const cursor = db.collection('mealplanner').find({});
    const allRecipes = [];
    
    await cursor.forEach(doc => allRecipes.push(doc));
    console.log(`Fetched ${allRecipes.length} recipes.`);

    // Function to find the closest combination of recipes
    const findClosestCombination = (recipes, target, tolerance) => {
      const closest = [];
      let closestSum = 0;
      const n = recipes.length;

      for (let i = 0; i < (1 << n); i++) {
        let sum = 0;
        let combination = [];

        for (let j = 0; j < n; j++) {
          if (i & (1 << j)) {
            sum += recipes[j].calories;
            combination.push(recipes[j]);
          }
        }

        if (Math.abs(sum - target) < Math.abs(closestSum - target) || closest.length === 0) {
          closestSum = sum;
          closest.length = 0;
          closest.push(...combination);
        }

        if (Math.abs(sum - target) <= tolerance) {
          return combination;
        }
      }

      return closest;
    };

    // Calculate calories for each meal type
    const calculateMealCalories = (percentage) => {
      return target * (percentage / 100);
    };

    const meals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
    const result = {};

    for (const meal of meals) {
      const mealCalories = calculateMealCalories(mealDistribution[meal.toLowerCase()]);
      const filteredRecipes = allRecipes.filter(r => r.mealType === meal);
      console.log(`Filtered ${meal} recipes:`, filteredRecipes); // Debugging log
      const closestRecipes = findClosestCombination(filteredRecipes, mealCalories, tolerance);
      result[meal] = closestRecipes;
    }

    console.log('Final result:', result); // Debugging log
    res.json(result);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
});


app.post('/insertmany', async (req, res) => {
  try {
    const result = await db.collection('').insertMany(req.body);
    res.json(result);
  } catch (e) {
    console.error('Error inserting documents:', e);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});
app.post('/get-yoga-poses', async (req, res) => {
  const { caloriesToBurn } = req.body;

  if (caloriesToBurn == null) {
    return res.status(400).json({ message: 'Calories to burn not provided.' });
  }

  try {
    const targetCalories = Number(caloriesToBurn);

    if (isNaN(targetCalories)) {
      return res.status(400).json({ message: 'Invalid calories value.' });
    }

    // Fetch all poses with non-negative calories
    const calorieThreshold = 0;
    const poses = await db.collection('ast').find({
      caloriesBurned: { $gte: calorieThreshold }
    }).toArray();

    console.log('Fetched poses:', poses);

    // Function to find combinations of poses
    const findCombinations = (poses, target) => {
      const results = [];
      const combination = [];
      let closestSum = Number.MAX_VALUE;
      let closestCombination = [];

      const findCombination = (start, sum) => {
        if (sum > target + 60) return; // Stop early if sum exceeds target + tolerance
        if (sum >= target - 60 && sum <= target + 60) {
          if (Math.abs(sum - target) < Math.abs(closestSum - target)) {
            closestSum = sum;
            closestCombination = [...combination];
            console.log(`New closest sum found: ${closestSum}`);
          }
        }
        if (start >= poses.length) return;

        for (let i = start; i < poses.length; i++) {
          const calories = Number(poses[i].caloriesBurned);

          if (isNaN(calories)) {
            console.log(`Skipping pose with invalid calories: ${poses[i]}`);
            continue;
          }

          combination.push(poses[i]);
          findCombination(i + 1, sum + calories);
          combination.pop();
        }
      };

      findCombination(0, 0);

      console.log(`Final closest combination:`, closestCombination);

      if (closestCombination.length > 0) {
        results.push({
          combination: closestCombination.map(pose => ({
            name: pose.name || 'Unknown',
            caloriesBurned: pose.caloriesBurned || 0,
            imageUrl: pose.imageUrl || '',
            videoUrl: pose.videoUrl || ''
          })),
          totalCalories: closestSum
        });
      }

      return results;
    };

    const combinations = findCombinations(poses, targetCalories);

    if (combinations.length > 0) {
      res.json(combinations);
    } else {
      res.status(404).json({ message: 'No matching poses found.' });
    }
  } catch (error) {
    console.error('Error fetching yoga poses:', error);
    res.status(500).json({ message: 'An error occurred while fetching yoga poses.' });
  }
});


// Start server
connectToDB(() => {
  app.listen(9001, () => {
    console.log('Server running on port 9001');
  });
});

