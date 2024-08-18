const Order = require('../../models/order')
const Restaurant = require('../../models/restaurant')
const Rider = require('../../models/rider')

module.exports = {
  Mutation: {},
  Query: {
    lastOrderCreds: async() => {
      const order = await Order.findOne().sort({ createdAt: -1 })
      const restaurant = await Restaurant.findById(order.restaurant)
      const rider = await Rider.findOne({
        zone: order.zone,
        isActive: true,
        available: true
      })

      return {
        restaurantUsername: restaurant.username,
        restaurantPassword: restaurant.password,
        riderUsername: rider.username,
        riderPassword: rider.password
      }
    }
  }
}
