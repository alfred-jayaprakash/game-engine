import React, {useState} from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
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
  const history = useHistory ();

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
    <Container
      className="d-flex flex-column justify-content-center bg-dark text-white vertical-center"
      fluid={true}
    >
      <Row>
        <Col>
          <h2>Game.Ninja</h2>
        </Col>
      </Row>
      {error !== '' &&
        <Row><Col><Alert color="danger">{error}</Alert></Col></Row>}
      <Form>
        <Row>
          <Col>
            <FormGroup>
              <Input
                className="form-control form-control-lg"
                type="text"
                name="gameRoom"
                id="gameRoom"
                placeholder="Game Room ID"
                onChange={e => setRoom (e.target.value)}
                disabled={roomValidated}
              />
            </FormGroup>
          </Col>
        </Row>
        {roomValidated &&
          <Row>
            <Col>
              <FormGroup>
                <Input
                  className="form-control form-control-lg"
                  type="text"
                  name="gameUser"
                  id="gameUser"
                  placeholder="Your Name"
                  onChange={e => setUser (e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>}
        <Row>
          <Col>
            <FormGroup>
              <Button
                color="info"
                onClick={onSubmit}
                className="btn-lg btn-block"
              >
                {roomValidated ? 'Join' : 'Next'}
              </Button>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <Link to="/admin">Admins click here</Link>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default JoinScreen;
