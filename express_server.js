// Requirements
const express = require("express");
const PORT = 8080; // default port 8080
const morgan = require('morgan'); // HTTP request logger middleware for node.js
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const saltRounds = 10;
const bcrypt = require('bcrypt');

// helper functions
const { emailExists, passwordMatching, fetchUser } = require("./helpers/useHelpers")
const app = express();
app.set("view engine", "ejs"); // tells express to use ejs as templating

app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan('dev'));
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);
// datatbases
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

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

app.get("/", (req, res) => {
    res.send("Hello!");
  });

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

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

app.get("/urls", (req, res) => {
  if(req.session["user_id"]){
    const user_id = req.session["user_id"];
  let urls_uderid = getUrlDatabaseFromUserId(urlDatabase,user_id)
  const templateVars = { urls: urls_uderid, user: users[user_id]};
    res.render("urls_index", templateVars);
  }else{
    const user_id = req.session["user_id"];
    const templateVars = {  user: users[user_id]};
    res.render("redirect_login", templateVars);
  }
  
  });
  
  app.get("/urls/new", (req, res) => {
    if (req.session["user_id"])
    {
      const user_id = req.session["user_id"];
      const templateVars = {  user: users[user_id]};
        res.render("urls_new",templateVars);
    }
    else{
      res.redirect("/login")
    }
  });

  app.get("/u/:shortURL", (req, res) => {
    
    res.redirect( urlDatabase[req.params.shortURL])
  });

  app.get("/urls/:shortURL", (req, res) => {
    const user_id = req.session["user_id"];
    console.log(user_id)
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL ,user: users[user_id] };
    res.render("urls_show", templateVars);
  });

 // will show a form to login
  app.get('/register', (req, res) => {
    const user_id = req.session["user_id"];
    const templateVars = {  user: users[user_id]};
    res.render("register", templateVars)
  });

  app.post("/register", (req, res) => {
    const incomingEmail = req.body.email
    const incomingPassword = req.body.password
    const userid = generateRandomString()
  
    if (!incomingEmail || !incomingPassword){
      res.statusCode = 400;
      res.send('Incorrect username or password');
      return
    }
    // We should check if email exists
    if (emailExists(users, incomingEmail)) {
      res.send('email already exists');
      return
    } else {
      // If not, we want to add the new user data to the database
      const newUser = {
        id: userid,
        email: incomingEmail,
        password: incomingPassword
      }
  
      users[userid] = newUser
      // redirect them to home with cookie if everything was ok
      //res.cookie("user_id",userid)
      // res.redirect('/')
      // redirect them to login if everything was ok
      console.log(users)
      res.redirect('/urls')
    }
  })
  
  app.post("/urls", (req, res) => {
      let longUrl = req.body.longURL
      let shortUrl = generateRandomString()
      urlDatabase[shortUrl] = {}
      urlDatabase[shortUrl].userID = req.session["user_id"]
      urlDatabase[shortUrl].longURL = longUrl
      res.redirect("/urls/"+shortUrl)
  });
  // edit route to update a url resourse
app.post("/urls/:shortURL", (req, res) => {
  let userId = req.session["user_id"]
  let newlongUrl = req.body.longURL
  let shorturl = req.params.shortURL
  if(userId){
    const userIdDatabase = getUrlDatabaseFromUserId(urlDatabase, userId)
    if(userIdDatabase[shorturl]){
      urlDatabase[shorturl].longURL = newlongUrl
      res.redirect("/urls");
    }else{
      res.send("You are not authorized to perform this function")
    }
  }else{
    res.redirect("/login")
  }
  
})

app.get("/login", (req, res) => {
  const user_id = req.session["user_id"];
  const templateVars = { urls: urlDatabase, user: users[user_id]};
    res.render("login", templateVars);

})


app.post("/login", (req, res) => {

  if(passwordMatching(users,req.body.email,req.body.password))
  {
    let user_obj = fetchUser(users,req.body.email)
    req.session["user_id"] = user_obj.id
    console.log(user_obj.id)
    res.redirect("/urls");
  }
  else{
    res.statusCode = 403;
      res.send('Error '+res.statusCode +' Username Or password not correct');
      return
  }
  
  
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


// DELETE /urls/:shortURL
// POST /urls/:shortURL/delete
// post requests are used to CHANGE/DELETE/UPDATE/CREATE data 
app.post("/urls/:shortURL/delete", (req, res) => {
  let userId = req.session["user_id"]
  let shorturl = req.params.shortURL
  if(userId){
    const userIdDatabase = getUrlDatabaseFromUserId(urlDatabase, userId)
    if(userIdDatabase[shorturl]){
      delete urlDatabase[shorturl];
      res.redirect("/urls");
    }else{
      res.send("You are not authorized to perform this function")
    }
  }else{
    console.log("Delete fail!Redirect to login")
    res.redirect("/login")
  }
  
})

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});
