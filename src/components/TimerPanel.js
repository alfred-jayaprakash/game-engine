import React, {useState, useEffect} from 'react';
import {Row, Col, Progress} from 'reactstrap';

//
// TimerPanel. Pass the duration in secs as prop.duration
//
const TimerPanel = props => {
  const [timerVal, setTimerVal] = useState (100);
  const [timerStr, setTimerStr] = useState ('');
  const [timerCol, setTimerCol] = useState ('success');
  const {duration, currentRef, onTimeOver} = props;

  useEffect (
    () => {
      let currtime = parseInt (duration);
      setTimerStr (currtime + 's');
      //Create a timer
      const timer = setInterval (() => {
        currtime -= 1; //Reduce 1 sec
        setTimerStr (currtime + 's'); //Display the current sec
        setTimerVal (100 / parseInt (duration) * currtime); //Reduce the progess bar
        setTimerCol (
          currtime <= 10 ? (currtime < 5 ? 'danger' : 'warning') : 'success'
        );
        if (currtime === 0) {
          clearInterval (timer);
          onTimeOver (); //Call the onTimeOver function
        }
      }, 1000);

      return () => {
        //Cancel the timer
        clearInterval (timer);
      };
    },
    [duration, currentRef, onTimeOver]
  );

  return (
    <Row>
      <Col>
        <Progress bar color={timerCol} value={timerVal}>{timerStr}</Progress>
      </Col>
    </Row>
  );
};

export default TimerPanel;
