import React from 'react';
import {Row, Col, ListGroup, ListGroupItem} from 'reactstrap';

const MessagePanel = props => {
  return (
    <Row>
      <Col>
        <ListGroup>
          {props.data.map (answer => (
            <ListGroupItem key="{answer}">{answer}</ListGroupItem>
          ))}
        </ListGroup>
      </Col>
    </Row>
  );
};

export default MessagePanel;
