import React, {useState, useEffect} from 'react';
import {
  Container,
  Row,
  Col,
  Spinner,
  Button,
  Table,
  Toast,
  ToastHeader,
  ToastBody,
} from 'reactstrap';
import GameEngine from '../utils/GameEngine';

let initialized = false;

const AdminUserScreen = props => {
  const [users, setUsers] = useState ([]);

  if (!initialized) {
    console.log ('Trying to join room ', props.room);
    GameEngine.connect ();
    GameEngine.join ('admin', props.room, (error, data) => {
      if (error) {
        console.log (error);
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
      <Row>
        <Col>
          <Button color="success">Start Game</Button>
          {'  '}
          <Button color="danger">End Game</Button>
        </Col>
      </Row>
      <Row>
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

export default AdminUserScreen;
