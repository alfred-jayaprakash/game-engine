import React from 'react';
import {ListGroup, ListGroupItem} from 'reactstrap';

const MessagePanel = props => {
  return (
    <div className="centered-form__box">
      Some empty area to display your words
      <ListGroup>
        {props.data.map (answer => (
          <ListGroupItem key="{answer}">{answer}</ListGroupItem>
        ))}
      </ListGroup>
    </div>
  );
};

export default MessagePanel;
