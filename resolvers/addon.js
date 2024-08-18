const Addon = require('../../models/addon');
const Restaurant = require('../../models/restaurant');
const { transformAddon, transformRestaurant } = require('./merge');

module.exports = {
  Query: {
    addons: async () => {
      console.log('Fetching addons');
      try {
        const activeAddons = await Addon.find({ isActive: true });
        return activeAddons.map(transformAddon);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
  Mutation: {
    createAddons: async (_, { addonInput }) => {
      console.log('Creating addons');
      try {
        const restaurant = await Restaurant.findById(addonInput.restaurant);
        const { addons } = addonInput;

        addons.forEach(addon => restaurant.addons.push(new Addon(addon)));

        const updatedRestaurant = await restaurant.save();
        return transformRestaurant(updatedRestaurant);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    editAddon: async (_, { addonInput }) => {
      console.log('Editing addon');
      try {
        const restaurant = await Restaurant.findById(addonInput.restaurant);
        const { addons } = addonInput;

        const addonToUpdate = restaurant.addons.id(addons._id);
        Object.assign(addonToUpdate, {
          title: addons.title,
          description: addons.description,
          options: addons.options,
          quantityMinimum: addons.quantityMinimum,
          quantityMaximum: addons.quantityMaximum,
        });

        await restaurant.save();
        return transformRestaurant(restaurant);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    deleteAddon: async (_, { id, restaurant }) => {
      console.log('Deleting addon');
      try {
        const targetRestaurant = await Restaurant.findById(restaurant);

        targetRestaurant.addons.id(id).remove();
        targetRestaurant.categories.forEach(category => {
          category.foods.forEach(food => {
            food.variations.forEach(variation => {
              variation.addons = variation.addons.filter(addonId => addonId !== id);
            });
          });
        });

        await targetRestaurant.save();
        return transformRestaurant(targetRestaurant);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
