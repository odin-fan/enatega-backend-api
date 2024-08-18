const { Expo } = require('expo-server-sdk');
const User = require('../../models/user');
const { sendNotificationMobile } = require('../../helpers/utilities');

module.exports = {
  Mutation: {
    sendNotificationUser: async (_, args, { req, res }) => {
      console.log('Sending notification to users');
      try {
        const users = await User.find({ isActive: true });
        const messages = [];

        for (const user of users) {
          if (user.notificationToken && user.isOfferNotification) {
            if (Expo.isExpoPushToken(user.notificationToken)) {
              messages.push({
                to: user.notificationToken,
                sound: 'default',
                body: args.notificationBody,
                title: args.notificationTitle,
                channelId: 'default',
                data: {}
              });
            } else {
              console.warn(`Invalid Expo push token for user ${user._id}`);
            }
          }
        }

        if (messages.length > 0) {
          await sendNotificationMobile(messages);
        }

        console.log('Notifications sent successfully');
        return 'Success';
      } catch (error) {
        console.error('Error sending notifications:', error);
        throw new Error('Failed to send notifications');
      }
    },

    saveNotificationTokenWeb: async (_, args, { req, res }) => {
      console.log('Saving notification token for web', args);
      try {
        if (!req.userId) throw new Error('Unauthenticated');

        const result = await User.updateOne(
          { _id: req.userId },
          { $set: { notificationTokenWeb: args.token } },
          { new: true, useFindAndModify: false }
        );

        if (result.modifiedCount > 0) {
          console.log('Notification token saved successfully');
          return {
            success: true,
            message: 'Notification token saved successfully'
          };
        } else {
          console.warn('No changes made while saving notification token');
          return {
            success: false,
            message: 'No changes were made while saving the token'
          };
        }
      } catch (error) {
        console.error('Error saving notification token:', error);
        return {
          success: false,
          message: error.message
        };
      }
    }
  }
};
