import React, {useState, useEffect} from 'react';
import {Container, Row, Col, Spinner} from 'reactstrap';
import GameEngine from '../utils/GameEngine';
import GameUser from '../components/GameUser';

const GameScreen = props => {
  const [users, setUsers] = useState ([]);

  useEffect (() => {
    GameEngine.connect ();
    GameEngine.registerForRoomNotifications (data => {
      if (data && data.users) setUsers (data.users);
    });
  });

  return (
    <Container>
      <Row className="row h-100 justify-content-center align-items-center">
        <Col className="col-2">
          <Spinner color="primary" />
        </Col>
        <Col className="col-10">
          Waiting for other players to join ...
        </Col>
      </Row>
      <Row className="row h-100 justify-content-center align-items-center">
        <Col>
          {users.forEach (user => <GameUser user={user} />)}
        </Col>
      </Row>
    </Container>
  );
};

export default GameScreen;
