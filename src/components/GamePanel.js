import React, {useState} from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardImg,
  CardBody,
  Button,
  Input,
  ListGroup,
  ListGroupItem,
} from 'reactstrap';

const GamePanel = props => {
  const [answer, setAnswer] = useState ('');
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
    <div className="centered.form__box">
      <Card>
        <CardImg top width="100%" src={props.imgsrc} alt="Game Image" />
        <CardBody>
          <Container>
            <Row>
              <Col>
                <Input
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
                <Button color="success" onClick={onSubmit}>Submit</Button>
              </Col>
            </Row>
            <Row>
              <Col>
                {answers.map (answer => <Button key={answer}>{answer}</Button>)}
              </Col>
            </Row>
          </Container>
        </CardBody>
      </Card>
    </div>
  );
};

export default GamePanel;
