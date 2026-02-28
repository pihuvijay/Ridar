import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CreateGroupPage } from './CreateGroupPage';

/*
tests to write:

*/

test('renders CreateGroupPage correctly (snapshot test)', () => {
  const { toJSON } = render(<CreateGroupPage />);
  expect(toJSON()).toMatchSnapshot(); 
});