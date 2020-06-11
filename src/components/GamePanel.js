import React, {useState} from 'react';
import {Card, CardImg, CardBody, Button, Input} from 'reactstrap';

const GamePanel = props => {
  const [answer, setAnswer] = useState ('');

  const onSubmit = e => {
    if (answer === '') {
      return console.log ('Answer cannot be empty');
    }
    if (answer.length > 10) {
      return console.log ('Answer length greater than 20');
    }
    props.onAnswer (answer);
    setAnswer ('');
  };

  return (
    <div className="centered.form__box">
      <Card>
        <CardImg top width="100%" src={props.imgsrc} alt="Game Image" />
        <CardBody>
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
        </CardBody>
      </Card>
    </div>
  );
};

export default GamePanel;
