const bcrypt = require('bcrypt');

// generates a random id 
function generateRandomString() {
  var result = '';
  var char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charlen = char.length;
  for ( var i = 0; i < 6; i++ ) {
     result += char.charAt(Math.floor(Math.random() * charlen));
  }
  return result;
}

// Checks if given email corresponds to a user in a given database, returns true or false
const emailExists = (users, email) => {
    // fetch user gives user object if email exist
  if (fetchUser(users,email)){
    return true
  } else {
    return false
  }
};


  const passwordMatching = (users, email, password) => {
    let user_obj = fetchUser(users, email)
    if (user_obj && bcrypt.compareSync(password,user_obj.password)){
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

  // func takes urlDatabase and userId as its arguments
  // it returns a subset of urldatabase which matches the userId 
  // if no userid is matched return null
const getUrlDatabaseFromUserId = function(urlDatabase, userId){
  let returnUrlObject = {}
  for(let urls in urlDatabase){
    if(urlDatabase[urls].userID === userId){
      returnUrlObject[urls] = {}
      returnUrlObject[urls].longURL = urlDatabase[urls].longURL
      returnUrlObject[urls].userID = urlDatabase[urls].userID
    }
  }
if(Object.keys(returnUrlObject).length === 0 ){
  return null
}else{
  return returnUrlObject
}
}



  module.exports = { emailExists, passwordMatching, fetchUser, generateRandomString, getUrlDatabaseFromUserId}