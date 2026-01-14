import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { View } from "react-native";
export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false, title: "home" }}
      />
      <Stack.Screen
        name="channel/[id]"
        options={{
          contentStyle: {
            backgroundColor: "white",
          },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
          animation: "slide_from_right",
          title: "Chat",
          headerRight: () => (
            <View className="flex-row gap-4">
              <Ionicons name="videocam-outline" size={24} />
              <Ionicons name="call-outline" size={24} />
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="new/chat"
        options={{
          presentation: "modal",
          title: "Baru Chat",
          animation: "slide_from_bottom",
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "white",
          },
        }}
      />
    </Stack>
  );
}
