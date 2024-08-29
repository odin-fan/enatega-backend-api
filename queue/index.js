const { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } = require('../config')

const Queue = require('bull')
const { sendNotificationToUser } = require('../helpers/notifications')

const JOB_TYPE = {
  REVIEW_ORDER_NOTIFICATION: 'REVIEW_ORDER_NOTIFICATION'
}
const QUEUE_NAME = 'NOTIFICATION_QUEUE'

const notificationsQueue = new Queue(QUEUE_NAME, {
  redis: {
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
    port: REDIS_PORT
  }
})

notificationsQueue.process(JOB_TYPE.REVIEW_ORDER_NOTIFICATION, async job => {
  console.log(`Processing job ${job.id} with data:`, job.data)
  const { user, order, message, type } = job.data

  sendNotificationToUser(user, order, message, type)
})

const JOB_DELAY_DEFAULT = 30000 // Delay time in milliseconds

module.exports = {
  JOB_TYPE,
  JOB_DELAY_DEFAULT,
  notificationsQueue
}
