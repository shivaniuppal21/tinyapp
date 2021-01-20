const emailExists = (users, email) => {
    if (users[email]) {
      return true
    } else {
      return false
    }
  }
  const passwordMatching = (users, email, password) => {
    if (users[email].password === password) {
      return true
    } else {
      return false
    }
  }
  
  const fetchUser = (users, email) => {
    if (users[email]) {
      return users[email]
    } else {
      return {}
    }
  }







  module.exports = { emailExists, passwordMatching, fetchUser }