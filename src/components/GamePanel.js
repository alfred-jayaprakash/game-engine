import React from 'react';

const GamePanel = props => {
  const [answer, setAnswer] = useState ('');

  const onSubmit = () => {
    if (answer === '') {
      return console.log ('Answer cannot be empty');
    }
    if (answer.length > 10) {
      return console.log ('Answer length greater than 20');
    }
    props.answer (answer);
  };

  return (
    <div>
      <Card>
        <CardImg top width="100%" src="{props.image}" alt="Game Image" />
        <CardBody>
          <Input
            type="email"
            name="email"
            id="exampleEmail"
            placeholder="with a placeholder"
            onChange={e => setAnswer (e.target.value)}
          />
          <Button color="success" onClick={onSubmit}>Submit</Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default GamePanel;
