const { withFilter } = require('graphql-subscriptions')
const Rider = require('../../models/rider')
const Order = require('../../models/order')
const Point = require('../../models/point')
const User = require('../../models/user')
const { transformOrder, transformRider } = require('../resolvers/merge')
const {
  pubsub,
  publishRiderLocation,
  RIDER_LOCATION,
  ZONE_ORDER,
  publishOrder
} = require('../../helpers/pubsub')
const { sendNotificationToUser } = require('../../helpers/notifications')
const {
  sendNotificationToCustomerWeb
} = require('../../helpers/firebase-web-notifications')
const { order_status } = require('../../helpers/enum')
const {
  notificationsQueue,
  JOB_TYPE,
  JOB_DELAY_DEFAULT
} = require('../../queue')
module.exports = {
  Subscription: {
    subscriptionRiderLocation: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(RIDER_LOCATION),
        (payload, args) => {
          const riderId = payload.subscriptionRiderLocation._id
          return riderId === args.riderId
        }
      )
    },
    subscriptionZoneOrders: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ZONE_ORDER),
        (payload, args) => {
          const zoneId = payload.subscriptionZoneOrders.zoneId
          return zoneId === args.zoneId
        }
      )
    }
  },
  Query: {
    riders: async() => {
      console.log('riders')
      try {
        const riders = await Rider.find({ isActive: true })
        return riders.map(transformRider)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    rider: async(_, args, { req }) => {
      console.log('args', args)
      console.log('rider1111', args.id, req.userId, req.isAuth)
      console.log('rider', args.id, req.userId, req.isAuth)
      try {
        const userId = args.id || req.userId
        if (!userId) {
          throw new Error('Unauthenticated!')
        }
        const rider = await Rider.findById(userId)
        return transformRider(rider)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    availableRiders: async _ => {
      console.log('riders')
      try {
        const riders = await Rider.find({ isActive: true, available: true })
        return riders.map(transformRider)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    assignedOrders: async(_, args, { req }) => {
      console.log('assignedOrders', args.id || req.userId)
      const userId = args.id || req.userId
      if (!userId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const riderOrders = await Order.find({
          rider: req.userId,
          $or: [{ orderStatus: 'ACCEPTED' }, { orderStatus: 'PICKED' }]
        }).sort({ createdAt: -1 })
        return riderOrders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    riderCompletedOrders: async(_, args, { req }) => {
      console.log('rider completed orders')
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const orders = await Order.find({
          rider: req.userId,
          $or: [{ orderStatus: 'COMPLETED' }, { orderStatus: 'DELIVERED' }]
        }).sort({ createdAt: -1 })
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    unassignedOrdersByZone: async(_, args, { req }) => {
      console.log('unassignedOrders')

      try {
        if (!req.isAuth) {
          throw new Error('Unauthenticated!')
        }

        const rider = await Rider.findById(req.userId)
        if (!rider) throw new Error('Rider does not exist')

        const orders = await Order.find({
          zone: rider.zone,
          orderStatus: 'ACCEPTED',
          rider: null
        }).sort({ createdAt: -1 })
        return orders.map(transformOrder)
      } catch (err) {
        throw err
      }
    },
    riderOrders: async(_, args, { req }) => {
      console.log('riderOrders', req.userId)
      try {
        const rider = await Rider.findById(req.userId)
        if (!rider) throw new Error('Rider does not exist')
        const date = new Date()
        date.setDate(date.getDate() - 1)
        const assignedOrders = await Order.find({
          rider: req.userId,
          createdAt: {
            $gte: `${date.getFullYear()}-${
              date.getMonth() + 1
            }-${date.getDate()}`
          },
          $or: [
            { orderStatus: 'ACCEPTED' },
            { orderStatus: 'PICKED' },
            { orderStatus: 'DELIVERED' },
            { orderStatus: 'ASSIGNED' }
          ]
        }).sort({ createdAt: -1 })
        const orders = await Order.find({
          zone: rider.zone,
          orderStatus: 'ACCEPTED',
          rider: null,
          createdAt: {
            $gte: `${date.getFullYear()}-${
              date.getMonth() + 1
            }-${date.getDate()}`
          }
        }).sort({ createdAt: -1 })
        return orders.concat(...assignedOrders).map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    createRider: async(_, args) => {
      console.log('createRider')
      try {
        // check username, if already exists throw error
        const checkUsername = await Rider.countDocuments({
          username: args.riderInput.username
        })
        if (checkUsername) {
          throw new Error(
            'Username already associated with another rider account'
          )
        }
        const checkPhone = await Rider.countDocuments({
          phone: args.riderInput.phone
        })
        if (checkPhone) {
          throw new Error('Phone already associated with another rider account')
        }

        const rider = new Rider({
          name: args.riderInput.name,
          username: args.riderInput.username,
          password: args.riderInput.password,
          phone: args.riderInput.phone,
          available: args.riderInput.available,
          zone: args.riderInput.zone
        })
        console.log('new rider :', rider)

        const result = await rider.save()
        console.log('result: ', result)
        return transformRider(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editRider: async(_, args) => {
      console.log('editRider')
      try {
        const checkUsername = await Rider.find({
          username: args.riderInput.username
        })
        if (
          checkUsername.length > 1 ||
          (checkUsername.length === 1 &&
            checkUsername[0].id !== args.riderInput._id)
        ) {
          throw new Error('Username associated with another rider account')
        }
        const checkPhone = await Rider.find({ phone: args.riderInput.phone })
        if (
          checkPhone.length > 1 ||
          (checkPhone.length === 1 && checkPhone[0].id !== args.riderInput._id)
        ) {
          throw new Error('Phone associated with another rider account')
        }

        const rider = await Rider.findOne({ _id: args.riderInput._id })

        rider.name = args.riderInput.name
        rider.username = args.riderInput.username
        rider.phone = args.riderInput.phone
        rider.available = args.riderInput.available
        rider.zone = args.riderInput.zone

        const result = await rider.save()
        return transformRider(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteRider: async(_, { id }) => {
      console.log('deleteRider')
      try {
        const rider = await Rider.findById(id)
        rider.isActive = false
        const result = await rider.save()
        return transformRider(result)
      } catch (err) {
        throw err
      }
    },
    toggleAvailablity: async(_, args, { req }) => {
      console.log('toggleAvailablity')
      const userId = args.id || req.userId // if rider: get id from req, args otherwise
      if (!userId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const rider = await Rider.findById(userId)
        rider.available = !rider.available
        const result = await rider.save()
        return transformRider(result)
      } catch (err) {
        throw err
      }
    },
    updateOrderStatusRider: async(_, args, { req }) => {
      console.log('updateOrderStatusRider', args, req.userId)
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const order = await Order.findById(args.id)
        order.orderStatus = args.status
        if (args.status === 'PICKED') {
          order.completionTime = new Date(Date.now() + 15 * 60 * 1000)
          order.pickedAt = new Date()
        }
        if (args.status === 'DELIVERED') {
          notificationsQueue.add(
            JOB_TYPE.REVIEW_ORDER_NOTIFICATION,
            {
              type: 'REVIEW_ORDER',
              orderId: args.id,
              order,
              user: order.user,
              message: 'How was your order?'
            },
            { delay: JOB_DELAY_DEFAULT }
          )

          await Rider.updateMany(
            { assigned: { $in: [order.id] } },
            { $pull: { assigned: { $in: [order.id] } } }
          )
          await Rider.updateOne(
            { _id: req.userId },
            { $push: { delivered: order.id } }
          )
          order.deliveredAt = new Date()
        }
        const result = await order.save()
        const user = await User.findById(order.user)
        const transformedOrder = await transformOrder(result)
        publishOrder(transformedOrder)
        sendNotificationToUser(result.user, result)
        sendNotificationToCustomerWeb(
          user.notificationTokenWeb,
          `Order status: ${result.orderStatus}`,
          `Order ID ${result.orderId}`
        )
        return transformedOrder
      } catch (err) {
        throw err
      }
    },
    assignOrder: async(_, args, { req }) => {
      console.log('assignOrder', args.id, req.userId)
      try {
        const order = await Order.findById(args.id)
        if (!order) throw new Error('Order does not exist')
        if (order.rider) {
          throw new Error('Order was assigned to someone else.')
        }
        order.rider = req.userId
        order.orderStatus = order_status[6]
        order.assignedAt = new Date()
        order.isRiderRinged = false
        const result = await order.save()
        const transformedOrder = await transformOrder(result)
        sendNotificationToUser(order.user.toString(), transformedOrder)
        publishOrder(transformedOrder)
        return transformedOrder
      } catch (error) {
        throw error
      }
    },
    updateRiderLocation: async(_, args, { req }) => {
      console.log('updateRiderLocation', req.userId)
      if (!req.userId) {
        throw new Error('Unauthenticated!')
      }

      const rider = await Rider.findById(req.userId)
      if (!rider) {
        throw new Error('Unauthenticated!')
      }

      const location = new Point({
        coordinates: [args.longitude, args.latitude]
      })
      rider.location = location
      const result = await rider.save()

      publishRiderLocation({
        ...result._doc,
        _id: result.id,
        location: location
      })
      return transformRider(result)
    }
  }
}
