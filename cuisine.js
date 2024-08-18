const Cuisine = require('../../models/cuisine');

module.exports = {
  Query: {
    cuisines: async () => {
      console.log('Fetching active cuisines');
      try {
        const cuisines = await Cuisine.find({ isActive: true }).sort({
          createdAt: -1,
        });
        return cuisines.map((cuisine) => ({
          ...cuisine._doc,
          _id: cuisine.id,
        }));
      } catch (err) {
        console.error('Error fetching cuisines:', err);
        throw new Error('Failed to fetch cuisines');
      }
    },
  },
  Mutation: {
    createCuisine: async (_, args) => {
      console.log('Creating a new cuisine');
      try {
        const existingCuisineCount = await Cuisine.countDocuments({
          name: args.cuisineInput.name,
          isActive: true,
        });

        if (existingCuisineCount > 0) {
          throw new Error('Cuisine already exists');
        }

        const cuisine = new Cuisine({
          name: args.cuisineInput.name,
          description: args.cuisineInput.description,
          image: args.cuisineInput.image,
          shopType: args.cuisineInput.shopType,
        });

        const result = await cuisine.save();
        return {
          ...result._doc,
          _id: result.id,
        };
      } catch (err) {
        console.error('Error creating cuisine:', err);
        throw new Error('Failed to create cuisine');
      }
    },
    editCuisine: async (_, args) => {
      console.log('Editing a cuisine');
      try {
        const cuisine = await Cuisine.findById(args.cuisineInput._id);
        if (!cuisine) {
          throw new Error('Cuisine does not exist');
        }

        cuisine.name = args.cuisineInput.name;
        cuisine.description = args.cuisineInput.description;
        cuisine.image = args.cuisineInput.image;
        cuisine.shopType = args.cuisineInput.shopType;

        const result = await cuisine.save();
        return {
          ...result._doc,
          _id: result.id,
        };
      } catch (err) {
        console.error('Error editing cuisine:', err);
        throw new Error('Failed to edit cuisine');
      }
    },
    deleteCuisine: async (_, args) => {
      console.log('Deleting a cuisine');
      try {
        const cuisine = await Cuisine.findById(args.id);
        if (!cuisine) {
          throw new Error('Cuisine not found');
        }

        cuisine.isActive = false;
        const result = await cuisine.save();
        return result.id;
      } catch (err) {
        console.error('Error deleting cuisine:', err);
        throw new Error('Failed to delete cuisine');
      }
    },
    cuisine: async (_, args) => {
      console.log('Fetching a single cuisine by name:', args.cuisine);
      try {
        const cuisine = await Cuisine.findOne({
          isActive: true,
          name: args.cuisine,
        });

        if (!cuisine) {
          throw new Error('Cuisine not found');
        }

        return {
          ...cuisine._doc,
          _id: cuisine.id,
        };
      } catch (err) {
        console.error('Error fetching cuisine:', err);
        throw new Error('Failed to fetch cuisine');
      }
    },
  },
};
