import React, {useState} from 'react';
import {Container, Row, Col, Alert, Spinner} from 'reactstrap';
import {withRouter} from 'react-router-dom';

const WaitScreen = props => {
  const [error, setError] = useState ('');
  const [roomValidated, setValidated] = useState (false);
  const {history} = props;

  const onSubmit = () => {
    //Waiting
  };

  return (
    <Container>
      <Row>
        {error !== '' && <Alert color="danger">{error}</Alert>}
      </Row>
      <Row>
        <Spinner color="primary" />
        &nbsp;&nbsp;<div className="waittext">Waiting for other players...</div>
      </Row>
    </Container>
  );
};

export default WaitScreen;
