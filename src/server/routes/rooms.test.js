const request = require ('supertest');
const app = require ('../app');

test ('Should get all the rooms available', async () => {
  const response = await request (app).get ('/rooms').send ({}).expect (200);
});
