// require syntax
const Unsplash = require ('unsplash-js').default;
const toJson = require ('unsplash-js').toJson;
const fetch = require ('node-fetch');
global.fetch = fetch;

const API_ACCESS_KEY = process.env.UNSPLASH_API_ACCESS_KEY;
const unsplash = new Unsplash ({accessKey: API_ACCESS_KEY});

const getPhotos = (query, count) => {
  return new Promise ((resolve, reject) => {
    unsplash.photos
      .getRandomPhoto ({query, count}) //Get photos by our personal collections
      .then (toJson)
      .then (unsplashPhotos => {
        let photos_arr = [];
        if (unsplashPhotos) {
          unsplashPhotos.forEach (photo => {
            if (photo && photo.urls && photo.urls.small) {
              photos_arr.push (photo.urls.small);
            }
          });
          resolve (photos_arr);
        }
      })
      .catch (err => reject (err));
  });
};

module.exports = {
  getPhotos,
};
