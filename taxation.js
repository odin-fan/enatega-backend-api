const Taxation = require('../../models/taxation')

module.exports = {
  Query: {
    taxes: async() => {
      console.log('Taxation')
      try {
        const taxation = await Taxation.findOne({ isActive: true })
        if (!taxation) {
          return {
            _id: '',
            taxationCharges: null,
            enabled: true
          }
        }
        return {
          ...taxation._doc,
          _id: taxation.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createTaxation: async(_, args, context) => {
      console.log('createTaxation')
      try {
        const count = await Taxation.countDocuments({
          isActive: true
        })
        if (count > 0) throw new Error('Taxation amount already exists')
        const taxation = new Taxation({
          taxationCharges: args.taxationInput.taxationCharges,
          enabled: args.taxationInput.enabled
        })
        const result = await taxation.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editTaxation: async(_, args, context) => {
      console.log('editTaxation')
      try {
        const taxation = await Taxation.findById(args.taxationInput._id)
        if (!taxation) {
          throw new Error('Something went wrong')
        }
        taxation.taxationCharges = args.taxationInput.taxationCharges
        taxation.enabled = args.taxationInput.enabled
        const result = await taxation.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
