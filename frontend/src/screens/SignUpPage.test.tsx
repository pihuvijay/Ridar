import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SignUpPage } from './SignUpPage';

/*
tests to write:
1. checks if a .ac.uk email is entered as verified.
2. disables verification if a non .ac.uk email is entered 
3. creates an account if all inputs are valid and entered
4. doesn't create an account if they don't press to verify their email
5. cann't press the 'create account' button if inputs aren't filled in
6. redirects to the signin page if the 'sign in' button is pressed
7. can't press 'verify' for email if its already been verified
8. check if course string length is long enough to be valid (at least 4 characters? math)
9. check if age is at least 18 to create an account
*/



// snapshot test
test('renders SignUpPage correctly (snapshot test)', () => {
  const { toJSON } = render(<SignUpPage />);
  expect(toJSON()).toMatchSnapshot(); 
});


// test 1
test('Verifies if its a valid university email', () => {
  const { getByLabelText, getByText } = render(<SignUpPage />);
  
  fireEvent.changeText(getByLabelText("University Email"), "abc@university.ac.uk");
  fireEvent.press(getByText("Verify"));

  expect(getByText("Email verified successfully")).toBeTruthy(); // could also be "✓ Verified"
});


// test 2
test("Rejects if its not a valid university email", () => {
  const { getByLabelText, getByText } = render(<SignUpPage />);
  
  fireEvent.changeText(
    getByLabelText("University Email"),
    "abc@gmail.com"
  );

  fireEvent.press(getByText("Verify"));
  expect(getByText("Email must end in .ac.uk")).toBeTruthy();
});


// test 3
test('Fills form and verifies email', () => {
  const mockCreateAccount = jest.fn();
  const { getByLabelText, getByText } = render(
    <SignUpPage onCreateAccount={mockCreateAccount} />
  );

  // fake inputs
  fireEvent.changeText(getByLabelText("Full Name"), "Dave");
  fireEvent.changeText(getByLabelText("Course/Major"), "Computer Science");
  fireEvent.changeText(getByLabelText("Age"), "20");
  fireEvent.changeText(getByLabelText("University Email"), "dv123@bath.ac.uk");

  fireEvent.press(getByText("Select Gender"));
  fireEvent.press(getByText("Male"));

  // accepting the t&cs
  fireEvent.press(getByText("☐"));

  fireEvent.press(getByText("Verify"));
  expect(getByText("Email verified successfully")).toBeTruthy();

  fireEvent.press(getByText("Create Account & Connect Uber"));
  expect(mockCreateAccount).toHaveBeenCalledTimes(1);
});


// test 4
test("If they don't press 'verify' for their email, their account isn't created", () => {
  const mockCreateAccount = jest.fn();
  const { getByLabelText, getByText } = render(
    <SignUpPage onCreateAccount={mockCreateAccount} />
  );

  fireEvent.changeText(getByLabelText("Full Name"), "Dave");
  fireEvent.changeText(getByLabelText("Course/Major"), "CS");
  fireEvent.changeText(getByLabelText("Age"), "20");
  fireEvent.changeText(
    getByLabelText("University Email"),
    "dv123@bath.ac.uk"
  );

  fireEvent.press(getByText("Select Gender"));
  fireEvent.press(getByText("Male"));
  fireEvent.press(getByText("☐"));
  fireEvent.press(getByText("Create Account & Connect Uber"));

  expect(mockCreateAccount).not.toHaveBeenCalled();
});


// test 5
test('Create Account button is disabled if form incomplete', () => {
  const mockCreateAccount = jest.fn();
  const { getByText } = render(<SignUpPage onCreateAccount={mockCreateAccount} />);
  const createButton = getByText("Create Account & Connect Uber");
  expect(createButton).toBeDisabled();
});

// continuation of test 5, if some fields are filled but not all.
test("Create button disabled when form partially filled", () => {
  const { getByLabelText, getByText } = render(<SignUpPage />);

  fireEvent.changeText(getByLabelText("Full Name"), "Dave");
  const createButton = getByText("Create Account & Connect Uber");
  expect(createButton).toBeDisabled();
});


// test 6
test("Calls onSignIn when Sign in pressed", () => {
  const mockSignIn = jest.fn();
  const { getByText } = render(
    <SignUpPage onSignIn={mockSignIn} />
  );

  fireEvent.press(getByText("Sign in"));
  expect(mockSignIn).toHaveBeenCalledTimes(1);
});


// test 7
test("Verify button is disabled after email is verified", () => {
  const { getByLabelText, getByText } = render(<SignUpPage />);

  fireEvent.changeText(
    getByLabelText("University Email"),
    "abc@uni.ac.uk"
  );

  fireEvent.press(getByText("Verify"));
  const verifiedButton = getByText("✓ Verified");

  expect(verifiedButton).toBeDisabled();
});


// test 8 course length



// test 9 age value


// SafeAreaView has been deprecated and will be removed in a future release. Please use 'react-native-safe-area-context' instead. See https://github.com/th3rdwave/react-native-safe-area-context