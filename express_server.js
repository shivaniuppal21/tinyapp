// Requirements
const express = require('express');
const PORT = 8080; // default port 8080
const morgan = require('morgan'); // HTTP request logger middleware for node.js
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
// helper functions
const {generateRandomString, emailExists, passwordMatching, fetchUser, getUrlDatabaseFromUserId} = require('./helpers/useHelpers');
const app = express();
app.set('view engine', 'ejs'); // tells express to use ejs as templating
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan('dev'));
app.use(methodOverride('_method'));
app.use(
    cookieSession({
      name: 'session',
      keys: ['key1', 'key2'],
    }),
);
// datatbases
const urlDatabase = {
  b6UTxQ: {longURL: 'https://www.tsn.ca', userID: 'userRandomID'},
  i3BoGr: {longURL: 'https://www.google.ca', userID: 'user2RandomID'},
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10),
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk', 10),
  },
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});


app.get('/urls', (req, res) => {
  if (req.session['user_Id']) {
    const user_Id = req.session['user_Id'];
    const urls_uderid = getUrlDatabaseFromUserId(urlDatabase, user_Id);
    const templateVars = {urls: urls_uderid, user: users[user_Id]};
    res.render('urls_index', templateVars);
  } else {
    const user_Id = req.session['user_Id'];
    const templateVars = {user: users[user_Id]};
    res.render('redirect_login', templateVars);
  }
});

app.get('/urls/new', (req, res) => {
  if (req.session['user_Id']) {
    const user_Id = req.session['user_Id'];
    const templateVars = {user: users[user_Id]};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/u/:shortURL', (req, res) => {
  res.redirect( urlDatabase[req.params.shortURL].longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  const user_Id = req.session['user_Id'];
  console.log(user_Id);
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[user_Id]};
  res.render('urls_show', templateVars);
});

// will show a form to login
app.get('/register', (req, res) => {
  const user_Id = req.session['user_Id'];
  const templateVars = {user: users[user_Id]};
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const incomingEmail = req.body.email;
  const incomingPassword = req.body.password;
  const userid = generateRandomString();

  if (!incomingEmail || !incomingPassword) {
    res.statusCode = 400;
    res.send('Incorrect username or password');
    return;
  }
  // We should check if email exists
  if (emailExists(users, incomingEmail)) {
    res.send('An account already exists for this email address');
    return;
  } else {
    // If not, we want to add the new user data to the database
    const newUser = {
      id: userid,
      email: incomingEmail,
      password: bcrypt.hashSync(incomingPassword, 10),
    };
    users[userid] = newUser;
    // redirect them to home with cookie if everything was ok
    // res.cookie("user_Id",userid)
    // res.redirect('/')
    // redirect them to login if everything was ok
    res.redirect('/urls');
  }
});

app.put('/urls', (req, res) => {
  const longUrl = req.body.longURL;
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {};
  urlDatabase[shortUrl].userID = req.session['user_Id'];
  urlDatabase[shortUrl].longURL = longUrl;
  res.redirect('/urls/'+shortUrl);
});
// edit route to update a url resourse
app.post('/urls/:shortURL', (req, res) => {
  const userId = req.session['user_Id'];
  const newlongUrl = req.body.longURL;
  const shorturl = req.params.shortURL;
  if (userId) {
    const userIdDatabase = getUrlDatabaseFromUserId(urlDatabase, userId);
    if (userIdDatabase[shorturl]) {
      urlDatabase[shorturl].longURL = newlongUrl;
      res.redirect('/urls');
    } else {
      res.send('You are not authorized to perform this function');
    }
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  const user_Id = req.session['user_Id'];
  const templateVars = {urls: urlDatabase, user: users[user_Id]};
  res.render('login', templateVars);
});


app.post('/login', (req, res) => {
  if (passwordMatching(users, req.body.email, req.body.password)) {
    const user_obj = fetchUser(users, req.body.email);
    req.session['user_Id'] = user_obj.id;
    console.log(user_obj.id);
    res.redirect('/urls');
  } else {
    res.statusCode = 403;
    res.send('Error '+res.statusCode +' The password you entered does not match the one associated with the provided email address');
    return;
  }
});

app.post('/logout', (req, res) => {
  req.session['user_Id'] = null;
  res.redirect('/urls');
});


// DELETE /urls/:shortURL
// POST /urls/:shortURL/delete
// post requests are used to CHANGE/DELETE/UPDATE/CREATE data
app.delete('/urls/:shortURL', (req, res) => {
  const userId = req.session['user_Id'];
  const shorturl = req.params.shortURL;
  if (userId) {
    const userIdDatabase = getUrlDatabaseFromUserId(urlDatabase, userId);
    if (userIdDatabase[shorturl]) {
      delete urlDatabase[shorturl];
      res.redirect('/urls');
    } else {
      res.send('You are not authorized to perform this function');
    }
  } else {
    console.log('Delete fail!Redirect to login');
    res.redirect('/login');
  }
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});
