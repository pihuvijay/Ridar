import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { MapScreen } from './src/screens/MapScreen';
import { SignInPage } from './src/screens/SignInPage';
import { SignUpPage } from './src/screens/SignUpPage';
import { CreateGroupPage } from './src/screens/CreateGroupPage';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'signin' | 'signup' | 'map' | 'creategroup'>('signin');

  const handleSignUp = () => {
    setCurrentScreen('signup');
  };

  const handleBackToSignIn = () => {
    setCurrentScreen('signin');
  };

  const handleCreateAccount = () => {
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
      ) : currentScreen === 'creategroup' ? (
        <CreateGroupPage onBack={handleBackToMap} />
      ) : (
        <MapScreen onMenuPress={handleSignOut} onCreateRideGroup={handleCreateRideGroup} />
      )}
      <StatusBar style="auto" />
    </>
  );
}

