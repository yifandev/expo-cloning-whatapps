import UserList from "@/components/UserList";
import { useSupabase } from "@/providers/SupabaseProvider";
import { User } from "@/types";
import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function LayoutNew() {
  const supabase = useSupabase();
  const { user } = useUser();
  const router = useRouter();

  const createChannel = useMutation({
    mutationFn: async (clickedUser: User) => {
      // 1. Create a channel (if it doesn't exist)
      const { data: channel } = await supabase
        .from("channels")
        .insert({ type: "direct" })
        .throwOnError()
        .select("*")
        .single();

      if (!channel) {
        throw new Error("Channel is null");
      }

      // 2. Add user to the channel
      await supabase
        .from("channel_users")
        .insert({ channel_id: channel.id, user_id: clickedUser.id })
        .throwOnError();

      // 3. Add myself to the channel
      await supabase
        .from("channel_users")
        .insert({ channel_id: channel.id, user_id: user!.id })
        .throwOnError();

      return channel;
    },
    onSuccess(newChannel) {
      router.back();
      router.push(`/channel/${newChannel.id}`);
    },
  });

  const handleUserPress = (user: User) => {
    console.log("User clicked: ", user.first_name);

    createChannel.mutate(user);
  };

  return (
    <View className="">
      <UserList onPress={handleUserPress} />
    </View>
  );
}
