'use strict';

const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const hbs = require('hbs');
// const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// create app
const app = express();

// -- setup the app
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));
hbs.registerPartials(path.join(__dirname, '/views/partials'));

// configure middlewares (static, session, cookies, body, ...)
app.use(express.static('public'));
//  app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log('REQUEST:', req.method, req.path);
  next();
});

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret
});

// Retrieve an access token.
spotifyApi.clientCredentialsGrant()
  .then(function (data) {
    spotifyApi.setAccessToken(data.body['access_token']);
  }, function (err) {
    console.log('Something went wrong when retrieving an access token', err);
  });

app.get('/', (req, res, next) => {
  res.render('home-page');
});

// search artist
app.get('/artists', (req, res, next) => {
  const artist = req.query.artist;
  spotifyApi.searchArtists(artist)
    .then(result => {
      const data = {
        artist: result.body.artists.items
      };
      // console.log(result.body.artists.items);
      res.render('artists', data);
    })
    .catch(next);
});

// see albums from selected artist
app.get('/albums/:artistId', (req, res, next) => {
  const artistId = req.params.artistId;
  // console.log(artistId);
  spotifyApi.getArtistAlbums(artistId)
    .then(result => {
      const data = {
        album: result.body.items
      };
      // console.log(data.album[0].name);
      res.render('albums', data);
    })
    .catch(next);
});

// Get tracks in an album
app.get('/album/:id', (req, res, next) => {
  const albumId = req.params.id;
  // console.log(albumId);
  spotifyApi.getAlbumTracks(albumId)
    .then(result => {
      const data = {
        track: result.body.items
      };
      res.render('tracks', data);
    })
    .catch(next);
});

// -- 404 and error handler

// NOTE: requires a views/not-found.ejs template
app.use((req, res, next) => {
  res.status(404);
  res.render('not-found');
});

// NOTE: requires a views/error.ejs template
app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500);
    res.render('error');
  }
});

app.listen(3000, () => console.log('hello, connected to 3000'));
