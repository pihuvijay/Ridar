import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SignUpPage } from './SignUpPage';

test('renders SignUpPage correctly (snapshot)', () => {
  const { toJSON } = render(<SignUpPage />);
  expect(toJSON()).toMatchSnapshot(); 
});

test('Verifies if its a valid university email', () => {
  const { getByLabelText, getByText } = render(<SignUpPage />);
  
  fireEvent.changeText(getByLabelText("University Email"), "abc@university.ac.uk");
  fireEvent.press(getByText("Verify"));

  expect(getByText("Email verified successfully")).toBeTruthy(); // could also be "✓ Verified"
});

test("Rejects if its not a valid university email", () => {
  const { getByLabelText, getByText } = render(<SignUpPage />);
  
  fireEvent.changeText(
    getByLabelText("University Email"),
    "abc@gmail.com"
  );

  fireEvent.press(getByText("Verify"));

  expect(getByText("Email must end in .ac.uk")).toBeTruthy();
});


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


// this test failed
test('Create Account button is disabled if form incomplete', () => {
  const mockCreateAccount = jest.fn();
  const { getByText } = render(<SignUpPage onCreateAccount={mockCreateAccount} />);
  const createButton = getByText("Create Account & Connect Uber");
  expect(createButton.props.disabled).toBe(true);
});


test("Calls onSignIn when Sign in pressed", () => {
  const mockSignIn = jest.fn();
  const { getByText } = render(
    <SignUpPage onSignIn={mockSignIn} />
  );

  fireEvent.press(getByText("Sign in"));
  expect(mockSignIn).toHaveBeenCalledTimes(1);
});


// this failed
test("Verify button is disabled after email is verified", () => {
  const { getByLabelText, getByText } = render(<SignUpPage />);

  fireEvent.changeText(
    getByLabelText("University Email"),
    "abc@uni.ac.uk"
  );

  fireEvent.press(getByText("Verify"));
  const verifiedButton = getByText("✓ Verified");

  expect(
    verifiedButton.parent?.props.accessibilityState.disabled
  ).toBe(true);
});



// SafeAreaView has been deprecated and will be removed in a future release. Please use 'react-native-safe-area-context' instead. See https://github.com/th3rdwave/react-native-safe-area-context