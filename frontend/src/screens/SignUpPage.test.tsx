import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { SignUpPage } from "./SignUpPage";
import { useSignUp, useEmailVerificationCode } from "../hooks";


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

jest.mock("../hooks");

const mockSignUp = jest.fn();
const mockSendCode = jest.fn();
const mockVerifyCode = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  (useSignUp as jest.Mock).mockReturnValue({
    signUp: mockSignUp,
    loading: false,
    error: null,
  });

  (useEmailVerificationCode as jest.Mock).mockReturnValue({
    sendVerificationCode: mockSendCode,
    verifyEmailCode: mockVerifyCode,
    sendingCode: false,
    sendCodeError: null,
    verifyingCode: false,
    verifyCodeError: null,
  });

  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});




// snapshot test
test("renders SignUpPage correctly (snapshot test)", () => {
  const { toJSON } = render(<SignUpPage />);
  expect(toJSON()).toMatchSnapshot();
});


// test 1
test("Verifies if its a valid university email", async () => {
  mockSendCode.mockResolvedValue(true);
  mockVerifyCode.mockResolvedValue(true);

  const { getByLabelText, getByText } = render(<SignUpPage />);

  fireEvent.changeText(
    getByLabelText("University Email"),
    "abc@university.ac.uk"
  );

  fireEvent.press(getByText("Send Code"));

  await waitFor(() =>
    expect(mockSendCode).toHaveBeenCalled()
  );

  fireEvent.changeText(getByLabelText("Verification Code"), "123456");
  fireEvent.press(getByText("Verify Code"));

  await waitFor(() => {
    expect(mockVerifyCode).toHaveBeenCalled();
  });
});


// test 2
test("Rejects if its not a valid university email", () => {
  const { getByLabelText, getByText } = render(<SignUpPage />);

  fireEvent.changeText(
    getByLabelText("University Email"),
    "abc@gmail.com"
  );

  fireEvent.press(getByText("Send Code"));

  expect(Alert.alert).toHaveBeenCalledWith(
    "Invalid Email",
    "Email must end in .ac.uk"
  );
});


// test 3
test("Fills form and verifies email", async () => {
  mockSendCode.mockResolvedValue(true);
  mockVerifyCode.mockResolvedValue(true);
  mockSignUp.mockResolvedValue(true);

  const mockCreateAccount = jest.fn();

  const { getByLabelText, getByText } = render(
    <SignUpPage onCreateAccount={mockCreateAccount} />
  );

  fireEvent.changeText(getByLabelText("Full Name"), "Dave");
  fireEvent.changeText(getByLabelText("Course/Major"), "Computer Science");
  fireEvent.changeText(getByLabelText("Age"), "20");
  fireEvent.changeText(
    getByLabelText("University Email"),
    "dv123@bath.ac.uk"
  );

  fireEvent.changeText(getByLabelText("Password"), "password123");
  fireEvent.changeText(getByLabelText("Confirm Password"), "password123");

  fireEvent.press(getByText("Select Gender"));
  fireEvent.press(getByText("Male"));

  fireEvent.press(getByText("☐"));

  fireEvent.press(getByText("Send Code"));

  await waitFor(() => expect(mockSendCode).toHaveBeenCalled());

  fireEvent.changeText(getByLabelText("Verification Code"), "123456");

  fireEvent.press(getByText("Verify Code"));

  await waitFor(() => expect(mockVerifyCode).toHaveBeenCalled());

  fireEvent.press(getByText("Create Account & Connect Uber"));

  await waitFor(() => {
    expect(mockSignUp).toHaveBeenCalled();
    expect(mockCreateAccount).toHaveBeenCalledTimes(1);
  });
});


// test 4
test("If they don't press 'verify' for their email, their account isn't created", () => {
  const mockCreateAccount = jest.fn();

  const { getByLabelText, getByText } = render(
    <SignUpPage onCreateAccount={mockCreateAccount} />
  );

  fireEvent.changeText(getByLabelText("Full Name"), "Dave");
  fireEvent.changeText(getByLabelText("Course/Major"), "Computer Science");
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
test("Create Account button is disabled if form incomplete", () => {
  const { getByText } = render(<SignUpPage />);
  const createButton = getByText("Create Account & Connect Uber");
  expect(createButton).toBeDisabled();
});


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
test("Verify button is disabled after email is verified", async () => {
  mockSendCode.mockResolvedValue(true);
  mockVerifyCode.mockResolvedValue(true);

  const { getByLabelText, getByText } = render(<SignUpPage />);

  fireEvent.changeText(
    getByLabelText("University Email"),
    "abc@uni.ac.uk"
  );

  fireEvent.press(getByText("Send Code"));

  await waitFor(() => expect(mockSendCode).toHaveBeenCalled());

  fireEvent.changeText(getByLabelText("Verification Code"), "123456");

  fireEvent.press(getByText("Verify Code"));

  await waitFor(() => expect(mockVerifyCode).toHaveBeenCalled());

  // TDD expectation (logic not yet implemented)
  const verifiedButton = getByText("✓ Verified");

  expect(verifiedButton).toBeDisabled();
});


// test 8
test("Create Account is disabled if the course string is less than 5 characters", () => {
  const { getByLabelText, getByText } = render(<SignUpPage />);

  fireEvent.changeText(getByLabelText("Full Name"), "Dave");
  fireEvent.changeText(getByLabelText("Course/Major"), "aa");
  fireEvent.changeText(getByLabelText("Age"), "18");
  fireEvent.changeText(
    getByLabelText("University Email"),
    "dv123@bath.ac.uk"
  );

  fireEvent.press(getByText("Select Gender"));
  fireEvent.press(getByText("Male"));
  fireEvent.press(getByText("☐"));

  const createButton = getByText("Create Account & Connect Uber");

  expect(createButton).toBeDisabled();
});



// test 9
test("Create Account is disabled if the user inputs an age < 18", () => {
  const { getByLabelText, getByText } = render(<SignUpPage />);

  fireEvent.changeText(getByLabelText("Full Name"), "Dave");
  fireEvent.changeText(getByLabelText("Course/Major"), "Computer Science");
  fireEvent.changeText(getByLabelText("Age"), "17");

  fireEvent.changeText(
    getByLabelText("University Email"),
    "dv123@bath.ac.uk"
  );

  fireEvent.press(getByText("Select Gender"));
  fireEvent.press(getByText("Male"));
  fireEvent.press(getByText("☐"));

  const createButton = getByText("Create Account & Connect Uber");

  expect(createButton).toBeDisabled();
});