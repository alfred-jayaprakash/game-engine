import React, {useState} from 'react';
import {Button} from 'reactstrap';

const GameUser = props => {
  return <Button>{props.user}</Button>;
};

export default GameUser;
