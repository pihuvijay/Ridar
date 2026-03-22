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
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../theme/colors";

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

		return [
			{
				id: rideGroup?.id?.toString() ?? "1",
				name:
					rideGroup?.driverName ?? rideGroup?.name ?? "Ride Creator",
				initial: (
					rideGroup?.driverInitial ??
					rideGroup?.driverName ??
					rideGroup?.name ??
					"R"
				)
					.charAt(0)
					.toUpperCase(),
				status: "joined",
				isCreator: true,
				isVerified: true,
			},
		];
	}, [rideGroup]);

	const rideDetails = {
		destination:
			rideGroup?.destination?.label ||
			rideGroup?.destination ||
			"Destination not set",
		ridersJoined:
			rideGroup?.currentPassengers ??
			rideGroup?.currentMembers ??
			riders.filter((r) => r.status === "joined").length,
		totalRiders: rideGroup?.maxPassengers ?? rideGroup?.maxMembers ?? 4,
		pickupLocation:
			rideGroup?.pickup?.label || rideGroup?.pickup || "Pickup not set",
		departureTime: `Leaving in ${rideGroup?.leavingIn ?? rideGroup?.leaveBy ?? 5} min`,
		pricePerPerson: `£${rideGroup?.price ?? 0}/person`,
	};

	const handleSendMessage = () => {
		if (newMessage.trim()) {
			onSendMessage(newMessage.trim());
			setNewMessage("");
		}
	};

	const handleJoinRide = () => {
		onPartyFull(rideGroup);
	};

	const renderRider = ({ item }: { item: Rider }) => (
		<View
			style={[
				styles.riderCard,
				item.status === "joined"
					? { backgroundColor: COLORS.success + "15" }
					: { backgroundColor: COLORS.primaryLight },
			]}
		>
			<View style={styles.riderAvatar}>
				<Text style={styles.riderAvatarText}>{item.initial}</Text>
				{item.isVerified && (
					<View style={styles.verifiedBadge}>
						<Ionicons name="star" size={12} color={COLORS.primary} style={styles.verifiedIcon} />
					</View>
				)}
			</View>

			<View style={styles.riderInfo}>
				<View style={styles.riderNameRow}>
					<Text style={styles.riderName}>{item.name}</Text>
					{item.isCreator && (
						<View style={styles.creatorBadge}>
							<Text style={styles.creatorText}>Creator</Text>
						</View>
					)}
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
					{item.status === 'joined' ? (
						<>
							<Ionicons name="checkmark" size={14} color={COLORS.success} />
							<Text style={styles.riderStatus}>Joined</Text>
						</>
					) : (
						<Text style={styles.riderStatus}>Waiting...</Text>
					)}
				</View>
			</View>

			{item.status === 'joined' && (
				<Ionicons name="checkmark-circle" size={16} color={COLORS.success} style={styles.confirmedIcon} />
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
							<Ionicons name="star" size={14} color={COLORS.primary} style={styles.verifiedCheck} />
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
			<View style={styles.header}>
				<Pressable style={styles.backButton} onPress={onBack}>
					<Ionicons name="chevron-back" size={18} color={COLORS.text} />
				</Pressable>
				<View style={styles.headerContent}>
					<Text style={styles.headerTitle}>
						{rideDetails.destination}
					</Text>
					<Text style={styles.headerSubtitle}>
						{rideDetails.ridersJoined}/{rideDetails.totalRiders}{" "}
						riders joined
					</Text>
				</View>
				<Pressable
					style={styles.settingsButton}
					onPress={onViewSettings}
				>
					<Ionicons name="settings-outline" size={18} color={COLORS.text} />
				</Pressable>
			</View>

			<View style={styles.rideDetailsCard}>
				<View style={styles.detailRow}>
					<Ionicons name="location-outline" size={16} color={COLORS.text} style={{ marginRight: 8 }} />
					<Text style={styles.detailLabel}>{rideDetails.pickupLocation}</Text>
				</View>
				<View style={styles.detailRow}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Ionicons name="time-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
						<Text style={styles.detailLabel}>{rideDetails.departureTime}</Text>
					</View>
					<Text style={styles.priceText}>
						{rideDetails.pricePerPerson}
					</Text>
				</View>
			</View>

			<View style={styles.section}>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
					<Ionicons name="people-outline" size={18} color={COLORS.text} />
					<Text style={styles.sectionTitle}>Riders ({rideDetails.ridersJoined}/{rideDetails.totalRiders})</Text>
				</View>
				<FlatList
					data={riders}
					renderItem={renderRider}
					keyExtractor={(item) => item.id}
					scrollEnabled={false}
					contentContainerStyle={styles.ridersList}
				/>
			</View>

			<View style={styles.messagesSection}>
				<FlatList
					data={messages}
					renderItem={renderMessage}
					keyExtractor={(item) => item.id}
					scrollEnabled={false}
					contentContainerStyle={styles.messagesList}
				/>
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
						style={styles.sendButton}
						onPress={handleSendMessage}
						disabled={!newMessage.trim()}
					>
						<Ionicons name="send" size={18} color={COLORS.primary} style={styles.sendIcon} />
					</Pressable>
				</View>
			</View>

			<View style={styles.footer}>
				<Pressable style={styles.joinButton} onPress={handleJoinRide}>
					<Ionicons name="people-outline" size={18} color={COLORS.textLight} style={styles.joinButtonIcon} />
					<Text style={styles.joinButtonText}>
						Join This Ride - {rideDetails.pricePerPerson}
					</Text>
				</Pressable>
			</View>
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
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		backgroundColor: COLORS.background,
		gap: SPACING.md,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: BORDER_RADIUS.lg,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: COLORS.primaryLight,
	},
	backIcon: {
		fontSize: FONT_SIZES.xl,
		color: COLORS.primary,
	},
	headerContent: {
		flex: 1,
		gap: SPACING.xs,
	},
	headerTitle: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.primary,
	},
	headerSubtitle: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	settingsButton: {
		width: 40,
		height: 40,
		borderRadius: BORDER_RADIUS.lg,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: COLORS.primaryLight,
	},
	settingsIcon: {
		fontSize: FONT_SIZES.lg,
	},
	rideDetailsCard: {
		marginHorizontal: SPACING.md,
		marginVertical: SPACING.md,
		backgroundColor: COLORS.primaryLight,
		borderRadius: BORDER_RADIUS.lg,
		padding: SPACING.md,
		gap: SPACING.md,
	},
	detailRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	detailLabel: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.primary,
		fontWeight: "500",
	},
	priceText: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.primary,
		fontWeight: "600",
	},
	section: {
		marginHorizontal: SPACING.md,
		marginVertical: SPACING.md,
		gap: SPACING.md,
	},
	sectionTitle: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.primary,
	},
	ridersList: {
		gap: SPACING.sm,
	},
	riderCard: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		borderRadius: BORDER_RADIUS.lg,
		borderWidth: 1,
		borderColor: COLORS.border,
		gap: SPACING.md,
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
	verifiedBadge: {
		position: "absolute",
		top: -8,
		right: -8,
		width: 28,
		height: 28,
		borderRadius: BORDER_RADIUS.full,
		backgroundColor: COLORS.accentYellow,
		justifyContent: "center",
		alignItems: "center",
	},
	verifiedIcon: {
		fontSize: FONT_SIZES.sm,
	},
	riderInfo: {
		flex: 1,
		gap: SPACING.xs,
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
	riderStatus: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
	},
	confirmedIcon: {
		fontSize: FONT_SIZES.base,
		color: COLORS.success,
	},
	messagesSection: {
		flex: 1,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
	},
	messagesList: {
		gap: SPACING.md,
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
		gap: SPACING.sm,
	},
	messageSender: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.primary,
	},
	verifiedCheck: {
		fontSize: FONT_SIZES.sm,
	},
	messageBubble: {
		backgroundColor: COLORS.background,
		borderRadius: BORDER_RADIUS.xl,
		borderWidth: 1,
		borderColor: COLORS.border,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
	},
	messageBubbleMine: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	messageContent: {
		fontSize: FONT_SIZES.base,
		color: COLORS.primary,
		lineHeight: 24,
	},
	messageContentMine: {
		color: COLORS.textLight,
	},
	messageTime: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
	},
	messageTimeMine: {
		textAlign: "right",
	},
	inputSection: {
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		backgroundColor: COLORS.background,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: SPACING.sm,
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: BORDER_RADIUS.lg,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		fontSize: FONT_SIZES.sm,
		color: COLORS.text,
		maxHeight: 100,
	},
	sendButton: {
		width: 40,
		height: 40,
		borderRadius: BORDER_RADIUS.lg,
		backgroundColor: COLORS.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	sendIcon: {
		fontSize: FONT_SIZES.lg,
	},
	footer: {
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		backgroundColor: COLORS.background,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
	},
	joinButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: SPACING.lg,
		borderRadius: BORDER_RADIUS.lg,
		backgroundColor: COLORS.primary,
		gap: SPACING.md,
	},
	joinButtonIcon: {
		fontSize: FONT_SIZES.lg,
	},
	joinButtonText: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.textLight,
	},
});
