import React, {useState} from 'react';
import {Container, Row, Col, Spinner} from 'reactstrap';
import GameEngine from '../utils/GameEngine';

let initialized = false;

const GameScreen = props => {
  // eslint-disable-next-line
  const [users, setUsers] = useState ([]);

  if (!initialized) {
    GameEngine.connect ();
    GameEngine.registerForRoomNotifications (data => {
      if (data && data.users) {
        setUsers (data.users);
      }
    });

    GameEngine.registerForGameStart (data => {});
    initialized = true;
  }

  return (
    <Container>
      <Row className="row h-100 justify-content-center align-items-center">
        <Col className="col-2">
          <Spinner color="primary" />
        </Col>
        <Col className="col-10">
          Waiting for game to begin ...
        </Col>
      </Row>
    </Container>
  );
};

export default GameScreen;
