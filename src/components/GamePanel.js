import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  useLayoutEffect,
} from 'react';
import {
  Row,
  Col,
  Card,
  CardImg,
  CardBody,
  Button,
  Input,
  Form,
  FormGroup,
  ListGroup,
  ListGroupItem,
  Badge,
  FormText,
} from 'reactstrap';

import GameEngine from '../utils/GameEngine';

function reducer (answers, action) {
  switch (action.type) {
    case 'add':
      //console.log ('add state called in reducer');
      return [...answers, action.payload];
    case 'update':
      //console.log ('update state called in reducer');
      return action.payload;
    case 'clear':
      //console.log ('clear state called in reducer');
      return [];
    default:
      throw new Error ('Unknown action');
  }
}

//
// Main Game Panel
// Props: Current Image
//
const GamePanel = props => {
  const [currentAnswer, setCurrentAnswer] = useState ('');
  //const [answers, setAnswers] = useState ([]);
  const [error, setError] = useState ('');
  const gameStateRef = useRef ({});
  const [answers, dispatch] = useReducer (reducer, []);

  //
  // One-time Initialization
  //
  useEffect (() => {
    GameEngine.registerForGameStateUpdates (state_data =>
      handleGameStateChange (state_data)
    );
    return () => {}; //TODO: Remove socket.io state_data listener
  }, []);

  //
  // Logic to clear the answers whenever there is a new image
  //
  useEffect (
    () => {
      //Clear all the user answers
      dispatch ({type: 'clear'});
      setCurrentAnswer ('');
      setError ('');
      return () => {
        //Clear all the user answers
        dispatch ({type: 'clear'});
      };
    }, // eslint-disable-next-line
    [props.currentImage]
  );

  //
  // Logic to handle hits whenever another user guess same words as us
  //
  useLayoutEffect (
    () => {
      //console.log ('useEffect to update scores has been triggered');
      if (gameStateRef && gameStateRef.current) {
        let state_data_answer = gameStateRef.current.answer;
        let users = gameStateRef.current.users;
        let receivedRef = gameStateRef.current.ref;

        if (state_data_answer && receivedRef === props.currentRef) {
          let newAnswers = answers.map (value => {
            //Update the Answers with new count
            if (
              value.answer.toLowerCase () === state_data_answer.toLowerCase ()
            ) {
              value.count = users.length; //Preserve the new count
            }
            return value;
          });
          dispatch ({type: 'update', payload: newAnswers});
        }
      }
      return () => {};
    }, // eslint-disable-next-line
    [gameStateRef.current]
  );

  const handleGameStateChange = state_data => {
    //One-time initialization
    // console.log (
    //   'Received game state change with hits from server in GamePanel',
    //   state_data
    // );
    if (state_data) {
      //setGameState (state_data);
      gameStateRef.current = state_data;
    }
  };

  const handleSubmit = e => {
    if (currentAnswer === '') {
      return setError ('Guess cannot be empty');
    }
    if (currentAnswer.length < 2) {
      return setError ('Guess is too short');
    }
    if (currentAnswer.length > 20) {
      return setError ('Guess cannot be longer than 20');
    }

    if (
      answers.findIndex (
        value => currentAnswer.toLowerCase () === value.answer.toLowerCase ()
      ) !== -1
    ) {
      return setError ('Word already guessed');
    }

    // setAnswers ([
    //   ...answers,
    //   {
    //     answer: currentAnswer.toLowerCase (),
    //     count: 1,
    //   },
    // ]);
    dispatch ({
      type: 'add',
      payload: {answer: currentAnswer.toLowerCase (), count: 1},
    });

    props.onAnswer (currentAnswer.toLowerCase ());
    setError ('');
    setCurrentAnswer ('');
  };

  return (
    <div>
      <Row>
        <Col>
          <Card>
            <CardImg
              top
              width="256"
              height="256"
              src={props.currentImage}
              alt="Game Image"
            />
            <CardBody>
              <Form>
                <FormGroup>
                  <Input
                    className="form-control form-control-lg"
                    type="text"
                    name="answer"
                    id="userAnswer"
                    placeholder="Type your word"
                    value={currentAnswer}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault ();
                        handleSubmit (e);
                      }
                    }}
                    onChange={e => setCurrentAnswer (e.target.value)}
                    invalid={error !== ''}
                  />
                  {error !== '' && <FormText color="danger">{error}</FormText>}
                </FormGroup>
                <FormGroup>
                  <Button
                    type="button"
                    color="info"
                    className="btn-lg btn-block"
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </FormGroup>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <ListGroup>
            {answers.map (({answer, count}) => (
              <ListGroupItem key={answer} className="bg-light text-dark p-2">
                <div className="d-flex bd-highlight">
                  <div className="p-2 flex-grow-1 bd-highlight">{answer}</div>
                  <div className="p-2 bd-highlight">
                    <Badge color={count > 1 ? 'info' : 'secondary'}>
                      {count}
                    </Badge>
                  </div>
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </div>
  );
};

export default GamePanel;
