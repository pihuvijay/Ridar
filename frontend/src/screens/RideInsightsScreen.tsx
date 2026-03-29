
import React, { useEffect, useMemo, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	Pressable,
	StyleSheet,
	SafeAreaView,
	Modal,
	TextInput,
	Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../theme/colors";
import { uberService, userService } from "../services/api";

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

export const RideInsightsScreen: React.FC<RideInsightsScreenProps> = ({
	rideGroup,
	onAddReport,
	onDone,
}) => {
	const [ratings, setRatings] = useState<Record<string, number>>({});
	const [reportModalVisible, setReportModalVisible] = useState(false);
	const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
	const [selectedReason, setSelectedReason] = useState("");
	const [reportDescription, setReportDescription] = useState("");
	const [reportSubmitted, setReportSubmitted] = useState(false);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [estimatedPricePerPerson, setEstimatedPricePerPerson] = useState<
		number | null
	>(null);

	useEffect(() => {
		(async () => {
			try {
				const res = await userService.me();
				if (!(res as any)?.success) return;

				const me = (res as any).data;
				const meId =
					me?.id ??
					me?.user?.id ??
					me?.profile?.id ??
					me?.user_id ??
					null;

				setCurrentUserId(meId ? meId.toString() : null);
			} catch {
				// ignore
			}
		})();
	}, []);

	const partyRiders: Rider[] = useMemo(() => {
		if (rideGroup?.members?.length) {
			return rideGroup.members.map((member: any, index: number) => {
				const displayName =
					member.name ??
					member.full_name ??
					member.email ??
					`Rider ${index + 1}`;

				const id = member.id?.toString() ?? `${index}`;
				const isCreator =
					member.isCreator === true ||
					member.is_creator === true ||
					member.role === "leader" ||
					index === 0;

				const isSelf =
					member.isSelf === true ||
					member.is_self === true ||
					(!!currentUserId && id === currentUserId) ||
					displayName.toLowerCase() === "you";

				return {
					id,
					name: displayName,
					initial: displayName.charAt(0).toUpperCase(),
					isCreator,
					isSelf,
				};
			});
		}

		const fallbackName =
			rideGroup?.leaderName ??
			rideGroup?.driverName ??
			rideGroup?.name ??
			"Ride Creator";

		return [
			{
				id: rideGroup?.leaderUserId?.toString() ?? "1",
				name: fallbackName,
				initial: fallbackName.charAt(0).toUpperCase(),
				isCreator: true,
				isSelf:
					!!currentUserId &&
					rideGroup?.leaderUserId?.toString() === currentUserId,
			},
		];
	}, [rideGroup, currentUserId]);

	const destination =
		rideGroup?.destination?.label ??
		rideGroup?.destination ??
		"Destination not set";

	const pickup =
		rideGroup?.pickup?.label ?? rideGroup?.pickup ?? "Pickup not set";

	useEffect(() => {
		const fetchPrice = async () => {
			const startLat = rideGroup?.pickup?.lat;
			const startLng = rideGroup?.pickup?.lng;
			const endLat = rideGroup?.destination?.lat;
			const endLng = rideGroup?.destination?.lng;

			if (startLat && startLng && endLat && endLng) {
				try {
					const res = await uberService.getPriceEstimates(
						startLat,
						startLng,
						endLat,
						endLng,
					);
					if (res.success && res.data?.length > 0) {
						const uberX =
							res.data.find(
								(p: any) => p.display_name === "UberX",
							) || res.data[0];
						const totalEst =
							(uberX.low_estimate + uberX.high_estimate) / 2;
						const membersCount = partyRiders.length || 1;
						setEstimatedPricePerPerson(totalEst / membersCount);
					}
				} catch (err) {
					console.warn(
						"[RideInsightsScreen] price estimate error:",
						err,
					);
				}
			}
		};
		fetchPrice();
	}, [
		rideGroup?.pickup?.lat,
		rideGroup?.pickup?.lng,
		rideGroup?.destination?.lat,
		rideGroup?.destination?.lng,
		partyRiders.length,
	]);

	const pricePerPerson =
		estimatedPricePerPerson ??
		rideGroup?.pricePerPerson ??
		rideGroup?.price ??
		0;

	const totalPaid = pricePerPerson * partyRiders.length;
	const tripTime =
		rideGroup?.durationMinutes ??
		rideGroup?.tripMinutes ??
		rideGroup?.completedTripMinutes ??
		14;
	const co2SavedKg = rideGroup?.co2SavedKg ?? 1.8;
	const driverName =
		rideGroup?.driverName ??
		rideGroup?.leaderName ??
		rideGroup?.name ??
		"Uber Driver";

	const openReportModal = (rider: Rider) => {
		setSelectedRider(rider);
		setSelectedReason("");
		setReportDescription("");
		setReportSubmitted(false);
		setReportModalVisible(true);
	};

	const setRatingFor = (riderId: string, value: number) => {
		setRatings((prev) => ({ ...prev, [riderId]: value }));
	};

	const handleSubmitRatings = async () => {
		const entries = Object.entries(ratings).map(([id, rating]) => ({
			id,
			rating,
		}));

		if (entries.length === 0) {
			Alert.alert(
				"No ratings",
				"Please rate at least one rider before submitting.",
			);
			return;
		}

		try {
			for (const [userId, rating] of Object.entries(ratings)) {
				try {
					const res = await userService.rateUser(
						userId,
						rating as number,
					);
					console.log("[RideInsights] rateUser", userId, res);
				} catch (err) {
					console.warn("[RideInsights] failed to rate", userId, err);
				}
			}

			Alert.alert(
				"Ratings submitted",
				`Submitted ${entries.length} ratings.`,
			);
			setRatings({});
		} catch (err) {
			console.error("[RideInsights] submit ratings error", err);
			Alert.alert("Error", "Failed to submit ratings");
		}
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
			<View style={styles.hero}>
				<View style={styles.heroTopRow}>
					<View style={styles.completedPill}>
						<Ionicons
							name="checkmark-circle"
							size={14}
							color={COLORS.textLight}
						/>
						<Text style={styles.completedPillText}>
							Trip completed
						</Text>
					</View>
					<View style={styles.partyPill}>
						<Ionicons
							name="people-outline"
							size={14}
							color={COLORS.textLight}
						/>
						<Text style={styles.partyPillText}>
							{partyRiders.length} riders
						</Text>
					</View>
				</View>

				<Text style={styles.heroTitle}>Trip Summary</Text>
				<Text style={styles.heroSubtitle}>
					Review your shared ride, rate fellow riders, and report any
					issues if needed.
				</Text>

				<View style={styles.routeCard}>
					<View style={styles.routeRow}>
						<View style={styles.routeIconWrap}>
							<View style={styles.pickupDot} />
						</View>
						<View style={styles.routeTextWrap}>
							<Text style={styles.routeLabel}>Pickup</Text>
							<Text style={styles.routeValue}>{pickup}</Text>
						</View>
					</View>

					<View style={styles.routeDivider} />

					<View style={styles.routeRow}>
						<View style={styles.routeIconWrap}>
							<Ionicons
								name="flag-outline"
								size={16}
								color={COLORS.textLight}
							/>
						</View>
						<View style={styles.routeTextWrap}>
							<Text style={styles.routeLabel}>Destination</Text>
							<Text style={styles.routeValue}>{destination}</Text>
						</View>
					</View>
				</View>
			</View>

			<View style={styles.sheet}>
				<ScrollView
					style={styles.scroll}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.statsRow}>
						<View style={[styles.statCard, styles.statCardSuccess]}>
							<Ionicons
								name="checkmark-done-outline"
								size={22}
								color={COLORS.success}
								style={styles.statIcon}
							/>
							<Text style={styles.statValue}>Completed</Text>
							<Text style={styles.statLabel}>Trip status</Text>
						</View>

						<View style={[styles.statCard, styles.statCardNeutral]}>
							<Ionicons
								name="cash-outline"
								size={22}
								color={COLORS.primary}
								style={styles.statIcon}
							/>
							<Text style={styles.statValue}>
								£{totalPaid.toFixed(2)}
							</Text>
							<Text style={styles.statLabel}>Total paid</Text>
						</View>
					</View>

					<View style={styles.statsRow}>
						<View style={[styles.statCard, styles.statCardNeutral]}>
							<Ionicons
								name="time-outline"
								size={22}
								color={COLORS.primary}
								style={styles.statIcon}
							/>
							<Text style={styles.statValue}>{tripTime} min</Text>
							<Text style={styles.statLabel}>Trip length</Text>
						</View>

						<View style={[styles.statCard, styles.statCardSuccess]}>
							<Ionicons
								name="leaf-outline"
								size={22}
								color={COLORS.success}
								style={styles.statIcon}
							/>
							<Text style={styles.statValue}>
								{co2SavedKg} kg
							</Text>
							<Text style={styles.statLabel}>CO₂ saved</Text>
						</View>
					</View>

					<View style={styles.driverCard}>
						<View style={styles.driverAvatar}>
							<Text style={styles.driverAvatarText}>
								{driverName.charAt(0).toUpperCase()}
							</Text>
						</View>
						<View style={styles.driverInfo}>
							<Text style={styles.driverName}>{driverName}</Text>
							<Text style={styles.driverMeta}>
								Completed trip • Shared ride
							</Text>
						</View>
						<View style={styles.driverBadge}>
							<Text style={styles.driverBadgeText}>Done</Text>
						</View>
					</View>

					<View style={styles.contextCard}>
						<Ionicons
							name="recycle"
							size={20}
							color={COLORS.success}
							style={styles.contextIcon}
						/>
						<View style={styles.contextContent}>
							<Text style={styles.contextTitle}>
								Great choice sharing this ride
							</Text>
							<Text style={styles.contextText}>
								You and your party saved{" "}
								{(co2SavedKg * partyRiders.length).toFixed(1)}{" "}
								kg of CO₂ combined versus travelling separately.
							</Text>
						</View>
					</View>

					<View style={styles.card}>
						<Text style={styles.cardTitle}>Ride details</Text>

						<View style={styles.detailRow}>
							<Ionicons
								name="cash-outline"
								size={18}
								color={COLORS.text}
								style={styles.detailIcon}
							/>
							<Text style={styles.detailText}>
								£{pricePerPerson.toFixed(2)} per person
							</Text>
						</View>

						<View style={styles.detailRow}>
							<Ionicons
								name="people-outline"
								size={18}
								color={COLORS.text}
								style={styles.detailIcon}
							/>
							<Text style={styles.detailText}>
								{partyRiders.length} riders shared this trip
							</Text>
						</View>

						<View style={styles.detailRow}>
							<Ionicons
								name="navigate-outline"
								size={18}
								color={COLORS.text}
								style={styles.detailIcon}
							/>
							<Text style={styles.detailText}>
								{pickup} → {destination}
							</Text>
						</View>
					</View>

					<View style={styles.card}>
						<View style={styles.cardHeaderRow}>
							<Text style={styles.cardTitle}>
								Rate your party
							</Text>
							<Text style={styles.cardSubtitle}>
								Rate riders and report issues
							</Text>
						</View>

						{partyRiders.map((rider) => {
							const canRate = !rider.isSelf;

							return (
								<View key={rider.id} style={styles.riderRow}>
									<View style={styles.riderAvatar}>
										<Text style={styles.riderAvatarText}>
											{rider.initial}
										</Text>
									</View>

									<View style={styles.riderInfoBlock}>
										<View style={styles.riderNameHeaderRow}>
											<Text style={styles.riderName}>
												{rider.name}
												{rider.isSelf ? " (You)" : ""}
											</Text>

											{rider.isCreator && (
												<View
													style={styles.creatorBadge}
												>
													<Text
														style={
															styles.creatorText
														}
													>
														Leader
													</Text>
												</View>
											)}
										</View>

										{canRate ? (
											<View style={styles.actionRow}>
												<View style={styles.starsRow}>
													{[1, 2, 3, 4, 5].map(
														(n) => (
															<Pressable
																key={n}
																onPress={() =>
																	setRatingFor(
																		rider.id,
																		n,
																	)
																}
															>
																<Ionicons
																	name={
																		ratings[
																			rider
																				.id
																		] >= n
																			? "star"
																			: "star-outline"
																	}
																	size={20}
																	color={
																		COLORS.primary
																	}
																/>
															</Pressable>
														),
													)}
												</View>

												<Pressable
													style={styles.reportButton}
													onPress={() =>
														openReportModal(rider)
													}
												>
													<Text
														style={
															styles.reportButtonText
														}
													>
														Report
													</Text>
												</Pressable>
											</View>
										) : (
											<Text style={styles.riderMetaText}>
												You cannot rate yourself
											</Text>
										)}
									</View>
								</View>
							);
						})}
					</View>
				</ScrollView>

				<View style={styles.footer}>
					<Pressable style={styles.secondaryButton} onPress={onDone}>
						<Text style={styles.secondaryButtonText}>
							Back to Map
						</Text>
					</Pressable>

					<Pressable
						style={styles.primaryButton}
						onPress={handleSubmitRatings}
					>
						<Text style={styles.primaryButtonText}>
							Submit Ratings
						</Text>
					</Pressable>
				</View>
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
								<Ionicons
									name="checkmark-circle"
									size={24}
									color={COLORS.success}
									style={styles.reportSuccessIcon}
								/>
								<Text style={styles.reportSuccessTitle}>
									Report submitted
								</Text>
								<Text style={styles.reportSuccessText}>
									Thanks. Our moderation team will review your
									report.
								</Text>
								<Pressable
									style={styles.modalPrimaryButton}
									onPress={handleCloseReport}
								>
									<Text style={styles.modalPrimaryButtonText}>
										Close
									</Text>
								</Pressable>
							</View>
						) : (
							<>
								<View style={styles.modalHeader}>
									<Text style={styles.modalTitle}>
										Report rider
									</Text>
									<Pressable onPress={handleCloseReport}>
										<Ionicons
											name="close"
											size={20}
											color={COLORS.text}
										/>
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
		backgroundColor: "#0F172A",
	},
	hero: {
		paddingHorizontal: SPACING.lg,
		paddingTop: SPACING.lg,
		paddingBottom: SPACING.xl,
		backgroundColor: "#0F172A",
	},
	heroTopRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: SPACING.lg,
	},
	completedPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "rgba(34,197,94,0.22)",
	},
	completedPillText: {
		color: COLORS.textLight,
		fontSize: FONT_SIZES.xs,
		fontWeight: "700",
	},
	partyPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "rgba(255,255,255,0.12)",
	},
	partyPillText: {
		color: COLORS.textLight,
		fontSize: FONT_SIZES.xs,
		fontWeight: "700",
	},
	heroTitle: {
		fontSize: 30,
		fontWeight: "700",
		color: COLORS.textLight,
		marginBottom: 8,
	},
	heroSubtitle: {
		fontSize: FONT_SIZES.sm,
		lineHeight: 20,
		color: "rgba(255,255,255,0.75)",
		marginBottom: SPACING.lg,
	},
	routeCard: {
		backgroundColor: "rgba(255,255,255,0.08)",
		borderRadius: 22,
		padding: SPACING.md,
	},
	routeRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: SPACING.md,
	},
	routeIconWrap: {
		width: 20,
		alignItems: "center",
		marginTop: 2,
	},
	pickupDot: {
		width: 10,
		height: 10,
		borderRadius: 999,
		backgroundColor: COLORS.success,
		marginTop: 4,
	},
	routeTextWrap: {
		flex: 1,
	},
	routeLabel: {
		fontSize: FONT_SIZES.xs,
		color: "rgba(255,255,255,0.6)",
		marginBottom: 4,
	},
	routeValue: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.textLight,
		lineHeight: 20,
	},
	routeDivider: {
		height: 1,
		backgroundColor: "rgba(255,255,255,0.12)",
		marginVertical: SPACING.md,
	},
	sheet: {
		flex: 1,
		backgroundColor: COLORS.background,
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
	},
	scroll: {
		flex: 1,
	},
	scrollContent: {
		padding: SPACING.lg,
		paddingBottom: 140,
		gap: SPACING.md,
	},
	statsRow: {
		flexDirection: "row",
		gap: SPACING.md,
	},
	statCard: {
		flex: 1,
		borderRadius: 20,
		paddingVertical: SPACING.lg,
		paddingHorizontal: SPACING.md,
		alignItems: "center",
		gap: SPACING.sm,
		borderWidth: 1,
	},
	statCardSuccess: {
		backgroundColor: "#ECFDF5",
		borderColor: "#A7F3D0",
	},
	statCardNeutral: {
		backgroundColor: "#F8FAFC",
		borderColor: "#E5E7EB",
	},
	statIcon: {
		fontSize: FONT_SIZES.xxl,
	},
	statValue: {
		fontSize: FONT_SIZES.lg,
		fontWeight: "700",
		color: COLORS.primary,
		textAlign: "center",
	},
	statLabel: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
		fontWeight: "500",
		textAlign: "center",
	},
	driverCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.md,
		padding: SPACING.md,
		borderRadius: 20,
		backgroundColor: "#F8FAFC",
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	driverAvatar: {
		width: 56,
		height: 56,
		borderRadius: 999,
		backgroundColor: COLORS.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	driverAvatarText: {
		fontSize: FONT_SIZES.lg,
		fontWeight: "700",
		color: COLORS.textLight,
	},
	driverInfo: {
		flex: 1,
		gap: 4,
	},
	driverName: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
		color: COLORS.primary,
	},
	driverMeta: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
	},
	driverBadge: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: "#111827",
	},
	driverBadgeText: {
		fontSize: 10,
		fontWeight: "700",
		color: COLORS.textLight,
	},
	contextCard: {
		flexDirection: "row",
		alignItems: "flex-start",
		backgroundColor: "#ECFDF5",
		borderRadius: 18,
		padding: SPACING.md,
		borderWidth: 1,
		borderColor: "#A7F3D0",
		gap: SPACING.md,
	},
	contextIcon: {
		marginTop: 2,
	},
	contextContent: {
		flex: 1,
		gap: SPACING.xs,
	},
	contextTitle: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "700",
		color: COLORS.primary,
	},
	contextText: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
		lineHeight: 18,
	},
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 20,
		padding: SPACING.md,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		gap: SPACING.md,
	},
	cardHeaderRow: {
		gap: 4,
	},
	cardTitle: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
		color: COLORS.primary,
	},
	cardSubtitle: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
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
		flex: 1,
		fontSize: FONT_SIZES.sm,
		color: COLORS.primary,
		fontWeight: "500",
	},
	riderRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: SPACING.md,
		paddingVertical: SPACING.sm,
	},
	riderAvatar: {
		width: 42,
		height: 42,
		borderRadius: 999,
		backgroundColor: COLORS.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	riderAvatarText: {
		color: COLORS.textLight,
		fontSize: FONT_SIZES.sm,
		fontWeight: "700",
	},
	riderInfoBlock: {
		flex: 1,
		gap: 8,
	},
	riderNameHeaderRow: {
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
	riderMetaText: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
	},
	actionRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: SPACING.sm,
		flexWrap: "wrap",
	},
	creatorBadge: {
		backgroundColor: "#FEF3C7",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
	},
	creatorText: {
		fontSize: 10,
		fontWeight: "700",
		color: "#92400E",
	},
	starsRow: {
		flexDirection: "row",
		gap: SPACING.xs,
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
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		flexDirection: "row",
		gap: 12,
		paddingHorizontal: SPACING.lg,
		paddingTop: SPACING.md,
		paddingBottom: SPACING.lg,
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
		backgroundColor: COLORS.background,
	},
	secondaryButton: {
		flex: 1,
		paddingVertical: 16,
		borderRadius: 18,
		backgroundColor: "#F3F4F6",
		alignItems: "center",
	},
	secondaryButtonText: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
		color: COLORS.textSecondary,
	},
	primaryButton: {
		flex: 1,
		paddingVertical: 16,
		borderRadius: 18,
		backgroundColor: COLORS.primary,
		alignItems: "center",
	},
	primaryButtonText: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
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
	modalPrimaryButton: {
		marginTop: SPACING.md,
		paddingVertical: SPACING.md,
		paddingHorizontal: SPACING.xxl,
		borderRadius: BORDER_RADIUS.lg,
		backgroundColor: COLORS.primary,
	},
	modalPrimaryButtonText: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.textLight,
	},
});
