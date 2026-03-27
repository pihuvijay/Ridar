import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SignInPage } from "./SignInPage";

afterEach(() => {
  jest.clearAllMocks();
});

/*
tests to write:
1. all fields have to be filled appropriately to allow for signing in
2. if email and password are filled, but the email isn't .ac.uk, fail signin
3. if only email is filled, fail signin
4. if only password is filled, fail signin

-- redirects (not all are currently functional in code anyways)
5. on pressing the 'remember me' button, the box should turn ticked.
6. on pressing 'Sign Up' it should redirect you to the SignUpPage.tsx
7. on pressing 'Moderator Login' it should redirect you to whatever the moderator login page becomes
8. on pressing 'Forgot Password?', the user should be redirected to the appropriate page.

-- backend testing/end to end testing?
9. if the email and password are registered in database, successfully signin.
10. if the email or password are not registered in database, fail signin.

*/



// snapshot
test("renders SignInPage correctly (snapshot)", () => {
  const { toJSON } = render(<SignInPage />);
  expect(toJSON()).toMatchSnapshot();
});



// test 1
test("calls onLogin when valid credentials entered", () => {
  const mockLogin = jest.fn();

  const { getByLabelText, getByText } = render(
    <SignInPage onLogin={mockLogin} />
  );

  fireEvent.changeText(getByLabelText("Email address"), "czl21@bath.ac.uk");
  fireEvent.changeText(getByLabelText("Password"), "abc123");

  fireEvent.press(getByText("Sign In"));

  expect(mockLogin).toHaveBeenCalledWith("czl21");
});



// test 2
test("fails if email is not .ac.uk", () => {
  const mockLogin = jest.fn();

  const { getByLabelText, getByText } = render(
    <SignInPage onLogin={mockLogin} />
  );

  fireEvent.changeText(getByLabelText("Email address"), "czl21@gmail.com");
  fireEvent.changeText(getByLabelText("Password"), "abc123");

  fireEvent.press(getByText("Sign In"));

  expect(mockLogin).not.toHaveBeenCalled();
});



// test 3
test("fails sign in if email missing", () => {
  const mockLogin = jest.fn();

  const { getByLabelText, getByText } = render(
    <SignInPage onLogin={mockLogin} />
  );

  fireEvent.changeText(getByLabelText("Password"), "abc123");

  fireEvent.press(getByText("Sign In"));

  expect(mockLogin).not.toHaveBeenCalled();
});



// test 4
test("fails sign in if password missing", () => {
  const mockLogin = jest.fn();

  const { getByLabelText, getByText } = render(
    <SignInPage onLogin={mockLogin} />
  );

  fireEvent.changeText(getByLabelText("Email address"), "czl21@bath.ac.uk");

  fireEvent.press(getByText("Sign In"));

  expect(mockLogin).not.toHaveBeenCalled();
});



// test 5
test("remember me checkbox toggles", () => {
  const { getByLabelText, queryByText } = render(<SignInPage />);

  const checkbox = getByLabelText("Remember me");

  expect(queryByText("✓")).toBeNull();

  fireEvent.press(checkbox);

  expect(queryByText("✓")).toBeTruthy();
});



// test 6
test("calls onSignUp when Sign up pressed", () => {
  const mockSignUp = jest.fn();

  const { getByText } = render(
    <SignInPage onSignUp={mockSignUp} />
  );

  fireEvent.press(getByText("Sign up"));

  expect(mockSignUp).toHaveBeenCalledTimes(1);
});



// test 7
test("calls onModeratorLogin when Moderator Login pressed", () => {
  const mockModeratorLogin = jest.fn();

  const { getByText } = render(
    <SignInPage onModeratorLogin={mockModeratorLogin} />
  );

  fireEvent.press(getByText("Moderator Login"));

  expect(mockModeratorLogin).toHaveBeenCalledTimes(1);
});


// test 8
test("calls onForgotPassword when Forgot password pressed", () => {
  const mockForgotPassword = jest.fn();

  const { getByText } = render(
    <SignInPage onForgotPassword={mockForgotPassword} />
  );

  fireEvent.press(getByText("Forgot password?"));

  expect(mockForgotPassword).toHaveBeenCalledTimes(1);
});


// test 9
test("successful login with valid database credentials", () => {
  const mockLogin = jest.fn();

  const { getByLabelText, getByText } = render(
    <SignInPage onLogin={mockLogin} />
  );

  fireEvent.changeText(getByLabelText("Email address"), "czl21@bath.ac.uk");
  fireEvent.changeText(getByLabelText("Password"), "abc123");

  fireEvent.press(getByText("Sign In"));

  expect(mockLogin).toHaveBeenCalled();
});


// test 10
test("fails login if credentials incorrect", () => {
  const mockLogin = jest.fn();

  const { getByLabelText, getByText } = render(
    <SignInPage onLogin={mockLogin} />
  );

  fireEvent.changeText(getByLabelText("Email address"), "wrong@bath.ac.uk");
  fireEvent.changeText(getByLabelText("Password"), "wrongpass");

  fireEvent.press(getByText("Sign In"));

  expect(mockLogin).not.toHaveBeenCalled();
});