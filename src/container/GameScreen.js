import React, {useState} from 'react';
import {Container, Row, Col, Spinner, Alert} from 'reactstrap';
import GameEngine from '../utils/GameEngine';
import ControlPanel from '../components/ControlPanel';
import StatusPanel from '../components/StatusPanel';
import ScorePanel from '../components/ScorePanel';
import GamePanel from '../components/GamePanel';
// eslint-disable-next-line
import UserPanel from '../components/UserPanel';
import MessagePanel from '../components/MessagePanel';

let initialized = false;

const WAITING_STATUS = 'wait';
const GAME_START = 'start';
// eslint-disable-next-line
const GAME_END = 'end';

const GameScreen = props => {
  const [users, setUsers] = useState ([]);
  const [error, setError] = useState ('');
  const [gameStatus, setGameStatus] = useState (WAITING_STATUS);

  //One-time initialization
  if (!initialized) {
    //Following state values set by calling function in Join Screen
    let user = props.location.state.user;
    let room = props.location.state.room;

    console.log ('Joining as ', user, 'to room =', room);
    GameEngine.connect ();
    GameEngine.join (user, parseInt (room), (error, data) => {
      if (error) {
        setError (error);
      } else {
        setUsers (data);
      }
    });

    GameEngine.registerForRoomNotifications (data => {
      console.log ('Received updated user list in GameScreen', data);
      if (data && data.users) {
        setUsers (data.users);
      }
    });

    GameEngine.registerForGameStatus (data => {
      console.log ('Received game status change in GameScreen', data);
      if (data && data.status) {
        setGameStatus (data.status);
      }
    });
    initialized = true;
  }

  return (
    <div>
      {error !== '' && <Alert color="danger">{error}</Alert>}
      {gameStatus === WAITING_STATUS &&
        <Container className="centered-form border-primary">
          <Row className="centered.form__box">
            <Col>
              <Spinner color="primary" />
              Waiting for game to begin ...
            </Col>
          </Row>
        </Container>}

      {gameStatus === GAME_START &&
        <Container>
          <Row className="centered.form__box">
            <Col>
              <StatusPanel />
            </Col>
          </Row>
          <Row className="centered.form__box">
            <Col>
              <ScorePanel />
            </Col>
          </Row>
          <Row className="centered.form__box">
            <Col>
              <GamePanel />
            </Col>
          </Row>
          <Row className="centered.form__box">
            <Col>
              <ControlPanel />
            </Col>
          </Row>
          <Row className="centered.form__box">
            <Col>
              <MessagePanel />
            </Col>
          </Row>
        </Container>}
    </div>
  );
};

export default GameScreen;
