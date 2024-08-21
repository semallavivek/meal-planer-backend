// import mongoose from 'mongoose';

// // Define the schema for a recipe
// const recipeSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   calories: {
//     type: Number,
//     required: true
//   },
//   protein: {
//     type: Number,
//     required: true
//   },
//   carbs: {
//     type: Number,
//     required: true
//   },
//   fat: {
//     type: Number,
//     required: true
//   },
//   mealType: {
//     type: String,
//     enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
//     required: true
//   },
//   imageUrl: {
//     type: String,
//     required: true
//   },
//   amazonFreshUrl: {
//     type: String,
//     required: true
//   }
// }, {
//   collection: 'mealplanner',  // Specify the collection name
//   timestamps: true  // Optional: Adds createdAt and updatedAt fields
// });

// // Create and export the Recipe model
// const Recipe = mongoose.model('Recipe', recipeSchema);
// export default Recipe;
