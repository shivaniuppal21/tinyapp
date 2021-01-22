const {assert} = require('chai');
const bcrypt = require('bcrypt');


const {generateRandomString, emailExists, passwordMatching, fetchUser, getUrlDatabaseFromUserId} = require('../helpers/useHelpers');

const testUsers = {
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
const urlDatabase = {
  b6UTxQ: {longURL: 'https://www.tsn.ca', userID: 'userRandomID'},
  i3BoGr: {longURL: 'https://www.google.ca', userID: 'user2RandomID'},
};

describe('generateRandomString', function() {
  it('should return a string with six characters', function() {
    const randomStringLength = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(randomStringLength, expectedOutput);
  });

  it('should not return the same string when called multiple times', function() {
    const firstRandomString = generateRandomString();
    const secondRandomString = generateRandomString();
    assert.notEqual(firstRandomString, secondRandomString);
  });
});

describe('emailExists', function() {
  it('return true if email corresponds to a user in the database', function() {
    const existingEmail = emailExists(testUsers, 'user@example.com');
    const expectedOutput = true;
    assert.equal(existingEmail, expectedOutput);
  });

  it('should return false if email does not correspond to a user in the database', function() {
    const nonExistantEmail = emailExists(testUsers, 'false.email@test.com');
    const expectedOutput = false;
    assert.equal(nonExistantEmail, expectedOutput);
  });
});

describe('fetchUser', function() {
  it('should return a user with a valid email', function() {
    const user = fetchUser(testUsers, 'user@example.com');
    const expectedOutput = testUsers['userRandomID'];
    assert.deepEqual(user, expectedOutput);
  });

  it('should return null when no user exists for a given email address', function() {
    const user = fetchUser(testUsers, 'me@test.com');
    const expectedOutput = null;
    assert.equal(user, expectedOutput);
  });
});

describe('getUrlDatabaseFromUserId', function() {
  it('should return an object of url information specific to the given user ID', function() {
    const specificUrls = getUrlDatabaseFromUserId(urlDatabase, 'userRandomID');
    const expectedOutput = {
      b6UTxQ: {longURL: 'https://www.tsn.ca', userID: 'userRandomID'},
    };
    assert.deepEqual(specificUrls, expectedOutput);
  });

  it('should return an empty object if no urls exist for a given user ID', function() {
    const noSpecificUrls = getUrlDatabaseFromUserId(urlDatabase, 'fakeUser');
    const expectedOutput = null;
    assert.deepEqual(noSpecificUrls, expectedOutput);
  });
});


describe('passwordMatching', function() {
  it('should return a true with encrypted password match', function() {
    const ret = passwordMatching(testUsers, 'user@example.com', 'purple-monkey-dinosaur');
    const expectedOutput = true;
    assert.equal(ret, expectedOutput);
  });

  it('should return false with no password match', function() {
    const ret = passwordMatching(testUsers, 'user@example.com', 'purple-monkey-dinosau');
    const expectedOutput = false;
    assert.equal(ret, expectedOutput);
  });
});
