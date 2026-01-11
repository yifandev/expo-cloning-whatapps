import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Image, Platform, Pressable, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MessageInput() {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    setMessage("");
    setImage(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const isMessageEmpty = !message && !image;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "padding" : "height"}
      keyboardVerticalOffset={35}
    >
      <View
        style={{
          paddingBottom: insets.bottom + 8,
          paddingHorizontal: 16,
          paddingTop: 8,
          backgroundColor: "transparent",
        }}
      >
        {image && (
          <View className="w-32 h-32 mb-2">
            <Image
              source={{ uri: image }}
              className="w-full h-full rounded-lg"
            />
            <Pressable
              onPress={() => setImage(null)}
              className="absolute bg-white w-6 h-6 items-center justify-center rounded-full -top-2 -right-2"
            >
              <Ionicons name="close" size={14} color="red" />
            </Pressable>
          </View>
        )}

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={pickImage}
            className="bg-gray-200 rounded-full w-10 h-10 items-center justify-center"
          >
            <Ionicons name="image" size={20} color="#6B7280" />
          </Pressable>

          <TextInput
            placeholder="Type a message"
            className="bg-gray-100 flex-1 rounded-3xl px-4 py-3 text-base max-h-[120px]"
            multiline
            value={message}
            onChangeText={setMessage}
          />

          <Pressable
            onPress={handleSend}
            disabled={isMessageEmpty}
            style={{
              backgroundColor: isMessageEmpty ? "#E5E7EB" : "#25D366",
              borderRadius: 999,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="send"
              size={18}
              color={isMessageEmpty ? "#9CA3AF" : "#FFFFFF"}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
