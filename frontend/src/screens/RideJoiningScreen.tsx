import React, { useState } from "react";
import {
	View,
	Text,
	ScrollView,
	Pressable,
	StyleSheet,
	SafeAreaView,
	FlatList,
	TextInput,
} from "react-native";
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
	onBack: () => void;
	onViewSettings: () => void;
	onPartyFull: (rideGroup: any) => void;
}

const mockRiders: Rider[] = [
	{
		id: "1",
		name: "Sarah M.",
		initial: "S",
		status: "joined",
		isCreator: true,
		isVerified: true,
	},
	{
		id: "2",
		name: "Alex P.",
		initial: "A",
		status: "waiting",
		isCreator: false,
		isVerified: false,
	},
	{
		id: "3",
		name: "ndfjv",
		initial: "n",
		status: "waiting",
		isCreator: false,
		isVerified: false,
	},
];

const mockMessages: Message[] = [
	{
		id: "1",
		author: "Sarah M.",
		content:
			"Hey everyone! Heading to Downtown Financial District. Join the ride!",
		timestamp: "Just now",
		isVerified: true,
	},
];

export const RideJoiningScreen: React.FC<RideJoiningScreenProps> = ({
	userName,
	rideGroup,
	onBack,
	onViewSettings,
	onPartyFull,
}) => {
	const [newMessage, setNewMessage] = useState("");

	const rideDetails = {
		destination: rideGroup?.destination || "Downtown Financial District",
		ridersJoined: 1,
		totalRiders: 4,
		pickupLocation: rideGroup?.pickup || "North Station - Main Entrance",
		departureTime: `Leaving in ${rideGroup?.leavingIn || 5} min`,
		pricePerPerson: `£${rideGroup?.price || 8}/person`,
	};

	const handleSendMessage = () => {
		if (newMessage.trim()) {
			// Handle message sending
			setNewMessage("");
		}
	};

	const handleJoinRide = () => {
		onPartyFull(rideGroup);
	};

	const renderRider = ({ item, index }: { item: Rider; index: number }) => (
		<View
			style={[
				styles.riderCard,
				index === 0
					? { backgroundColor: COLORS.success + "15" }
					: { backgroundColor: COLORS.primaryLight },
			]}
		>
			<View style={styles.riderAvatar}>
				<Text style={styles.riderAvatarText}>{item.initial}</Text>
				{item.isVerified && (
					<View style={styles.verifiedBadge}>
						<Text style={styles.verifiedIcon}>⭐</Text>
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
				<Text style={styles.riderStatus}>
					{item.status === "joined" ? "✓ Joined" : "Waiting..."}
				</Text>
			</View>

			{item.status === "joined" && (
				<Text style={styles.confirmedIcon}>✓</Text>
			)}
		</View>
	);

	const renderMessage = ({ item }: { item: Message }) => (
		<View style={styles.messageContainer}>
			<View style={styles.messageHeader}>
				<Text style={styles.messageSender}>{item.author}</Text>
				{item.isVerified && (
					<Text style={styles.verifiedCheck}>⭐</Text>
				)}
			</View>
			<View style={styles.messageBubble}>
				<Text style={styles.messageContent}>{item.content}</Text>
			</View>
			<Text style={styles.messageTime}>{item.timestamp}</Text>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Pressable style={styles.backButton} onPress={onBack}>
					<Text style={styles.backIcon}>←</Text>
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
					<Text style={styles.settingsIcon}>⚙️</Text>
				</Pressable>
			</View>

			{/* Ride Details Card */}
			<View style={styles.rideDetailsCard}>
				<View style={styles.detailRow}>
					<Text style={styles.detailLabel}>
						📍 {rideDetails.pickupLocation}
					</Text>
				</View>
				<View style={styles.detailRow}>
					<Text style={styles.detailLabel}>
						⏱ {rideDetails.departureTime}
					</Text>
					<Text style={styles.priceText}>
						{rideDetails.pricePerPerson}
					</Text>
				</View>
			</View>

			{/* Riders Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					👥 Riders ({rideDetails.ridersJoined}/
					{rideDetails.totalRiders})
				</Text>
				<FlatList
					data={mockRiders}
					renderItem={renderRider}
					keyExtractor={(item) => item.id}
					scrollEnabled={false}
					contentContainerStyle={styles.ridersList}
				/>
			</View>

			{/* Messages Section */}
			<View style={styles.messagesSection}>
				<FlatList
					data={mockMessages}
					renderItem={renderMessage}
					keyExtractor={(item) => item.id}
					scrollEnabled={false}
					contentContainerStyle={styles.messagesList}
				/>
			</View>

			{/* Message Input */}
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
						<Text style={styles.sendIcon}>➤</Text>
					</Pressable>
				</View>
			</View>

			{/* Join Ride Button */}
			<View style={styles.footer}>
				<Pressable style={styles.joinButton} onPress={handleJoinRide}>
					<Text style={styles.joinButtonIcon}>👥</Text>
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
	messageContent: {
		fontSize: FONT_SIZES.base,
		color: COLORS.primary,
		lineHeight: 24,
	},
	messageTime: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textSecondary,
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
