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

interface Report {
  id: string;
  reporterName: string;
  reportedUserName: string;
  reason: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'investigating';
  description: string;
  evidence?: string;
}

interface ModeratorDashboardProps {
  onLogout: () => void;
}

const mockReports: Report[] = [
  {
    id: '1',
    reporterName: 'John D.',
    reportedUserName: 'Alex P.',
    reason: 'Inappropriate Behavior',
    timestamp: '2 hours ago',
    status: 'pending',
    description: 'User was disrespectful during ride',
    evidence: 'Chat logs available',
  },
  {
    id: '2',
    reporterName: 'Sarah M.',
    reportedUserName: 'Tom K.',
    reason: 'Safety Concern',
    timestamp: '4 hours ago',
    status: 'investigating',
    description: 'Unsafe driving reported',
    evidence: 'Multiple witness accounts',
  },
  {
    id: '3',
    reporterName: 'Emma W.',
    reportedUserName: 'Mike J.',
    reason: 'Damage Report',
    timestamp: '1 day ago',
    status: 'approved',
    description: 'Vehicle damage reported',
    evidence: 'Photos attached',
  },
];

export const ModeratorDashboard: React.FC<ModeratorDashboardProps> = ({ onLogout }) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState(mockReports);

  const stats = {
    pending: reports.filter((r) => r.status === 'pending').length,
    investigating: reports.filter((r) => r.status === 'investigating').length,
    resolved: reports.filter((r) => r.status === 'approved' || r.status === 'rejected').length,
  };

  const handleApproveReport = (reportId: string) => {
    setReports(
      reports.map((r) =>
        r.id === reportId ? { ...r, status: 'approved' as const } : r
      )
    );
    setSelectedReport(null);
  };

  const handleRejectReport = (reportId: string) => {
    setReports(
      reports.map((r) =>
        r.id === reportId ? { ...r, status: 'rejected' as const } : r
      )
    );
    setSelectedReport(null);
  };

  const handleInvestigate = (reportId: string) => {
    setReports(
      reports.map((r) =>
        r.id === reportId ? { ...r, status: 'investigating' as const } : r
      )
    );
    setSelectedReport(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'investigating':
        return COLORS.info;
      case 'approved':
        return COLORS.success;
      case 'rejected':
        return COLORS.danger;
      default:
        return COLORS.text;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'pending':
        return COLORS.warning + '20';
      case 'investigating':
        return COLORS.info + '20';
      case 'approved':
        return COLORS.success + '20';
      case 'rejected':
        return COLORS.danger + '20';
      default:
        return COLORS.primaryLight;
    }
  };

  const renderReportCard = ({ item }: { item: Report }) => (
    <Pressable
      style={styles.reportCard}
      onPress={() => setSelectedReport(item)}
    >
      <View style={styles.reportCardHeader}>
        <View style={styles.reportCardLeft}>
          <Text style={styles.reportCardTitle}>{item.reportedUserName}</Text>
          <Text style={styles.reportCardSubtitle}>Reported by {item.reporterName}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusBgColor(item.status) },
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={styles.reportReason}>Reason: {item.reason}</Text>
      <Text style={styles.reportTime}>{item.timestamp}</Text>
    </Pressable>
  );

  if (selectedReport) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => setSelectedReport(null)}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Report Details</Text>
          <Pressable style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scrollContent}>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reported User:</Text>
              <Text style={styles.detailValue}>{selectedReport.reportedUserName}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reporter:</Text>
              <Text style={styles.detailValue}>{selectedReport.reporterName}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reason:</Text>
              <Text style={styles.detailValue}>{selectedReport.reason}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>{selectedReport.timestamp}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{selectedReport.description}</Text>
            </View>

            {selectedReport.evidence && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Evidence</Text>
                  <Text style={styles.descriptionText}>{selectedReport.evidence}</Text>
                </View>
              </>
            )}

            <View style={styles.divider} />

            <View style={styles.statusSection}>
              <Text style={styles.statusLabel}>Current Status:</Text>
              <View
                style={[
                  styles.statusBadgeLarge,
                  { backgroundColor: getStatusBgColor(selectedReport.status) },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeTextLarge,
                    { color: getStatusColor(selectedReport.status) },
                  ]}
                >
                  {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          {selectedReport.status === 'pending' && (
            <View style={styles.actionsSection}>
              <Pressable
                style={styles.investigateButton}
                onPress={() => handleInvestigate(selectedReport.id)}
              >
                <Text style={styles.buttonText}>🔍 Investigate Further</Text>
              </Pressable>

              <Pressable
                style={styles.approveButton}
                onPress={() => handleApproveReport(selectedReport.id)}
              >
                <Text style={styles.buttonText}>✓ Approve Report</Text>
              </Pressable>

              <Pressable
                style={styles.rejectButton}
                onPress={() => handleRejectReport(selectedReport.id)}
              >
                <Text style={styles.buttonText}>✕ Reject Report</Text>
              </Pressable>
            </View>
          )}

          {selectedReport.status === 'investigating' && (
            <View style={styles.actionsSection}>
              <Pressable
                style={styles.approveButton}
                onPress={() => handleApproveReport(selectedReport.id)}
              >
                <Text style={styles.buttonText}>✓ Confirm & Close</Text>
              </Pressable>

              <Pressable
                style={styles.rejectButton}
                onPress={() => handleRejectReport(selectedReport.id)}
              >
                <Text style={styles.buttonText}>✕ Dismiss Report</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.spacing} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moderator Dashboard</Text>
        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.investigating}</Text>
            <Text style={styles.statLabel}>Investigating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Reports List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Reports</Text>
          <FlatList
            data={reports}
            renderItem={renderReportCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.reportsList}
          />
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
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
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
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.danger + '20',
  },
  logoutIcon: {
    fontSize: FONT_SIZES.lg,
  },
  scrollContent: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
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
  },
  sectionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  reportsList: {
    gap: SPACING.md,
  },
  reportCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reportCardLeft: {
    flex: 1,
    gap: SPACING.xs,
  },
  reportCardTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reportCardSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  reportReason: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  reportTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  detailsCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  detailSection: {
    gap: SPACING.sm,
  },
  descriptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  statusSection: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  statusLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statusBadgeLarge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  statusBadgeTextLarge: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
  },
  actionsSection: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    gap: SPACING.md,
  },
  investigateButton: {
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.info,
    alignItems: 'center',
  },
  approveButton: {
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.success,
    alignItems: 'center',
  },
  rejectButton: {
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  spacing: {
    height: SPACING.xl,
  },
});
