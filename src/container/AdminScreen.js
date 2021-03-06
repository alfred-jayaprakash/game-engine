import React, {useState} from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Alert,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import AdminGamePanel from '../components/AdminGamePanel';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || '/';

const AdminScreen = props => {
  const [room, setRoom] = useState ('');
  const [error, setError] = useState ('');
  const [category, setCategory] = useState ('11328847');
  const [time, setTime] = useState ('30');
  const [questions, setQuestions] = useState ('5');

  const onCreateRoom = e => {
    console.log ('URL to connect is ', SERVER_URL);
    axios
      .post (SERVER_URL + '/rooms', {
        room: 'New Room',
        config: {
          time,
          questions,
          category,
        },
      })
      .then (res => {
        if (res.data) {
          if (res.data.error) {
            return setError (res.data.error);
          }
          setRoom (res.data);
        }
      });
  };

  return (
    <Container
      className="d-flex flex-column justify-content-center bg-dark text-white vertical-center"
      fluid={true}
    >
      {error !== '' &&
        <Row>
          <Col>
            <Alert color="danger">{error}</Alert>
          </Col>
        </Row>}
      {room === '' &&
        <Form>
          <Row>
            <Col>
              <FormGroup>
                <Label for="category">Choose picture category:</Label>
                <Input
                  type="select"
                  className="form-control-lg"
                  name="selectcategory"
                  id="category"
                  value="gn-office"
                  onChange={e => setCategory (e.target.value)}
                >
                  <option value="11328847">Random</option>
                  <option value="10757469">Office</option>
                  <option value="11328818">Family</option>
                  <option value="11328826">Nature</option>
                  <option value="11328790">Christian</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormGroup>
                <Label for="count">Number of pictures:</Label>
                <Input
                  type="select"
                  name="selectcount"
                  className="form-control-lg"
                  id="count"
                  value="5"
                  onChange={e => setQuestions (e.target.value)}
                >
                  <option value="3">3</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormGroup>
                <Label for="duration">Time for each picture:</Label>
                <Input
                  type="select"
                  name="selectduration"
                  className="form-control-lg"
                  id="duration"
                  value="30"
                  onChange={e => setTime (e.target.value)}
                >
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="60">60</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormGroup>
                <Button
                  id="createbtn"
                  color="info"
                  className="btn-lg btn-block"
                  onClick={onCreateRoom}
                >
                  Create Room
                </Button>
              </FormGroup>
            </Col>
          </Row>
        </Form>}
      {room &&
        <Row>
          <Col>
            <AdminGamePanel
              room={room.id}
              error={error => setError (error)}
              server={SERVER_URL}
            />
          </Col>
        </Row>}
    </Container>
  );
};

export default AdminScreen;
