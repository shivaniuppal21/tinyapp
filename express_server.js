const express = require("express");
const PORT = 8080; // default port 8080
const morgan = require('morgan'); // HTTP request logger middleware for node.js
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
// tells express to use ejs as templating
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan('dev'));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// generates a random id 
function generateRandomString() {
  var result           = '';
  var char       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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


  app.get("/u/:shortURL", (req, res) => {
    
    res.redirect( urlDatabase[req.params.shortURL])
  });

  app.get("/urls/:shortURL", (req, res) => {
    const username = req.cookies["username"];
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] ,username };
    res.render("urls_show", templateVars);
  });

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

