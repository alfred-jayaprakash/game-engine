import React from 'react';
import {Button} from 'reactstrap';

const GameUser = props => {
  return <Button className="secondary">{props.user}</Button>;
};

export default GameUser;
