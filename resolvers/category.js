const Category = require('../../models/category');
const Restaurant = require('../../models/restaurant');
const { transformRestaurant } = require('./merge');

module.exports = {
  Mutation: {
    createCategory: async (_, { category }, context) => {
      console.log('Creating a new category');
      try {
        const newCategory = new Category({
          title: category.title,
        });

        const restaurant = await Restaurant.findById(category.restaurant);
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }

        restaurant.categories.push(newCategory);
        await restaurant.save();

        return transformRestaurant(restaurant);
      } catch (error) {
        console.error('Error creating category:', error);
        throw error;
      }
    },

    editCategory: async (_, { category }, context) => {
      console.log('Editing category');
      try {
        const restaurant = await Restaurant.findById(category.restaurant);
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }

        const categoryToUpdate = restaurant.categories.id(category._id);
        if (!categoryToUpdate) {
          throw new Error('Category not found');
        }

        categoryToUpdate.title = category.title;
        await restaurant.save();

        return transformRestaurant(restaurant);
      } catch (error) {
        console.error('Error editing category:', error);
        throw error;
      }
    },

    deleteCategory: async (_, { id, restaurant }, context) => {
      console.log('Deleting category');
      try {
        const restaurantToUpdate = await Restaurant.findById(restaurant);
        if (!restaurantToUpdate) {
          throw new Error('Restaurant not found');
        }

        const categoryToDelete = restaurantToUpdate.categories.id(id);
        if (!categoryToDelete) {
          throw new Error('Category not found');
        }

        categoryToDelete.remove();
        await restaurantToUpdate.save();

        return transformRestaurant(restaurantToUpdate);
      } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
      }
    },
  },
};
