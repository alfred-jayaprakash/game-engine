import React, {useState} from 'react';
import {
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
  const [gameScores, setGameScores] = useState ([]);

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
      console.log ('Received updated roomdata in AdminScreen', data);
      if (data && data.users) {
        setUsers (data.users);
      }
    });

    GameEngine.registerForGameStatus (data => {
      console.log ('Received game status change in AdminScreen', data);
      if (data && data.status) {
        setGameStatus (data.status);
      }

      if (data && data.scores) {
        setGameScores (data.scores);
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
    <div>
      <Row>
        <Col>
          <h4 className="text-light">Join Game ID: {props.room}</h4>
        </Col>
      </Row>
      <Row>
        <Col>
          {gameStatus === WAITING_STATUS &&
            <Button
              color="success"
              className="btn-lg btn-block"
              onClick={handleStart}
            >
              Start Game
            </Button>}
          {gameStatus === GAME_START &&
            <Button
              color="danger"
              className="btn-lg btn-block"
              onClick={handleEnd}
            >
              Stop Game
            </Button>}
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
                  {gameStatus === WAITING_STATUS &&
                    users.map (user => (
                      <tr key="{user.id}">
                        <td>{user.username}</td>
                      </tr>
                    ))}

                  {(gameStatus === GAME_START || gameStatus === GAME_END) &&
                    gameScores.map (({user, score}) => (
                      <tr key="{user.id}">
                        <td>{user}</td>
                        <td>{score}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </ToastBody>
          </Toast>
        </Col>
      </Row>
    </div>
  );
};

export default AdminGamePanel;
