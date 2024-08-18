const Order = require('../../models/order');
const { months } = require('../../helpers/enum');

module.exports = {
  Query: {
    getDashboardTotal: async (_, args) => {
      console.log('Fetching dashboard total with arguments:', args);
      try {
        const startingDate = new Date(args.starting_date);
        const endingDate = new Date(args.ending_date);
        endingDate.setDate(endingDate.getDate() + 1);
        const filterDate = {
          createdAt: { $gte: startingDate, $lt: endingDate },
        };

        const ordersCount = await Order.countDocuments({
          ...filterDate,
          restaurant: args.restaurant,
          orderStatus: 'DELIVERED',
        });

        const paidOrders = await Order.find({
          ...filterDate,
          orderStatus: 'DELIVERED',
          restaurant: args.restaurant,
        }).select('orderAmount');

        const salesAmount = paidOrders.reduce(
          (acc, order) => acc + order.orderAmount,
          0
        );

        return {
          totalOrders: ordersCount,
          totalSales: salesAmount.toFixed(2),
        };
      } catch (err) {
        console.error('Error fetching dashboard total:', err);
        throw new Error('Failed to fetch dashboard total');
      }
    },

    getDashboardSales: async (_, args) => {
      console.log('Fetching dashboard sales with arguments:', args);
      try {
        const endingDate = new Date(args.ending_date);
        endingDate.setDate(endingDate.getDate() + 1);
        const salesValue = [];
        let currentDate = new Date(args.starting_date);

        while (currentDate < endingDate) {
          const filterStart = new Date(currentDate);
          const filterEnd = new Date(filterStart);
          filterEnd.setDate(filterStart.getDate() + 1);
          const filter = { createdAt: { $gte: filterStart, $lt: filterEnd } };

          const orders = await Order.find({
            ...filter,
            orderStatus: 'DELIVERED',
            restaurant: args.restaurant,
          }).select('orderAmount');

          const day = `${months[currentDate.getMonth()]} ${currentDate.getDate()}`;
          const tempSalesValue = {
            day,
            amount: orders.reduce((acc, order) => acc + order.orderAmount, 0).toFixed(2),
          };

          salesValue.push(tempSalesValue);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
          orders: salesValue,
        };
      } catch (err) {
        console.error('Error fetching dashboard sales:', err);
        throw new Error('Failed to fetch dashboard sales');
      }
    },

    getDashboardOrders: async (_, args) => {
      console.log('Fetching dashboard orders with arguments:', args);
      try {
        const endingDate = new Date(args.ending_date);
        endingDate.setDate(endingDate.getDate() + 1);
        const salesValue = [];
        let currentDate = new Date(args.starting_date);

        while (currentDate < endingDate) {
          const filterStart = new Date(currentDate);
          const filterEnd = new Date(filterStart);
          filterEnd.setDate(filterStart.getDate() + 1);
          const filter = { createdAt: { $gte: filterStart, $lt: filterEnd } };

          const day = `${months[currentDate.getMonth()]} ${currentDate.getDate()}`;
          const count = await Order.countDocuments({
            ...filter,
            orderStatus: 'DELIVERED',
            restaurant: args.restaurant,
          });

          salesValue.push({
            day,
            count,
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
          orders: salesValue,
        };
      } catch (err) {
        console.error('Error fetching dashboard orders:', err);
        throw new Error('Failed to fetch dashboard orders');
      }
    },
  },
  Mutation: {},
};
