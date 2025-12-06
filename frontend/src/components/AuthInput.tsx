import React, { ReactNode } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { commonStyles } from '../theme/styles';
import { colors } from '../theme/colors';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon?: ReactNode;
  error?: string;
  containerStyle?: any;
}

const AuthInput: React.FC<AuthInputProps> = ({
  label,
  icon,
  error,
  containerStyle,
  ...props
}) => {
  return (
    <View style={[commonStyles.inputGroup, containerStyle]}>
      <Text style={commonStyles.inputLabel}>{label}</Text>
      <View
        style={[
          commonStyles.inputWrapper,
          { borderColor: error ? colors.error : colors.borderColor },
        ]}
      >
        {icon && <View style={commonStyles.inputIcon}>{icon}</View>}
        <TextInput
          style={commonStyles.input}
          placeholderTextColor="rgba(10, 10, 10, 0.5)"
          {...props}
        />
      </View>
      {error && <Text style={commonStyles.errorText}>{error}</Text>}
    </View>
  );
};

export default AuthInput;
