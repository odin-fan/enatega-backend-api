const { ApolloError } = require('apollo-server-express');
const Country = require('../../models/country');

const resolvers = {
  Query: {
    // Get all countries
    getCountries: async () => {
      try {
        const countries = await Country.find();
        return countries;
      } catch (error) {
        console.error('Error fetching countries:', error);
        throw new ApolloError('Error fetching countries', 'DATABASE_ERROR');
      }
    },

    // Get a single country by ISO code
    getCountryByIso: async (_, { iso }) => {
      try {
        const country = await Country.findOne({ iso2: iso.toUpperCase() });
        if (!country) {
          throw new ApolloError('Country not found', 'NOT_FOUND');
        }
        return country;
      } catch (error) {
        console.error('Error fetching country by ISO:', error);
        throw new ApolloError('Error fetching country by ISO', 'DATABASE_ERROR');
      }
    }
  }
};

module.exports = resolvers;