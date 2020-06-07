import React, {useState} from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
} from 'reactstrap';
import {Link, useHistory} from 'react-router-dom';
import axios from 'axios';
const SERVER_URL = process.env.REACT_APP_SERVER_URL || '/';

const JoinScreen = props => {
  const [room, setRoom] = useState ('');
  const [user, setUser] = useState ('');
  const [error, setError] = useState ('');
  const [roomValidated, setValidated] = useState (false);
  let history = useHistory ();

  const onSubmit = () => {
    if (!roomValidated) {
      //That means room is being verified
      if (room === '') {
        return setError ('Room ID cannot be empty');
      }
      if (room.length !== 6) {
        return setError (
          'Invalid room number. Please enter a 6-digit room number'
        );
      }
      if (isNaN (room)) {
        return setError ('Invalid room number');
      }
      const url = SERVER_URL + '/rooms/' + room;
      console.log (url);
      axios.get (url).then (res => {
        if (res.data) {
          if (res.data.error) {
            return setError (res.data.error);
          }
          setValidated (true);
        }
      });
    } else {
      if (user === '') {
        return setError ('Username cannot be empty');
      }
      const url = SERVER_URL + '/rooms/' + room + '/user/' + user;
      axios.get (url).then (res => {
        if (res.data) {
          if (res.data.error) {
            return setError (res.data.error);
          }
          console.log ('Validation successful and pushing data ', user, room);
          history.push ({
            pathname: '/game',
            state: {
              user,
              room,
            },
          });
        }
      });
    }
  };

  return (
    <Container className="centered-form border-primary">
      <Row className="centered.form__box">
        <Col className="col-lg-12">
          {error !== '' && <Alert color="danger">{error}</Alert>}
          <Form>
            <FormGroup>
              <Label for="gameRoom">Enter Game Room</Label>
              <Input
                type="text"
                name="gameRoom"
                id="gameRoom"
                placeholder="Game Room ID"
                onChange={e => setRoom (e.target.value)}
                disabled={roomValidated}
              />
            </FormGroup>
            {roomValidated &&
              <FormGroup>
                <Label for="gameRoom">Enter your name</Label>
                <Input
                  type="text"
                  name="gameUser"
                  id="gameUser"
                  placeholder="Your Screen Name"
                  onChange={e => setUser (e.target.value)}
                />
              </FormGroup>}
            <Button color="primary" onClick={onSubmit}>
              {roomValidated ? 'Join' : 'Next'}
            </Button>
            {'    '}
            <Link to="/admin">Admins click here</Link>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default JoinScreen;
