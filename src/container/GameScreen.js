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
const GAME_PROGRESS = 'run';
// eslint-disable-next-line
const GAME_END = 'end';

const GameScreen = props => {
  // eslint-disable-next-line
  const [users, setUsers] = useState ([]);
  const [error, setError] = useState ('');
  const [gameStatus, setGameStatus] = useState (WAITING_STATUS);
  const [gameState, setGameState] = useState ('');
  const [answers, setAnswers] = useState ([]);

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
        console.log (data.state);
        setGameState (data.state);
      }
    });
    initialized = true;
  }

  const onAnswer = answer => {
    console.log ('Received answer =', answer);
    if (answers.indexOf (answer) !== -1) {
      return console.log ('Word already guessed');
    }
    answers.push (answer);
    setAnswers (answers);
    GameEngine.sendGameStatus (
      {
        room: props.room,
        status: GAME_PROGRESS,
        state: {
          response: answer,
        },
      },
      data => {
        console.log ('Receive Game progress change response');
      }
    );
  };

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
        <Container className="centered-form border-primary">
          <Row>
            <Col>
              <StatusPanel />
            </Col>
          </Row>
          <Row>
            <Col>
              <ScorePanel />
            </Col>
          </Row>
          <Row>
            <Col>
              <GamePanel imgsrc="/images/image1.jpg" onAnswer={onAnswer} />
            </Col>
          </Row>
          <Row>
            <Col>
              <MessagePanel data={answers} />
            </Col>
          </Row>
          <Row>
            <Col>
              <ControlPanel />
            </Col>
          </Row>
        </Container>}
    </div>
  );
};

export default GameScreen;
