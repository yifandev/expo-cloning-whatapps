import MessageInput from "@/components/MessageInput";
import MessageList from "@/components/MessageList";
import channels from "@/data/channels";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function ChannelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const channel = channels.find((e) => e.id === id);
  const navigation = useNavigation();

  if (!channel) {
    return (
      <View>
        <Text>Channel Not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: channel?.name,
          animation: "slide_from_right",
          headerBackVisible: false,
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                className="mr-4 px-2 py-2 hover:bg-slate-400 rounded-full"
                onPress={() => navigation.goBack()}
              >
                <AntDesign name="arrow-left" size={24} color="black" />
              </TouchableOpacity>
              <Image
                source={{ uri: channel?.avatar }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  marginRight: 10,
                }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {channel?.name}
              </Text>
            </View>
          ),
        }}
      />
      <MessageList />
      <MessageInput />
    </>
  );
}
