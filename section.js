const Section = require('../../models/section')
const Restaurant = require('../../models/restaurant')
const { transformSection } = require('./merge')
module.exports = {
  Query: {
    sections: async(_, args, context) => {
      console.log('Sections')
      try {
        const sections = await Section.find({ isActive: true })
        return await sections.map(transformSection)
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    createSection: async(_, args, { req, res }) => {
      console.log('createSections: ', args)
      try {
        const section = new Section({
          name: args.section.name,
          enabled: args.section.enabled,
          restaurants: args.section.restaurants
        })
        const result = await section.save()
        if (args.section.restaurants.length > 0) {
          await Restaurant.updateMany(
            { _id: { $in: args.section.restaurants } },
            { $push: { sections: section._id } }
          )
        }
        return transformSection(result)
      } catch (err) {
        throw err
      }
    },
    editSection: async(_, args, context) => {
      // db.inventory.update(
      //   { _id: 2 },
      //   { $addToSet: { tags: { $each: [ "camera", "electronics", "accessories" ] } } }
      // )
      console.log('editSection')
      try {
        const section = await Section.findById(args.section._id)
        // const checkRestaurant = await Restaurant.find({ sections: { $in: args.section._id } })
        if (section.restaurants.length > 0) {
          await Restaurant.updateMany(
            { _id: { $in: section.restaurants } },
            { $pull: { sections: section._id } }
          )
        }
        if (args.section.restaurants.length > 0) {
          await Restaurant.updateMany(
            { _id: { $in: args.section.restaurants } },
            { $addToSet: { sections: section._id } }
          )
        }

        section.name = args.section.name
        section.enabled = args.section.enabled
        section.restaurants = args.section.restaurants
        const result = await section.save()
        return transformSection(result)
      } catch (error) {
        throw error
      }
    },
    deleteSection: async(_, args, context) => {
      console.log('deleteSection')
      try {
        const section = await Section.findById(args.id)
        section.isActive = false
        section.enabled = false
        section.restaurants = []
        if (section.restaurants.length > 0) {
          await Restaurant.updateMany(
            { _id: { $in: section.restaurants } },
            { $pull: { sections: section._id } }
          )
        }
        await section.save()
        return true
      } catch (error) {
        throw error
      }
    }
  }
}
