const request = require ('supertest');
const app = require ('../app');
const gameroom = require ('../utils/gameroom');

let roomId;

describe ('Integration tests', () => {
  beforeAll (() => {
    let room = gameroom.createRoom ('Jest');
    room.users = [
      {
        id: 1,
        username: 'test',
        room: 'Jest',
        score: 0,
      },
    ];
  });

  it ('Should get all the rooms available', async () => {
    const response = await request (app).get ('/rooms').send ({}).expect (200);
    expect (response.body).toBeTruthy (); //Response data is not empty
    expect (response.body).toHaveLength (1); //List of rooms should be only one
    expect (response.body[0].room).toEqual ('Jest'); //Room name should be Jest
    //Room ID is 6 digits
    roomId = response.body[0].id;
    expect (roomId).toBeGreaterThan (100000);
    expect (roomId).toBeLessThan (1000000);
  });

  it ('Should get a room by ID', async () => {
    const response = await request (app)
      .get ('/rooms/' + roomId)
      .send ({})
      .expect (200);
    expect (response.body.data).toBeTruthy (); //Response data is not empty
    expect (response.body.data.roomname).toEqual ('Jest'); //Room name should be Jest
    expect (response.body.data.id).toEqual (roomId);
  });

  it ('Should not get invalid Room ID', async () => {
    const response = await request (app)
      .get ('/rooms/100000')
      .send ({})
      .expect (200);
    expect (response.body.data).toBeFalsy (); //Response data should be empty
    expect (response.body.error).toBeTruthy (); //Should get error
  });

  it ('Should create a new room', async () => {
    const response = await request (app)
      .post ('/rooms')
      .send ({
        room: 'New Room',
        config: {
          category: 'office',
          questions: 5,
        },
      })
      .expect (200);
    expect (response.body.id).toBeTruthy (); //Room ID should be present
    expect (response.body.id).not.toBeNaN (); //Room ID should be a number
    expect (response.body.id).not.toBe (roomId); //SHould not be same as before
    expect (response.body.roomname).toBe ('New Room'); //Should get New Room
  });

  it ('Should return error for existing user', async () => {
    const response = await request (app)
      .get ('/rooms/' + roomId + '/user/test')
      .expect (200);
    expect (response.body.error).toBeTruthy (); //Error should be present
    expect (response.body.data).toBeFalsy (); //Data should not be present
  });

  it ('Should return data for new user', async () => {
    const response = await request (app)
      .get ('/rooms/' + roomId + '/user/test1')
      .expect (200);
    expect (response.body.data).toBeTruthy (); //Data should be present
    expect (response.body.error).toBeFalsy (); //Error should not be present
  });
});
