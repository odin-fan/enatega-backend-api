const Earnings = require('../../models/earnings');
const Rider = require('../../models/rider');
const { transformEarnings } = require('../resolvers/merge');

module.exports = {
  Query: {
    earnings: async (_, __, { req }) => {
      console.log('Fetching all earnings');
      if (!req.isAuth) {
        throw new Error('Unauthenticated!');
      }
      try {
        const earnings = await Earnings.find({});
        return earnings.map(transformEarnings);
      } catch (err) {
        console.error('Error fetching earnings:', err);
        throw new Error('Failed to fetch earnings');
      }
    },
    riderEarnings: async (_, args, { req }) => {
      console.log('Fetching rider earnings with arguments:', args);
      const riderId = args.id || req.userId;
      if (!riderId) {
        throw new Error('Unauthenticated!');
      }
      try {
        const riderEarnings = await Earnings.find({ rider: riderId })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10);
        return riderEarnings.map(transformEarnings);
      } catch (err) {
        console.error('Error fetching rider earnings:', err);
        throw new Error('Failed to fetch rider earnings');
      }
    }
  },
  Mutation: {
    createEarning: async (_, args, { req }) => {
      console.log('Creating earning with arguments:', args);
      if (!req.isAuth) {
        throw new Error('Unauthenticated');
      }
      try {
        const rider = await Rider.findById(args.earningsInput.rider);
        if (!rider) {
          throw new Error('Rider not found');
        }
        const earning = new Earnings({
          rider: rider._id,
          orderId: args.earningsInput.orderId,
          deliveryFee: args.earningsInput.deliveryFee,
          orderStatus: args.earningsInput.orderStatus,
          paymentMethod: args.earningsInput.paymentMethod,
          deliveryTime: new Date()
        });
        const result = await earning.save();
        return transformEarnings(result);
      } catch (err) {
        console.error('Error creating earning:', err);
        throw new Error('Failed to create earning');
      }
    }
  }
};
