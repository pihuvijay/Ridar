import React, { useState } from "react";
import {
	View,
	Text,
	ScrollView,
	Pressable,
	StyleSheet,
	SafeAreaView,
	Modal,
	TextInput,
} from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../theme/colors";

interface Rider {
	id: string;
	name: string;
	initial: string;
	isCreator: boolean;
	isSelf: boolean;
}

interface RideInsightsScreenProps {
	rideGroup: any;
	onAddReport: (report: any) => void;
	onDone: () => void;
}

const REPORT_REASONS = [
	"Aggressive Behavior",
	"Inappropriate Conduct",
	"Safety Concern",
	"No Show",
	"Other",
];

const mockPartyRiders: Rider[] = [
	{ id: "1", name: "Sarah M.", initial: "S", isCreator: true, isSelf: false },
	{ id: "2", name: "Alex P.", initial: "A", isCreator: false, isSelf: false },
	{ id: "3", name: "You", initial: "Y", isCreator: false, isSelf: true },
];

export const RideInsightsScreen: React.FC<RideInsightsScreenProps> = ({
	rideGroup,
	onAddReport,
	onDone,
}) => {
	const [reportModalVisible, setReportModalVisible] = useState(false);
	const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
	const [selectedReason, setSelectedReason] = useState("");
	const [reportDescription, setReportDescription] = useState("");
	const [reportSubmitted, setReportSubmitted] = useState(false);

	const destination = rideGroup?.destination || "Downtown Financial District";
	const pickup = rideGroup?.pickup || "North Station - Main Entrance";
	const price = rideGroup?.price || 8;
	const etaMinutes = 23;
	const co2SavedKg = 1.8;

	const openReportModal = (rider: Rider) => {
		setSelectedRider(rider);
		setSelectedReason("");
		setReportDescription("");
		setReportSubmitted(false);
		setReportModalVisible(true);
	};

	const handleSubmitReport = () => {
		if (!selectedReason || !selectedRider) return;
		onAddReport({
			id: Date.now().toString(),
			reporterName: "You",
			reportedUserName: selectedRider.name,
			reason: selectedReason,
			timestamp: "Just now",
			status: "pending",
			description: reportDescription || "No additional details provided.",
		});
		setReportSubmitted(true);
	};

	const handleCloseReport = () => {
		setReportModalVisible(false);
		setSelectedRider(null);
		setSelectedReason("");
		setReportDescription("");
		setReportSubmitted(false);
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerContent}>
					<Text style={styles.headerTitle}>Ride Insights</Text>
					<Text style={styles.headerSubtitle}>{destination}</Text>
				</View>
				<View style={styles.activeBadge}>
					<View style={styles.activeDot} />
					<Text style={styles.activeBadgeText}>Active</Text>
				</View>
			</View>

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
			>
				<View style={styles.statsRow}>
					<View style={[styles.statCard, styles.statCardEta]}>
						<Text style={styles.statIcon}>🕐</Text>
						<Text style={styles.statValue}>{etaMinutes} min</Text>
						<Text style={styles.statLabel}>Est. Arrival</Text>
					</View>
					<View style={[styles.statCard, styles.statCardCo2]}>
						<Text style={styles.statIcon}>🌿</Text>
						<Text style={styles.statValue}>{co2SavedKg} kg</Text>
						<Text style={styles.statLabel}>CO2 Saved</Text>
					</View>
				</View>

				<View style={styles.co2ContextCard}>
					<Text style={styles.co2ContextIcon}>♻️</Text>
					<View style={styles.co2ContextContent}>
						<Text style={styles.co2ContextTitle}>
							Great choice sharing this ride!
						</Text>
						<Text style={styles.co2ContextText}>
							You and your party saved{" "}
							{(co2SavedKg * mockPartyRiders.length).toFixed(1)}{" "}
							kg of CO2 combined versus driving separately.
						</Text>
					</View>
				</View>

				<View style={styles.card}>
					<Text style={styles.cardTitle}>Ride Details</Text>
					<View style={styles.routeRow}>
						<View style={styles.routeDots}>
							<View style={styles.dotGreen} />
							<View style={styles.routeLine} />
							<View style={styles.dotDark} />
						</View>
						<View style={styles.routeLabels}>
							<Text style={styles.routeLocation}>{pickup}</Text>
							<Text style={styles.routeLocation}>
								{destination}
							</Text>
						</View>
					</View>
					<View style={styles.divider} />
					<View style={styles.detailRow}>
						<Text style={styles.detailIcon}>💷</Text>
						<Text style={styles.detailText}>£{price}/person</Text>
					</View>
					<View style={styles.detailRow}>
						<Text style={styles.detailIcon}>👥</Text>
						<Text style={styles.detailText}>
							{mockPartyRiders.length} riders sharing
						</Text>
					</View>
				</View>

				<View style={styles.card}>
					<Text style={styles.cardTitle}>Your Party</Text>
					{mockPartyRiders.map((rider) => (
						<View key={rider.id} style={styles.riderRow}>
							<View style={styles.riderAvatar}>
								<Text style={styles.riderAvatarText}>
									{rider.initial}
								</Text>
							</View>
							<View style={styles.riderInfo}>
								<Text style={styles.riderName}>
									{rider.name}
									{rider.isSelf ? "  (You)" : ""}
								</Text>
								{rider.isCreator && (
									<View style={styles.creatorBadge}>
										<Text style={styles.creatorText}>
											Creator
										</Text>
									</View>
								)}
							</View>
							{!rider.isSelf && (
								<Pressable
									style={styles.reportButton}
									onPress={() => openReportModal(rider)}
								>
									<Text style={styles.reportButtonText}>
										Report
									</Text>
								</Pressable>
							)}
						</View>
					))}
				</View>
			</ScrollView>

			<View style={styles.footer}>
				<Pressable style={styles.doneButton} onPress={onDone}>
					<Text style={styles.doneButtonText}>Back to Map</Text>
				</Pressable>
			</View>

			<Modal
				visible={reportModalVisible}
				transparent
				animationType="slide"
				onRequestClose={handleCloseReport}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalSheet}>
						{reportSubmitted ? (
							<View style={styles.reportSuccess}>
								<Text style={styles.reportSuccessIcon}>✓</Text>
								<Text style={styles.reportSuccessTitle}>
									Report Submitted
								</Text>
								<Text style={styles.reportSuccessText}>
									Thank you. Our moderation team will review
									your report.
								</Text>
								<Pressable
									style={styles.closeButton}
									onPress={handleCloseReport}
								>
									<Text style={styles.closeButtonText}>
										Close
									</Text>
								</Pressable>
							</View>
						) : (
							<>
								<View style={styles.modalHeader}>
									<Text style={styles.modalTitle}>
										Report User
									</Text>
									<Pressable onPress={handleCloseReport}>
										<Text style={styles.modalCloseIcon}>
											✕
										</Text>
									</Pressable>
								</View>

								{selectedRider && (
									<View style={styles.reportingUserRow}>
										<View style={styles.reportingAvatar}>
											<Text
												style={
													styles.reportingAvatarText
												}
											>
												{selectedRider.initial}
											</Text>
										</View>
										<View>
											<Text style={styles.reportingLabel}>
												Reporting
											</Text>
											<Text style={styles.reportingName}>
												{selectedRider.name}
											</Text>
										</View>
									</View>
								)}

								<Text style={styles.reasonTitle}>Reason</Text>
								<View style={styles.reasonList}>
									{REPORT_REASONS.map((reason) => (
										<Pressable
											key={reason}
											style={[
												styles.reasonChip,
												selectedReason === reason &&
													styles.reasonChipSelected,
											]}
											onPress={() =>
												setSelectedReason(reason)
											}
										>
											<Text
												style={[
													styles.reasonChipText,
													selectedReason === reason &&
														styles.reasonChipTextSelected,
												]}
											>
												{reason}
											</Text>
										</Pressable>
									))}
								</View>

								<Text style={styles.descriptionLabel}>
									Additional details (optional)
								</Text>
								<TextInput
									style={styles.descriptionInput}
									placeholder="Describe what happened..."
									placeholderTextColor={COLORS.textSecondary}
									value={reportDescription}
									onChangeText={setReportDescription}
									multiline
									numberOfLines={3}
								/>

								<View style={styles.modalActions}>
									<Pressable
										style={styles.cancelButton}
										onPress={handleCloseReport}
									>
										<Text style={styles.cancelButtonText}>
											Cancel
										</Text>
									</Pressable>
									<Pressable
										style={[
											styles.submitButton,
											!selectedReason &&
												styles.submitButtonDisabled,
										]}
										onPress={handleSubmitReport}
										disabled={!selectedReason}
									>
										<Text style={styles.submitButtonText}>
											Submit Report
										</Text>
									</Pressable>
								</View>
							</>
						)}
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		backgroundColor: COLORS.background,
	},
	headerContent: {
		gap: SPACING.xs,
	},
	headerTitle: {
		fontSize: FONT_SIZES.lg,
		fontWeight: "700",
		color: COLORS.primary,
	},
	headerSubtitle: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	activeBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.success + "20",
		borderRadius: BORDER_RADIUS.full,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		gap: SPACING.sm,
	},
	activeDot: {
		width: 8,
		height: 8,
		borderRadius: BORDER_RADIUS.full,
		backgroundColor: COLORS.success,
	},
	activeBadgeText: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.success,
	},
	scroll: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		gap: SPACING.md,
	},
	statsRow: {
		flexDirection: "row",
		gap: SPACING.md,
	},
	statCard: {
		flex: 1,
		borderRadius: BORDER_RADIUS.xl,
		paddingVertical: SPACING.xl,
		alignItems: "center",
		gap: SPACING.sm,
		borderWidth: 1,
	},
	statCardEta: {
		backgroundColor: COLORS.info + "10",
		borderColor: COLORS.info + "30",
	},
	statCardCo2: {
		backgroundColor: COLORS.success + "10",
		borderColor: COLORS.success + "30",
	},
	statIcon: {
		fontSize: FONT_SIZES.xxl,
	},
	statValue: {
		fontSize: FONT_SIZES.xxl,
		fontWeight: "700",
		color: COLORS.primary,
	},
	statLabel: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
		fontWeight: "500",
	},
	co2ContextCard: {
		flexDirection: "row",
		alignItems: "flex-start",
		backgroundColor: COLORS.success + "10",
		borderRadius: BORDER_RADIUS.lg,
		padding: SPACING.md,
		borderWidth: 1,
		borderColor: COLORS.success + "30",
		gap: SPACING.md,
	},
	co2ContextIcon: {
		fontSize: FONT_SIZES.lg,
		marginTop: SPACING.xs,
	},
	co2ContextContent: {
		flex: 1,
		gap: SPACING.xs,
	},
	co2ContextTitle: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.primary,
	},
	co2ContextText: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
		lineHeight: 18,
	},
	card: {
		backgroundColor: COLORS.background,
		borderRadius: BORDER_RADIUS.xl,
		padding: SPACING.md,
		borderWidth: 1,
		borderColor: COLORS.border,
		gap: SPACING.md,
	},
	cardTitle: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
		color: COLORS.primary,
	},
	routeRow: {
		flexDirection: "row",
		alignItems: "stretch",
		gap: SPACING.md,
	},
	routeDots: {
		alignItems: "center",
		paddingTop: SPACING.xs,
		gap: 0,
	},
	dotGreen: {
		width: 10,
		height: 10,
		borderRadius: BORDER_RADIUS.full,
		backgroundColor: COLORS.success,
	},
	routeLine: {
		width: 2,
		flex: 1,
		backgroundColor: COLORS.border,
		marginVertical: SPACING.xs,
	},
	dotDark: {
		width: 10,
		height: 10,
		borderRadius: BORDER_RADIUS.full,
		backgroundColor: COLORS.primary,
	},
	routeLabels: {
		flex: 1,
		justifyContent: "space-between",
		paddingVertical: SPACING.xs,
		gap: SPACING.xl,
	},
	routeLocation: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "500",
		color: COLORS.primary,
	},
	divider: {
		height: 1,
		backgroundColor: COLORS.border,
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
	},
	detailIcon: {
		fontSize: FONT_SIZES.base,
	},
	detailText: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.primary,
		fontWeight: "500",
	},
	riderRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.md,
		paddingVertical: SPACING.sm,
	},
	riderAvatar: {
		width: 40,
		height: 40,
		borderRadius: BORDER_RADIUS.full,
		backgroundColor: COLORS.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	riderAvatarText: {
		color: COLORS.textLight,
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
	},
	riderInfo: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.sm,
		flexWrap: "wrap",
	},
	riderName: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.primary,
	},
	creatorBadge: {
		backgroundColor: COLORS.accentYellow,
		paddingHorizontal: SPACING.sm,
		paddingVertical: SPACING.xs,
		borderRadius: BORDER_RADIUS.full,
	},
	creatorText: {
		fontSize: FONT_SIZES.xs,
		color: "#a65f00",
		fontWeight: "500",
	},
	reportButton: {
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		borderRadius: BORDER_RADIUS.full,
		borderWidth: 1,
		borderColor: COLORS.danger,
	},
	reportButtonText: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.danger,
		fontWeight: "600",
	},
	footer: {
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
		backgroundColor: COLORS.background,
	},
	doneButton: {
		paddingVertical: SPACING.lg,
		borderRadius: BORDER_RADIUS.lg,
		backgroundColor: COLORS.primary,
		alignItems: "center",
	},
	doneButtonText: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.textLight,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: COLORS.overlay,
		justifyContent: "flex-end",
	},
	modalSheet: {
		backgroundColor: COLORS.background,
		borderTopLeftRadius: BORDER_RADIUS.xl,
		borderTopRightRadius: BORDER_RADIUS.xl,
		paddingHorizontal: SPACING.md,
		paddingTop: SPACING.lg,
		paddingBottom: SPACING.xxl,
		gap: SPACING.md,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	modalTitle: {
		fontSize: FONT_SIZES.lg,
		fontWeight: "700",
		color: COLORS.primary,
	},
	modalCloseIcon: {
		fontSize: FONT_SIZES.lg,
		color: COLORS.textSecondary,
		padding: SPACING.sm,
	},
	reportingUserRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.md,
		backgroundColor: COLORS.primaryLight,
		borderRadius: BORDER_RADIUS.lg,
		padding: SPACING.md,
	},
	reportingAvatar: {
		width: 40,
		height: 40,
		borderRadius: BORDER_RADIUS.full,
		backgroundColor: COLORS.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	reportingAvatarText: {
		color: COLORS.textLight,
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
	},
	reportingLabel: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
	},
	reportingName: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.primary,
	},
	reasonTitle: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.primary,
	},
	reasonList: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: SPACING.sm,
	},
	reasonChip: {
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		borderRadius: BORDER_RADIUS.full,
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: COLORS.primaryLight,
	},
	reasonChipSelected: {
		borderColor: COLORS.danger,
		backgroundColor: COLORS.danger + "15",
	},
	reasonChipText: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	reasonChipTextSelected: {
		color: COLORS.danger,
		fontWeight: "600",
	},
	descriptionLabel: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.primary,
	},
	descriptionInput: {
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: BORDER_RADIUS.lg,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		fontSize: FONT_SIZES.sm,
		color: COLORS.text,
		textAlignVertical: "top",
		minHeight: 80,
	},
	modalActions: {
		flexDirection: "row",
		gap: SPACING.md,
		marginTop: SPACING.sm,
	},
	cancelButton: {
		flex: 1,
		paddingVertical: SPACING.md,
		borderRadius: BORDER_RADIUS.lg,
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: "center",
	},
	cancelButtonText: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.textSecondary,
	},
	submitButton: {
		flex: 2,
		paddingVertical: SPACING.md,
		borderRadius: BORDER_RADIUS.lg,
		backgroundColor: COLORS.danger,
		alignItems: "center",
	},
	submitButtonDisabled: {
		backgroundColor: COLORS.disabled,
	},
	submitButtonText: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.textLight,
	},
	reportSuccess: {
		alignItems: "center",
		paddingVertical: SPACING.xl,
		gap: SPACING.md,
	},
	reportSuccessIcon: {
		fontSize: 48,
		color: COLORS.success,
	},
	reportSuccessTitle: {
		fontSize: FONT_SIZES.lg,
		fontWeight: "700",
		color: COLORS.primary,
	},
	reportSuccessText: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
		textAlign: "center",
		lineHeight: 22,
	},
	closeButton: {
		marginTop: SPACING.md,
		paddingVertical: SPACING.md,
		paddingHorizontal: SPACING.xxl,
		borderRadius: BORDER_RADIUS.lg,
		backgroundColor: COLORS.primary,
	},
	closeButtonText: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.textLight,
	},
});
