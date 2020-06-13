import React, {useState} from 'react';
import axios from 'axios';
import {Container, Row, Col, Alert, Button, Form, FormGroup} from 'reactstrap';
import AdminGamePanel from '../components/AdminGamePanel';

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
    <Container
      className="d-flex flex-column justify-content-center bg-dark text-white vertical-center"
      fluid={true}
    >
      {error !== '' &&
        <Row>
          <Col>
            <Alert color="danger">{error}</Alert>
          </Col>
        </Row>}
      {room === '' &&
        <Form>
          <FormGroup>
            <Row>
              <Col>
                <Button
                  color="success"
                  className="btn-lg btn-block"
                  onClick={onCreateRoom}
                >
                  Create Room
                </Button>
              </Col>
            </Row>
          </FormGroup>
        </Form>}
      {room &&
        <Row>
          <Col>
            <AdminGamePanel
              room={room.id}
              error={error => setError (error)}
              server={SERVER_URL}
            />
          </Col>
        </Row>}
    </Container>
  );
};

export default AdminScreen;
