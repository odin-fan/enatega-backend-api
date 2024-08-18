const Tipping = require('../../models/tipping')

module.exports = {
  Query: {
    tips: async() => {
      console.log('Tipping')
      try {
        const tipping = await Tipping.findOne({ isActive: true })
        if (!tipping) {
          return {
            _id: '',
            tipVariations: [],
            enabled: true
          }
        }
        return {
          ...tipping._doc,
          _id: tipping.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createTipping: async(_, args, context) => {
      console.log('createTipping')
      try {
        const count = await Tipping.countDocuments({
          isActive: true
        })
        if (count > 0) throw new Error('Tipping amount already exists')
        const tipping = new Tipping({
          tipVariations: args.tippingInput.tipVariations,
          enabled: args.tippingInput.enabled
        })
        const result = await tipping.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editTipping: async(_, args, context) => {
      console.log('editTipping', args)
      try {
        const tipping = await Tipping.findById(args.tippingInput._id)
        if (!tipping) {
          throw new Error('Something went wrong')
        }
        tipping.tipVariations = args.tippingInput.tipVariations
        tipping.enabled = args.tippingInput.enabled
        const result = await tipping.save()
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
