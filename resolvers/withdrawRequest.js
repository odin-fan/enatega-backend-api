const { WITHDRAW_REQUEST_STATUS } = require('../../helpers/enum')
const Rider = require('../../models/rider')
const WithdrawRequest = require('../../models/withdrawRequest')
const { transformWithDrawRequest, transformRider } = require('./merge')
module.exports = {
  Query: {
    withdrawRequests: async(_, { req }) => {
      console.log('withdrawRequests')
      if (!req.isAuth) throw new Error('Unauthenticated!')
      try {
        const requests = await WithdrawRequest.find({})
        return requests.map(transformWithDrawRequest)
      } catch (err) {
        throw err
      }
    },
    riderWithdrawRequests: async(_, args, { req }) => {
      console.log('riderWithdrawRequests', args)
      const riderId = args.id || req.userId
      if (!riderId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const riderRequests = await WithdrawRequest.find({
          rider: riderId
        })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10)
        return riderRequests.map(transformWithDrawRequest)
      } catch (err) {
        throw err
      }
    },
    getAllWithdrawRequests: async(_, args, { req }) => {
      try {
        if (!req.isAuth) {
          throw new Error('Unauthenticated')
        }
        const riderRequests = await WithdrawRequest.find({})
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(20)
        const withdrawRequestCount = await WithdrawRequest.countDocuments()
        return {
          success: true,
          data: riderRequests.map(transformWithDrawRequest),
          pagination: {
            total: withdrawRequestCount
          }
        }
      } catch (error) {
        console.log('getAllWithdrawRequests', error)
        return {
          success: false,
          message: error.message
        }
      }
    }
  },
  Mutation: {
    createWithdrawRequest: async(_, args, { req }) => {
      console.log('createWithdrawRequest', args)
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        const rider = await Rider.findById(req.userId)
        const existingRequest = await WithdrawRequest.countDocuments({
          rider: req.userId,
          status: WITHDRAW_REQUEST_STATUS.REQUESTED
        })
        if (existingRequest > 0) {
          throw new Error("You've an existing withdraw request")
        }
        if (args.amount > rider.currentWalletAmount) {
          throw new Error('Not enough amount in wallet')
        }
        const requestId = `REQ-${
          rider.username
        }-${await WithdrawRequest.countDocuments()}`
        const request = new WithdrawRequest({
          requestId: requestId,
          requestAmount: args.amount,
          rider: rider,
          status: WITHDRAW_REQUEST_STATUS.REQUESTED
        })
        const result = await request.save()
        return transformWithDrawRequest(result)
      } catch (err) {
        throw err
      }
    },
    updateWithdrawReqStatus: async(_, args, { req }) => {
      console.log('updateWithdrawReqStatus: ', args)
      try {
        if (!req.isAuth) {
          throw new Error('Unauthenticated')
        }
        const withdrawRequest = await WithdrawRequest.findById({
          _id: args.id
        })
        const rider = await Rider.findById(withdrawRequest.rider)
        if (!withdrawRequest) throw new Error('Withdraw Request not found!')
        withdrawRequest.status = args.status
        if (args.status === WITHDRAW_REQUEST_STATUS.TRANSFERRED) {
          if (rider.currentWalletAmount >= withdrawRequest.requestAmount) {
            rider.currentWalletAmount =
              rider.currentWalletAmount - withdrawRequest.requestAmount
            rider.withdrawnWalletAmount += withdrawRequest.requestAmount
          } else {
            return {
              success: false,
              message: 'Not enough amount in wallet'
            }
          }
        }
        const resultRider = await rider.save()
        const resultWithdrawRequest = await withdrawRequest.save()
        // TODO: notify riders with notification here
        return {
          success: true,
          data: {
            rider: transformRider(resultRider),
            withdrawRequest: transformWithDrawRequest(resultWithdrawRequest)
          }
        }
      } catch (err) {
        console.log('updateWithdrawReqStatus error', err)
        return {
          success: false,
          message: err.message
        }
      }
    }
  }
}
