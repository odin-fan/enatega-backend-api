/* eslint-disable no-tabs */
const path = require('path')
const User = require('../../models/user')
// const Rider = require('../../models/rider')
const Order = require('../../models/order')
const Item = require('../../models/item')
const Coupon = require('../../models/coupon')
const Point = require('../../models/point')
const Zone = require('../../models/zone')
const Restaurant = require('../../models/restaurant')
const Configuration = require('../../models/configuration')
const Paypal = require('../../models/paypal')
const Stripe = require('../../models/stripe')
const { transformOrder, transformReviews } = require('./merge')
const {
  payment_status,
  order_status,
  ORDER_STATUS
} = require('../../helpers/enum')
const { sendEmail } = require('../../helpers/email')
const {
  sendNotification,
  calculateDistance
} = require('../../helpers/utilities')
const { placeOrderTemplate } = require('../../helpers/templates')
const { sendNotificationToRestaurant } = require('../../helpers/notifications')
const { withFilter } = require('graphql-subscriptions')
const {
  pubsub,
  publishToUser,
  publishToDashboard,
  publishOrder,
  publishToDispatcher,
  PLACE_ORDER,
  ORDER_STATUS_CHANGED,
  ASSIGN_RIDER,
  SUBSCRIPTION_ORDER
} = require('../../helpers/pubsub')
const { sendNotificationToUser } = require('../../helpers/notifications')
const {
  sendNotificationToCustomerWeb
} = require('../../helpers/firebase-web-notifications')

var DELIVERY_CHARGES = 0.0
module.exports = {
  Subscription: {
    subscribePlaceOrder: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PLACE_ORDER),
        (payload, args, context) => {
          const restaurantId = payload.subscribePlaceOrder.restaurantId
          console.log('restaurantId', restaurantId)
          return restaurantId === args.restaurant
        }
      )
    },
    orderStatusChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ORDER_STATUS_CHANGED),
        (payload, args, context) => {
          const userId = payload.orderStatusChanged.userId.toString()
          return userId === args.userId
        }
      )
    },
    subscriptionAssignRider: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ASSIGN_RIDER),
        (payload, args) => {
          const riderId = payload.subscriptionAssignRider.userId.toString()
          return riderId === args.riderId
        }
      )
    },
    subscriptionOrder: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_ORDER),
        (payload, args) => {
          const orderId = payload.subscriptionOrder._id.toString()
          return orderId === args.id
        }
      )
    }
  },
  Query: {
    order: async(_, args, { req, res }) => {
      console.log('order')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const order = await Order.findById(args.id)
        if (!order) throw new Error('Order does not exist')
        console.log(order)
        return transformOrder(order)
      } catch (err) {
        throw err
      }
    },
    orderPaypal: async(_, args, { req, res }) => {
      console.log('orderPaypal')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const paypal = await Paypal.findById(args.id)
        console.log('PAYPAL: ', paypal)
        if (!paypal) throw new Error('Order does not exist')
        return transformOrder(paypal)
      } catch (err) {
        throw err
      }
    },
    orderStripe: async(_, args, { req, res }) => {
      console.log('orderStripe')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const stripe = await Stripe.findById(args.id)
        console.log('STRIPE: ', stripe)
        if (!stripe) throw new Error('Order does not exist')
        return transformOrder(stripe)
      } catch (err) {
        throw err
      }
    },
    orders: async(_, args, { req, res }) => {
      console.log('orders')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const orders = await Order.find({ user: req.userId })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(50)
        const filterOrders = orders.filter(order => order.restaurant)
        return filterOrders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },

    getOrdersByDateRange: async(_, args, context) => {
      try {
        const orders = await Order.find({
          restaurant: args.restaurant,
          createdAt: {
            $gte: new Date(args.startingDate),
            $lt: new Date(args.endingDate)
          }
        }).sort({ createdAt: -1 })

        const cashOnDeliveryOrders = orders.filter(
          order =>
            order.paymentMethod === 'COD' && order.orderStatus === 'DELIVERED'
        )

        const totalAmountCashOnDelivery = cashOnDeliveryOrders
          .reduce((total, order) => total + parseFloat(order.orderAmount), 0)
          .toFixed(2)

        const countCashOnDeliveryOrders = cashOnDeliveryOrders.length

        return {
          orders: orders.map(order => transformOrder(order)),
          totalAmountCashOnDelivery,
          countCashOnDeliveryOrders
        }
      } catch (err) {
        throw err
      }
    },
    ordersByRestId: async(_, args, context) => {
      console.log('restaurant orders')
      try {
        let orders = []
        if (args.search) {
          const search = new RegExp(
            // eslint-disable-next-line no-useless-escape
            args.search.replace(/[\\\[\]()+?.*]/g, c => '\\' + c),
            'i'
          )
          orders = await Order.find({
            restaurant: args.restaurant,
            orderId: search
          }).sort({ createdAt: -1 })
          return orders.map(order => {
            return transformOrder(order)
          })
        } else {
          orders = await Order.find({ restaurant: args.restaurant })
            .sort({ createdAt: -1 })
            .skip((args.page || 0) * args.rows)
            .limit(args.rows)
          return orders.map(order => {
            return transformOrder(order)
          })
        }
      } catch (err) {
        throw err
      }
    },
    undeliveredOrders: async(_, args, { req, res }) => {
      console.log('undeliveredOrders')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const orders = await Order.find({
          user: req.userId,
          $or: [
            { orderStatus: 'PENDING' },
            { orderStatus: 'PICKED' },
            { orderStatus: 'ACCEPTED' }
          ]
        })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10)
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    deliveredOrders: async(_, args, { req, res }) => {
      console.log('deliveredOrders')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const orders = await Order.find({
          user: req.userId,
          $or: [{ orderStatus: 'DELIVERED' }, { orderStatus: 'COMPLETED' }]
        })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10)
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    allOrders: async(_, args, context) => {
      try {
        const orders = await Order.find()
          .sort({ createdAt: -1 })
          .skip((args.page || 0) * 10)
          .limit(10)
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    pageCount: async(_, args, context) => {
      try {
        const orderCount = await Order.countDocuments({
          restaurant: args.restaurant
        })
        const pageCount = orderCount / 10
        return Math.ceil(pageCount)
      } catch (err) {
        throw err
      }
    },
    orderCount: async(_, args, context) => {
      try {
        const orderCount = await Order.find({
          isActive: true,
          restaurant: args.restautant
        }).countDocuments()
        return orderCount
      } catch (err) {
        throw err
      }
    },
    reviews: async(_, args, { req, res }) => {
      console.log('reviews')
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        const orders = await Order.find({ user: req.userId })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10)
          .populate('review')
        return transformReviews(orders)
      } catch (err) {
        throw err
      }
    },
    getOrderStatuses: async(_, args, context) => {
      return order_status
    },
    getPaymentStatuses: async(_, args, context) => {
      return payment_status
    }
  },
  Mutation: {
    placeOrder: async(_, args, { req, res }) => {
      console.log('placeOrder', args.address.longitude, args.address.latitude)
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const restaurant = await Restaurant.findById(args.restaurant)
        const location = new Point({
          type: 'Point',
          coordinates: [+args.address.longitude, +args.address.latitude]
        })
        const checkZone = await Restaurant.findOne({
          _id: args.restaurant,
          deliveryBounds: { $geoIntersects: { $geometry: location } }
        })
        if (!checkZone && args.isPickedUp !== true) {
          throw new Error("Sorry! we can't deliver to your address.")
        }
        const zone = await Zone.findOne({
          isActive: true,
          location: {
            $geoIntersects: { $geometry: restaurant.location }
          }
        })
        if (!zone) {
          throw new Error('Delivery zone not found')
        }

        const foods = restaurant.categories.map(c => c.foods).flat()
        const availableAddons = restaurant.addons
        const availableOptions = restaurant.options
        const ItemsData = args.orderInput.map(item => {
          const food = foods.find(
            element => element._id.toString() === item.food
          )
          const variation = food.variations.find(
            v => v._id.toString() === item.variation
          )
          const addonList = []
          item.addons.forEach((data, index) => {
            const selectedOptions = []
            data.options.forEach((option, inx) => {
              selectedOptions.push(
                availableOptions.find(op => op._id.toString() === option)
              )
            })
            const adds = availableAddons.find(
              addon => addon._id.toString() === data._id.toString()
            )

            addonList.push({
              ...adds._doc,
              options: selectedOptions
            })
          })

          return new Item({
            food: item.food,
            title: food.title,
            description: food.description,
            image: food.image,
            variation,
            addons: addonList,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions
          })
        })

        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('invalid request')
        }
        // get previous orderid from db
        let configuration = await Configuration.findOne()
        if (!configuration) {
          configuration = new Configuration()
          await configuration.save()
        }

        const orderid =
          restaurant.orderPrefix + '-' + (Number(restaurant.orderId) + 1)
        restaurant.orderId = Number(restaurant.orderId) + 1
        await restaurant.save()
        const latOrigin = +restaurant.location.coordinates[1]
        const lonOrigin = +restaurant.location.coordinates[0]
        const latDest = +args.address.latitude
        const longDest = +args.address.longitude
        const distance = calculateDistance(
          latOrigin,
          lonOrigin,
          latDest,
          longDest
        )
        const costType = configuration.costType

        if (costType === 'fixed') {
          DELIVERY_CHARGES = configuration.deliveryRate
        } else {
          DELIVERY_CHARGES = Math.ceil(distance) * configuration.deliveryRate
        }

        let price = 0.0

        ItemsData.forEach(async item => {
          let itemPrice = item.variation.price
          if (item.addons && item.addons.length > 0) {
            const addonDetails = []
            item.addons.forEach(({ options }) => {
              options.forEach(option => {
                itemPrice = itemPrice + option.price
                addonDetails.push(
                  `${option.title}	${configuration.currencySymbol}${option.price}`
                )
              })
            })
          }
          price += itemPrice * item.quantity
          return `${item.quantity} x ${item.title}${
            item.variation.title ? `(${item.variation.title})` : ''
          }	${configuration.currencySymbol}${item.variation.price}`
        })
        let coupon = null
        if (args.couponCode) {
          coupon = await Coupon.findOne({ title: args.couponCode })
          if (coupon) {
            price = price - (coupon.discount / 100) * price
          }
        }
        const orderObj = {
          zone: zone._id,
          restaurant: args.restaurant,
          user: req.userId,
          items: ItemsData,
          deliveryAddress: {
            ...args.address,
            location: location
          },
          orderId: orderid,
          paidAmount: 0,
          orderStatus: 'PENDING',
          deliveryCharges: args.isPickedUp ? 0 : DELIVERY_CHARGES,
          tipping: args.tipping,
          taxationAmount: args.taxationAmount,
          orderDate: args.orderDate,
          isPickedUp: args.isPickedUp,
          orderAmount: (
            price +
            (args.isPickedUp ? 0 : DELIVERY_CHARGES) +
            args.taxationAmount +
            args.tipping
          ).toFixed(2),
          paymentStatus: payment_status[0],
          coupon: coupon,
          completionTime: new Date(
            Date.now() + restaurant.deliveryTime * 60 * 1000
          ),
          instructions: args.instructions
        }

        let result = null
        if (args.paymentMethod === 'COD') {
          const order = new Order(orderObj)
          result = await order.save()

          const placeOrder_template = await placeOrderTemplate([
            result.orderId,
            ItemsData,
            args.isPickedUp
              ? restaurant.address
              : result.deliveryAddress.deliveryAddress,
            `${configuration.currencySymbol} ${Number(price).toFixed(2)}`,
            `${configuration.currencySymbol} ${order.tipping.toFixed(2)}`,
            `${configuration.currencySymbol} ${order.taxationAmount.toFixed(
              2
            )}`,
            `${configuration.currencySymbol} ${order.deliveryCharges.toFixed(
              2
            )}`,
            `${configuration.currencySymbol} ${order.orderAmount.toFixed(2)}`,
            configuration.currencySymbol
          ])
          const transformedOrder = await transformOrder(result)

          publishToDashboard(
            order.restaurant.toString(),
            transformedOrder,
            'new'
          )
          publishToDispatcher(transformedOrder)
          const attachment = path.join(
            __dirname,
            '../../public/assets/tempImages/enatega.png'
          )
          sendEmail(
            user.email,
            'Order Placed',
            '',
            placeOrder_template,
            attachment
          )
          sendNotification(result.orderId)
          sendNotificationToCustomerWeb(
            user.notificationTokenWeb,
            'Order placed',
            `Order ID ${result.orderId}`
          )
          sendNotificationToRestaurant(result.restaurant, result)
        } else if (args.paymentMethod === 'PAYPAL') {
          orderObj.paymentMethod = args.paymentMethod
          const paypal = new Paypal(orderObj)
          result = await paypal.save()
        } else if (args.paymentMethod === 'STRIPE') {
          console.log('stripe')
          orderObj.paymentMethod = args.paymentMethod
          const stripe = new Stripe(orderObj)
          result = await stripe.save()
          console.log(result)
        } else {
          throw new Error('Invalid Payment Method')
        }
        const orderResult = await transformOrder(result)
        return orderResult
      } catch (err) {
        throw err
      }
    },
    editOrder: async(_, args, { req, res }) => {
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const items = args.orderInput.map(async function(item) {
          const newItem = new Item({
            ...item
          })
          const result = await newItem.save()
          return result._id
        })
        const completed = await Promise.all(items)
        const order = await Order.findOne({ _id: args._id, user: req.userId })
        if (!order) {
          throw new Error('order does not exist')
        }
        order.items = completed
        const result = await order.save()
        return transformOrder(result)
      } catch (err) {
        throw err
      }
    },
    updateOrderStatus: async(_, args, context) => {
      console.log('updateOrderStatus')
      try {
        const order = await Order.findById(args.id)
        const restaurant = await Restaurant.findById(order.restaurant)
        if (args.status === 'ACCEPTED') {
          order.completionTime = new Date(
            Date.now() + restaurant.deliveryTime * 60 * 1000
          )
        }
        order.orderStatus = args.status
        order.reason = args.reason
        const result = await order.save()

        const transformedOrder = await transformOrder(result)
        const user = await User.findById(order.user)
        publishToUser(result.user.toString(), transformedOrder, 'update')
        publishOrder(transformedOrder)
        sendNotificationToUser(result.user, result)
        sendNotificationToCustomerWeb(
          user.notificationTokenWeb,
          `Order status: ${result.orderStatus}`,
          `Order ID ${result.orderId}`
        )
        return transformOrder(result)
      } catch (err) {
        throw err
      }
    },
    updatePaymentStatus: async(_, args, context) => {
      console.log('updatePaymentStatus', args.id, args.status)
      try {
        const order = await Order.findById(args.id)
        if (!order) throw new Error('Order does not exist')
        order.paymentStatus = args.status
        order.paidAmount = args.status === 'PAID' ? order.orderAmount : 0.0
        const result = await order.save()
        return transformOrder(result)
      } catch (error) {
        throw error
      }
    },
    muteRing: async(_, args, { req }) => {
      try {
        const order = await Order.findOne({ orderId: args.orderId })
        if (!order) throw new Error('Order does not exist')
        order.isRinged = false
        await order.save()
        return true
      } catch (error) {
        throw error
      }
    },
    abortOrder: async(_, args, { req }) => {
      console.log('abortOrder', args)
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      const order = await Order.findById(args.id)
      order.orderStatus = ORDER_STATUS.CANCELLED
      const result = await order.save()

      const transformedOrder = await transformOrder(result)
      publishOrder(transformedOrder)

      return transformedOrder
    }
  }
}
