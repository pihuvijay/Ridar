import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme/colors';

interface RideHistory {
  id: string;
  date: string;
  type: string;
  duration: string;
  amount: string;
  origin: string;
  destination: string;
  driver: string;
  groupSize: string;
  taxiFare: string;
  amountPaid: string;
}

interface ProfileScreenProps {
  userName: string;
  onBack: () => void;
  onUpdateProfile: (profile: any) => void;
  onViewSettings: () => void;
}

const mockRideHistory: RideHistory[] = [
  {
    id: '1',
    date: 'Feb 12',
    type: 'Rider',
    duration: '18 mins',
    amount: '£11',
    origin: 'Campus Sports Centre',
    destination: 'Train Station',
    driver: 'James Wilson',
    groupSize: '4 in group',
    taxiFare: '£15',
    amountPaid: '£4',
  },
  {
    id: '2',
    date: 'Feb 10',
    type: 'Rider',
    duration: '25 mins',
    amount: '£8',
    origin: 'Downtown',
    destination: 'Airport',
    driver: 'Sarah M.',
    groupSize: '3 in group',
    taxiFare: '£25',
    amountPaid: '£8',
  },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userName,
  onBack,
  onUpdateProfile,
  onViewSettings,
}) => {
  const [totalRides] = useState(12);
  const [averageRating] = useState(4.8);
  const [totalSavings] = useState(47.5);

  const handlePrivacyOption = (option: string) => {
    console.log(`Navigate to: ${option}`);
  };

  const renderRideCard = ({ item }: { item: RideHistory }) => (
    <View style={styles.rideCard}>
      <View style={styles.rideCardHeader}>
        <View style={styles.rideCardLeft}>
          <Text style={styles.rideDate}>{item.date}</Text>
          <View style={styles.rideTypeBadge}>
            <Text style={styles.rideTypeText}>{item.type}</Text>
          </View>
          <Text style={styles.rideDuration}>⏱ {item.duration}</Text>
        </View>
        <Text style={styles.rideAmount}>{item.amount}</Text>
      </View>

      <View style={styles.rideLocations}>
        <View style={styles.locationRow}>
          <Text style={styles.locationDot}>🔵</Text>
          <Text style={styles.locationText}>{item.origin}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.locationRow}>
          <Text style={styles.locationDot}>📍</Text>
          <Text style={styles.locationText}>{item.destination}</Text>
        </View>
      </View>

      <View style={styles.rideCardFooter}>
        <View style={styles.rideCardFooterLeft}>
          <Text style={styles.rideFooterText}>Driver: {item.driver}</Text>
          <Text style={styles.rideFooterText}>{item.groupSize}</Text>
        </View>
        <View style={styles.rideCardFooterRight}>
          <Text style={styles.rideFareText}>Taxi: {item.taxiFare}</Text>
          <Text style={styles.ridePaidText}>Paid: {item.amountPaid}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable style={styles.settingsButton} onPress={onViewSettings}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Overview */}
        <View style={styles.profileOverview}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileStatus}>Active Member</Text>
          </View>
        </View>

        {/* User Stats Summary */}
        <View style={styles.statsSummary}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalRides}</Text>
            <Text style={styles.statLabel}>Total Rides</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{averageRating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>£{totalSavings}</Text>
            <Text style={styles.statLabel}>Savings</Text>
          </View>
        </View>

        {/* Ride History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Rides</Text>
            <Pressable>
              <Text style={styles.viewAllLink}>View All →</Text>
            </Pressable>
          </View>
          <FlatList
            data={mockRideHistory}
            renderItem={renderRideCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.rideListContent}
          />
        </View>

        {/* Membership Info */}
        <View style={styles.membershipCard}>
          <Text style={styles.membershipTitle}>Membership Benefits</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Verified driver status</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Priority ride matching</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Early access to new features</Text>
          </View>
        </View>

        {/* Privacy & Safety */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Privacy & Safety</Text>
          </View>

          <Pressable
            style={styles.privacyOptionButton}
            onPress={() => handlePrivacyOption('change-password')}
          >
            <Text style={styles.privacyOptionText}>Change Password</Text>
            <Text style={styles.privacyOptionArrow}>→</Text>
          </Pressable>

          <Pressable
            style={styles.privacyOptionButton}
            onPress={() => handlePrivacyOption('block-list')}
          >
            <Text style={styles.privacyOptionText}>Block List</Text>
            <Text style={styles.privacyOptionArrow}>→</Text>
          </Pressable>

          <Pressable
            style={styles.privacyOptionButton}
            onPress={() => handlePrivacyOption('privacy-settings')}
          >
            <Text style={styles.privacyOptionText}>Privacy Settings</Text>
            <Text style={styles.privacyOptionArrow}>→</Text>
          </Pressable>
        </View>

        <View style={styles.spacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  backIcon: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  settingsIcon: {
    fontSize: FONT_SIZES.lg,
  },
  scrollContent: {
    flex: 1,
  },
  profileOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  profileName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  profileStatus: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statsSummary: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  section: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.primaryLight,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  viewAllLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  rideListContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  rideCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  rideCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rideCardLeft: {
    gap: SPACING.xs,
  },
  rideDate: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  rideTypeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  rideTypeText: {
    fontSize: FONT_SIZES.xs,
    color: '#1447e6',
    fontWeight: '500',
  },
  rideDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  rideAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.success,
  },
  rideLocations: {
    gap: SPACING.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  locationDot: {
    fontSize: FONT_SIZES.base,
  },
  locationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    flex: 1,
  },
  routeLine: {
    height: 20,
    width: 2,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.sm,
  },
  rideCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rideCardFooterLeft: {
    gap: SPACING.sm,
  },
  rideCardFooterRight: {
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  rideFooterText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  rideFareText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  ridePaidText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  membershipCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  membershipTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  benefitIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.success,
  },
  benefitText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  privacyOptionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  privacyOptionText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: COLORS.primary,
  },
  privacyOptionArrow: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
  },
  spacing: {
    height: SPACING.xl,
  },
});
