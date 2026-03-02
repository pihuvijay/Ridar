import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SignInPage } from './SignInPage';

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

// snapshot test
test('renders SignInPage correctly (snapshot test)', () => {
  const { toJSON } = render(<SignInPage />);
  expect(toJSON()).toMatchSnapshot(); 
});

// EVERYTHING IS FAILING BECAUSE WE DONT HAVE A PROP SET UP FOR THE SIGN IN BUTTON
// test 1
test('Verifies if these are valid login credentials', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  const { getByLabelText, getByText } = render(<SignInPage />);
  
  fireEvent.changeText(getByLabelText("Email address"), "czl21@bath.ac.uk");
  fireEvent.changeText(getByLabelText("Password"), "abc123");
  fireEvent.press(getByText("Sign In"));

  expect(consoleSpy).toHaveBeenCalledWith(
    "Sign in submitted",
    expect.objectContaining({email: "czl21@bath.ac.uk", password: "abc123", rememberMe: false,
    })
  );

  consoleSpy.mockRestore();
});


// test 2
test('Fails if its not a .ac.uk email', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  const { getByLabelText, getByText } = render(<SignInPage />);
  
  fireEvent.changeText(getByLabelText("Email address"), "czl21@gmail.com");
  fireEvent.changeText(getByLabelText("Password"), "abc123");
  fireEvent.press(getByText("Sign In"));

  expect(consoleSpy).not.toHaveBeenCalled();
});

// test 3
test('Fails Sign In if no email is entered', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  const { getByLabelText, getByText } = render(<SignInPage />);
  
  fireEvent.changeText(getByLabelText("Password"), "abc123");
  fireEvent.press(getByText("Sign In"));

  expect(consoleSpy).not.toHaveBeenCalled();
});


// test 4
test('Fails Sign In if no password is entered', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  const { getByLabelText, getByText } = render(<SignInPage />);
  
  fireEvent.changeText(getByLabelText("Email address"), "czl21@bath.ac.uk");
  fireEvent.press(getByText("Sign In"));

  expect(consoleSpy).not.toHaveBeenCalled();
});


// test 5
test('Remember Me checkbox toggles when pressed', () => {
  const { getByLabelText, getByText, queryByText } = render(<SignInPage />);

  expect(queryByText("✓")).toBeNull(); // before press
  fireEvent.press(getByLabelText("Remember me"));
  expect(getByText("✓")).toBeTruthy(); // after press
});


// test 6
test("Goes to the onSignIn when Sign in pressed", () => {
  const mockSignIn = jest.fn();
  const { getByText } = render(<SignInPage onSignUp = {mockSignIn} />
    
  );

  fireEvent.press(getByText("Sign up"));
  expect(mockSignIn).toHaveBeenCalledTimes(1);
});


// test 7
test("Goes to the Moderator Login when that section is pressed", () => {
  const mockModeratorLogin = jest.fn();
  const { getByText } = render(<SignInPage onModeratorLogin = {mockModeratorLogin} />
    
  );

  fireEvent.press(getByText("Moderator Login"));
  expect(mockModeratorLogin).toHaveBeenCalledTimes(1);
});


// test 8
test("Goes to the forget password section when 'forget password pressed", () => {
  const mockForgetPassword = jest.fn();
  const { getByText } = render(<SignInPage onForgotPassword = {mockForgetPassword} />
    
  );

  fireEvent.press(getByText("Forgot password?"));
  expect(mockForgetPassword).toHaveBeenCalledTimes(1);
});
