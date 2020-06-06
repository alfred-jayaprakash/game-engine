import React, {useState} from 'react';
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

const WAITING_STATUS = 'wait';
const GAME_START = 'start';
const GAME_END = 'end';

const AdminGamePanel = props => {
  const [users, setUsers] = useState ([]);
  const [gameStatus, setGameStatus] = useState (WAITING_STATUS);

  if (!initialized) {
    //setRoom (props.room);
    console.log ('Trying to join room ', props.room);
    GameEngine.connect ();
    GameEngine.join ('Game Admin', props.room, (error, data) => {
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

    GameEngine.registerForGameStatus (data => {
      console.log ('Received game status change in AdminScreen', data);
      if (data && data.status) {
        setGameStatus (data.status);
      }
    });

    initialized = true;
  }

  const handleStart = () => {
    GameEngine.sendGameStatus ({room: props.room, status: GAME_START}, data => {
      console.log ('Receive Game status change response');
    });
  };

  const handleEnd = () => {
    setGameStatus (GAME_END);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h2>Game Room ID: {props.room}</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button color="success" onClick={handleStart}>Start Game</Button>
          <Button color="danger" onClick={handleEnd}>End Game</Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Toast>
            <ToastHeader icon={<Spinner size="sm" />}>
              {gameStatus === WAITING_STATUS &&
                <div>Waiting for other players to join ...</div>}
              {gameStatus === GAME_START && <div>Game started</div>}
              {gameStatus === GAME_END && <div>Game ended</div>}
            </ToastHeader>
            <ToastBody>
              <Table>
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

export default AdminGamePanel;
