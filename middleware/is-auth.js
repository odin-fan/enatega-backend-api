const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization')
  if (!authHeader) {
    return {
      isAuth: false
    }
  }
  const token = authHeader.split(' ')[1]
  if (!token || token === '') {
    return {
      isAuth: false
    }
  }
  let decodedToken
  try {
    decodedToken = jwt.verify(token, 'somesupersecretkey')
  } catch (err) {
    return {
      isAuth: false
    }
  }
  if (!decodedToken) {
    return {
      isAuth: false
    }
  }
  return {
    isAuth: true,
    userId: decodedToken.userId,
    userType: decodedToken.userType ? decodedToken.userType : null,
    restaurantId: decodedToken.restaurantId
  }
}
