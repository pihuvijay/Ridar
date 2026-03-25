import React, { useMemo, useState } from "react";
import {
	View,
	Text,
	Pressable,
	StyleSheet,
	SafeAreaView,
	FlatList,
	TextInput,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../theme/colors";
import { partiesService } from "../services/api";

interface Rider {
	id: string;
	name: string;
	initial: string;
	status: "joined" | "waiting";
	isCreator: boolean;
	isVerified: boolean;
}

interface Message {
	id: string;
	author: string;
	content: string;
	timestamp: string;
	isVerified: boolean;
}

interface RideJoiningScreenProps {
	userName: string;
	rideGroup: any;
	messages: Message[];
	onSendMessage: (text: string) => void;
	onBack: () => void;
	onViewSettings: () => void;
	onPartyFull: (rideGroup: any) => void;
}

export const RideJoiningScreen: React.FC<RideJoiningScreenProps> = ({
	userName,
	rideGroup,
	messages,
	onSendMessage,
	onBack,
	onViewSettings,
	onPartyFull,
}) => {
	const [newMessage, setNewMessage] = useState("");

	const riders: Rider[] = useMemo(() => {
		if (rideGroup?.members?.length) {
			return rideGroup.members.map((member: any, index: number) => ({
				id: member.id?.toString() ?? `${index}`,
				name:
					member.name ??
					member.full_name ??
					member.email ??
					`Rider ${index + 1}`,
				initial: (
					member.name ??
					member.full_name ??
					member.email ??
					"R"
				)
					.charAt(0)
					.toUpperCase(),
				status: member.status === "waiting" ? "waiting" : "joined",
				isCreator:
					member.isCreator === true ||
					member.is_creator === true ||
					member.role === "leader" ||
					index === 0,
				isVerified:
					member.isVerified === true ||
					member.verified === true ||
					member.rating >= 4.5,
			}));
		}

		const leaderDisplayName =
			rideGroup?.leaderName ||
			rideGroup?.driverName ||
			userName ||
			"Ride Leader";

		return [
			{
				id: rideGroup?.id?.toString() ?? "leader",
				name: leaderDisplayName,
				initial: leaderDisplayName.charAt(0).toUpperCase(),
				status: "joined",
				isCreator: true,
				isVerified: true,
			},
		];
	}, [rideGroup, userName]);

	const leaveByTime = rideGroup?.leaveBy
		? new Date(rideGroup.leaveBy).getTime()
		: null;

	const computedLeavingIn = leaveByTime
		? Math.max(1, Math.round((leaveByTime - Date.now()) / 60000))
		: 5;

	const rideDetails = {
		destination:
			rideGroup?.destination?.label ||
			rideGroup?.destination ||
			"Destination not set",
		ridersJoined:
			rideGroup?.currentMembers ??
			rideGroup?.currentPassengers ??
			riders.length,
		totalRiders: rideGroup?.maxMembers ?? rideGroup?.maxPassengers ?? 4,
		pickupLocation:
			rideGroup?.pickup?.label || rideGroup?.pickup || "Pickup not set",
		departureTime: `Ending in ${
			rideGroup?.leavingIn ?? computedLeavingIn
		} min`,
		pricePerPerson: `£${
			rideGroup?.pricePerPerson ?? rideGroup?.price ?? 0
		}/person`,
	};

	const handleSendMessage = () => {
		if (newMessage.trim()) {
			onSendMessage(newMessage.trim());
			setNewMessage("");
		}
	};

	const handleJoinRide = async () => {
		try {
			if (rideGroup?.id) {
				const joinRes = await partiesService.join(rideGroup.id, {
					status: "pending",
				});

				console.log("[demo join] backend response:", joinRes);
			}
		} catch (err) {
			console.log(
				"[demo join] backend call failed, continuing with fake flow:",
				err,
			);
		}

		const fakeJoinedRideGroup = {
			...rideGroup,
			leaderUserId: rideGroup?.leaderUserId ?? "leader-demo-1",
			leaderName:
				rideGroup?.leaderName ?? rideGroup?.driverName ?? "Test Leader",
			currentMembers: 4,
			maxMembers: rideGroup?.maxMembers ?? 4,
			demoAutoStartRide: true,
			pickup: {
				lat: Number(rideGroup?.pickup?.lat ?? 51.3813),
				lng: Number(rideGroup?.pickup?.lng ?? -2.359),
				label:
					rideGroup?.pickup?.label ??
					rideGroup?.pickup ??
					"Bath City Centre",
			},
			destination: {
				lat: Number(rideGroup?.destination?.lat ?? 51.3777),
				lng: Number(rideGroup?.destination?.lng ?? -2.3569),
				label:
					rideGroup?.destination?.label ??
					rideGroup?.destination ??
					"Bath Spa Station",
			},
			members: [
				{
					id: rideGroup?.leaderUserId ?? "leader-demo-1",
					name:
						rideGroup?.leaderName ??
						rideGroup?.driverName ??
						"Test Leader",
					is_creator: true,
					role: "leader",
					status: "At pickup point",
				},
				{
					id: "member-demo-1",
					name: "Alex Johnson",
					is_creator: false,
					role: "member",
					status: "At pickup point",
				},
				{
					id: "member-demo-2",
					name: "Samantha Patel",
					is_creator: false,
					role: "member",
					status: "At pickup point",
				},
				{
					id: "real-rider-demo",
					name: userName,
					is_creator: false,
					role: "member",
					is_self: true,
					status: "At pickup point",
				},
			],
		};

		onPartyFull(fakeJoinedRideGroup);
	};

	const renderRider = ({ item }: { item: Rider }) => (
		<View
			style={[
				styles.riderCard,
				item.status === "joined"
					? styles.riderCardJoined
					: styles.riderCardWaiting,
			]}
		>
			<View style={styles.riderAvatar}>
				<Text style={styles.riderAvatarText}>{item.initial}</Text>
				{item.isVerified && (
					<View style={styles.verifiedBadge}>
						<Ionicons
							name="star"
							size={10}
							color={COLORS.primary}
						/>
					</View>
				)}
			</View>

			<View style={styles.riderInfo}>
				<View style={styles.riderNameRow}>
					<Text style={styles.riderName}>{item.name}</Text>
					{item.isCreator && (
						<View style={styles.creatorBadge}>
							<Text style={styles.creatorText}>Leader</Text>
						</View>
					)}
				</View>

				<View style={styles.riderMetaRow}>
					<Ionicons
						name={
							item.status === "joined"
								? "checkmark-circle"
								: "time-outline"
						}
						size={14}
						color={
							item.status === "joined"
								? COLORS.success
								: COLORS.textSecondary
						}
					/>
					<Text style={styles.riderStatus}>
						{item.status === "joined" ? "Joined" : "Waiting"}
					</Text>
				</View>
			</View>

			{item.status === "joined" && (
				<Ionicons
					name="chevron-forward"
					size={16}
					color={COLORS.textSecondary}
				/>
			)}
		</View>
	);

	const renderMessage = ({ item }: { item: Message }) => {
		const isMine = item.author === userName || item.author === "You";

		return (
			<View
				style={[
					styles.messageContainer,
					isMine && styles.messageContainerMine,
				]}
			>
				{!isMine && (
					<View style={styles.messageHeader}>
						<Text style={styles.messageSender}>{item.author}</Text>
						{item.isVerified && (
							<Ionicons
								name="star"
								size={12}
								color={COLORS.primary}
							/>
						)}
					</View>
				)}

				<View
					style={[
						styles.messageBubble,
						isMine && styles.messageBubbleMine,
					]}
				>
					<Text
						style={[
							styles.messageContent,
							isMine && styles.messageContentMine,
						]}
					>
						{item.content}
					</Text>
				</View>

				<Text
					style={[
						styles.messageTime,
						isMine && styles.messageTimeMine,
					]}
				>
					{item.timestamp}
				</Text>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.hero}>
				<View style={styles.header}>
					<Pressable style={styles.iconButton} onPress={onBack}>
						<Ionicons
							name="chevron-back"
							size={20}
							color={COLORS.textLight}
						/>
					</Pressable>

					<View style={styles.headerContent}>
						<Text style={styles.headerTitle}>
							Join ride to {rideDetails.destination}
						</Text>
						<Text style={styles.headerSubtitle}>
							{rideDetails.ridersJoined}/{rideDetails.totalRiders}{" "}
							riders
						</Text>
					</View>

					<Pressable
						style={styles.iconButton}
						onPress={onViewSettings}
					>
						<Ionicons
							name="ellipsis-horizontal"
							size={20}
							color={COLORS.textLight}
						/>
					</Pressable>
				</View>

				<View style={styles.routeCard}>
					<View style={styles.routeRow}>
						<View style={styles.routeIconWrap}>
							<View style={styles.pickupDot} />
						</View>
						<View style={styles.routeTextWrap}>
							<Text style={styles.routeLabel}>Pickup</Text>
							<Text style={styles.routeValue}>
								{rideDetails.pickupLocation}
							</Text>
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
							<Text style={styles.routeValue}>
								{rideDetails.destination}
							</Text>
						</View>
					</View>

					<View style={styles.heroMetaRow}>
						<View style={styles.metaPill}>
							<Ionicons
								name="time-outline"
								size={14}
								color={COLORS.textLight}
							/>
							<Text style={styles.metaPillText}>
								{rideDetails.departureTime}
							</Text>
						</View>

						<View style={styles.metaPill}>
							<Ionicons
								name="cash-outline"
								size={14}
								color={COLORS.textLight}
							/>
							<Text style={styles.metaPillText}>
								{rideDetails.pricePerPerson}
							</Text>
						</View>
					</View>
				</View>
			</View>

			<View style={styles.sheet}>
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Riders</Text>
						<Text style={styles.sectionCount}>
							{rideDetails.ridersJoined}/{rideDetails.totalRiders}
						</Text>
					</View>

					<FlatList
						data={riders}
						renderItem={renderRider}
						keyExtractor={(item) => item.id}
						scrollEnabled={false}
						contentContainerStyle={styles.ridersList}
					/>
				</View>

				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Ride chat</Text>
						<Text style={styles.sectionCount}>
							{messages.length > 0
								? `${messages.length} messages`
								: "Demo"}
						</Text>
					</View>

					<View style={styles.chatCard}>
						{messages.length > 0 ? (
							<FlatList
								data={messages}
								renderItem={renderMessage}
								keyExtractor={(item) => item.id}
								scrollEnabled={false}
								contentContainerStyle={styles.messagesList}
							/>
						) : (
							<View style={styles.emptyChatState}>
								<Ionicons
									name="chatbubble-ellipses-outline"
									size={22}
									color={COLORS.textSecondary}
								/>
								<Text style={styles.emptyChatTitle}>
									No messages yet
								</Text>
								<Text style={styles.emptyChatText}>
									Send a quick message before joining.
								</Text>
							</View>
						)}
					</View>
				</View>

				<View style={styles.inputSection}>
					<View style={styles.inputContainer}>
						<TextInput
							style={styles.input}
							placeholder="Send a message..."
							placeholderTextColor={COLORS.textSecondary}
							value={newMessage}
							onChangeText={setNewMessage}
							multiline
						/>
						<Pressable
							style={[
								styles.sendButton,
								!newMessage.trim() && styles.sendButtonDisabled,
							]}
							onPress={handleSendMessage}
							disabled={!newMessage.trim()}
						>
							<Ionicons
								name="send"
								size={18}
								color={COLORS.textLight}
							/>
						</Pressable>
					</View>
				</View>
			</View>

			<View style={styles.footer}>
				<Pressable style={styles.joinButton} onPress={handleJoinRide}>
					<View>
						<Text style={styles.joinButtonTitle}>
							Join this ride
						</Text>
						<Text style={styles.joinButtonSubtitle}>
							{rideDetails.pricePerPerson}
						</Text>
					</View>

					<Ionicons
						name="arrow-forward"
						size={20}
						color={COLORS.textLight}
					/>
				</Pressable>
			</View>
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
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SPACING.lg,
		gap: SPACING.md,
	},
	iconButton: {
		width: 42,
		height: 42,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(255,255,255,0.10)",
	},
	headerContent: {
		flex: 1,
		gap: 4,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: COLORS.textLight,
	},
	headerSubtitle: {
		fontSize: FONT_SIZES.sm,
		color: "rgba(255,255,255,0.72)",
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
	heroMetaRow: {
		flexDirection: "row",
		gap: SPACING.sm,
		marginTop: SPACING.md,
	},
	metaPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "rgba(255,255,255,0.10)",
	},
	metaPillText: {
		fontSize: FONT_SIZES.xs,
		fontWeight: "700",
		color: COLORS.textLight,
	},
	sheet: {
		flex: 1,
		backgroundColor: COLORS.background,
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
		paddingTop: SPACING.lg,
	},
	section: {
		paddingHorizontal: SPACING.lg,
		marginBottom: SPACING.lg,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: SPACING.md,
	},
	sectionTitle: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
		color: COLORS.primary,
	},
	sectionCount: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	ridersList: {
		gap: SPACING.sm,
	},
	riderCard: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		borderRadius: 18,
		borderWidth: 1,
		gap: SPACING.md,
	},
	riderCardJoined: {
		backgroundColor: "#F8FAFC",
		borderColor: "#E5E7EB",
	},
	riderCardWaiting: {
		backgroundColor: COLORS.primaryLight,
		borderColor: COLORS.border,
	},
	riderAvatar: {
		width: 44,
		height: 44,
		borderRadius: 999,
		backgroundColor: COLORS.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	riderAvatarText: {
		color: COLORS.textLight,
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
	},
	verifiedBadge: {
		position: "absolute",
		top: -5,
		right: -5,
		width: 20,
		height: 20,
		borderRadius: 999,
		backgroundColor: COLORS.accentYellow,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#fff",
	},
	riderInfo: {
		flex: 1,
		gap: 4,
	},
	riderNameRow: {
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
		backgroundColor: "#FEF3C7",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
	},
	creatorText: {
		fontSize: 10,
		color: "#92400E",
		fontWeight: "700",
	},
	riderMetaRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	riderStatus: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
	},
	chatCard: {
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#E5E7EB",
		borderRadius: 20,
		padding: SPACING.md,
		minHeight: 140,
	},
	messagesList: {
		gap: SPACING.md,
	},
	emptyChatState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: SPACING.xl,
		gap: 6,
	},
	emptyChatTitle: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "700",
		color: COLORS.primary,
	},
	emptyChatText: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
		textAlign: "center",
	},
	messageContainer: {
		gap: SPACING.xs,
	},
	messageContainerMine: {
		alignItems: "flex-end",
	},
	messageHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	messageSender: {
		fontSize: FONT_SIZES.xs,
		fontWeight: "700",
		color: COLORS.primary,
	},
	messageBubble: {
		maxWidth: "86%",
		backgroundColor: "#F8FAFC",
		borderRadius: 18,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		paddingHorizontal: SPACING.md,
		paddingVertical: 10,
	},
	messageBubbleMine: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	messageContent: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.primary,
		lineHeight: 20,
	},
	messageContentMine: {
		color: COLORS.textLight,
	},
	messageTime: {
		fontSize: 11,
		color: COLORS.textSecondary,
	},
	messageTimeMine: {
		textAlign: "right",
	},
	inputSection: {
		paddingHorizontal: SPACING.lg,
		paddingBottom: SPACING.md,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: SPACING.sm,
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		borderRadius: 18,
		paddingHorizontal: SPACING.md,
		paddingVertical: 12,
		fontSize: FONT_SIZES.sm,
		color: COLORS.text,
		backgroundColor: "#fff",
		maxHeight: 100,
	},
	sendButton: {
		width: 46,
		height: 46,
		borderRadius: 999,
		backgroundColor: COLORS.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	sendButtonDisabled: {
		opacity: 0.45,
	},
	footer: {
		paddingHorizontal: SPACING.lg,
		paddingTop: SPACING.sm,
		paddingBottom: SPACING.lg,
		backgroundColor: COLORS.background,
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
	},
	joinButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: SPACING.lg,
		paddingVertical: SPACING.lg,
		borderRadius: 20,
		backgroundColor: COLORS.primary,
	},
	joinButtonTitle: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
		color: COLORS.textLight,
	},
	joinButtonSubtitle: {
		fontSize: FONT_SIZES.xs,
		color: "rgba(255,255,255,0.82)",
		marginTop: 2,
	},
});
