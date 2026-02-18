import React, { useState } from "react";
import { JSX } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ConnectAccountsPageProps {
  userName?: string;
  onNavigateHome?: () => void;
}

const AccountCard = ({
  icon,
  title,
  description,
  buttonText,
  onConnect,
  isConnected = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onConnect: () => void;
  isConnected?: boolean;
}) => {
  return (
    <View style={styles.accountCard}>
      <View style={styles.cardContent}>
        {icon}
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
          <TouchableOpacity
            style={[styles.connectButton, isConnected && styles.connectedButton]}
            onPress={onConnect}
            disabled={isConnected}
            activeOpacity={0.8}
          >
            <Text style={styles.connectButtonIcon}>✓</Text>
            <Text style={styles.connectButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const ConnectAccountsPage = ({
  userName = "User",
  onNavigateHome,
}: ConnectAccountsPageProps): JSX.Element => {
  const [uberConnected, setUberConnected] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);

  const handleUberConnect = () => {
    console.log("Connecting Uber...");
    // Simulate Uber OAuth flow
    setTimeout(() => {
      setUberConnected(true);
    }, 500);
  };

  const handleStripeConnect = () => {
    console.log("Connecting Stripe...");
    // Simulate Stripe OAuth flow
    setTimeout(() => {
      setStripeConnected(true);
    }, 500);
  };

  const handleContinue = () => {
    if (uberConnected && stripeConnected) {
      console.log("All accounts connected, navigating home");
      if (onNavigateHome) onNavigateHome();
    }
  };

  const allConnected = uberConnected && stripeConnected;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#2B7FFF", "#9810FA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>R</Text>
            </View>
            <Text style={styles.headerTitle}>Welcome to Ridar, {userName}!</Text>
            <Text style={styles.headerSubtitle}>
              Connect your accounts to get started
            </Text>
          </View>

          {/* Account Cards */}
          <View style={styles.accountsSection}>
            <AccountCard
              icon={
                <View style={styles.iconContainer}>
                  <Text style={styles.uberIcon}>🚗</Text>
                </View>
              }
              title="Uber Account"
              description="Required to book rides for your group"
              buttonText="Connect Uber"
              onConnect={handleUberConnect}
              isConnected={uberConnected}
            />

            <AccountCard
              icon={
                <View style={[styles.iconContainer, styles.stripeIcon]}>
                  <Text style={styles.stripeIconText}>S</Text>
                </View>
              }
              title="Stripe Account"
              description="Required to send and receive payments"
              buttonText="Connect Stripe"
              onConnect={handleStripeConnect}
              isConnected={stripeConnected}
            />
          </View>

          {/* Footer Info */}
          <Text style={styles.footerText}>
            Both accounts are required to use Ridar
          </Text>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, !allConnected && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!allConnected}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              {allConnected ? "Continue to Home" : "Connect Both Accounts"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  gradientBackground: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBadge: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#daeafe",
    textAlign: "center",
  },
  accountsSection: {
    gap: 16,
    marginBottom: 24,
  },
  accountCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 8,
  },
  cardContent: {
    flexDirection: "row",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#101828",
    justifyContent: "center",
    alignItems: "center",
  },
  uberIcon: {
    fontSize: 24,
  },
  stripeIcon: {
    backgroundColor: "#4f39f6",
  },
  stripeIconText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  cardTextContainer: {
    flex: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e2939",
  },
  cardDescription: {
    fontSize: 14,
    color: "#4a5565",
    lineHeight: 20,
  },
  connectButton: {
    backgroundColor: "#155dfc",
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  connectedButton: {
    backgroundColor: "#d1d5dc",
    opacity: 0.6,
  },
  connectButtonIcon: {
    fontSize: 16,
    color: "#ffffff",
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  footerText: {
    fontSize: 14,
    color: "#daeafe",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#155dfc",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonDisabled: {
    backgroundColor: "#d1d5dc",
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
