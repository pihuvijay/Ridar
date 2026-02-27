import React, { useState } from "react";
import type { JSX } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface MapScreenProps {
  onViewRideGroups?: () => void;
  onCreateRideGroup?: () => void;
  onMenuPress?: () => void;
  onSettingsPress?: () => void;
  onProfilePress?: () => void;
  userName?: string;
}

export const MapScreen = ({
  onViewRideGroups,
  onCreateRideGroup,
  onMenuPress,
  onSettingsPress,
  onProfilePress,
  userName = "Rhys Leonard",
}: MapScreenProps): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    if (onMenuPress) onMenuPress();
  };

  const handleSettingsClick = () => {
    console.log("Settings clicked");
    if (onSettingsPress) onSettingsPress();
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
    if (onProfilePress) onProfilePress();
  };

  const handleViewRideGroups = () => {
    console.log("View Available Ride Groups clicked");
    if (onViewRideGroups) onViewRideGroups();
  };

  const handleCreateRideGroup = () => {
    console.log("Create New Ride Group clicked");
    if (onCreateRideGroup) onCreateRideGroup();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleMenuToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find a Ride</Text>
        </View>

        <View style={styles.headerNav}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsClick}
            activeOpacity={0.7}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfileClick}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#2B7FFF", "#9810FA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>R</Text>
            </LinearGradient>
            <Text style={styles.userName}>{userName}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setIsMenuOpen(false)}
        >
          <View style={styles.menuContent}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                handleViewRideGroups();
              }}
            >
              <Text style={styles.menuItemText}>View Ride Groups</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                handleCreateRideGroup();
              }}
            >
              <Text style={styles.menuItemText}>Create Ride Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                handleSettingsClick();
              }}
            >
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
              }}
            >
              <Text style={styles.menuItemText}>Close Menu</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>🗺️ Map View</Text>
          <Text style={styles.mapSubtext}>Ride groups displayed on map</Text>
        </View>
      </View>

      {/* Footer with Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewRideGroups}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonIcon}>👥</Text>
          <Text style={styles.primaryButtonText}>View Available Ride Groups</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleCreateRideGroup}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Create New Ride Group</Text>
        </TouchableOpacity>

        <Text style={styles.availabilityText}>3 ride groups available near you</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  menuIcon: {
    fontSize: 24,
    color: "#1e2939",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e2939",
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  settingsIcon: {
    fontSize: 20,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  avatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  userName: {
    fontSize: 14,
    color: "#364153",
    fontWeight: "500",
    maxWidth: 150,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  menuContent: {
    backgroundColor: "#ffffff",
    marginTop: 80,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  menuItemText: {
    fontSize: 14,
    color: "#364153",
    fontWeight: "500",
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholder: {
    alignItems: "center",
    gap: 8,
  },
  mapPlaceholderText: {
    fontSize: 32,
  },
  mapSubtext: {
    fontSize: 14,
    color: "#6b7280",
  },
  footer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#0000001a",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#155dfc",
    borderRadius: 10,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonIcon: {
    fontSize: 20,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#155dfc",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#155dfc",
    fontSize: 16,
    fontWeight: "600",
  },
  availabilityText: {
    fontSize: 16,
    color: "#4a5565",
    textAlign: "center",
    fontWeight: "500",
  },
});
