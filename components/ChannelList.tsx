import { Channel } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Link } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

type ChannelListProps = {
  channel: Channel;
};

export default function ChannelList({ channel }: ChannelListProps) {
  return (
    <Link
      href={{
        pathname: "/channel/[id]",
        params: { id: channel.id },
      }}
      asChild
    >
      <Pressable className="flex-row gap-2 border-b border-gray-200 p-2">
        <Image
          source={{ uri: channel.avatar }}
          className="w-12 h-12 rounded-full"
        />
        <View className="flex-1">
          <Text className="font-bold text-lg text-gray-600" numberOfLines={1}>
            {channel.name}
          </Text>
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {channel.lastMessage?.content || "No Message Yet"}
          </Text>
        </View>
        {channel.lastMessage && (
          <Text className="text-xs text-neutral-500">
            {formatDistanceToNow(new Date(channel.lastMessage?.createdAt), {
              addSuffix: true,
            })}
          </Text>
        )}
      </Pressable>
    </Link>
  );
}
