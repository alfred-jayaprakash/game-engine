import React, {useState, useEffect, useRef} from 'react';
import {useHistory} from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Toast,
  ToastHeader,
  ToastBody,
  Table,
} from 'reactstrap';
import GameEngine from '../utils/GameEngine';
import ScorePanel from '../components/ScorePanel';
import GamePanel from '../components/GamePanel';

const {
  GAME_START,
  GAME_PROGRESS,
  GAME_END,
  GAME_STOP,
} = require ('../utils/GlobalConfig');

const WAITING_STATUS = 'wait';
const REDIRECT_TIMEOUT = 3000;

const GameScreen = props => {
  const [error, setError] = useState ('');
  const [gameStatus, setGameStatus] = useState (WAITING_STATUS);
  const [score, setScore] = useState (0);
  const [currentImage, setCurrentImage] = useState ('');

  const duration = useRef (30);
  const currentRef = useRef ('');
  const counter = useRef (0);
  const gameMetaDataRef = useRef ([]);
  const gameScores = useRef ([]);

  const history = useHistory ();

  //
  // One-time Initialization
  //
  useEffect (() => {
    //Defensive code
    initialize ();
    return () => {}; // eslint-disable-next-line
  }, []);

  const initialize = () => {
    //Following state values set by calling function in Join Screen
    let user = props.location.state.user;
    let room = props.location.state.room;

    console.log ('Joining as ', user, 'to room =', room);
    GameEngine.connect ();
    GameEngine.join (user, parseInt (room), (error, data) => {
      if (error) {
        setError (error + '. Redirecting ...');
        setTimeout (() => {
          history.push ({
            pathname: '/',
            state: {},
          });
        }, REDIRECT_TIMEOUT);
      } else {
        //setUsers (data);
      }
    });

    GameEngine.registerForRoomNotifications (data => {
      console.log ('Received updated user list in GameScreen', data);
      // if (data && data.users) {
      //   setUsers (data.users);
      // }
    });

    GameEngine.registerForGameStatus (data => {
      console.log ('Received game status data in GameScreen', data);
      if (data) {
        if (data.status) setGameStatus (data.status);
        if (data.state) {
          gameMetaDataRef.current = data.state;
          if (data.state.length > 0) {
            console.log (
              'Setting first image ',
              counter.current,
              data.state[counter.current].url
            );
            setCurrentImage (data.state[counter.current].url);
            currentRef.current = data.state[counter.current].ref;
          }
        }
        if (data.config && data.config.time) {
          duration.current = data.config.time;
        }
        if (data.scores) {
          let userScoreData = data.scores.find (
            user => user.user === props.location.state.user
          ); //Find my own score
          setScore (userScoreData.score); //And set it
          gameScores.current = data.scores;
        }
      }
    });
  };

  //
  // When user answers
  //
  const onAnswer = answer => {
    console.log ('Received answer =', answer);
    GameEngine.sendGameStatus (
      {
        room: props.location.state.room,
        status: GAME_PROGRESS,
        state: {
          ref: currentRef.current,
          response: answer,
        },
      },
      data => {
        console.log ('Receive Game progress change response');
      }
    );
  };

  //
  // Timer complete
  //
  const onTimeOver = () => {
    counter.current++; //Increment the counter
    console.log ('Timer has ended. Resetting time:', counter.current);
    let gameMetaData = gameMetaDataRef.current;
    if (counter.current < gameMetaData.length) {
      let newMetaData = gameMetaData[counter.current];
      currentRef.current = newMetaData.ref;
      console.log (
        'Switching to next image ',
        counter.current,
        newMetaData.url
      );
      setCurrentImage (newMetaData.url); //Set the contents to the next data
    } else {
      console.log ('Finished all the questions. Closing');
      setGameStatus (GAME_END);
      GameEngine.sendGameStatus (
        {
          room: props.location.state.room,
          status: GAME_END,
        },
        data => {
          console.log ('Receive Game end response');
        }
      );
    }
  };

  return (
    <Container
      className="flex-column justify-content-center bg-dark text-light vertical-center"
      fluid={true}
    >
      {error !== '' &&
        <Row><Col><Alert color="danger">{error}</Alert></Col></Row>}
      {gameStatus === WAITING_STATUS &&
        <Row>
          <Col>
            <Toast>
              <ToastHeader
                className="text-primary"
                icon={<Spinner size="sm" />}
              >
                Waiting ...
              </ToastHeader>
              <ToastBody id="waitMsg" className="text-dark">
                Please wait for other players to join
              </ToastBody>
            </Toast>
          </Col>
        </Row>}

      {(gameStatus === GAME_START || gameStatus === GAME_PROGRESS) &&
        <div>
          <ScorePanel score={score} />
          <GamePanel
            duration={duration.current}
            currentImage={currentImage}
            currentRef={currentRef.current}
            onAnswer={onAnswer}
            onTimeOver={onTimeOver}
          />
        </div>}

      {(gameStatus === GAME_END || gameStatus === GAME_STOP) &&
        <div className="p-3 my-2 rounded bg-docs-transparent-grid text-dark">
          <Toast>
            <ToastHeader>
              Your final score is {score}
            </ToastHeader>
            <ToastBody>
              <Table>
                <tbody>
                  {gameScores.current.map (({user, score}) => (
                    <tr key={user}>
                      <td>{user}</td>
                      <td>{score}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </ToastBody>
          </Toast>
        </div>}
    </Container>
  );
};

export default GameScreen;
