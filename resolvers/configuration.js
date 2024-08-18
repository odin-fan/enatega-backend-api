const Configuration = require('../../models/configuration')

module.exports = {
  Query: {
    configuration: async() => {
      console.log('configuration')
      const configuration = await Configuration.findOne()
      if (!configuration) {
        return {
          _id: '',
          email: '',
          password: '',
          emailName: '',
          enableEmail: true,
          clientId: '',
          clientSecret: '',
          sandbox: false,
          publishableKey: '',
          secretKey: '',
          currency: '',
          currencySymbol: '',
          deliveryRate: 5,
          twilioAccountSid: '',
          twilioAuthToken: '',
          twilioPhoneNumber: '',
          twilioEnabled: false,
          formEmail: '',
          sendGridApiKey: '',
          sendGridEnabled: false,
          sendGridEmail: '',
          sendGridEmailName: '',
          sendGridPassword: '',
          dashboardSentryUrl: '',
          webSentryUrl: '',
          apiSentryUrl: '',
          customerAppSentryUrl: '',
          restaurantAppSentryUrl: '',
          riderAppSentryUrl: '',
          googleApiKey: '',
          cloudinaryUploadUrl: '',
          cloudinaryApiKey: '',
          webClientID: '',
          androidClientID: '',
          iOSClientID: '',
          expoClientID: '',
          googleMapLibraries: '',
          googleColor: '',
          termsAndConditions: '',
          privacyPolicy: '',
          testOtp: '',
          firebaseKey: '',
          authDomain: '',
          projectId: '',
          storageBucket: '',
          msgSenderId: '',
          appId: '',
          measurementId: '',
          isPaidVersion: false,
          skipMobileVerification: false,
          skipEmailVerification: false,
          costType: '',
          vapidKey: ''
        }
      }
      return {
        ...configuration._doc,
        _id: configuration.id
      }
    }
  },
  Mutation: {
    saveEmailConfiguration: async(_, args, context) => {
      console.log('saveEmailConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.email = args.configurationInput.email
      configuration.emailName = args.configurationInput.emailName
      configuration.password = args.configurationInput.password
      configuration.enableEmail = args.configurationInput.enableEmail
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveFirebaseConfiguration: async(_, args, context) => {
      console.log('saveFirebaseConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.firebaseKey = args.configurationInput.firebaseKey
      configuration.authDomain = args.configurationInput.authDomain
      configuration.projectId = args.configurationInput.projectId
      configuration.storageBucket = args.configurationInput.storageBucket
      configuration.msgSenderId = args.configurationInput.msgSenderId
      configuration.appId = args.configurationInput.appId
      configuration.measurementId = args.configurationInput.measurementId
      configuration.vapidKey = args.configurationInput?.vapidKey ?? ''

      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveDeliveryRateConfiguration: async(_, { configurationInput }) => {
      console.log('saveDeliveryRateConfiguration', configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.deliveryRate = configurationInput.deliveryRate
      configuration.costType = configurationInput.costType
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    savePaypalConfiguration: async(_, args, context) => {
      console.log('savePaypalConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.clientId = args.configurationInput.clientId
      configuration.clientSecret = args.configurationInput.clientSecret
      configuration.sandbox = args.configurationInput.sandbox
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveStripeConfiguration: async(_, args, context) => {
      console.log('saveStripeConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.publishableKey = args.configurationInput.publishableKey
      configuration.secretKey = args.configurationInput.secretKey
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveCurrencyConfiguration: async(_, args, context) => {
      console.log('saveCurrencyConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.currency = args.configurationInput.currency
      configuration.currencySymbol = args.configurationInput.currencySymbol
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },

    // New mutation resolver for TWILIO configuration
    saveTwilioConfiguration: async(_, args, context) => {
      console.log('saveTwilioConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.twilioAccountSid = args.configurationInput.twilioAccountSid
      configuration.twilioAuthToken = args.configurationInput.twilioAuthToken
      configuration.twilioPhoneNumber =
        args.configurationInput.twilioPhoneNumber
      configuration.twilioEnabled = args.configurationInput.twilioEnabled
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },

    saveFormEmailConfiguration: async(_, args, context) => {
      console.log('saveFormEmailConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.formEmail = args.configurationInput.formEmail
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveSendGridConfiguration: async(_, args, context) => {
      console.log('saveSendGridConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()

      // Update fields based on the provided input
      configuration.sendGridApiKey = args.configurationInput.sendGridApiKey
      configuration.sendGridEnabled = args.configurationInput.sendGridEnabled
      configuration.sendGridEmail = args.configurationInput.sendGridEmail
      configuration.sendGridEmailName =
        args.configurationInput.sendGridEmailName
      configuration.sendGridPassword = args.configurationInput.sendGridPassword
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },

    saveSentryConfiguration: async(_, args, context) => {
      console.log('saveSentryConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()

      configuration.dashboardSentryUrl =
        args.configurationInput.dashboardSentryUrl
      configuration.webSentryUrl = args.configurationInput.webSentryUrl
      configuration.apiSentryUrl = args.configurationInput.apiSentryUrl
      configuration.customerAppSentryUrl =
        args.configurationInput.customerAppSentryUrl
      configuration.restaurantAppSentryUrl =
        args.configurationInput.restaurantAppSentryUrl
      configuration.riderAppSentryUrl =
        args.configurationInput.riderAppSentryUrl

      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveGoogleApiKeyConfiguration: async(_, args, context) => {
      console.log('saveGoogleApiKeyConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()

      configuration.googleApiKey = args.configurationInput.googleApiKey

      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },

    saveCloudinaryConfiguration: async(_, args, context) => {
      console.log('saveCloudinaryConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()

      configuration.cloudinaryUploadUrl =
        args.configurationInput.cloudinaryUploadUrl
      configuration.cloudinaryApiKey = args.configurationInput.cloudinaryApiKey

      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveAmplitudeApiKeyConfiguration: async(_, args, context) => {
      console.log('saveAmplitudeApiKeyConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()

      configuration.webAmplitudeApiKey =
        args.configurationInput.webAmplitudeApiKey
      configuration.appAmplitudeApiKey =
        args.configurationInput.appAmplitudeApiKey

      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },

    saveGoogleClientIDConfiguration: async(_, args, context) => {
      console.log('saveGoogleClientIDConfiguration', args.configurationInput)

      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.webClientID = args.configurationInput.webClientID
      configuration.androidClientID = args.configurationInput.androidClientID
      configuration.iOSClientID = args.configurationInput.iOSClientID
      configuration.expoClientID = args.configurationInput.expoClientID

      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveWebConfiguration: async(_, args, context) => {
      console.log('saveWebConfiguration', args.configurationInput)

      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()

      configuration.googleMapLibraries =
        args.configurationInput.googleMapLibraries
      configuration.googleColor = args.configurationInput.googleColor

      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveAppConfigurations: async(_, args, context) => {
      console.log('saveAppConfigurations', args.configurationInput)

      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()

      configuration.termsAndConditions =
        args.configurationInput.termsAndConditions
      configuration.privacyPolicy = args.configurationInput.privacyPolicy
      configuration.testOtp = args.configurationInput.testOtp

      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveVerificationsToggle: async(_, args, context) => {
      console.log('saveVerificationsToggle', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.skipEmailVerification =
        args.configurationInput.skipEmailVerification
      configuration.skipMobileVerification =
        args.configurationInput.skipMobileVerification
      const result = await configuration.save()
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveDemoConfiguration: async(_, args, context) => {
      console.log('saveDemoConfiguration', args)
      try {
        let configuration = await Configuration.findOne()
        if (!configuration) configuration = new Configuration()
        configuration.enableRiderDemo = args.configurationInput.enableRiderDemo
        configuration.enableRestaurantDemo =
          args.configurationInput.enableRestaurantDemo
        configuration.enableAdminDemo = args.configurationInput.enableAdminDemo
        const result = await configuration.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (error) {
        console.log('saveDemoConfiguration error', error.message)
      }
    }
  }
}
