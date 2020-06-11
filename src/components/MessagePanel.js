import React from 'react';
import {ListGroup, ListGroupItem} from 'reactstrap';

const MessagePanel = props => {
  return (
    <div className="centered-form__box">
      Some empty area to display your words
      {console.log (props.data)}
    </div>
  );
};

export default MessagePanel;
