// Add type declarations for modules that don't have them
declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.jpg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.jpeg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

// Add Node.js type definitions
declare module 'path' {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
}

// Add React Navigation types
declare module '@react-navigation/native' {
  export * from '@react-navigation/native';
}

declare module '@react-navigation/stack' {
  export * from '@react-navigation/stack';
}

// Add other module declarations as needed
