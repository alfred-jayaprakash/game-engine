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

let initialized = false;

const GamePanel = props => {
  const [currentAnswer, setCurrentAnswer] = useState ('');
  const [answers, setAnswers] = useState ([]);
  const {currentImage} = props;

  useEffect (
    () => {
      //Clear all the user answers
      setAnswers ([]);
      setCurrentAnswer ('');
      return () => {
        //Clear all the user answers
        setAnswers ([]);
        setCurrentAnswer ('');
      };
    },
    [currentImage]
  );

  //One-time initialization
  if (!initialized) {
    GameEngine.registerForGameStateUpdates (state_data => {
      console.log ('Received game state change in GamePanel', state_data);
      if (state_data) {
        let state_data_answer = state_data.answer;
        let users = state_data.users;
        if (state_data_answer) {
          let idx = answers.findIndex (
            value => value.answer === state_data_answer
          );
          if (idx !== -1)
            answers[idx].set ({answer: state_data_answer, count: users.length}); //Preserve the new count
        }
      }
    });
    initialized = true; //Done
  }

  const onSubmit = e => {
    if (currentAnswer === '') {
      return console.log ('Answer cannot be empty');
    }
    if (currentAnswer.length > 20) {
      return console.log ('Answer length greater than 20');
    }

    if (answers.findIndex (value => currentAnswer === value.answer) !== -1) {
      return console.log ('Word already guessed');
    }

    answers.push ({answer: currentAnswer, count: 1});
    props.onAnswer (currentAnswer);
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
              src={currentImage}
              alt="Game Image"
            />
            <CardBody>
              <Form>
                <FormGroup>
                  <Input
                    className="form-control form-control-lg"
                    type="answer"
                    name="answer"
                    id="userAnswer"
                    placeholder="Type your word"
                    autoFocus={true}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault ();
                        onSubmit (e);
                      }
                    }}
                    onChange={e => setCurrentAnswer (e.target.value)}
                    value={currentAnswer}
                  />
                </FormGroup>
                <FormGroup>
                  <Button
                    color="info"
                    className="btn-lg btn-block"
                    onClick={onSubmit}
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
                    <Badge color="secondary">{count}</Badge>
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