import { ChannelWithUsers } from "@/types";
import { useUser } from "@clerk/clerk-expo";
import { formatDistanceToNow } from "date-fns";
import { Link } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

type ChannelListProps = {
  channel: ChannelWithUsers;
};

export default function ChannelList({ channel }: ChannelListProps) {
  const { user } = useUser();

  const otherUser = channel.users?.find((u) => u.id !== user?.id);
  const hasUsers = channel.users && channel.users.length > 0;

  let channelName = channel.name || "Channel";
  let avatarUrl: string | null = null;
  let initials = "?";

  if (channel.type === "direct" && hasUsers) {
    channelName = otherUser?.full_name || otherUser?.first_name || "Unknown";
    avatarUrl = otherUser?.avatar_url || null;
    initials = otherUser?.first_name?.charAt(0)?.toUpperCase() || "?";
  } else if (channel.type === "group") {
    channelName = channel.name || "Group Chat";
    initials = channelName.charAt(0).toUpperCase();
  }

  // Format waktu
  const getTimeText = () => {
    if (channel.lastMessage?.created_at) {
      return formatDistanceToNow(new Date(channel.lastMessage.created_at), {
        addSuffix: true,
      });
    }
    return formatDistanceToNow(new Date(channel.created_at), {
      addSuffix: true,
    });
  };

  // Tentukan preview message
  const getPreviewText = () => {
    if (!channel.lastMessage) {
      return "No messages yet";
    }

    if (channel.lastMessage.image) {
      return "📷 Image";
    }

    if (channel.lastMessage.content) {
      return channel.lastMessage.content;
    }

    return "Message";
  };

  return (
    <Link href={`/channel/${channel.id}`} asChild>
      <Pressable className="flex-row gap-3 p-4 border-b border-gray-200 active:bg-gray-50">
        {/* Channel Image */}
        {channel.type === "direct" && avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="w-12 h-12 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-neutral-200 items-center justify-center">
            <Text className="text-neutral-500 font-bold text-lg">
              {initials}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className="font-bold text-lg text-neutral-800"
              numberOfLines={1}
            >
              {channelName}
            </Text>
            <Text className="text-xs text-neutral-500">{getTimeText()}</Text>
          </View>
          <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
            {getPreviewText()}
          </Text>
          {channel.type === "group" && hasUsers && (
            <Text className="text-xs text-gray-400 mt-1">
              {channel.users.length} members
            </Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
}
