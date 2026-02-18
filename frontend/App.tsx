import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { MapScreen } from './src/screens/MapScreen';
import { SignInPage } from './src/screens/SignInPage';
import { SignUpPage } from './src/screens/SignUpPage';
import { CreateGroupPage } from './src/screens/CreateGroupPage';
import { ConnectAccountsPage } from './src/screens/ConnectAccountsPage';

export default function App() {
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

  return (
    <>
      {currentScreen === 'signin' ? (
        <SignInPage onSignUp={handleSignUp} />
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
  );
}

