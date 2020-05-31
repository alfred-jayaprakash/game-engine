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
import {Link} from 'react-router-dom';
import GameEngine from '../utils/GameEngine';

const JoinScreen = props => {
  const [room, setRoom] = useState ('');
  const [user, setUser] = useState ('');
  const [error, setError] = useState ('');
  const [roomValidated, setValidated] = useState (false);
  const {history} = props;

  const onSubmit = () => {
    if (!roomValidated) {
      //That means room is being verified
      if (room === '') {
        return setError ('Room ID cannot be empty');
      }
      setValidated (true); //Let's assume it is validated now
    } else {
      if (user === '') {
        return setError ('Username cannot be empty');
      }

      //Now connect to the game server
      GameEngine.join (user, room, (error, data) => {
        if (error) {
          setError (error);
        } else {
          history.push ('/game');
        }
      });
    }
  };

  return (
    <Container className="container h-100">

      {error !== '' &&
        <Row>
          <Col className="col-12">
            <Alert color="danger">{error}</Alert>
          </Col>
        </Row>}

      <Row className="row h-100 justify-content-center align-items-center">
        <Col className="col-12">
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
            <Link to="/admin">Admin click herenp </Link>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default JoinScreen;
