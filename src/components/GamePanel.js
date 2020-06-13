import React, {useState} from 'react';
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
  const [answer, setAnswer] = useState ('');
  // eslint-disable-next-line
  const [answers, setAnswers] = useState ([]);
  // eslint-disable-next-line
  const [userAnswers, setUserAnswers] = useState (new Map ());

  //One-time initialization
  if (!initialized) {
    GameEngine.registerForGameStateUpdates (state_data => {
      console.log ('Received game state change in GamePanel', state_data);
      if (state_data) {
        let state_data_answer = state_data.answer;
        let users = state_data.users;
        if (state_data_answer) {
          let answerCount = userAnswers.get (state_data_answer);
          //If no answer is found - This is not correct state
          if (answerCount == null) {
            userAnswers.set (state_data_answer, 1);
          }
          userAnswers.set (state_data_answer, users.length); //Preserve the users
          console.log (
            'Set userAnswers data with ',
            state_data_answer,
            users.length
          );
        }
      }
    });
    initialized = true; //Done
  }

  const onSubmit = e => {
    if (answer === '') {
      return console.log ('Answer cannot be empty');
    }
    if (answer.length > 10) {
      return console.log ('Answer length greater than 20');
    }

    if (answers.indexOf (answer) !== -1) {
      return console.log ('Word already guessed');
    }

    answers.push (answer);
    props.onAnswer (answer);
    setAnswer ('');
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
              src={props.imgsrc}
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
                    onChange={e => setAnswer (e.target.value)}
                    value={answer}
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
            {userAnswers.forEach ((value, key) => (
              <ListGroupItem className="bg-light text-dark p-2">
                {key} <Badge color="secondary">{value.length - 1}</Badge>
                {console.log ('Data printed', key)}
              </ListGroupItem>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </div>
  );
};

export default GamePanel;
