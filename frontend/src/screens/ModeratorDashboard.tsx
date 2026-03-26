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
  reports: Report[];
  onUpdateReport: (id: string, status: Report['status']) => void;
  onLogout: () => void;
}

export const ModeratorDashboard: React.FC<ModeratorDashboardProps> = ({
  reports,
  onUpdateReport,
  onLogout,
}) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const stats = {
    pending: reports.filter((r) => r.status === 'pending').length,
    investigating: reports.filter((r) => r.status === 'investigating').length,
    resolved: reports.filter((r) => r.status === 'approved' || r.status === 'rejected').length,
  };

  const handleApproveReport = (reportId: string) => {
    onUpdateReport(reportId, 'approved');
    setSelectedReport(null);
  };

  const handleRejectReport = (reportId: string) => {
    onUpdateReport(reportId, 'rejected');
    setSelectedReport(null);
  };

  const handleInvestigate = (reportId: string) => {
    onUpdateReport(reportId, 'investigating');
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
          <View style={styles.reportCardTitleRow}>
            <Text style={styles.reportCardTitle}>{item.reportedUserName}</Text>
            {item.timestamp === 'Just now' && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>New</Text>
              </View>
            )}
          </View>
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
            <Ionicons name="chevron-back" size={18} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Report Details</Text>
          <Pressable style={styles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.text} />
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="search-outline" size={16} color="#fff" />
                  <Text style={styles.buttonText}>Investigate Further</Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.approveButton}
                onPress={() => handleApproveReport(selectedReport.id)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.buttonText}>Approve Report</Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.rejectButton}
                onPress={() => handleRejectReport(selectedReport.id)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="close" size={16} color="#fff" />
                  <Text style={styles.buttonText}>Reject Report</Text>
                </View>
              </Pressable>
            </View>
          )}

          {selectedReport.status === 'investigating' && (
            <View style={styles.actionsSection}>
              <Pressable
                style={styles.approveButton}
                onPress={() => handleApproveReport(selectedReport.id)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.buttonText}>Confirm & Close</Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.rejectButton}
                onPress={() => handleRejectReport(selectedReport.id)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="close" size={16} color="#fff" />
                  <Text style={styles.buttonText}>Dismiss Report</Text>
                </View>
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
          <Ionicons name="log-out-outline" size={18} color={COLORS.text} />
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
  reportCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  reportCardTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  newBadge: {
    backgroundColor: COLORS.danger + '20',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  newBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.danger,
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
