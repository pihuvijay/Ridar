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
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

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
  const { colors } = useTheme();
  const [totalRides] = useState(12);
  const [averageRating] = useState(4.8);
  const [totalSavings] = useState(47.5);

  const handlePrivacyOption = (option: string) => {
    console.log(`Navigate to: ${option}`);
  };

  const renderRideCard = ({ item }: { item: RideHistory }) => (
    <View style={[styles.rideCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <View style={styles.rideCardHeader}>
        <View style={styles.rideCardLeft}>
          <Text style={[styles.rideDate, { color: colors.primary }]}>{item.date}</Text>
          <View style={[styles.rideTypeBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.rideTypeText, { color: colors.primary }]}>{item.type}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.rideDuration, { color: colors.textSecondary }]}>{item.duration}</Text>
          </View>
        </View>
        <Text style={[styles.rideAmount, { color: colors.success }]}>{item.amount}</Text>
      </View>

      <View style={styles.rideLocations}>
        <View style={styles.locationRow}>
          <Ionicons name="ellipse" size={12} color={colors.primary} style={styles.locationDot} />
          <Text style={[styles.locationText, { color: colors.text }]}>{item.origin}</Text>
        </View>
        <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.primary} style={styles.locationDot} />
          <Text style={[styles.locationText, { color: colors.text }]}>{item.destination}</Text>
        </View>
      </View>

      <View style={styles.rideCardFooter}>
        <View style={styles.rideCardFooterLeft}>
          <Text style={[styles.rideFooterText, { color: colors.textSecondary }]}>Driver: {item.driver}</Text>
          <Text style={[styles.rideFooterText, { color: colors.textSecondary }]}>{item.groupSize}</Text>
        </View>
        <View style={styles.rideCardFooterRight}>
          <Text style={[styles.rideFareText, { color: colors.textSecondary }]}>Taxi: {item.taxiFare}</Text>
          <Text style={[styles.ridePaidText, { color: colors.primary }]}>Paid: {item.amountPaid}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Overview */}
        <View style={styles.profileOverview}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.profileAvatarText, { color: colors.background }]}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.primary }]}>{userName}</Text>
            <Text style={[styles.profileStatus, { color: colors.textSecondary }]}>Active Member</Text>
          </View>
        </View>

        {/* User Stats Summary */}
        <View style={styles.statsSummary}>
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{totalRides}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Rides</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{averageRating}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>£{totalSavings}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Savings</Text>
          </View>
        </View>

        {/* Ride History Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
          <View style={[styles.sectionHeader, { backgroundColor: colors.primaryLight, borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Recent Rides</Text>
            <Pressable>
              <Text style={[styles.viewAllLink, { color: colors.primary }]}>View All →</Text>
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
        <View style={[styles.membershipCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
          <Text style={[styles.membershipTitle, { color: colors.primary }]}>Membership Benefits</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} style={styles.benefitIcon} />
            <Text style={[styles.benefitText, { color: colors.primary }]}>Verified driver status</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} style={styles.benefitIcon} />
            <Text style={[styles.benefitText, { color: colors.primary }]}>Priority ride matching</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} style={styles.benefitIcon} />
            <Text style={[styles.benefitText, { color: colors.primary }]}>Early access to new features</Text>
          </View>
        </View>

        {/* Privacy & Safety */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
          <View style={[styles.sectionHeader, { backgroundColor: colors.primaryLight, borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Privacy & Safety</Text>
          </View>

          <Pressable
            style={[styles.privacyOptionButton, { borderBottomColor: colors.border, backgroundColor: colors.cardBackground }]}
            onPress={() => handlePrivacyOption('change-password')}
          >
            <Text style={[styles.privacyOptionText, { color: colors.primary }]}>Change Password</Text>
            <Text style={[styles.privacyOptionArrow, { color: colors.primary }]}>→</Text>
          </Pressable>

          <Pressable
            style={[styles.privacyOptionButton, { borderBottomColor: colors.border, backgroundColor: colors.cardBackground }]}
            onPress={() => handlePrivacyOption('block-list')}
          >
            <Text style={[styles.privacyOptionText, { color: colors.primary }]}>Block List</Text>
            <Text style={[styles.privacyOptionArrow, { color: colors.primary }]}>→</Text>
          </Pressable>

          <Pressable
            style={[styles.privacyOptionButton, { borderBottomColor: colors.border, backgroundColor: colors.cardBackground }]}
            onPress={() => handlePrivacyOption('privacy-settings')}
          >
            <Text style={[styles.privacyOptionText, { color: colors.primary }]}>Privacy Settings</Text>
            <Text style={[styles.privacyOptionArrow, { color: colors.primary }]}>→</Text>
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
