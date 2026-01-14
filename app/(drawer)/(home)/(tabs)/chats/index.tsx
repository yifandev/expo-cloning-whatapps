import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

import ChannelList from "@/components/ChannelList";
import { useSupabase } from "@/providers/SupabaseProvider";
import { ChannelQueryResult, ChannelWithUsers } from "@/types";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";

export default function ChannelListScreen() {
  const supabase = useSupabase();
  const { user } = useUser();

  const {
    data: channels,
    error,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<ChannelWithUsers[]>({
    queryKey: ["channels", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        // Langkah 1: Ambil channel yang diikuti user
        const { data: userChannels, error: userChannelsError } = await supabase
          .from("channel_users")
          .select("channel_id")
          .eq("user_id", user.id);

        if (userChannelsError) throw userChannelsError;

        const channelIds = userChannels.map((uc) => uc.channel_id);

        if (channelIds.length === 0) return [];

        // Langkah 2: Ambil detail channel beserta users
        const { data: channels, error: channelsError } = await supabase
          .from("channels")
          .select(
            `
            *,
            channel_users (
              user:users(*)
            )
          `
          )
          .in("id", channelIds)
          .returns<ChannelQueryResult[]>();

        if (channelsError) throw channelsError;

        // Langkah 3: Untuk setiap channel, ambil last message (termasuk field image)
        const channelsWithLastMessage = await Promise.all(
          channels.map(async (channel) => {
            // Ambil last message untuk channel ini dengan field image
            const { data: lastMessage } = await supabase
              .from("messages")
              .select("id, content, created_at, user_id, image")
              .eq("channel_id", channel.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            // Extract users dari channel_users
            const users = channel.channel_users.map((cu) => cu.user);

            // Format data sesuai ChannelWithUsers
            const formattedChannel: ChannelWithUsers = {
              ...channel,
              users,
              lastMessage: lastMessage || undefined,
            };

            return formattedChannel;
          })
        );

        // Sort by recent first
        return channelsWithLastMessage.sort((a, b) => {
          const timeA = a.lastMessage?.created_at || a.created_at;
          const timeB = b.lastMessage?.created_at || b.created_at;
          return new Date(timeB).getTime() - new Date(timeA).getTime();
        });
      } catch (error) {
        console.error("Error fetching channels:", error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    console.error("Channels error:", error);
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 text-center mb-2">
          Error loading channels
        </Text>
        <Text className="text-gray-500 text-sm text-center">
          Please pull down to refresh
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={channels}
      className="bg-white"
      renderItem={({ item }) => <ChannelList channel={item} />}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-gray-500">No conversations yet</Text>
          <Text className="text-gray-400 text-sm mt-2">
            Start a new conversation to see it here
          </Text>
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          tintColor="#000000"
          colors={["#000000"]}
        />
      }
    />
  );
}
