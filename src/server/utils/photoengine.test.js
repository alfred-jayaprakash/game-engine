const {getPhotos} = require ('./photoengine');

let roomId;

describe ('Integration tests', () => {
  beforeAll (() => {
    // Arrange
    jest.unmock ('unsplash-js');
  });

  it ('Should get all photos', async done => {
    let photos = await getPhotos ('office', 5);
    expect (photos).toBeTruthy ();
    expect (photos.length).toEqual (5);
    done ();
  });
});
