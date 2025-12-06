// Define the parameter list for the root stack
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  // Add other screens here as needed
};

// Define the screen props for each screen
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
