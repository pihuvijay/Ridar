import React, { useState } from "react";
import {
	View,
	Text,
	ScrollView,
	Pressable,
	StyleSheet,
	SafeAreaView,
	FlatList,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../theme/colors";

interface Report {
	id: string;
	reporterName: string;
	reportedUserName: string;
	reason: string;
	timestamp: string;
	status: "pending" | "approved" | "rejected" | "investigating";
	description: string;
	evidence?: string;
}

interface ModeratorDashboardProps {
	reports: Report[];
	onUpdateReport: (id: string, status: Report["status"]) => void;
	onLogout: () => void;
}

export const ModeratorDashboard: React.FC<ModeratorDashboardProps> = ({
	reports,
	onUpdateReport,
	onLogout,
}) => {
	const [selectedReport, setSelectedReport] = useState<Report | null>(null);

	const stats = {
		pending: reports.filter((r) => r.status === "pending").length,
		investigating: reports.filter((r) => r.status === "investigating")
			.length,
		resolved: reports.filter(
			(r) => r.status === "approved" || r.status === "rejected",
		).length,
	};

	const handleApproveReport = (reportId: string) => {
		onUpdateReport(reportId, "approved");
		setSelectedReport(null);
	};

	const handleRejectReport = (reportId: string) => {
		onUpdateReport(reportId, "rejected");
		setSelectedReport(null);
	};

	const handleInvestigate = (reportId: string) => {
		onUpdateReport(reportId, "investigating");
		setSelectedReport(null);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "#B45309";
			case "investigating":
				return "#1D4ED8";
			case "approved":
				return "#047857";
			case "rejected":
				return "#B91C1C";
			default:
				return COLORS.text;
		}
	};

	const getStatusBgColor = (status: string) => {
		switch (status) {
			case "pending":
				return "#FEF3C7";
			case "investigating":
				return "#DBEAFE";
			case "approved":
				return "#D1FAE5";
			case "rejected":
				return "#FEE2E2";
			default:
				return COLORS.primaryLight;
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "pending":
				return "time-outline";
			case "investigating":
				return "search-outline";
			case "approved":
				return "checkmark-circle-outline";
			case "rejected":
				return "close-circle-outline";
			default:
				return "alert-circle-outline";
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
						<Text style={styles.reportCardTitle}>
							{item.reportedUserName}
						</Text>
						{item.timestamp === "Just now" && (
							<View style={styles.newBadge}>
								<Text style={styles.newBadgeText}>NEW</Text>
							</View>
						)}
					</View>
					<Text style={styles.reportCardSubtitle}>
						Reported by {item.reporterName}
					</Text>
				</View>

				<View
					style={[
						styles.statusBadge,
						{ backgroundColor: getStatusBgColor(item.status) },
					]}
				>
					<Ionicons
						name={getStatusIcon(item.status) as any}
						size={12}
						color={getStatusColor(item.status)}
					/>
					<Text
						style={[
							styles.statusBadgeText,
							{ color: getStatusColor(item.status) },
						]}
					>
						{item.status.charAt(0).toUpperCase() +
							item.status.slice(1)}
					</Text>
				</View>
			</View>

			<View style={styles.reasonRow}>
				<Ionicons
					name="flag-outline"
					size={14}
					color={COLORS.textSecondary}
				/>
				<Text style={styles.reportReason}>{item.reason}</Text>
			</View>

			<View style={styles.reportFooterRow}>
				<Text style={styles.reportTime}>{item.timestamp}</Text>
				<View style={styles.viewDetailsRow}>
					<Text style={styles.viewDetailsText}>View details</Text>
					<Ionicons
						name="chevron-forward"
						size={14}
						color={COLORS.textSecondary}
					/>
				</View>
			</View>
		</Pressable>
	);

	if (selectedReport) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.darkHeader}>
					<View style={styles.darkHeaderTop}>
						<Pressable
							style={styles.headerIconButton}
							onPress={() => setSelectedReport(null)}
						>
							<Ionicons
								name="chevron-back"
								size={18}
								color={COLORS.textLight}
							/>
						</Pressable>

						<Pressable
							style={styles.headerIconButton}
							onPress={onLogout}
						>
							<Ionicons
								name="log-out-outline"
								size={18}
								color={COLORS.textLight}
							/>
						</Pressable>
					</View>

					<View style={styles.headerBadge}>
						<Ionicons
							name="shield-checkmark-outline"
							size={14}
							color={COLORS.textLight}
						/>
						<Text style={styles.headerBadgeText}>
							Moderator review
						</Text>
					</View>

					<Text style={styles.darkHeaderTitle}>Report Details</Text>
					<Text style={styles.darkHeaderSubtitle}>
						Review the report and choose the appropriate action.
					</Text>
				</View>

				<ScrollView
					style={styles.detailsScroll}
					contentContainerStyle={styles.detailsScrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.detailsCard}>
						<View style={styles.detailBlock}>
							<Text style={styles.detailBlockLabel}>
								Reported user
							</Text>
							<Text style={styles.detailBlockValue}>
								{selectedReport.reportedUserName}
							</Text>
						</View>

						<View style={styles.detailDivider} />

						<View style={styles.detailBlock}>
							<Text style={styles.detailBlockLabel}>
								Reporter
							</Text>
							<Text style={styles.detailBlockValue}>
								{selectedReport.reporterName}
							</Text>
						</View>

						<View style={styles.detailDivider} />

						<View style={styles.detailBlock}>
							<Text style={styles.detailBlockLabel}>Reason</Text>
							<Text style={styles.detailBlockValue}>
								{selectedReport.reason}
							</Text>
						</View>

						<View style={styles.detailDivider} />

						<View style={styles.detailBlock}>
							<Text style={styles.detailBlockLabel}>Time</Text>
							<Text style={styles.detailBlockValue}>
								{selectedReport.timestamp}
							</Text>
						</View>

						<View style={styles.detailDivider} />

						<View style={styles.detailSection}>
							<Text style={styles.sectionHeading}>
								Description
							</Text>
							<Text style={styles.descriptionText}>
								{selectedReport.description}
							</Text>
						</View>

						{selectedReport.evidence ? (
							<>
								<View style={styles.detailDivider} />
								<View style={styles.detailSection}>
									<Text style={styles.sectionHeading}>
										Evidence
									</Text>
									<Text style={styles.descriptionText}>
										{selectedReport.evidence}
									</Text>
								</View>
							</>
						) : null}

						<View style={styles.detailDivider} />

						<View style={styles.currentStatusSection}>
							<Text style={styles.sectionHeading}>
								Current Status
							</Text>
							<View
								style={[
									styles.statusBadgeLarge,
									{
										backgroundColor: getStatusBgColor(
											selectedReport.status,
										),
									},
								]}
							>
								<Ionicons
									name={
										getStatusIcon(
											selectedReport.status,
										) as any
									}
									size={14}
									color={getStatusColor(
										selectedReport.status,
									)}
								/>
								<Text
									style={[
										styles.statusBadgeTextLarge,
										{
											color: getStatusColor(
												selectedReport.status,
											),
										},
									]}
								>
									{selectedReport.status
										.charAt(0)
										.toUpperCase() +
										selectedReport.status.slice(1)}
								</Text>
							</View>
						</View>
					</View>

					{selectedReport.status === "pending" && (
						<View style={styles.actionsSection}>
							<Pressable
								style={styles.investigateButton}
								onPress={() =>
									handleInvestigate(selectedReport.id)
								}
							>
								<Ionicons
									name="search-outline"
									size={16}
									color="#fff"
								/>
								<Text style={styles.buttonText}>
									Investigate Further
								</Text>
							</Pressable>

							<Pressable
								style={styles.approveButton}
								onPress={() =>
									handleApproveReport(selectedReport.id)
								}
							>
								<Ionicons
									name="checkmark"
									size={16}
									color="#fff"
								/>
								<Text style={styles.buttonText}>
									Approve Report
								</Text>
							</Pressable>

							<Pressable
								style={styles.rejectButton}
								onPress={() =>
									handleRejectReport(selectedReport.id)
								}
							>
								<Ionicons name="close" size={16} color="#fff" />
								<Text style={styles.buttonText}>
									Reject Report
								</Text>
							</Pressable>
						</View>
					)}

					{selectedReport.status === "investigating" && (
						<View style={styles.actionsSection}>
							<Pressable
								style={styles.approveButton}
								onPress={() =>
									handleApproveReport(selectedReport.id)
								}
							>
								<Ionicons
									name="checkmark"
									size={16}
									color="#fff"
								/>
								<Text style={styles.buttonText}>
									Confirm & Close
								</Text>
							</Pressable>

							<Pressable
								style={styles.rejectButton}
								onPress={() =>
									handleRejectReport(selectedReport.id)
								}
							>
								<Ionicons name="close" size={16} color="#fff" />
								<Text style={styles.buttonText}>
									Dismiss Report
								</Text>
							</Pressable>
						</View>
					)}
				</ScrollView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.darkHeader}>
				<View style={styles.darkHeaderTopSingle}>
					<Pressable
						style={styles.headerIconButton}
						onPress={onLogout}
					>
						<Ionicons
							name="log-out-outline"
							size={18}
							color={COLORS.textLight}
						/>
					</Pressable>
				</View>

				<View style={styles.headerBadge}>
					<Ionicons
						name="shield-checkmark-outline"
						size={14}
						color={COLORS.textLight}
					/>
					<Text style={styles.headerBadgeText}>
						Moderator dashboard
					</Text>
				</View>

				<Text style={styles.darkHeaderTitle}>Safety Reports</Text>
				<Text style={styles.darkHeaderSubtitle}>
					Monitor incoming reports, investigate incidents, and resolve
					safety issues.
				</Text>
			</View>

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.statsRow}>
					<View style={styles.statCard}>
						<Text style={styles.statValue}>{stats.pending}</Text>
						<Text style={styles.statLabel}>Pending</Text>
					</View>

					<View style={styles.statCard}>
						<Text style={styles.statValue}>
							{stats.investigating}
						</Text>
						<Text style={styles.statLabel}>Investigating</Text>
					</View>

					<View style={styles.statCard}>
						<Text style={styles.statValue}>{stats.resolved}</Text>
						<Text style={styles.statLabel}>Resolved</Text>
					</View>
				</View>

				<View style={styles.listSection}>
					<View style={styles.listSectionHeader}>
						<Text style={styles.listSectionTitle}>All Reports</Text>
						<Text style={styles.listSectionCount}>
							{reports.length} total
						</Text>
					</View>

					<FlatList
						data={reports}
						renderItem={renderReportCard}
						keyExtractor={(item) => item.id}
						scrollEnabled={false}
						contentContainerStyle={styles.reportsList}
					/>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8FAFC",
	},
	darkHeader: {
		backgroundColor: "#0F172A",
		paddingHorizontal: SPACING.lg,
		paddingTop: SPACING.lg,
		paddingBottom: SPACING.xl,
	},
	darkHeaderTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: SPACING.lg,
	},
	darkHeaderTopSingle: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
		marginBottom: SPACING.lg,
	},
	headerIconButton: {
		width: 42,
		height: 42,
		borderRadius: 14,
		backgroundColor: "rgba(255,255,255,0.12)",
		alignItems: "center",
		justifyContent: "center",
	},
	headerBadge: {
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "rgba(255,255,255,0.12)",
		marginBottom: SPACING.md,
	},
	headerBadgeText: {
		fontSize: FONT_SIZES.xs,
		fontWeight: "700",
		color: COLORS.textLight,
	},
	darkHeaderTitle: {
		fontSize: 30,
		fontWeight: "700",
		color: COLORS.textLight,
		marginBottom: 8,
	},
	darkHeaderSubtitle: {
		fontSize: FONT_SIZES.sm,
		lineHeight: 22,
		color: "rgba(255,255,255,0.75)",
	},
	scroll: {
		flex: 1,
	},
	scrollContent: {
		padding: SPACING.lg,
		gap: SPACING.lg,
	},
	statsRow: {
		flexDirection: "row",
		gap: SPACING.md,
		marginTop: -22,
	},
	statCard: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 20,
		paddingVertical: SPACING.lg,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#E5E7EB",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.06,
		shadowRadius: 10,
		elevation: 3,
	},
	statValue: {
		fontSize: FONT_SIZES.xxl,
		fontWeight: "700",
		color: COLORS.primary,
		marginBottom: 4,
	},
	statLabel: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
		fontWeight: "600",
	},
	listSection: {
		gap: SPACING.md,
	},
	listSectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	listSectionTitle: {
		fontSize: FONT_SIZES.lg,
		fontWeight: "700",
		color: COLORS.primary,
	},
	listSectionCount: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	reportsList: {
		gap: SPACING.md,
	},
	reportCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		padding: SPACING.md,
		gap: SPACING.sm,
	},
	reportCardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	reportCardLeft: {
		flex: 1,
		gap: 4,
		paddingRight: SPACING.sm,
	},
	reportCardTitleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
		flexWrap: "wrap",
	},
	reportCardTitle: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
		color: COLORS.primary,
	},
	newBadge: {
		backgroundColor: "#FEE2E2",
		borderRadius: 999,
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	newBadgeText: {
		fontSize: 10,
		fontWeight: "700",
		color: "#B91C1C",
	},
	reportCardSubtitle: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
	},
	statusBadgeText: {
		fontSize: 11,
		fontWeight: "700",
	},
	reasonRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	reportReason: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.primary,
		fontWeight: "500",
	},
	reportFooterRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 4,
	},
	reportTime: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
	},
	viewDetailsRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
	},
	viewDetailsText: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
		fontWeight: "600",
	},
	detailsScroll: {
		flex: 1,
		backgroundColor: "#F8FAFC",
	},
	detailsScrollContent: {
		padding: SPACING.lg,
		gap: SPACING.lg,
	},
	detailsCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 24,
		padding: SPACING.lg,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		gap: SPACING.md,
	},
	detailBlock: {
		gap: 6,
	},
	detailBlockLabel: {
		fontSize: FONT_SIZES.xs,
		fontWeight: "700",
		color: COLORS.textSecondary,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	detailBlockValue: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.primary,
	},
	detailDivider: {
		height: 1,
		backgroundColor: "#E5E7EB",
	},
	detailSection: {
		gap: 8,
	},
	sectionHeading: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "700",
		color: COLORS.primary,
	},
	descriptionText: {
		fontSize: FONT_SIZES.sm,
		lineHeight: 22,
		color: COLORS.text,
	},
	currentStatusSection: {
		gap: SPACING.sm,
		alignItems: "flex-start",
	},
	statusBadgeLarge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 999,
	},
	statusBadgeTextLarge: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "700",
	},
	actionsSection: {
		gap: SPACING.md,
	},
	investigateButton: {
		height: 54,
		borderRadius: 16,
		backgroundColor: COLORS.info,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	approveButton: {
		height: 54,
		borderRadius: 16,
		backgroundColor: COLORS.success,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	rejectButton: {
		height: 54,
		borderRadius: 16,
		backgroundColor: COLORS.danger,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	buttonText: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
		color: COLORS.textLight,
	},
});
