import React, {useState} from 'react';
import axios from 'axios';
import {Container, Row, Col, Alert, Button} from 'reactstrap';
import AdminUserScreen from './AdminUserScreen';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || '/';

const AdminScreen = props => {
  const [room, setRoom] = useState ('');
  const [error, setError] = useState ('');

  const onCreateRoom = e => {
    console.log ('URL to connect is ', SERVER_URL);
    axios.post (SERVER_URL + '/rooms', {room: 'New Room'}).then (res => {
      if (res.data) {
        setRoom (res.data);
      }
    });
  };

  return (
    <Container className="centered-form">
      {error !== '' &&
        <Row>
          <Col>
            <Alert color="danger">{error}</Alert>
          </Col>
        </Row>}
      {room === '' &&
        <Row>
          <Col>
            <Button color="success" onClick={onCreateRoom}>Create Room</Button>
          </Col>
        </Row>}
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
