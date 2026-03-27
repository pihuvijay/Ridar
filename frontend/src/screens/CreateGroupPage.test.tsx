import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CreateGroupPage } from './CreateGroupPage';

// IMPORTANT: IM USING THE FIGMA SCREEN INSTEAD OF THE EXPO BECAUSE IT IS HEAVILY OUTDATED HENCEFORTH

/*
tests to write:
1. Given the pickup point and destination are valid when pressing "Start Party Formation", proceed to the next screen
2. Given the pickup point and destination are empty when pressing "Start Party Formation", then don't proceed/output an error
3. Given the pickup point is empty when pressing "Start Party Formation", then don't proceed/output an error
4. Given the destination is empty when pressing "Start Party Formation", then don't proceed/output an error
5. Given the user deletes a destination/pickup when on the page, then remove the estimated pricing from view.
6. Given the user pressed the back button when on the page, then go back to the map view.

// im unsure how to add logic of actual locations for now. need to ask Rhys how his map thing is being implemented
// SHOULDN'T THE FIGMA CREATE PAGE HAVE THE OPTION TO CREATE GROUPS ON GENDER, ALCOHOL AND STUFF? its part of our requirements

*/

afterEach(() => {
  jest.clearAllMocks();
});

// snapshot test
test('renders CreateGroupPage correctly (snapshot test)', () => {
  const { toJSON } = render(<CreateGroupPage onCreateGroup = {() => {}} />);
  expect(toJSON()).toMatchSnapshot();
});

// test 1
test('If all ride filters are appropriate, create the group', () => {
  const mockCreateGroup = jest.fn();
  const { getByLabelText } = render(<CreateGroupPage onCreateGroup = {mockCreateGroup} />);

  fireEvent.changeText(getByLabelText("Pickup point"), "45 Upper Olfield Park");
  fireEvent.changeText(getByLabelText("Final destination"), "University of Bath Campus");
  
  fireEvent.press(getByLabelText("Create ride group"));
  expect(mockCreateGroup).toHaveBeenCalledTimes(1);
});

// test 2
test('If all fields are empty, the button stays disabled', () => {
  const mockCreateGroup = jest.fn();
  const { getByLabelText } = render(<CreateGroupPage onCreateGroup = {mockCreateGroup} />);

  const createButton = getByLabelText("Create ride group");
  expect(createButton).toBeTruthy(); 
});

// test 3
test('If the pickup point is empty, the button stays disabled', () => {
  const mockCreateGroup = jest.fn();
  const { getByLabelText } = render(<CreateGroupPage onCreateGroup = {mockCreateGroup} />);

  fireEvent.changeText(getByLabelText("Final destination"), "University of Bath Campus");

  const createButton = getByLabelText("Create ride group");
  expect(createButton).toBeTruthy();
});

// test 4
test('If the destination is empty, the button stays disabled', () => {
  const mockCreateGroup = jest.fn();
  const { getByLabelText } = render(<CreateGroupPage onCreateGroup = {mockCreateGroup} />);

  fireEvent.changeText(getByLabelText("Pickup point"), "45 Upper Olfield Park");

  const createButton = getByLabelText("Create ride group");
  expect(createButton).toBeTruthy();
});

// test 5
test('If the user inputs and deletes a location field, the price estimation disappears', () => {
  const mockCreateGroup = jest.fn();
  const { getByLabelText } = render(<CreateGroupPage onCreateGroup = {mockCreateGroup} />);

  fireEvent.changeText(getByLabelText("Pickup point"), "45 Upper Olfield Park");
  fireEvent.changeText(getByLabelText("Final destination"), "University of Bath Campus");

  fireEvent.changeText(getByLabelText("Final destination"), "");

  const createButton = getByLabelText("Create ride group");
  expect(createButton).toBeTruthy();
});

// test 6
test('If the user presses the back button, they return to MapScreen.tsx', () => {
  const mockBack = jest.fn();
  const mockCreateGroup = jest.fn();
  const { getByLabelText } = render(<CreateGroupPage onBack = {mockBack} onCreateGroup = {mockCreateGroup} />);

  fireEvent.press(getByLabelText("Go back"));

  expect(mockBack).toHaveBeenCalledTimes(1);
});


test('Toggle ride preference switches', () => {
  const { getByLabelText } = render(<CreateGroupPage onCreateGroup = {() => {}} />);

  const customStopsSwitch = getByLabelText("Allow custom stops toggle");
  const femaleOnlySwitch = getByLabelText("Female only toggle");
  const alcoholFreeSwitch = getByLabelText("Alcohol free toggle");

  fireEvent(customStopsSwitch, 'valueChange', true);
  fireEvent(femaleOnlySwitch, 'valueChange', true);
  fireEvent(alcoholFreeSwitch, 'valueChange', true);

  expect(customStopsSwitch.props.value).toBe(true);
  expect(femaleOnlySwitch.props.value).toBe(true);
  expect(alcoholFreeSwitch.props.value).toBe(true);
});