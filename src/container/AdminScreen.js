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
import GameEngine from '../utils/GameEngine';

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
          <Col>
            <Alert color="danger">{error}</Alert>
          </Col>
        </Row>}
      <Row>
        <Col>
          <Button color="success">Start Game</Button>
          {'  '}
          <Button color="danger">End Game</Button>
        </Col>
      </Row>
      <Row>
        <Col>
          {'  '}
        </Col>
      </Row>
      <Row className="row h-100">
        <Col>
          <Toast className="mb-2">
            <ToastHeader icon={<Spinner size="sm" />}>
              Waiting for other players to join ...
            </ToastHeader>
            <ToastBody>
              <Table size="sm">
                <tbody>
                  {users.map (user => (
                    <tr>
                      <td>{user.username}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </ToastBody>
          </Toast>
        </Col>
      </Row>

    </Container>
  );
};

export default AdminScreen;
