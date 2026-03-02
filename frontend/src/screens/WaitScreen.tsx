import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme/colors';

interface PartyMember {
  id: string;
  name: string;
  initial: string;
  status: string;
  isLeader: boolean;
}

interface WaitScreenProps {
  onContinue: () => void;
}

const mockPartyMembers: PartyMember[] = [
  {
    id: '1',
    name: 'ndfjv',
    initial: 'n',
    status: 'At pickup point',
    isLeader: false,
  },
  {
    id: '2',
    name: 'Alex P.',
    initial: 'A',
    status: 'At pickup point',
    isLeader: true,
  },
];

const driverInfo = {
  name: 'David Smith',
  vehicle: 'Silver Toyota Prius',
  licensePlate: 'AB12 CDE',
  distance: '2.1 miles away',
  arrivalTime: '8 min',
};

const pickupLocation = 'North Station - Main Entrance';

export const WaitScreen: React.FC<WaitScreenProps> = ({ onContinue }) => {
  const allMembersPresent = true;
  const waitingForLeader = true;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Section - Driver Arrival Countdown */}
      <View style={styles.topSection}>
        <View style={styles.pickupMarker}>
          <Text style={styles.pickupMarkerIcon}>📍</Text>
        </View>

        <View style={styles.arrivalCard}>
          <Text style={styles.arrivalLabel}>Driver arriving in</Text>
          <Text style={styles.arrivalTime}>{driverInfo.arrivalTime}</Text>
        </View>

        <View style={styles.vehicleIcon}>
          <Text style={styles.vehicleEmoji}>🚗</Text>
        </View>
      </View>

      {/* Bottom Section - Ride Details */}
      <View style={styles.bottomSection}>
        {/* Driver Info Header */}
        <View style={styles.driverSection}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>{driverInfo.name.charAt(0)}</Text>
          </View>

          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driverInfo.name}</Text>
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleModel}>{driverInfo.vehicle}</Text>
              <View style={styles.licensePlate}>
                <Text style={styles.licensePlateText}>{driverInfo.licensePlate}</Text>
              </View>
            </View>
            <View style={styles.distanceRow}>
              <Text style={styles.distanceIcon}>📍</Text>
              <Text style={styles.distanceText}>{driverInfo.distance}</Text>
            </View>
          </View>

          <Pressable style={styles.contactButton}>
            <Text style={styles.contactIcon}>📞</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Pickup Location */}
        <View style={styles.pickupSection}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationContent}>
              <Text style={styles.locationLabel}>Pickup Location</Text>
              <Text style={styles.locationName}>{pickupLocation}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Party Members */}
        <View style={styles.partySection}>
          <View style={styles.partyHeader}>
            <Text style={styles.partyIcon}>👥</Text>
            <Text style={styles.partyTitle}>Your Party ({mockPartyMembers.length})</Text>
          </View>

          <View style={styles.membersList}>
            {mockPartyMembers.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{member.initial}</Text>
                  {member.isLeader && (
                    <View style={styles.leaderBadge}>
                      <Text style={styles.leaderBadgeText}>👑</Text>
                    </View>
                  )}
                </View>

                <View style={styles.memberInfo}>
                  <View style={styles.memberNameRow}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    {member.isLeader && (
                      <View style={styles.leaderLabel}>
                        <Text style={styles.leaderLabelText}>Leader</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.memberStatus}>{member.status}</Text>
                </View>

                <Text style={styles.checkmark}>✓</Text>
              </View>
            ))}
          </View>

          {/* Status Messages */}
          <View style={styles.statusMessages}>
            {allMembersPresent && (
              <View style={styles.successMessage}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successText}>All members are here!</Text>
              </View>
            )}

            {waitingForLeader && (
              <View style={styles.infoMessage}>
                <Text style={styles.infoIcon}>⏳</Text>
                <Text style={styles.infoText}>
                  Waiting for party leader to book the ride...
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Button */}
        <Pressable style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>Ready to Go</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
  },
  topSection: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pickupMarker: {
    position: 'absolute',
    left: 30,
    fontSize: FONT_SIZES.xxl,
  },
  pickupMarkerIcon: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.primary,
  },
  arrivalCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  arrivalLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  arrivalTime: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  vehicleIcon: {
    position: 'absolute',
    right: 30,
    fontSize: FONT_SIZES.xxl,
  },
  vehicleEmoji: {
    fontSize: FONT_SIZES.xxl,
  },
  bottomSection: {
    flex: 0.7,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    paddingBottom: SPACING.md,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverAvatarText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
  },
  driverInfo: {
    flex: 1,
    gap: SPACING.sm,
  },
  driverName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  vehicleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  vehicleModel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  licensePlate: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  licensePlateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontFamily: 'Courier New',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  distanceIcon: {
    fontSize: FONT_SIZES.base,
  },
  distanceText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: FONT_SIZES.lg,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  pickupSection: {
    paddingVertical: SPACING.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  locationIcon: {
    fontSize: FONT_SIZES.lg,
    marginTop: SPACING.xs,
  },
  locationContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  locationLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  locationName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  partySection: {
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  partyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  partyIcon: {
    fontSize: FONT_SIZES.lg,
  },
  partyTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  membersList: {
    gap: SPACING.sm,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.success + '15',
    borderWidth: 1,
    borderColor: COLORS.success + '40',
    gap: SPACING.md,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  memberAvatarText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
  },
  leaderBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accentYellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderBadgeText: {
    fontSize: FONT_SIZES.sm,
  },
  memberInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  memberName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  leaderLabel: {
    backgroundColor: COLORS.accentYellow,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  leaderLabelText: {
    fontSize: FONT_SIZES.xs,
    color: '#a65f00',
    fontWeight: '500',
  },
  memberStatus: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  checkmark: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.success,
  },
  statusMessages: {
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.success + '15',
    borderWidth: 1,
    borderColor: COLORS.success + '40',
    gap: SPACING.md,
  },
  successIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.success,
  },
  successText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: '600',
  },
  infoMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  infoIcon: {
    fontSize: FONT_SIZES.lg,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  continueButton: {
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  continueButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textLight,
  },
});
