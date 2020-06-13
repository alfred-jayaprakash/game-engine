import React from 'react';
import {Row, Col} from 'reactstrap';

const ScorePanel = props => {
  return (
    <Row className="text-dark bg-light">
      <Col><h3>Score: {props.score}</h3></Col>
    </Row>
  );
};

export default ScorePanel;
