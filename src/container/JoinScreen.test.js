import React from 'react';
import {shallow} from 'enzyme';
import JoinScreen from './JoinScreen';

test ('should render correctly without issues', () => {
  const component = shallow (<JoinScreen />);

  expect (component).toMatchSnapshot ();
});
