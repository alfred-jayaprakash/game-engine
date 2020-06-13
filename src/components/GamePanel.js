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
  Label,
} from 'reactstrap';

const GamePanel = props => {
  const [answer, setAnswer] = useState ('');
  // eslint-disable-next-line
  const [answers, setAnswers] = useState ([]);

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
          {answers.map (answer => (
            <Label className="border border-dark rounded bg-light text-dark w-25 p-3">
              {answer}
            </Label>
          ))}
        </Col>
      </Row>
    </div>
  );
};

export default GamePanel;
