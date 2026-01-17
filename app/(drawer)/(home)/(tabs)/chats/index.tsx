// index.tsx
import { ActivityIndicator, FlatList, Text, View } from "react-native";

import ChannelList from "@/components/ChannelList";
import {
  fetchUserChannels,
  useChannelSubscriptions,
} from "@/hooks/channelService";
import { useSupabase } from "@/providers/SupabaseProvider";
import { ChannelWithUsers } from "@/types";
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
  } = useQuery<ChannelWithUsers[]>({
    queryKey: ["channels", user?.id],
    queryFn: () => fetchUserChannels(supabase, user?.id),
    enabled: !!user?.id,
  });

  // Setup realtime subscriptions
  useChannelSubscriptions({
    supabase,
    userId: user?.id,
    onDataChange: () => refetch().then(() => {}), // Convert to Promise<void>
  });

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
    />
  );
}
