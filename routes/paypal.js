/* eslint-disable no-tabs */
const express = require('express')
const paypal = require('paypal-rest-sdk')
const Paypal = require('../models/paypal')
const Order = require('../models/order')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const Item = require('../models/item')
const Restaurant = require('../models/restaurant')
const config = require('../config')
const Configuration = require('../models/configuration')
const Zone = require('../models/zone')
const { sendEmail } = require('../helpers/email')
const { sendNotification } = require('../helpers/utilities')
const { placeOrderTemplate } = require('../helpers/templates')
const { transformOrder } = require('../graphql/resolvers/merge')
const { sendNotificationToRestaurant } = require('../helpers/notifications')
const {
  pubsub,
  PLACE_ORDER,
  ORDER_STATUS_CHANGED,
  publishToDashboard,
  publishToDispatcher
} = require('../helpers/pubsub')
const {
  sendNotificationToCustomerWeb
} = require('../helpers/firebase-web-notifications')

const router = express.Router()

var CURRENCY = 'USD'
var CURRENCY_SYMBOL = '$'
var isInitialized = false

const initializePaypal = async() => {
  const configuration = await Configuration.findOne()
  if (!configuration) return (isInitialized = false)
  paypal.configure({
    mode: configuration.sandbox ? 'sandbox' : 'live', // sandbox or live
    client_id: configuration.clientId,
    client_secret: configuration.clientSecret
  })
  CURRENCY = configuration.currency
  CURRENCY_SYMBOL = configuration.currencySymbol
  isInitialized = true
}

router.get('/', async(req, res) => {
  // get order information from paypal table against this id
  const paypalOrder = await Paypal.findOne({ orderId: req.query.id })
  await initializePaypal(paypalOrder.restaurant)
  if (!isInitialized) return res.render('cancel')
  console.log('/', req.query.id)
  return res.render('index', { id: req.query.id })
})

router.get('/paypal-transaction-complete', async(req, res) => {
  console.log('/paypal-transaction-complete')
  const paypalOrder = await Paypal.findOne({ orderId: req.query.id })
  if (!paypalOrder) {
    return res.json({
      error: true,
      message: 'Order Not Found'
    })
  } else {
    const paymentRespone = JSON.parse(req.query.paymentDetails)
    const transactionId =
      paymentRespone.purchase_units[0].payments.captures[0].id
    const paypalPaymentResponse = JSON.parse(req.query.paymentDetails)

    paypalOrder.paymentId = transactionId
    paypalOrder.paypalPaymentResponse = paypalPaymentResponse
    paypalOrder.paidAmount = Number(
      paymentRespone.purchase_units[0].amount.value
    )
    // paypalOrder.orderStatus = 'PAID'
    paypalOrder.paymentMethod = 'PAYPAL'
    const result1 = await paypalOrder.save()

    const user = await User.findById(result1.user)
    const itemsFood = await Item.find({
      _id: { $in: paypalOrder.items }
    }).populate('food variation')
    let price = 0
    itemsFood.forEach(async item => {
      let item_price = item.variation.price

      if (item.addons && item.addons.length > 0) {
        const addons = []
        let optionsAll = []
        item.addons.forEach(({ options }) => {
          optionsAll = optionsAll.concat(options)
        })
        const populatedOptions = await Option.find({ _id: { $in: optionsAll } })
        optionsAll.forEach(id => {
          const option = populatedOptions.find(o => o.id === id)
          item_price += option.price
          addons.push(`${option.title} ${CURRENCY_SYMBOL}${option.price}`)
        })
      }
      price += item_price * item.quantity
      return `${item.quantity} x ${item.food.title}${
        item.variation.title ? `(${item.variation.title})` : ''
      } ${CURRENCY_SYMBOL}${item.variation.price}`
    })

    let coupon = null
    if (paypalOrder.coupon) {
      coupon = await Coupon.findOne({ code: paypalOrder.coupon })
      if (coupon) {
        if (coupon.couponType === 'fixed') {
          price = price - coupon.discount
        } else {
          price = price - (coupon.discount / 100) * price
        }
      }
    }
    const restaurant = await Restaurant.findById(paypalOrder.restaurant)
    const zone = await Zone.findOne({
      isActive: true,
      location: {
        $geoIntersects: { $geometry: restaurant.location }
      }
    })
    if (!zone) {
      throw new Error('Delivery zone not found')
    }
    const order = new Order({
      zone: zone._id,
      restaurant: paypalOrder.restaurant,
      user: paypalOrder.user,
      items: paypalOrder.items,
      deliveryAddress: paypalOrder.deliveryAddress, // dynamic address
      orderId: paypalOrder.orderId,
      orderStatus: 'PENDING',
      paymentMethod: 'PAYPAL',
      paymentStatus: 'PAID',
      paidAmount: Number(paymentRespone.purchase_units[0].amount.value),
      orderAmount: paypalOrder.orderAmount,
      deliveryCharges: paypalOrder.isPickedUp ? 0 : paypalOrder.deliveryCharges,
      completionTime: new Date(
        Date.now() + restaurant.deliveryTime * 60 * 1000
      ),
      taxationAmount: paypalOrder.taxationAmount,
      tipping: paypalOrder.tipping,
      coupon: paypalOrder.coupon,
      orderDate: paypalOrder.orderDate,
      isPickedUp: paypalOrder.isPickedUp,
      expectedTime: paypalOrder.expectedTime,
      instructions: paypalOrder.instructions
    })
    const result = await order.save()
    await paypalOrder.save()
    await user.save()
    const transformedOrder = await transformOrder(result)
    const orderStatusChanged = {
      userId: user.id,
      order: transformedOrder,
      origin: 'new'
    }
    pubsub.publish(ORDER_STATUS_CHANGED, {
      orderStatusChanged: orderStatusChanged
    })

    pubsub.publish(PLACE_ORDER, {
      subscribePlaceOrder: { origin: 'new', order: transformedOrder }
    })
    res.json({
      error: false,
      message: 'Order Placed Successfully!'
    })
    const placeOrder_template = await placeOrderTemplate([
      result.orderId,
      paypalOrder.items,
      paypalOrder.isPickedUp
        ? restaurant.address
        : result.deliveryAddress.deliveryAddress,
      `${CURRENCY_SYMBOL} ${Number(price).toFixed(2)}`,
      `${CURRENCY_SYMBOL} ${order.tipping.toFixed(2)}`,
      `${CURRENCY_SYMBOL} ${order.taxationAmount.toFixed(2)}`,
      `${CURRENCY_SYMBOL} ${order.deliveryCharges.toFixed(2)}`,
      `${CURRENCY_SYMBOL} ${order.orderAmount.toFixed(2)}`,
      CURRENCY_SYMBOL
    ])
    sendEmail(user.email, 'Order Placed', '', placeOrder_template)
    sendNotification(order.orderId)
    sendNotificationToCustomerWeb(
      user.notificationTokenWeb,
      'Order placed',
      `Order ID ${order.orderId}`
    )
    // updateStockValue(itemsFood)
  }
})

router.get('/payment', async(req, res) => {
  console.log('paypal')
  // get order information from paypal table against this id
  const paypalOrder = await Paypal.findOne({ orderId: req.query.id })
  if (!isInitialized) await initializePaypal(paypalOrder.restaurant)
  if (!isInitialized) return res.render('cancel')
  console.log('payment')

  if (!paypalOrder) {
    return res.redirect(`${config.SERVER_URL}paypal/cancel`)
  }

  const itemsFood = paypalOrder.items

  const items_list = []

  let price = 0
  let addonsTitle = ''
  let itemsT = []
  itemsT = itemsFood.map(async item => {
    items_list.push({
      name: item.title,
      sku: item.title,
      price: item.variation.price,
      currency: CURRENCY,
      quantity: item.quantity
    })
    let item_price = item.variation.price
    if (item.addons && item.addons.length > 0) {
      const addonDetails = []
      item.addons.forEach(({ options }) => {
        // console.log('options:', options)
        options.forEach(option => {
          item_price = item_price + option.price
          items_list.push({
            name: option.title,
            sku: option.title,
            price: option.price,
            currency: CURRENCY,
            quantity: item.quantity
          })
          addonDetails.push(`${option.title}	${CURRENCY_SYMBOL}${option.price}`)
        })
      })
      addonsTitle = addonDetails.join(',')
    }
    price += item_price * item.quantity
    return `${item.quantity} x ${item.title}${
      item.variation.title ? `(${item.variation.title})` : ''
    }	${CURRENCY_SYMBOL}${item.variation.price}`
  })

  let description = await Promise.all(itemsT)
  description = description.join(',') + `, ${addonsTitle}`
  console.log('paypalOrder.coupon', paypalOrder.coupon)
  if (paypalOrder.coupon) {
    items_list.push({
      name: 'discount',
      sku: 'discount',
      price: -((paypalOrder.coupon.discount / 100) * price),
      currency: CURRENCY,
      quantity: 1
    })
    price = price - (paypalOrder.coupon.discount / 100) * price
  }

  if (paypalOrder.tipping) {
    items_list.push({
      name: 'tipping',
      sku: 'tipping',
      price: paypalOrder.tipping.toFixed(2),
      currency: CURRENCY,
      quantity: 1
    })
    price = price + paypalOrder.tipping
  }
  // do something here
  var create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: `${config.SERVER_URL}paypal/success`,
      cancel_url: `${config.SERVER_URL}paypal/cancel`
    },
    transactions: [
      {
        item_list: {
          items: items_list
        },
        amount: {
          currency: CURRENCY,
          total: (
            price +
            (paypalOrder.isPickedUp ? 0 : paypalOrder.deliveryCharges) +
            paypalOrder.taxationAmount
          ).toFixed(2),
          details: {
            subtotal: Number(price).toFixed(2),
            shipping: (paypalOrder.isPickedUp
              ? 0
              : paypalOrder.deliveryCharges
            ).toFixed(2),
            tax: paypalOrder.taxationAmount.toFixed(2)
          }
        },
        description: description
      }
    ]
  }

  console.log('create_payment_json', JSON.stringify(create_payment_json))

  paypal.payment.create(create_payment_json, async function(error, payment) {
    console.log(payment, 'testing')
    if (error) {
      console.log('error.response.details', error.response.details)
      throw error
    } else {
      console.log('Create Payment Response')
      console.log('payment', payment)
      paypalOrder.paypalCreatePayment = payment
      paypalOrder.paymentId = payment.id
      await paypalOrder.save()
      console.log('payment', payment.links[1].href)
      res.redirect(payment.links[1].href)
    }
  })
})
router.get('/success', async(req, res) => {
  var PayerID = req.query.PayerID
  var paymentId = req.query.paymentId
  console.log('successs')
  const paypalOrder = await Paypal.findOne({ paymentId: paymentId })
  if (!isInitialized) await initializePaypal(paypalOrder.restaurant)
  if (!isInitialized) return res.render('cancel')
  // PAYID-LTR2IXQ81928789AS396423N

  const user = await User.findById(paypalOrder.user)
  const itemsFood = paypalOrder.items
  let price = 0
  itemsFood.forEach(async item => {
    let item_price = item.variation.price

    if (item.addons && item.addons.length > 0) {
      const addonDetails = []
      item.addons.forEach(({ options }) => {
        // console.log("options:",options)
        options.forEach(option => {
          item_price = item_price + option.price
          addonDetails.push(`${option.title}	${CURRENCY_SYMBOL}${option.price}`)
        })
      })
    }
    price += item_price * item.quantity
    return `${item.quantity} x ${item.title}${
      item.variation.title ? `(${item.variation.title})` : ''
    }	${CURRENCY_SYMBOL}${item.variation.price}`
  })

  if (paypalOrder.coupon) {
    price = price - (paypalOrder.coupon.discount / 100) * price
  }
  var execute_payment_json = {
    payer_id: PayerID,
    transactions: [
      {
        amount: {
          currency:
            paypalOrder.paypalCreatePayment.transactions[0].amount.currency,
          total: paypalOrder.paypalCreatePayment.transactions[0].amount.total
        }
      }
    ]
  }

  paypal.payment.execute(paymentId, execute_payment_json, async function(
    error,
    payment
  ) {
    if (error) {
      console.log('error.response', error.response)
      res.render('cancel')
    } else {
      console.log('Get Payment Response')
      if (payment.state === 'approved') {
        const restaurant = await Restaurant.findById(paypalOrder.restaurant)
        paypalOrder.paypalPaymentResponse = payment
        const order = new Order({
          zone: paypalOrder.zone,
          restaurant: paypalOrder.restaurant,
          user: paypalOrder.user,
          items: paypalOrder.items,
          deliveryAddress: paypalOrder.deliveryAddress, // dynamic address
          orderId: paypalOrder.orderId,
          orderStatus: 'PENDING',
          paymentMethod: 'PAYPAL',
          paymentStatus: 'PAID',
          paidAmount:
            paypalOrder.paypalCreatePayment.transactions[0].amount.total,
          orderAmount: paypalOrder.orderAmount,
          deliveryCharges: paypalOrder.isPickedUp
            ? 0
            : paypalOrder.deliveryCharges,
          completionTime: new Date(
            Date.now() + restaurant.deliveryTime * 60 * 1000
          ),
          orderDate: paypalOrder.orderDate,
          isPickedUp: paypalOrder.isPickedUp,
          expectedTime: paypalOrder.expectedTime
        })
        const result = await order.save()

        await paypalOrder.save()
        const placeOrder_template = await placeOrderTemplate([
          result.orderId,
          itemsFood,
          paypalOrder.isPickedUp
            ? restaurant.address
            : result.deliveryAddress.deliveryAddress,
          `${CURRENCY_SYMBOL} ${Number(price).toFixed(2)}`,
          `${CURRENCY_SYMBOL} ${result.tipping.toFixed(2)}`,
          `${CURRENCY_SYMBOL} ${result.taxationAmount.toFixed(2)}`,
          `${CURRENCY_SYMBOL} ${result.deliveryCharges.toFixed(2)}`,
          `${CURRENCY_SYMBOL} ${result.orderAmount.toFixed(2)}`,
          CURRENCY_SYMBOL
        ])
        await user.save()
        const transformedOrder = await transformOrder(result)
        const orderStatusChanged = {
          userId: user.id,
          order: transformedOrder,
          origin: 'new'
        }
        pubsub.publish(ORDER_STATUS_CHANGED, {
          orderStatusChanged: orderStatusChanged
        })
        publishToDashboard(
          result.restaurant.toString(),
          transformedOrder,
          'new'
        )
        publishToDispatcher(transformedOrder)
        sendEmail(user.email, 'Order Placed', '', placeOrder_template)
        sendNotification(order.orderId)
        sendNotificationToCustomerWeb(
          user.notificationTokenWeb,
          'Order placed',
          `Order ID ${order.orderId}`
        )
        sendNotificationToRestaurant(order.restaurant, order)
        console.log('success')
        res.render('success')
        return
      }
      res.render('cancel')
    }
  })
})
router.get('/cancel', (req, res) => {
  res.render('cancel')
})

module.exports = router
