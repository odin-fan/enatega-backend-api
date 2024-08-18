const { BANNER_ACTIONS } = require('../../helpers/enum');
const Banner = require('../../models/banner');

module.exports = {
  Query: {
    banners: async () => {
      console.log('Fetching active banners');
      try {
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
        return banners.map(banner => ({
          ...banner._doc,
          _id: banner.id,
        }));
      } catch (error) {
        console.error('Error fetching banners:', error);
        throw error;
      }
    },

    bannerActions: async () => {
      console.log('Fetching banner actions');
      try {
        return Object.values(BANNER_ACTIONS);
      } catch (error) {
        console.error('Error fetching banner actions:', error);
        throw error;
      }
    },
  },

  Mutation: {
    createBanner: async (_, { bannerInput }) => {
      console.log('Creating a new banner');
      try {
        const existingBannerCount = await Banner.countDocuments({
          title: bannerInput.title,
          isActive: true,
        });

        if (existingBannerCount > 0) {
          throw new Error('Banner with this title already exists');
        }

        const newBanner = new Banner({
          title: bannerInput.title,
          description: bannerInput.description,
          file: bannerInput.file,
          action: bannerInput.action,
          screen: bannerInput.screen,
          parameters: bannerInput.parameters,
        });

        const savedBanner = await newBanner.save();
        return {
          ...savedBanner._doc,
          _id: savedBanner.id,
        };
      } catch (error) {
        console.error('Error creating banner:', error);
        throw error;
      }
    },

    editBanner: async (_, { bannerInput }) => {
      console.log('Editing banner');
      try {
        const banner = await Banner.findById(bannerInput._id);
        if (!banner) {
          throw new Error('Banner does not exist');
        }

        banner.title = bannerInput.title;
        banner.description = bannerInput.description;
        banner.file = bannerInput.file;
        banner.action = bannerInput.action;
        banner.screen = bannerInput.screen;
        banner.parameters = bannerInput.parameters;

        const updatedBanner = await banner.save();
        return {
          ...updatedBanner._doc,
          _id: updatedBanner.id,
        };
      } catch (error) {
        console.error('Error editing banner:', error);
        throw error;
      }
    },

    deleteBanner: async (_, { id }) => {
      console.log('Deleting banner');
      try {
        const banner = await Banner.findById(id);
        if (!banner) throw new Error('Banner not found');

        banner.isActive = false;
        const deletedBanner = await banner.save();
        return deletedBanner.id;
      } catch (error) {
        console.error('Error deleting banner:', error);
        throw error;
      }
    },

    banner: async (_, { banner }) => {
      console.log('Fetching banner details:', banner);
      try {
        const foundBanner = await Banner.findOne({ isActive: true, title: banner });
        if (!foundBanner) throw new Error('Banner not found');

        return {
          ...foundBanner._doc,
          _id: foundBanner.id,
        };
      } catch (error) {
        console.error('Error fetching banner:', error);
        throw error;
      }
    },
  },
};
