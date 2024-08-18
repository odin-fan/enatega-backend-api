const Coupon = require('../../models/coupon');

module.exports = {
  Query: {
    coupons: async () => {
      console.log('Fetching active coupons');
      try {
        const coupons = await Coupon.find({ isActive: true }).sort({
          createdAt: -1,
        });
        return coupons.map((coupon) => ({
          ...coupon._doc,
          _id: coupon.id,
        }));
      } catch (err) {
        console.error('Error fetching coupons:', err);
        throw new Error('Failed to fetch coupons');
      }
    },
  },
  Mutation: {
    createCoupon: async (_, args) => {
      console.log('Creating a new coupon');
      try {
        const existingCouponCount = await Coupon.countDocuments({
          title: args.couponInput.title,
          isActive: true,
        });

        if (existingCouponCount > 0) {
          throw new Error('Coupon code already exists');
        }

        const coupon = new Coupon({
          title: args.couponInput.title,
          discount: args.couponInput.discount,
          enabled: args.couponInput.enabled,
        });

        const result = await coupon.save();
        return {
          ...result._doc,
          _id: result.id,
        };
      } catch (err) {
        console.error('Error creating coupon:', err);
        throw new Error('Failed to create coupon');
      }
    },
    editCoupon: async (_, args) => {
      console.log('Editing a coupon');
      try {
        const coupon = await Coupon.findById(args.couponInput._id);
        if (!coupon) {
          throw new Error('Coupon does not exist');
        }

        const duplicateCouponCount = await Coupon.countDocuments({
          _id: { $ne: args.couponInput._id },
          title: args.couponInput.title,
          isActive: true,
        });

        if (duplicateCouponCount > 0) {
          throw new Error('Another active coupon with the same title already exists');
        }

        coupon.title = args.couponInput.title;
        coupon.discount = args.couponInput.discount;
        coupon.enabled = args.couponInput.enabled;

        const result = await coupon.save();
        return {
          ...result._doc,
          _id: result.id,
        };
      } catch (err) {
        console.error('Error editing coupon:', err);
        throw new Error('Failed to edit coupon');
      }
    },
    deleteCoupon: async (_, args) => {
      console.log('Deleting a coupon');
      try {
        const coupon = await Coupon.findById(args.id);
        if (!coupon) {
          throw new Error('Coupon not found');
        }

        coupon.isActive = false;
        const result = await coupon.save();
        return result.id;
      } catch (err) {
        console.error('Error deleting coupon:', err);
        throw new Error('Failed to delete coupon');
      }
    },
    coupon: async (_, args) => {
      console.log('Fetching a single coupon by title:', args.coupon);
      try {
        const coupon = await Coupon.findOne({
          isActive: true,
          title: args.coupon,
        });

        if (!coupon) {
          throw new Error('Coupon code not found');
        }

        return {
          ...coupon._doc,
          _id: coupon.id,
        };
      } catch (err) {
        console.error('Error fetching coupon:', err);
        throw new Error('Failed to fetch coupon');
      }
    },
  },
};
