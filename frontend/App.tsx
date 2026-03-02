import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from './src/contexts';
import { MapScreen } from './src/screens/MapScreen';
import { SignInPage } from './src/screens/SignInPage';
import { SignUpPage } from './src/screens/SignUpPage';
import { CreateGroupPage } from './src/screens/CreateGroupPage';
import { ConnectAccountsPage } from './src/screens/ConnectAccountsPage';

export default function App() {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Stripe publishable key is missing. Add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env file');
  }
  const [currentScreen, setCurrentScreen] = useState<'signin' | 'signup' | 'connectaccounts' | 'map' | 'creategroup'>('signin');

  const handleSignUp = () => {
    setCurrentScreen('signup');
  };

  const handleBackToSignIn = () => {
    setCurrentScreen('signin');
  };

  const handleCreateAccount = () => {
    setCurrentScreen('connectaccounts');
  };

  const handleAccountsConnected = () => {
    setCurrentScreen('map');
  };

  const handleSignOut = () => {
    setCurrentScreen('signin');
  };

  const handleCreateRideGroup = () => {
    setCurrentScreen('creategroup');
  };

  const handleBackToMap = () => {
    setCurrentScreen('map');
  };

  const handleModeratorLogin = () => {
    setCurrentScreen('map');
  };

  return (
    <AuthProvider>
      <StripeProvider publishableKey={publishableKey}>
        <>
          {currentScreen === 'signin' ? (
            <SignInPage onSignUp={handleSignUp} onModeratorLogin={handleModeratorLogin} />
          ) : currentScreen === 'signup' ? (
            <SignUpPage onSignIn={handleBackToSignIn} onCreateAccount={handleCreateAccount} />
          ) : currentScreen === 'connectaccounts' ? (
            <ConnectAccountsPage onNavigateHome={handleAccountsConnected} />
          ) : currentScreen === 'creategroup' ? (
            <CreateGroupPage onBack={handleBackToMap} />
          ) : (
            <MapScreen onMenuPress={handleSignOut} onCreateRideGroup={handleCreateRideGroup} />
          )}
          <StatusBar style="auto" />
        </>
      </StripeProvider>
    </AuthProvider>
  );
}

