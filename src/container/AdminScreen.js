import React, {useState, useEffect} from 'react';
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Table,
  Toast,
  ToastHeader,
  ToastBody,
} from 'reactstrap';
import AdminUserScreen from './AdminUserScreen';
import GameEngine from '../utils/GameEngine';

let initialized = false;

const AdminScreen = props => {
  const [room, setRoom] = useState ('');
  const [error, setError] = useState ('');

  if (!initialized) {
    GameEngine.connect ();
    initialized = true;
  }

  const onCreateRoom = () => {
    GameEngine.createRoom ('New Game', (error, data) => {
      if (error) {
        return setError (error);
      }
      setRoom (data);
    });
  };

  return (
    <Container>
      {error !== '' &&
        <Row>
          <Col>
            <Alert color="danger">{error}</Alert>
          </Col>
        </Row>}
      <Row>
        <Col>
          <Button color="success" onClick={onCreateRoom}>Create Room</Button>
        </Col>
      </Row>
      {room &&
        <Row>
          <Col>
            <AdminUserScreen room={room.id} error={error => setError (error)} />
          </Col>
        </Row>}
    </Container>
  );
};

export default AdminScreen;
