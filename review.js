const Review = require('../../models/review')
const Order = require('../../models/order')
const { transformReview, transformOrder } = require('./merge')
const Restaurant = require('../../models/restaurant')
module.exports = {
  Query: {
    reviews: async(_, args, context) => {
      console.log('reviews')
      try {
        const reviews = await Review.find({ restaurant: args.restaurant })
        return reviews.map(review => {
          return transformReview(review)
        })
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    reviewOrder: async(_, args, { req, res }) => {
      console.log('reviewOrder')
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        const order = await Order.findById(args.reviewInput.order)
        const restaurant = await Restaurant.findById(order.restaurant)
        const review = new Review({
          order: args.reviewInput.order,
          rating: args.reviewInput.rating,
          restaurant: restaurant.id,
          description: args.reviewInput.description
        })
        const result = await review.save()
        await Order.findOneAndUpdate(
          { _id: args.reviewInput.order },
          { review: result.id }
        ).setOptions({ useFindAndModify: false })
        const updatedOrder = await Order.findById(args.reviewInput.order)

        return transformOrder(updatedOrder)
      } catch (err) {
        throw err
      }
    }
  }
}
