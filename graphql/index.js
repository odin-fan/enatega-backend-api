const { gql } = require('apollo-server-express')

const typeDefs = gql`
  type Location {
    location: Point
    deliveryAddress: String
  }
  type Address {
    _id: ID!
    location: Point
    deliveryAddress: String!
    details: String
    label: String!
    selected: Boolean
  }

  type OrderAddress {
    location: Point
    deliveryAddress: String!
    details: String
    label: String!
    id: String
  }

  type Item {
    _id: ID!
    title: String!
    food: String!
    description: String!
    image: String
    quantity: Int!
    variation: ItemVariation!
    addons: [ItemAddon!]
    specialInstructions: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Category {
    _id: ID!
    title: String!
    foods: [Food!]
    createdAt: String!
    updatedAt: String!
  }

  type ReviewData {
    reviews: [Review]
    ratings: Float
    total: Int
  }

  type Owner {
    _id: String
    email: String
  }

  type OrdersWithCashOnDeliveryInfo {
    orders: [Order!]!
    totalAmountCashOnDelivery: Float!
    countCashOnDeliveryOrders: Int!
  }
  type RestaurantPreview {
    _id: ID!
    orderId: Int!
    orderPrefix: String
    name: String!
    image: String
    address: String
    location: Point
    zone: Zone
    username: String
    password: String
    deliveryTime: Int
    minimumOrder: Int
    sections: [String!]
    rating: Float
    isActive: Boolean!
    isAvailable: Boolean!
    openingTimes: [OpeningTimes]
    slug: String
    stripeDetailsSubmitted: Boolean
    commissionRate: Float
    owner: Owner
    deliveryBounds: Polygon
    tax: Float
    notificationToken: String
    enableNotification: Boolean
    shopType: String
    cuisines: [String]
    keywords: [String]
    tags: [String]
    reviewCount: Int
    reviewAverage: Float
    restaurantUrl: String
    phone: String
  }

  type Restaurant {
    _id: ID!
    orderId: Int!
    orderPrefix: String
    name: String!
    image: String
    logo: String
    address: String
    location: Point
    categories: [Category!]
    options: [Option!]
    addons: [Addon!]
    reviewData: ReviewData
    zone: Zone
    username: String
    password: String
    deliveryTime: Int
    minimumOrder: Int
    sections: [String!]
    rating: Float
    isActive: Boolean!
    isAvailable: Boolean!
    openingTimes: [OpeningTimes]
    slug: String
    stripeDetailsSubmitted: Boolean
    commissionRate: Float
    owner: Owner
    deliveryBounds: Polygon
    tax: Float
    notificationToken: String
    enableNotification: Boolean
    shopType: String
    cuisines: [String]
    keywords: [String]
    tags: [String]
    reviewCount: Int
    reviewAverage: Float
    restaurantUrl: String
    phone: String
  }

  type OpeningTimes {
    day: String!
    times: [Timings]
  }

  type Timings {
    startTime: [String]
    endTime: [String]
  }

  type Variation {
    _id: ID!
    title: String!
    price: Float!
    discounted: Float
    addons: [String!]
  }

  type CartVariation {
    _id: ID!
    title: String!
    price: Float!
    discounted: Float
    addons: [CartAddon!]
  }

  type ItemVariation {
    _id: ID!
    title: String!
    price: Float!
    discounted: Float!
  }

  type Food {
    _id: ID!
    title: String!
    description: String!
    variations: [Variation!]!
    image: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type CartFood {
    _id: ID!
    title: String!
    description: String!
    variation: CartVariation!
    image: String!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Rider {
    _id: ID!
    name: String!
    email: String
    username: String!
    password: String!
    phone: String!
    image: String
    available: Boolean!
    zone: Zone!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
    location: Point
    accountNumber: String
    currentWalletAmount: Float
    totalWalletAmount: Float
    withdrawnWalletAmount: Float
  }

  type User {
    _id: ID
    name: String
    phone: String
    phoneIsVerified: Boolean
    email: String
    emailIsVerified: Boolean
    password: String
    isActive: Boolean
    isOrderNotification: Boolean
    isOfferNotification: Boolean
    createdAt: String
    updatedAt: String
    addresses: [Address!]
    notificationToken: String
    favourite: [String!]
    userType: String
  }
  type Configuration {
    _id: String!
    pushToken: String
    email: String
    emailName: String
    password: String
    enableEmail: Boolean
    clientId: String
    clientSecret: String
    sandbox: Boolean
    publishableKey: String
    secretKey: String
    currency: String
    currencySymbol: String
    deliveryRate: Float
    twilioAccountSid: String
    twilioAuthToken: String
    twilioPhoneNumber: String
    twilioEnabled: Boolean
    formEmail: String
    sendGridApiKey: String
    sendGridEnabled: Boolean
    sendGridEmail: String
    sendGridEmailName: String
    sendGridPassword: String
    dashboardSentryUrl: String
    webSentryUrl: String
    apiSentryUrl: String
    customerAppSentryUrl: String
    restaurantAppSentryUrl: String
    riderAppSentryUrl: String
    googleApiKey: String
    cloudinaryUploadUrl: String
    cloudinaryApiKey: String
    webAmplitudeApiKey: String
    appAmplitudeApiKey: String
    webClientID: String
    androidClientID: String
    iOSClientID: String
    expoClientID: String
    googleMapLibraries: String
    googleColor: String
    termsAndConditions: String
    privacyPolicy: String
    testOtp: String
    firebaseKey: String
    authDomain: String
    projectId: String
    storageBucket: String
    msgSenderId: String
    appId: String
    measurementId: String
    isPaidVersion: Boolean
    skipMobileVerification: Boolean
    skipEmailVerification: Boolean
    enableRiderDemo: Boolean
    enableRestaurantDemo: Boolean
    enableAdminDemo: Boolean
    costType: String
    vapidKey: String
  }
  type OrderStatus {
    pending: String!
    preparing: String
    picked: String
    delivered: String
    cancelled: String
  }
  type Order {
    _id: ID!
    orderId: String!
    restaurant: RestaurantDetail!
    deliveryAddress: OrderAddress!
    items: [Item!]!
    user: User!
    paymentMethod: String
    paidAmount: Float
    orderAmount: Float
    status: Boolean
    paymentStatus: String!
    orderStatus: String
    reason: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
    deliveryCharges: Float
    tipping: Float!
    taxationAmount: Float!
    rider: Rider
    review: Review
    zone: Zone!
    completionTime: String
    orderDate: String!
    expectedTime: String
    preparationTime: String
    isPickedUp: Boolean!
    acceptedAt: String
    pickedAt: String
    deliveredAt: String
    cancelledAt: String
    assignedAt: String
    isRinged: Boolean!
    isRiderRinged: Boolean!
    instructions: String
  }

  type MyOrders {
    userId: String!
    orders: [Order!]
  }

  type RiderOrders {
    riderId: String!
    orders: [Order!]
  }

  type RestaurantDetail {
    _id: ID!
    name: String!
    image: String!
    address: String!
    location: Point
    slug: String
    keywords: [String]
    tags: [String]
    reviewCount: Int
    reviewAverage: Float
  }

  type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
    name: String
    phone: String
    phoneIsVerified: Boolean
    email: String
    emailIsVerified: Boolean
    picture: String
    addresses: Location
    isNewUser: Boolean
    isActive: Boolean!
  }

  type OwnerAuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
    email: String!
    userType: String!
    restaurants: [Restaurant]!
    pushToken: String
  }

  type OwnerData {
    _id: ID!
    email: String!
    userType: String!
    restaurants: [Restaurant]!
    pushToken: String
  }

  type Review {
    _id: ID!
    order: Order!
    restaurant: Restaurant!
    rating: Int!
    description: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type ReviewOutput {
    _id: ID!
    order: String!
    restaurant: String!
    review: Review!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Admin {
    userId: String!
    email: String!
    name: String!
    token: String!
  }

  type ForgotPassword {
    result: Boolean!
  }

  type Option {
    _id: String!
    title: String!
    description: String
    price: Float!
  }
  type ItemOption {
    _id: String!
    title: String!
    description: String
    price: Float!
  }

  type Addon {
    _id: String!
    options: [String!]
    title: String!
    description: String
    quantityMinimum: Int!
    quantityMaximum: Int!
  }

  type CartAddon {
    _id: String!
    options: [Option!]
    title: String!
    description: String
    quantityMinimum: Int!
    quantityMaximum: Int!
  }

  type ItemAddon {
    _id: String!
    options: [ItemOption!]
    title: String!
    description: String
    quantityMinimum: Int!
    quantityMaximum: Int!
  }

  type DashboardData {
    totalOrders: Int!
    totalSales: Float!
  }

  type DashboardSales {
    orders: [SalesValues!]
  }
  type DashboardOrders {
    orders: [OrdersValues!]
  }

  type SalesValues {
    day: String!
    amount: Float!
  }
  type OrdersValues {
    day: String!
    count: Int!
  }
  type Coupon {
    _id: String!
    title: String!
    discount: Float!
    enabled: Boolean!
  }
  type Taxation {
    _id: String!
    taxationCharges: Float
    enabled: Boolean!
  }
  type Tipping {
    _id: String!
    tipVariations: [Float]
    enabled: Boolean!
  }

  type OfferInfo {
    _id: String!
    name: String!
    tag: String!
    restaurants: [String]
  }
  type SectionInfo {
    _id: String!
    name: String!
    restaurants: [String]
  }
  type Offer {
    _id: String!
    name: String!
    tag: String!
    restaurants: [OfferRestaurant]
  }

  type OfferRestaurant {
    _id: String!
    name: String!
    image: String!
    address: String!
    location: Point
    categories: [Category]
  }
  type SectionRestaurant {
    _id: String!
    name: String!
  }
  type Section {
    _id: String!
    name: String!
    enabled: Boolean!
    restaurants: [SectionRestaurant]
  }

  type SubscriptionOrders {
    restaurantId: String
    userId: String
    order: Order!
    origin: String!
  }

  type Subscription_Zone_Orders {
    zoneId: String
    order: Order!
    origin: String!
  }

  type NearByData {
    restaurants: [Restaurant!]
    offers: [OfferInfo!]
    sections: [SectionInfo!]
  }
  type NearByDataPreview {
    restaurants: [RestaurantPreview!]
    offers: [OfferInfo!]
    sections: [SectionInfo!]
  }

  type RestaurantAuth {
    token: String!
    restaurantId: String!
  }

  type Polygon {
    coordinates: [[[Float!]]]
  }

  type Point {
    coordinates: [String!]
  }

  type Zone {
    _id: String!
    title: String!
    tax: Float
    description: String!
    location: Polygon
    isActive: Boolean!
  }

  type Earnings {
    _id: String!
    rider: Rider!
    orderId: String!
    deliveryFee: Float!
    orderStatus: String!
    paymentMethod: String!
    deliveryTime: String!
  }

  type WithdrawRequest {
    _id: String!
    requestId: String!
    requestAmount: Float!
    requestTime: String!
    rider: Rider!
    status: String!
  }

  input EarningsInput {
    _id: String
    rider: String!
    orderId: String!
    deliveryFee: Float!
    orderStatus: String!
    paymentMethod: String!
    deliveryTime: String!
  }

  input EmailConfigurationInput {
    email: String!
    password: String!
    emailName: String!
    enableEmail: Boolean!
  }

  input TwilioConfigurationInput {
    twilioAccountSid: String!
    twilioAuthToken: String!
    twilioPhoneNumber: String!
    twilioEnabled: Boolean!
  }
  input FormEmailConfigurationInput {
    formEmail: String!
  }
  input SendGridConfigurationInput {
    sendGridApiKey: String!
    sendGridEnabled: Boolean!
    sendGridEmail: String!
    sendGridEmailName: String!
    sendGridPassword: String!
  }

  input SentryConfigurationInput {
    dashboardSentryUrl: String!
    webSentryUrl: String!
    apiSentryUrl: String!
    customerAppSentryUrl: String!
    restaurantAppSentryUrl: String!
    riderAppSentryUrl: String!
  }
  input GoogleApiKeyConfigurationInput {
    googleApiKey: String!
  }
  input CloudinaryConfigurationInput {
    cloudinaryUploadUrl: String!
    cloudinaryApiKey: String!
  }
  input AmplitudeApiKeyConfigurationInput {
    webAmplitudeApiKey: String!
    appAmplitudeApiKey: String!
  }
  input GoogleClientIDConfigurationInput {
    webClientID: String!
    androidClientID: String!
    iOSClientID: String!
    expoClientID: String!
  }
  input WebConfigurationInput {
    googleMapLibraries: String!
    googleColor: String!
  }
  input AppConfigurationsInput {
    termsAndConditions: String!
    privacyPolicy: String!
    testOtp: String!
  }

  input FirebaseConfigurationInput {
    firebaseKey: String!
    authDomain: String!
    projectId: String!
    storageBucket: String!
    msgSenderId: String!
    appId: String!
    measurementId: String!
    vapidKey: String
  }

  input PaypalConfigurationInput {
    clientId: String!
    clientSecret: String!
    sandbox: Boolean!
  }

  input StripeConfigurationInput {
    publishableKey: String!
    secretKey: String!
  }

  input CurrencyConfigurationInput {
    currency: String!
    currencySymbol: String!
  }

  input VerificationConfigurationInput {
    skipEmailVerification: Boolean!
    skipMobileVerification: Boolean!
  }

  input DemoConfigurationInput {
    enableRiderDemo: Boolean!
    enableRestaurantDemo: Boolean!
    enableAdminDemo: Boolean!
  }

  input DeliveryCostConfigurationInput {
    deliveryRate: Float!
    costType: String
  }

  input UpdateUser {
    name: String!
    phone: String
    phoneIsVerified: Boolean
    emailIsVerified: Boolean
  }
  input AddonsInput {
    _id: String
    options: [String!]
  }
  input OrderInput {
    food: String!
    quantity: Int!
    variation: String!
    addons: [AddonsInput!]
    specialInstructions: String
  }

  input VariationInput {
    _id: String
    title: String
    price: Float!
    discounted: Float
    addons: [String!]
  }

  input FoodInput {
    _id: String
    restaurant: String!
    category: String!
    title: String!
    description: String
    image: String
    variations: [VariationInput!]!
  }

  input RiderInput {
    _id: String
    name: String!
    email: String
    username: String!
    password: String!
    phone: String!
    image: String
    available: Boolean!
    zone: String!
    accountNumber: String
  }

  input UserInput {
    phone: String
    email: String
    password: String
    name: String

    notificationToken: String
    appleId: String
  }

  input OwnerInput {
    email: String
    password: String
  }

  input VendorInput {
    _id: String
    email: String
    password: String
  }

  input ReviewInput {
    order: String
    rating: Int
    description: String
  }

  input PointInput {
    coordinates: [String!]
  }

  input LocationInput {
    location: PointInput
    deliveryAddress: String
  }

  input CategoryInput {
    _id: String
    title: String!
    restaurant: String!
  }

  input RestaurantInput {
    name: String!
    username: String
    password: String
    image: String
    logo: String
    address: String
    categories: [CategoryInput!]
    reviews: [ReviewInput!]
    deliveryTime: Int
    minimumOrder: Int
    salesTax: Float
    shopType: String
    cuisines: [String]
    restaurantUrl: String
    phone: String
  }

  input RestaurantProfileInput {
    _id: String
    name: String!
    image: String
    logo: String
    address: String
    orderPrefix: String
    username: String
    password: String
    deliveryTime: Int
    minimumOrder: Int
    salesTax: Float
    shopType: String
    cuisines: [String]
    restaurantUrl: String
    phone: String
  }

  input OptionInput {
    _id: String
    title: String!
    description: String
    price: Float!
  }

  input editOptionInput {
    restaurant: String!
    options: OptionInput
  }

  input CreateOptionInput {
    restaurant: String
    options: [OptionInput!]!
  }

  input AddonInput {
    restaurant: String!
    addons: [createAddonInput!]!
  }
  input editAddonInput {
    restaurant: String!
    addons: createAddonInput!
  }
  input createAddonInput {
    title: String!
    _id: String
    description: String
    options: [String]
    quantityMinimum: Int!
    quantityMaximum: Int!
  }

  input CouponInput {
    _id: String
    title: String!
    discount: Float!
    enabled: Boolean
  }
  input TippingInput {
    _id: String
    tipVariations: [Float]
    enabled: Boolean
  }
  input TaxationInput {
    _id: String
    taxationCharges: Float
    enabled: Boolean
  }
  input AddressInput {
    _id: String
    longitude: String
    latitude: String
    deliveryAddress: String!
    details: String
    label: String!
  }
  input CartFoodInput {
    _id: String
    variation: CartVariationInput!
  }
  input CartVariationInput {
    _id: String
    addons: [CartAddonInput!]
  }
  input CartAddonInput {
    _id: String
    options: [String!]
  }
  input OfferInput {
    _id: String
    name: String!
    tag: String!
    restaurants: [String]
  }
  input SectionInput {
    _id: String
    name: String!
    enabled: Boolean!
    restaurants: [String]
  }

  input ZoneInput {
    _id: String
    title: String!
    description: String!
    coordinates: [[[Float!]]]
  }

  input TimingsInput {
    day: String!
    times: [TimesInput]
  }

  input TimesInput {
    startTime: [String]
    endTime: [String]
  }

  input FormSubmissionInput {
    name: String!
    email: String!
    message: String!
  }

  input CuisineInput {
    _id: String
    name: String!
    description: String
    image: String
    shopType: String
  }

  type Cuisine {
    _id: String!
    name: String!
    description: String
    image: String
    shopType: String
  }

  type Banner {
    _id: String!
    title: String
    description: String
    file: String
    action: String
    screen: String
    parameters: String
  }

  input BannerInput {
    _id: String
    title: String
    description: String
    file: String
    action: String
    screen: String
    parameters: String
  }

  type FormSubmissionResponse {
    message: String!
    status: String!
  }

  type RestaurantResponse {
    success: Boolean!
    message: String
    data: Restaurant
  }

  input CoordinatesInput {
    longitude: Float!
    latitude: Float!
  }

  type SaveNotificationTokenWebResponse {
    success: Boolean!
    message: String
  }

  type Otp {
    result: Boolean!
  }

  type ChatMessageResponse {
    success: Boolean!
    message: String
    data: ChatMessageOutput
  }

  type ChatMessageOutput {
    id: ID!
    message: String!
    user: ChatUserOutput!
    createdAt: String!
  }

  input ChatMessageInput {
    message: String!
    user: ChatUserInput!
  }

  input ChatUserInput {
    id: ID!
    name: String!
  }

  type ChatUserOutput {
    id: ID!
    name: String!
  }
  type WithdrawRequestReponse {
    success: Boolean!
    data: [WithdrawRequest!]
    message: String
    pagination: Pagination
  }
  type Pagination {
    total: Int
  }
  type UpdateWithdrawResponse {
    success: Boolean!
    data: RiderAndWithdrawRequest
    message: String
  }
  type RiderAndWithdrawRequest {
    rider: Rider!
    withdrawRequest: WithdrawRequest!
  }

  type City {
    id: Int
    name: String
    latitude: String
    longitude: String
  }

  type Country {
    id: Int
    name: String
    latitude: String
    longitude: String
    cities: [City]
  }

  type PopularItemsResponse {
    id: String!
    count: Int!
  }

  type DemoCredentails {
    restaurantUsername: String
    restaurantPassword: String
    riderUsername: String
    riderPassword: String
  }

  type Query {
    withdrawRequests: [WithdrawRequest!]!
    earnings: [Earnings!]!
    categories: [Category!]!
    foods: [Food!]!
    orders(offset: Int): [Order!]!
    undeliveredOrders(offset: Int): [Order!]!
    deliveredOrders(offset: Int): [Order!]!
    allOrders(page: Int): [Order!]!
    getDashboardTotal(
      starting_date: String
      ending_date: String
      restaurant: String!
    ): DashboardData!
    likedFood: [Food!]!
    reviews(offset: Int, restaurant: String!): [Review!]!
    foodByCategory(
      category: String!
      onSale: Boolean
      inStock: Boolean
      min: Float
      max: Float
      search: String
    ): [Food!]!
    profile: User
    configuration: Configuration!
    users: [User!]
    userFavourite(latitude: Float, longitude: Float): [Restaurant]
    order(id: String!): Order!
    orderPaypal(id: String!): Order!
    orderStripe(id: String!): Order!
    riders: [Rider!]
    rider(id: String): Rider!
    riderEarnings(id: String, offset: Int): [Earnings!]
    riderWithdrawRequests(id: String, offset: Int): [WithdrawRequest!]
    pageCount(restaurant: String!): Int
    availableRiders: [Rider]
    getOrderStatuses: [String!]
    getPaymentStatuses: [String!]
    assignedOrders(id: String): [Order!]
    options: [Option!]
    addons: [Addon!]
    foodByIds(foodIds: [CartFoodInput!]!): [CartFood!]
    getDashboardOrders(
      starting_date: String
      ending_date: String
      restaurant: String!
    ): DashboardOrders!
    getDashboardSales(
      starting_date: String
      ending_date: String
      restaurant: String!
    ): DashboardSales!
    coupons: [Coupon!]!
    cuisines: [Cuisine!]!
    banners: [Banner!]!
    bannerActions: [String!]!
    taxes: Taxation!
    tips: Tipping!
    nearByRestaurants(
      latitude: Float
      longitude: Float
      shopType: String
    ): NearByData!
    nearByRestaurantsPreview(
      latitude: Float
      longitude: Float
      shopType: String
    ): NearByDataPreview!
    restaurantList: [Restaurant!]
    restaurantListPreview: [RestaurantPreview!]
    ordersByRestId(
      restaurant: String!
      page: Int
      rows: Int
      search: String
    ): [Order!]
    getOrdersByDateRange(
      startingDate: String!
      endingDate: String!
      restaurant: String!
    ): OrdersWithCashOnDeliveryInfo!

    riderCompletedOrders: [Order!]
    restaurant(id: String, slug: String): Restaurant!
    restaurantPreview(id: String, slug: String): RestaurantPreview!
    restaurants: [Restaurant!]
    restaurantsPreview: [RestaurantPreview!]
    restaurantByOwner(id: String): OwnerData!
    offers: [Offer]
    sections: [Section]
    vendors: [OwnerData]
    getVendor(id: String!): OwnerData
    orderCount(restaurant: String!): Int
    restaurantOrders: [Order!]!
    zones: [Zone!]
    zone(id: String!): Zone!
    unassignedOrdersByZone: [Order!]
    riderOrders: [Order!]
    getActiveOrders(restaurantId: ID): [Order!]
    orderDetails(id: String!): Order!
    ridersByZone(id: String!): [Rider!]
    chat(order: ID!): [ChatMessageOutput!]
    getAllWithdrawRequests(offset: Int): WithdrawRequestReponse!
    getCountries: [Country]
    getCountryByIso(iso: String!): Country
    recentOrderRestaurants(latitude: Float!, longitude: Float!): [Restaurant!]
    recentOrderRestaurantsPreview(
      latitude: Float!
      longitude: Float!
    ): [RestaurantPreview!]
    mostOrderedRestaurants(latitude: Float!, longitude: Float!): [Restaurant!]
    mostOrderedRestaurantsPreview(
      latitude: Float!
      longitude: Float!
    ): [RestaurantPreview!]
    relatedItems(itemId: String!, restaurantId: String!): [String!]!
    popularItems(restaurantId: String!): [PopularItemsResponse!]!
    topRatedVendors(latitude: Float!, longitude: Float!): [Restaurant!]
    topRatedVendorsPreview(
      latitude: Float!
      longitude: Float!
    ): [RestaurantPreview!]
    lastOrderCreds: DemoCredentails
  }

  type Mutation {
    createWithdrawRequest(amount: Float!): WithdrawRequest!
    updateWithdrawReqStatus(id: ID!, status: String!): UpdateWithdrawResponse!
    createEarning(earningsInput: EarningsInput): Earnings!
    sendOtpToEmail(email: String!, otp: String!): Otp!
    sendOtpToPhoneNumber(phone: String!, otp: String!): Otp!
    emailExist(email: String!): User!
    phoneExist(phone: String!): User!
    Deactivate(isActive: Boolean!, email: String!): User!
    adminLogin(email: String!, password: String!): Admin!
    login(
      appleId: String
      email: String
      password: String
      type: String!
      name: String
      notificationToken: String
      isActive: Boolean
    ): AuthData!
    ownerLogin(email: String!, password: String!): OwnerAuthData!
    createUser(userInput: UserInput): AuthData!
    createVendor(vendorInput: VendorInput): OwnerData!
    editVendor(vendorInput: VendorInput): OwnerData!
    deleteVendor(id: String!): Boolean
    updateUser(updateUserInput: UpdateUser!): User!
    updateNotificationStatus(
      offerNotification: Boolean!
      orderNotification: Boolean!
    ): User!
    createCategory(category: CategoryInput): Restaurant!
    editCategory(category: CategoryInput): Restaurant!
    createFood(foodInput: FoodInput): Restaurant!
    editFood(foodInput: FoodInput): Restaurant!
    placeOrder(
      restaurant: String!
      orderInput: [OrderInput!]!
      paymentMethod: String!
      couponCode: String
      address: AddressInput!
      tipping: Float!
      orderDate: String!
      isPickedUp: Boolean!
      taxationAmount: Float!
      deliveryCharges: Float!
      instructions: String
    ): Order!
    editOrder(_id: String!, orderInput: [OrderInput!]!): Order!
    reviewOrder(reviewInput: ReviewInput!): Order!
    acceptOrder(_id: String!, time: String): Order!
    orderPickedUp(_id: String!): Order!
    cancelOrder(_id: String!, reason: String!): Order!
    likeFood(foodId: String!): Food!
    saveEmailConfiguration(
      configurationInput: EmailConfigurationInput!
    ): Configuration!
    saveFormEmailConfiguration(
      configurationInput: FormEmailConfigurationInput!
    ): Configuration!
    saveSendGridConfiguration(
      configurationInput: SendGridConfigurationInput!
    ): Configuration!

    saveFirebaseConfiguration(
      configurationInput: FirebaseConfigurationInput!
    ): Configuration!

    saveSentryConfiguration(
      configurationInput: SentryConfigurationInput!
    ): Configuration!
    saveGoogleApiKeyConfiguration(
      configurationInput: GoogleApiKeyConfigurationInput!
    ): Configuration!
    saveCloudinaryConfiguration(
      configurationInput: CloudinaryConfigurationInput!
    ): Configuration!
    saveAmplitudeApiKeyConfiguration(
      configurationInput: AmplitudeApiKeyConfigurationInput!
    ): Configuration!
    saveGoogleClientIDConfiguration(
      configurationInput: GoogleClientIDConfigurationInput!
    ): Configuration!
    saveWebConfiguration(
      configurationInput: WebConfigurationInput!
    ): Configuration!
    saveAppConfigurations(
      configurationInput: AppConfigurationsInput!
    ): Configuration!

    saveDeliveryRateConfiguration(
      configurationInput: DeliveryCostConfigurationInput
    ): Configuration

    savePaypalConfiguration(
      configurationInput: PaypalConfigurationInput!
    ): Configuration!
    saveStripeConfiguration(
      configurationInput: StripeConfigurationInput!
    ): Configuration!
    saveTwilioConfiguration(
      configurationInput: TwilioConfigurationInput!
    ): Configuration!

    saveCurrencyConfiguration(
      configurationInput: CurrencyConfigurationInput!
    ): Configuration!
    pushToken(token: String): User!
    updateOrderStatus(id: String!, status: String!, reason: String): Order!
    uploadToken(id: String!, pushToken: String!): OwnerData!
    forgotPassword(email: String!, otp: String!): ForgotPassword!
    resetPassword(password: String!, email: String!): ForgotPassword!
    vendorResetPassword(oldPassword: String!, newPassword: String!): Boolean!
    deleteCategory(id: String!, restaurant: String!): Restaurant!
    deleteFood(
      id: String!
      restaurant: String!
      categoryId: String!
    ): Restaurant!
    createRider(riderInput: RiderInput): Rider!
    editRider(riderInput: RiderInput): Rider!
    deleteRider(id: String!): Rider!
    toggleAvailablity(id: String): Rider!
    updateStatus(id: String, orderStatus: String!): Order!
    assignRider(id: String!, riderId: String!): Order!
    riderLogin(
      username: String
      password: String
      notificationToken: String
    ): AuthData!
    updateOrderStatusRider(id: String!, status: String!): Order!
    updatePaymentStatus(id: String, status: String): Order!
    createOptions(optionInput: CreateOptionInput): Restaurant!
    editOption(optionInput: editOptionInput): Restaurant!
    deleteOption(id: String!, restaurant: String!): Restaurant!
    createAddons(addonInput: AddonInput): Restaurant!
    editAddon(addonInput: editAddonInput): Restaurant!
    deleteAddon(id: String!, restaurant: String!): Restaurant!
    createCoupon(couponInput: CouponInput!): Coupon!
    editCoupon(couponInput: CouponInput!): Coupon!
    deleteCoupon(id: String!): String!
    coupon(coupon: String!): Coupon!
    createCuisine(cuisineInput: CuisineInput!): Cuisine!
    editCuisine(cuisineInput: CuisineInput!): Cuisine!
    deleteCuisine(id: String!): String!
    cuisine(cuisine: String!): Cuisine!
    createBanner(bannerInput: BannerInput!): Banner!
    editBanner(bannerInput: BannerInput!): Banner!
    deleteBanner(id: String!): String!
    banner(banner: String!): Banner!
    createTipping(tippingInput: TippingInput!): Tipping!
    editTipping(tippingInput: TippingInput!): Tipping!
    createTaxation(taxationInput: TaxationInput!): Taxation!
    editTaxation(taxationInput: TaxationInput!): Taxation!
    createRestaurant(restaurant: RestaurantInput!, owner: ID!): Restaurant!
    createReview(review: ReviewInput!): Restaurant!
    deleteRestaurant(id: String!): Restaurant!
    editRestaurant(restaurant: RestaurantProfileInput!): Restaurant!
    createAddress(addressInput: AddressInput!): User!
    editAddress(addressInput: AddressInput!): User!
    deleteAddress(id: ID!): User!
    deleteBulkAddresses(ids: [ID!]!): User!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
    createOffer(offer: OfferInput!): Offer!
    editOffer(offer: OfferInput!): Offer!
    deleteOffer(id: String!): Boolean
    createSection(section: SectionInput!): Section!
    editSection(section: SectionInput!): Section!
    deleteSection(id: String!): Boolean
    addRestaurantToOffer(id: String!, restaurant: String!): Offer
    selectAddress(id: String!): User!
    assignOrder(id: String): Order!
    muteRing(orderId: String): Boolean!
    updateRiderLocation(latitude: String!, longitude: String!): Rider!
    restaurantLogin(username: String!, password: String!): RestaurantAuth!
    createZone(zone: ZoneInput!): Zone!
    editZone(zone: ZoneInput!): Zone!
    deleteZone(id: String!): Zone!
    saveRestaurantToken(token: String, isEnabled: Boolean): Restaurant!
    notifyRiders(id: String!): Boolean!
    updateTimings(id: String!, openingTimes: [TimingsInput]): Restaurant!
    toggleAvailability: Restaurant!
    addFavourite(id: String!): User!
    sendNotificationUser(
      notificationTitle: String
      notificationBody: String!
    ): String!
    updateCommission(id: String!, commissionRate: Float!): Restaurant!
    updateDeliveryBoundsAndLocation(
      id: ID!
      bounds: [[[Float!]]]
      location: CoordinatesInput!
    ): RestaurantResponse!
    saveNotificationTokenWeb(token: String!): SaveNotificationTokenWebResponse!
    sendChatMessage(
      message: ChatMessageInput!
      orderId: ID!
    ): ChatMessageResponse!
    toggleMenuFood(id: ID!, restaurant: ID!, categoryId: ID!): Food!
    sendFormSubmission(
      formSubmissionInput: FormSubmissionInput!
    ): FormSubmissionResponse!
    abortOrder(id: String!): Order!
    saveVerificationsToggle(
      configurationInput: VerificationConfigurationInput!
    ): Configuration!

    saveDemoConfiguration(
      configurationInput: DemoConfigurationInput!
    ): Configuration!
  }
  type Subscription {
    subscribePlaceOrder(restaurant: String!): SubscriptionOrders!
    orderStatusChanged(userId: String!): SubscriptionOrders!
    subscriptionAssignRider(riderId: String!): SubscriptionOrders!
    subscriptionRiderLocation(riderId: String!): Rider!
    subscriptionZoneOrders(zoneId: String!): Subscription_Zone_Orders!
    subscriptionOrder(id: String!): Order!
    subscriptionDispatcher: Order!
    subscriptionNewMessage(order: ID!): ChatMessageOutput!
  }
`
module.exports = typeDefs
