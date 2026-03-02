import React, { useState } from "react";
import type { JSX } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../theme/colors";

interface SignInPageProps {
  onSignUp?: () => void;
  onForgotPassword?: () => void;
  onModeratorLogin?: () => void;
  onLogin?: (name: string) => void;
}

export const SignInPage = ({
  onSignUp,
  onForgotPassword,
  onModeratorLogin,
  onLogin,
}: SignInPageProps): JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = () => {
    if (email && password) {
      if (onLogin) {
        const name = email.split("@")[0];
        onLogin(name);
      }
      console.log("Sign in submitted", { email, password, rememberMe });
    }
  };

  const handleSignUp = () => {
    if (onSignUp) onSignUp();
    console.log("Navigate to sign up");
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) onForgotPassword();
    console.log("Navigate to forgot password");
  };

  const handleModeratorLogin = () => {
    if (onModeratorLogin) onModeratorLogin();
    console.log("Navigate to moderator login");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={[COLORS.primary, "#2d7a52"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>🚗</Text>
            </View>
            <Text style={styles.appTitle}>RideShare</Text>
            <Text style={styles.appSubtitle}>Connect. Share. Arrive.</Text>
          </View>

          {/* Main Form Card */}
          <View style={styles.card}>
            <Text style={styles.welcomeText}>Welcome Back</Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  accessibilityLabel="Email address"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  accessibilityLabel="Password"
                />
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <View style={styles.rememberMeContainer}>
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  style={styles.checkbox}
                  accessibilityLabel="Remember me"
                >
                  <Text style={styles.checkboxInner}>
                    {rememberMe ? "✓" : ""}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </View>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity style={styles.signInButton} onPress={handleSubmit}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpPrompt}>
              <Text style={styles.signUpPromptText}>Don't have an account?</Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signUpLink}>Sign up</Text>
              </TouchableOpacity>
            </View>

            {/* Moderator Login */}
            <View style={styles.moderatorSection}>
              <TouchableOpacity
                style={styles.moderatorButton}
                onPress={handleModeratorLogin}
              >
                <Text style={styles.moderatorIcon}>👮</Text>
                <Text style={styles.moderatorText}>Moderator Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flexGrow: 1,
  },
  gradientContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  contentWrapper: {
    width: "85%",
    maxWidth: 345,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 48,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: COLORS.textLightSecondary,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 10,
    width: "100%",
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.64,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 51,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxInner: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  rememberMeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 0,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1.64,
    borderTopColor: COLORS.border,
    marginBottom: 16,
  },
  signUpPromptText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  moderatorSection: {
    paddingTop: 8,
    borderTopWidth: 1.64,
    borderTopColor: COLORS.border,
  },
  moderatorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  moderatorIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  moderatorText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
