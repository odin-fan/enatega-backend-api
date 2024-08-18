const Food = require('../../models/food');
const Restaurant = require('../../models/restaurant');
const Variation = require('../../models/variation');
const { transformRestaurant } = require('./merge');

module.exports = {
  Mutation: {
    createFood: async (_, args, context) => {
      console.log('Creating food item with arguments:', args);
      const { restaurant: restId, category: categoryId, variations: foodVariations, title, description, image } = args.foodInput;

      const variations = foodVariations.map(variation => new Variation(variation));
      const food = new Food({
        title,
        variations,
        description,
        image
      });

      try {
        await Restaurant.updateOne(
          { _id: restId, 'categories._id': categoryId },
          { $push: { 'categories.$.foods': food } }
        );

        const latestRest = await Restaurant.findOne({ _id: restId });
        return await transformRestaurant(latestRest);
      } catch (err) {
        console.error('Error creating food item:', err);
        throw new Error('Failed to create food item');
      }
    },

    editFood: async (_, args, context) => {
      console.log('Editing food item with arguments:', args);
      const { _id: foodId, restaurant: restId, category: categoryId, variations: foodVariations, title, description, image } = args.foodInput;

      const variations = foodVariations.map(variation => new Variation(variation));

      try {
        const restaurant = await Restaurant.findOne({ _id: restId });
        if (!restaurant) throw new Error('Restaurant not found');

        const category = restaurant.categories.find(cat =>
          cat.foods.id(foodId)
        );

        if (!category || !category._id.equals(categoryId)) {
          // Remove from previous category if necessary
          const oldCategoryIndex = restaurant.categories.findIndex(cat =>
            cat.foods.id(foodId)
          );
          if (oldCategoryIndex !== -1) {
            restaurant.categories[oldCategoryIndex].foods.id(foodId).remove();
            await restaurant.save();
          }

          // Add to new category
          const food = new Food({
            title,
            variations,
            description,
            image
          });
          await Restaurant.updateOne(
            { _id: restId, 'categories._id': categoryId },
            { $push: { 'categories.$.foods': food } }
          );

          const latestRest = await Restaurant.findOne({ _id: restId });
          return await transformRestaurant(latestRest);
        } else {
          // Edit food item in the existing category
          const categoryFood = restaurant.categories.id(categoryId).foods.id(foodId);
          if (categoryFood) {
            categoryFood.set({
              title,
              description,
              image,
              variations
            });
            const result = await restaurant.save();
            return transformRestaurant(result);
          } else {
            throw new Error('Food item not found in category');
          }
        }
      } catch (err) {
        console.error('Error editing food item:', err);
        throw new Error('Failed to edit food item');
      }
    },

    deleteFood: async (_, { id, restaurant: restId, categoryId }, context) => {
      console.log('Deleting food item with ID:', id);
      try {
        const restaurant = await Restaurant.findOne({ _id: restId });
        if (!restaurant) throw new Error('Restaurant not found');

        restaurant.categories.id(categoryId).foods.id(id).remove();
        const result = await restaurant.save();
        return await transformRestaurant(result);
      } catch (err) {
        console.error('Error deleting food item:', err);
        throw new Error('Failed to delete food item');
      }
    }
  }
};
