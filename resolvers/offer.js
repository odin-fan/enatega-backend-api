const Offer = require('../../models/offer');
const { transformOffer } = require('./merge');

module.exports = {
  Query: {
    offers: async (_, args, context) => {
      console.log('Fetching offers');
      try {
        const offers = await Offer.find({ isActive: true });
        return offers.map(transformOffer);
      } catch (error) {
        console.error('Error fetching offers:', error);
        throw new Error('Failed to fetch offers');
      }
    }
  },
  Mutation: {
    createOffer: async (_, args, { req, res }) => {
      console.log('Creating offer');
      try {
        const offer = new Offer({
          name: args.offer.name,
          tag: args.offer.tag,
          restaurants: args.offer.restaurants
        });
        const result = await offer.save();
        return transformOffer(result);
      } catch (error) {
        console.error('Error creating offer:', error);
        throw new Error('Failed to create offer');
      }
    },
    editOffer: async (_, args, context) => {
      console.log('Editing offer');
      try {
        const offer = await Offer.findById(args.offer._id);
        if (!offer) throw new Error('Offer not found');

        offer.name = args.offer.name;
        offer.tag = args.offer.tag;
        offer.restaurants = args.offer.restaurants;

        const result = await offer.save();
        return transformOffer(result);
      } catch (error) {
        console.error('Error editing offer:', error);
        throw new Error('Failed to edit offer');
      }
    },
    deleteOffer: async (_, args, context) => {
      console.log('Deleting offer');
      try {
        const offer = await Offer.findById(args.id);
        if (!offer) throw new Error('Offer not found');

        offer.isActive = false;
        await offer.save();
        return true;
      } catch (error) {
        console.error('Error deleting offer:', error);
        throw new Error('Failed to delete offer');
      }
    },
    addRestaurantToOffer: async (_, { id, restaurant }, { req, res }) => {
      console.log('Adding restaurant to offer');
      try {
        const offer = await Offer.findById(id);
        if (!offer) throw new Error('Offer not found');

        offer.restaurants.push(restaurant);
        const result = await offer.save();
        return transformOffer(result);
      } catch (error) {
        console.error('Error adding restaurant to offer:', error);
        throw new Error('Failed to add restaurant to offer');
      }
    }
  }
};
