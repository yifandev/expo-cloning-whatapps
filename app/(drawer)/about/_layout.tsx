import { Stack } from "expo-router";

export default function LayoutAbout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
        }}
      />
    </Stack>
  );
}
