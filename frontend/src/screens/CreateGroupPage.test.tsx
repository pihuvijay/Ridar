// import React from 'react';
// import { render, fireEvent } from '@testing-library/react-native';
// import { CreateGroupPage } from './CreateGroupPage';

// // IMPORTANT: IM USING THE FIGMA SCREEN INSTEAD OF THE EXPO BECAUSE IT IS HEAVILY OUTDATED HENCEFORTH

// /*
// tests to write:
// 1. Give the pickup point and destination are valid when pressing "Start Party Formation", proceed to the next screen
// 2. Give the pickup point and destination are empty when pressing "Start Party Formation", then don't proceed/output an error
// 3. Give the pickup point is empty when pressing "Start Party Formation", then don't proceed/output an error
// 4. Give the destination is empty when pressing "Start Party Formation", then don't proceed/output an error
// 5. Given the user deletes a destination/pickup when on the page, then remove the estimated pricing from view.
// 6. Given the user pressed the back button when on the page, then go back to the map view.

// // im unsure how to add logic of actual locations for now. need to ask Rhys how his map thing is being implemented
// // SHOULDN'T THE FIGMA CREATE PAGE HAVE THE OPTION TO CREATE GROUPS ON GENDER, ALCOHOL AND STUFF? its part of our requirements

// */

// // snapshot
// test('renders CreateGroupPage correctly (snapshot test)', () => {
//   const { toJSON } = render(<CreateGroupPage />);
//   expect(toJSON()).toMatchSnapshot(); 
// });


// // test 1
// test('If all ride filters are appropriate, create the group', () => {
//   const mockCreateGroup = jest.fn();
//   const { getByLabelText, getByText } = render(<CreateGroupPage onCreateGroup = {mockCreateGroup} />);
  
//   fireEvent.changeText(getByLabelText("Pickup point"), "45 Upper Olfield Park");
//   fireEvent.changeText(getByLabelText("Final destination"), "University of Bath Campus");
  
  
//   // fireEvent.changeText(getByLabelText("Gender Filter"), "None/All Female");
//   // fireEvent.changeText(getByLabelText("Alcohol Filter"), "Yes/No");
  
//   fireEvent.press(getByLabelText("Create ride group"));
//   expect(mockCreateGroup).toHaveBeenCalledTimes(1);
// });


// // test 2
// test('If all fields are empty, the button stays disabled', () => {
//   const mockCreateGroup = jest.fn();
//   const { getByLabelText } = render(<CreateGroupPage onCreateGroup = {mockCreateGroup} />);
  
//   const createButton = getByLabelText("Create ride group");
//   expect(createButton).toBeDisabled();
// });


// // test 3
// test('If the pickup point is empty, the button stays disabled', () => {
//   const mockCreateGroup = jest.fn();
//   const { getByLabelText } = render(<CreateGroupPage onCreateGroup = {mockCreateGroup} />);

//   fireEvent.changeText(getByLabelText("Final destination"), "University of Bath Campus");

//   const createButton = getByLabelText("Create ride group");
//   expect(createButton).toBeDisabled();
// });


// // test 4
// test('If the destination is empty, the button stays disabled', () => {
//   const mockCreateGroup = jest.fn();
//   const { getByLabelText } = render(<CreateGroupPage onCreateGroup = {mockCreateGroup} />);

//   fireEvent.changeText(getByLabelText("Pickup point"), "45 Upper Olfield Park");

//   const createButton = getByLabelText("Create ride group");
//   expect(createButton).toBeDisabled();
// });


// // test 5 UNFINISHED TDD I GUESS
// test('If the user inputs and deletes a location field, the price estimation disappears and button is disabled', () => {
//   const mockCreateGroup = jest.fn();
//   const { getByLabelText } = render(<CreateGroupPage onCreateGroup = {mockCreateGroup} />);

//   fireEvent.changeText(getByLabelText("Pickup point"), "45 Upper Olfield Park");
//   fireEvent.changeText(getByLabelText("Final destination"), "University of Bath Campus");

//   fireEvent.changeText(getByLabelText("Final destination"), "");

//   // actual test should be on the payment window: not made yet "Estimated Pricing"
//   const createButton = getByLabelText("Create ride group");
//   expect(createButton).toBeDisabled();
// });



// // test 6
// test('If the user presses the back button, they return to MapScreen.tsx', () => {
//   const mockBack = jest.fn();
//   const { getByLabelText } = render(<CreateGroupPage onBack = {mockBack} />);

//   fireEvent.press(getByLabelText("Go back"));

//   expect(mockBack).toHaveBeenCalledTimes(1);
// });