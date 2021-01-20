const emailExists = (users, email) => {
    // fetch user gives user object if email exist
    if (fetchUser(users,email))
    {
        return true
    }
    else{
        return false
    }
  }

  const passwordMatching = (users, email, password) => {
    let user_obj = fetchUser(users, email)
    if (user_obj && user_obj.password === password){
        return true
    } else {
      return false
    }
  }
  
  // Return user with matching email IF exist - otherwise return null
  const fetchUser = (users, email) => {
    for (let userkey in users ){
        if (users[userkey].email === email) {
            return users[userkey]
          } 
    }
    return null
  }







  module.exports = { emailExists, passwordMatching, fetchUser }