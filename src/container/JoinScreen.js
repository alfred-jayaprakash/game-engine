import React, {useState} from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Input,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabPane,
  TabContent,
} from 'reactstrap';
import {useHistory} from 'react-router-dom';
import axios from 'axios';
import classnames from 'classnames';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || '/';

const JoinScreen = props => {
  const [room, setRoom] = useState ('');
  const [user, setUser] = useState ('');
  const [error, setError] = useState ('');
  const [roomValidated, setValidated] = useState (false);
  const history = useHistory ();
  const [activeTab, setActiveTab] = useState ('1');
  const [adminUser, setAdminUser] = useState ('');
  const [adminPass, setAdminPass] = useState ('');
  const [loginError, setLoginError] = useState ('');

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab (tab);
  };

  const onLogin = () => {
    if (adminUser === '' || adminPass === '') {
      return setLoginError ('User ID and Password cannot be empty');
    }

    if (adminUser === 'phantomsg@icloud.com' && adminPass === 'gameninja') {
      history.push ('/admin'); //Show admin screen
    } else {
      return setLoginError ('Invalid logon');
    }
  };

  const onSubmit = () => {
    if (!roomValidated) {
      //That means room is being verified
      if (room === '') {
        return setError ('Room ID cannot be empty');
      }
      if (room.length !== 6) {
        return setError (
          'Invalid room number. Please enter a 6-digit room number'
        );
      }
      if (isNaN (room)) {
        return setError ('Invalid room number');
      }
      const url = SERVER_URL + '/rooms/' + room;
      console.log (url);
      axios.get (url).then (res => {
        if (res.data) {
          if (res.data.error) {
            return setError (res.data.error);
          }
          setValidated (true);
        }
      });
    } else {
      if (user === '') {
        return setError ('Username cannot be empty');
      }
      const url = SERVER_URL + '/rooms/' + room + '/user/' + user;
      axios.get (url).then (res => {
        if (res.data) {
          if (res.data.error) {
            return setError (res.data.error);
          }
          console.log ('Validation successful and pushing data ', user, room);
          history.push ({
            pathname: '/game',
            state: {
              user,
              room,
            },
          });
        }
      });
    }
  };

  return (
    <Container
      className="d-flex flex-column justify-content-center bg-dark text-white vertical-center"
      fluid={true}
    >
      <div>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames ({active: activeTab === '1'})}
              onClick={() => {
                toggle ('1');
              }}
            >
              Join
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames ({active: activeTab === '2'})}
              onClick={() => {
                toggle ('2');
              }}
            >
              Host
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1" className="p-3 border">
            {error !== '' &&
              <Row><Col><Alert color="danger">{error}</Alert></Col></Row>}
            <Form>
              <Row>
                <Col>
                  <FormGroup>
                    <Input
                      className="form-control form-control-lg p-4"
                      type="text"
                      name="gameRoom"
                      id="gameRoom"
                      placeholder="Game Room ID"
                      onChange={e => setRoom (e.target.value)}
                      disabled={roomValidated}
                    />
                  </FormGroup>
                </Col>
              </Row>
              {roomValidated &&
                <Row>
                  <Col>
                    <FormGroup>
                      <Input
                        className="form-control form-control-lg"
                        type="text"
                        name="gameUser"
                        id="gameUser"
                        placeholder="Your Name"
                        onChange={e => setUser (e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>}
              <Row>
                <Col>
                  <FormGroup>
                    <Button
                      color="info"
                      onClick={onSubmit}
                      className="btn-lg btn-block"
                    >
                      {roomValidated ? 'Join' : 'Next'}
                    </Button>
                  </FormGroup>
                </Col>
              </Row>

            </Form>
          </TabPane>
          <TabPane tabId="2" className="p-3 border">
            {loginError !== '' &&
              <Row><Col><Alert color="danger">{loginError}</Alert></Col></Row>}
            <Form>
              <Row>
                <Col>
                  <FormGroup>
                    <Input
                      className="form-control form-control-lg"
                      type="text"
                      name="adminId"
                      id="adminId"
                      placeholder="email@domain.com"
                      onChange={e => setAdminUser (e.target.value)}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup>
                    <Input
                      className="form-control form-control-lg"
                      type="password"
                      name="adminPass"
                      id="adminPass"
                      placeholder="Your Password"
                      onChange={e => setAdminPass (e.target.value)}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup>
                    <Button
                      color="info"
                      onClick={onLogin}
                      className="btn-lg btn-block"
                    >
                      Login
                    </Button>
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </TabPane>
        </TabContent>
      </div>
    </Container>
  );
};

export default JoinScreen;
