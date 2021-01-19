const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
//code for body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
// tells express to use ejs as templating
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });
  
  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });
  
  app.post("/urls", (req, res) => {
      let longUrl = req.body.longURL
      let shortUrl = generateRandomString()
      urlDatabase[shortUrl] = longUrl
      res.redirect("/urls/"+shortUrl)
  });

  app.get("/u/:shortURL", (req, res) => {
    res.redirect( urlDatabase[req.params.shortURL])
  });

  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]  };
    res.render("urls_show", templateVars);
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
