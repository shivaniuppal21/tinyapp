// Requirements
const express = require("express");
const PORT = 8080; // default port 8080
const morgan = require('morgan'); // HTTP request logger middleware for node.js
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { emailExists, passwordMatching, fetchUser } = require('./helpers/userHelpers')

const app = express();
app.set("view engine", "ejs"); // tells express to use ejs as templating
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan('dev'));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { urls: urlDatabase,username };
    res.render("urls_index", templateVars);
  });
  
  app.get("/urls/new", (req, res) => {
    const username = req.cookies["username"];
    const templateVars = {  username };
    res.render("urls_new",templateVars);
  });


  app.get("/u/:shortURL", (req, res) => {
    
    res.redirect( urlDatabase[req.params.shortURL])
  });

  app.get("/urls/:shortURL", (req, res) => {
    const username = req.cookies["username"];
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] ,username };
    res.render("urls_show", templateVars);
  });
 // will show a form to login
  app.get('/register', (req, res) => {
    res.render("register")
  });

  app.post("/register", (req, res) => {
    const incomingEmail = req.body.email
    const incomingPassword = req.body.password
    const incomingName = req.body.name
  
    // We should check if email exists
    if (emailExists(users, incomingEmail)) {
      console.log("email already exists")
      res.redirect('/register')
    } else {
      // If not, we want to add the new user data to the databaseish
      const newUser = {
        name: incomingName,
        email: incomingEmail,
        password: incomingPassword
      }
  
      userDatabaseIsh[incomingEmail] = newUser
  
      // redirect them to home with cookie if everything was ok
      // res.cookie(incomingEmail)
      // res.redirect('/')
  
      // redirect them to login if everything was ok
      console.log(users)
      res.redirect('/urls')
    }
  })
  

  app.post("/urls", (req, res) => {
      let longUrl = req.body.longURL
      let shortUrl = generateRandomString()
      urlDatabase[shortUrl] = longUrl
      res.redirect("/urls/"+shortUrl)
  });
  // route to update a url resourse
app.post("/urls/:shortURL", (req, res) => {
  let newlongUrl = req.body.longURL
  let shorturl = req.params.shortURL
  urlDatabase[shorturl] = newlongUrl
  res.redirect("/urls");
})

app.post("/login", (req, res) => {

  res.cookie("username",req.body.username)
  console.log(req.body.username)
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


// DELETE /urls/:shortURL
// POST /urls/:shortURL/delete
// post requests are used to CHANGE/DELETE/UPDATE/CREATE data 
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});
