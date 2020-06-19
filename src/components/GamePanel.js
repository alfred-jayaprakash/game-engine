import React, {useState, useEffect} from 'react';
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
} from 'reactstrap';

import GameEngine from '../utils/GameEngine';

//
// Main Game Panel
// Props: Current Image
//
const GamePanel = props => {
  const [currentAnswer, setCurrentAnswer] = useState ('');
  // eslint-disable-next-line
  const [answers, setAnswers] = useState ([]);
  const [gameState, setGameState] = useState (null);

  //
  // One-time Initialization
  //
  useEffect (() => {
    GameEngine.registerForGameStateUpdates (state_data =>
      handleGameStateChange (state_data)
    );
    return () => {};
  }, []);

  //
  // Logic to clear the answers whenever there is a new image
  //
  useEffect (
    () => {
      //Clear all the user answers
      setAnswers ([]);
      return () => {
        //Clear all the user answers
        setAnswers ([]);
      };
    }, // eslint-disable-next-line
    [props.currentImage]
  );

  //
  // Logic to handle hits whenever another user guess same words as us
  //
  useEffect (
    () => {
      if (gameState) {
        let state_data_answer = gameState.answer;
        let users = gameState.users;
        if (state_data_answer) {
          let newAnswers = answers.map (value => {
            //Update the Answers with new count
            if (
              value.answer.toLowerCase () === state_data_answer.toLowerCase ()
            ) {
              value.count = users.length; //Preserve the new count
            }
            return value;
          });
          setAnswers (newAnswers);
        }
      }
      return () => {};
    }, // eslint-disable-next-line
    [gameState]
  );

  const handleGameStateChange = state_data => {
    //One-time initialization
    console.log (
      'Received game state change with hits from server in GamePanel',
      state_data
    );
    if (state_data) {
      setGameState (state_data);
    }
  };

  const handleSubmit = e => {
    if (currentAnswer === '') {
      return console.log ('Answer cannot be empty');
    }
    if (currentAnswer.length > 20) {
      return console.log ('Answer length greater than 20');
    }

    if (
      answers.findIndex (
        value => currentAnswer.toLowerCase () === value.answer.toLowerCase ()
      ) !== -1
    ) {
      return console.log ('Word already guessed');
    }

    setAnswers (
      answers.concat ({
        answer: currentAnswer.toLowerCase (),
        count: 1,
      })
    );

    props.onAnswer (currentAnswer.toLowerCase ());
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
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Input
                    className="form-control form-control-lg"
                    type="answer"
                    name="answer"
                    id="userAnswer"
                    placeholder="Type your word"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault ();
                        handleSubmit (e);
                      }
                    }}
                    onChange={e => setCurrentAnswer (e.target.value)}
                    value={currentAnswer}
                  />
                </FormGroup>
                <FormGroup>
                  <Button
                    type="submit"
                    color="info"
                    className="btn-lg btn-block"
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
