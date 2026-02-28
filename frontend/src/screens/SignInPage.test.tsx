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

-- backend testing?
9. if the email and password are registered in database, successfully signin.
10. if the email or password are not registered in database, fail signin.

*/


test('renders SignInPage correctly (snapshot test)', () => {
  const { toJSON } = render(<SignInPage />);
  expect(toJSON()).toMatchSnapshot(); 
});
