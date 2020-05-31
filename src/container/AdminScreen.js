import React, {useState, useEffect} from 'react';
import {Container, Row, Col, Spinner, Alert} from 'reactstrap';
import GameEngine from '../utils/GameEngine';
import GameUser from '../components/GameUser';

let initialized = false;

const AdminScreen = props => {
  const [users, setUsers] = useState ([]);
  const [error, setError] = useState ('');

  if (!initialized) {
    GameEngine.join ('admin', '232323', (error, data) => {
      if (error) {
        return setError (error);
      }
      setUsers (data);
    });
    GameEngine.registerForRoomNotifications (data => {
      console.log ('Received data in AdminScreen', data);
      if (data && data.users) {
        console.log ('Received non empty user list');
        setUsers (data.users);
      }
    });
    initialized = true;
  }

  useEffect (() => {
    //Do nothing for now
  });

  return (
    <Container>
      {error !== '' &&
        <Row>
          <Col className="col-12">
            <Alert color="danger">{error}</Alert>
          </Col>
        </Row>}
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
          {users.map (user => <GameUser user={user.username} />)}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminScreen;
