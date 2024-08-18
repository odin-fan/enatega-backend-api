const Food = require('../../models/food')
const User = require('../../models/user')
const Rider = require('../../models/rider')
const Review = require('../../models/review')
const Restaurant = require('../../models/restaurant')
const Order = require('../../models/order')
const Zone = require('../../models/zone')
const Owner = require('../../models/owner')
const mongoose = require('mongoose')

const { dateToString } = require('../../helpers/date')
const { SHOP_TYPE } = require('../../helpers/enum')

const variations = async variations => {
  try {
    return variations.map(doc => {
      return transformVariation(doc)
    })
  } catch (err) {
    throw err
  }
}

const transformVariation = variation => {
  return {
    ...variation._doc,
    _id: variation.id
  }
}

const foods = async foodIds => {
  try {
    const foods = await Food.find({ _id: { $in: foodIds } })
    foods.sort((a, b) => {
      return (
        foodIds.indexOf(a._id.toString()) - foodIds.indexOf(b._id.toString())
      )
    })
    return foods.map(food => {
      return transformFood(food)
    })
  } catch (err) {
    throw err
  }
}

const user = async userId => {
  try {
    const user = await User.findById(userId.toString())
    return {
      ...user._doc,
      _id: user.id
    }
  } catch (err) {
    throw err
  }
}
const rider = async riderId => {
  try {
    const rider = await Rider.findById(riderId.toString())
    return {
      ...rider._doc,
      _id: rider.id
    }
  } catch (err) {
    throw err
  }
}

const transformRider = rider => {
  return {
    ...rider._doc,
    _id: rider.id,
    zone: rider.zone ? zone.bind(this, rider.zone) : ''
  }
}

const zone = async id => {
  try {
    const zone = await Zone.findById(id)
    return {
      ...zone._doc,
      _id: zone.id
    }
  } catch (error) {
    throw error
  }
}

const transformFood = food => {
  return {
    ...food._doc,
    _id: food.id,
    variations: variations.bind(this, food.variations)
  }
}

const review = async reviewId => {
  if (!reviewId) return null
  const review = await Review.findById(reviewId)
  if (!review) return null
  return {
    ...review._doc,
    _id: review.id,
    createdAt: dateToString(review._doc.createdAt),
    updatedAt: dateToString(review._doc.updatedAt)
  }
}

const transformFoods = async foodIds => {
  return await foods(foodIds)
}

const transformOrder = async order => {
  return {
    ...order._doc,
    _id: order.id,
    zone: zone(order.zone),
    review: review.bind(this, order.review),
    user: await user.bind(this, order._doc.user),
    userId: order._doc.user.toString(),
    orderDate: dateToString(order._doc.orderDate) || dateToString(new Date()),
    items: await order.items.map(item => {
      return {
        ...item._doc,
        _id: item.id,
        variation: {
          ...item.variation._doc,
          _id: item.variation.id
        },
        addons: item.addons.map(populateOrderAddons)
      }
    }),
    restaurant: await populateRestaurantDetail.bind(
      this,
      order._doc.restaurant
    ),
    restaurantId: order.restaurant,
    isRinged: order.isRinged,
    isRiderRinged: order.isRiderRinged,
    rider: order._doc.rider ? rider.bind(this, order._doc.rider) : null,
    riderId: order._doc.rider ? order._doc.rider.toString() : '',
    createdAt: dateToString(order._doc.createdAt),
    updatedAt: dateToString(order._doc.updatedAt),
    completionTime: dateToString(order._doc.completionTime),
    expectedTime: dateToString(order._doc.expectedTime),
    preparationTime: dateToString(order._doc.preparationTime),
    acceptedAt: order._doc.acceptedAt
      ? dateToString(order._doc.acceptedAt)
      : '',
    pickedAt: order._doc.pickedAt ? dateToString(order._doc.pickedAt) : '',
    deliveredAt: order._doc.deliveredAt
      ? dateToString(order._doc.deliveredAt)
      : '',
    cancelledAt: order._doc.cancelledAt
      ? dateToString(order._doc.cancelledAt)
      : '',
    assignedAt: order._doc.assignedAt ? dateToString(order._doc.assignedAt) : ''
  }
}

const populateReviewsDetail = async restaurantId => {
  const data = await Review.find({ restaurant: restaurantId })
    .sort({ createdAt: -1 })
    .limit(10)
  const result = await Review.aggregate([
    { $match: { restaurant: mongoose.Types.ObjectId(restaurantId) } },
    { $group: { _id: restaurantId, average: { $avg: '$rating' } } }
  ])
  const reviewData = result.length > 0 ? result[0] : { average: 0 }
  const reviewCount = await Review.countDocuments({ restaurant: restaurantId })
  return {
    reviews: data.map(transformReview),
    ratings: reviewData.average.toFixed(2),
    total: reviewCount
  }
}

const populateOrderAddons = async addon => {
  return {
    ...addon._doc,
    _id: addon.id,
    options: addon.options.map(populateOrderOptions)
  }
}

const populateOrderOptions = async option => {
  return {
    ...option._doc,
    _id: option.id
  }
}

const populateRestaurantDetail = async restaurantId => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId
  })
  return {
    ...restaurant._doc,
    _id: restaurant.id
  }
}

const categoryFoods = async foods => {
  return foods.map(transformFood)
}

const transformCategory = async category => {
  return {
    ...category._doc,
    _id: category.id,
    foods: categoryFoods.bind(this, category.foods),
    createdAt: dateToString(category._doc.createdAt),
    updatedAt: dateToString(category._doc.updatedAt)
  }
}

const transformCategories = async categories => {
  return categories.map(transformCategory)
}

const transformReview = review => {
  return {
    ...review._doc,
    _id: review.id,
    order: populateOrder.bind(this, review.order),
    restaurant: populateRestaurantDetail.bind(this, review.restaurant)
  }
}

const populateOrder = async orderId => {
  const order = await Order.findById(orderId)
  return transformOrder(order)
}

const transformOption = async option => {
  return {
    ...option._doc,
    _id: option.id
  }
}

const transformAddon = async addon => {
  return {
    ...addon._doc,
    _id: addon.id
  }
}

const populateCategories = async categories => {
  return categories.map(transformCategory)
}

const populateOptions = async options => {
  return await options.map(transformOption)
}

const populateAddons = async addons => {
  return await addons.map(transformAddon)
}

const transformRestaurants = async restaurants => {
  return restaurants.map(transformRestaurant)
}
const transformMinimalRestaurants = async restaurants => {
  return restaurants.map(transformMinimalRestaurantData)
}

const transformRestaurant = async restaurant => {
  return {
    ...restaurant._doc,
    categories: populateCategories.bind(this, restaurant.categories),
    options: populateOptions.bind(this, restaurant.options),
    addons: populateAddons.bind(this, restaurant.addons),
    reviewData: populateReviewsDetail.bind(this, restaurant.id),
    zone: null, // remove this when zone revamp is done all the queries in apps, web are updated
    owner: restaurant.owner ? populateOwner.bind(this, restaurant.owner) : null,
    shopType: restaurant.shopType || SHOP_TYPE.RESTAURANT,
    _id: restaurant.id
  }
}

const transformMinimalRestaurantData = async restaurant => {
  return {
    ...restaurant._doc,
    shopType: restaurant.shopType || SHOP_TYPE.RESTAURANT,
    _id: restaurant.id
  }
}

const populateOwnerRestaurant = async restaurant => {
  const restaurants = await Restaurant.find({ _id: { $in: restaurant } })
  return restaurants.map(transformRestaurant)
}

const transformOwner = async owner => {
  return {
    ...owner._doc,
    _id: owner.id,
    userId: owner.id,
    restaurants: await populateOwnerRestaurant(owner.restaurants)
  }
}

const transformUser = async user => {
  return {
    ...user._doc,
    password: null,
    _id: user.id,
    addresses: await populateAddresses(user.addresses)
  }
}

const populateAddresses = async addresses => {
  // const addresses = await Address.find({ _id: { $in: addressIds }, isActive: true }).sort({ createdAt: -1 })
  return addresses.map(address => ({
    ...address._doc,
    _id: address.id
  }))
}

const transformOffer = async offer => {
  return {
    ...offer._doc,
    _id: offer.id,
    restaurants: offer.restaurants.map(transformOfferRestaurant)
  }
}

const transformSection = async section => {
  return {
    ...section._doc,
    _id: section.id,
    restaurants: section.restaurants.map(transformSectionRestaurant)
  }
}
const transformSectionRestaurant = async id => {
  const restaurant = await Restaurant.findById(id)
  return {
    _id: restaurant.id,
    name: restaurant._doc.name
  }
}

const transformOfferRestaurant = async id => {
  const restaurant = await Restaurant.findById(id)
  return {
    ...restaurant._doc,
    _id: restaurant.id
  }
}

const transformZone = async zone => {
  return {
    ...zone._doc,
    _id: zone.id
  }
}

const populateOwner = async ownerId => {
  const owner = await Owner.findById(ownerId)
  return transformOwner(owner)
}

const transformMessage = message => {
  return {
    ...message._doc,
    id: message.id,
    message: message.message || '',
    createdAt: dateToString(message._doc.createdAt)
  }
}

const transformEarnings = async earning => {
  return {
    ...earning._doc,
    deliveryTime: dateToString(earning.deliveryTime),
    rider: populateRider(earning.rider)
  }
}

const populateRider = async id => await Rider.findById(id)

const transformWithDrawRequest = async withDrawRequest => {
  return {
    _id: withDrawRequest.id,
    ...withDrawRequest._doc,
    requestTime: dateToString(withDrawRequest.requestTime),
    rider: populateRider(withDrawRequest.rider)
  }
}

exports.transformCategory = transformCategory
exports.transformFood = transformFood
exports.transformFoods = transformFoods
exports.transformOrder = transformOrder
exports.transformReview = transformReview
exports.transformOption = transformOption
exports.transformAddon = transformAddon
exports.transformRestaurants = transformRestaurants
exports.transformRestaurant = transformRestaurant
exports.transformCategories = transformCategories
exports.transformOwner = transformOwner
exports.transformUser = transformUser
exports.transformOffer = transformOffer
exports.transformSection = transformSection
exports.transformZone = transformZone
exports.transformRider = transformRider
exports.transformMessage = transformMessage
exports.transformEarnings = transformEarnings
exports.transformWithDrawRequest = transformWithDrawRequest
exports.transformMinimalRestaurantData = transformMinimalRestaurantData
exports.transformMinimalRestaurants = transformMinimalRestaurants
