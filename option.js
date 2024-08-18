const Option = require('../../models/option')
const Restaurant = require('../../models/restaurant')
const { transformOption, transformRestaurant } = require('./merge')

module.exports = {
  Query: {
    options: async() => {
      console.log('options')
      try {
        const options = await Option.find({ isActive: true })
        return options.map(option => {
          return transformOption(option)
        })
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createOptions: async(_, args, context) => {
      console.log('createOption')
      try {
        const options = args.optionInput.options
        const restaurant = await Restaurant.findById(
          args.optionInput.restaurant
        )

        options.map(option => {
          restaurant.options.push(new Option(option))
        })

        const result = await restaurant.save()
        return transformRestaurant(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editOption: async(_, args, context) => {
      console.log('editOption')
      try {
        const options = args.optionInput.options
        const restaurant = await Restaurant.findById(
          args.optionInput.restaurant
        )
        restaurant.options.id(options._id).set({
          title: options.title,
          description: options.description,
          price: options.price
        })
        const result = await restaurant.save()
        return transformRestaurant(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteOption: async(_, { id, restaurant }, context) => {
      console.log('deleteOption')
      try {
        const restaurants = await Restaurant.findById(restaurant)
        restaurants.options.id(id).remove()
        restaurants.addons = restaurants.addons.map(addon => {
          addon.options = addon.options.filter(option => option !== id)
          return addon
        })

        const result = await restaurants.save()
        return transformRestaurant(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
