import React from 'react';
import {Row, Col} from 'reactstrap';

const ScorePanel = props => {
  return (
    <Row>
      <Col><h5 className="text-dark bg-light">Score: {props.score}</h5></Col>
    </Row>
  );
};

export default ScorePanel;
