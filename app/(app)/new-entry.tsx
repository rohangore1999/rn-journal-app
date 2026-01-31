import React, { useState } from "react";
import { Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack } from "tamagui";

const NewEntry = () => {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleCallAPI = async () => {
    setLoading(true);

    try {
      const result = await fetch("/api/categorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ test: "data from new-entry" }),
      });

      const data = await result.json();
      console.log("✅ API Response:", data);
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("❌ API Error:", error);
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <YStack padding="$4" gap="$4">
        <Text style={{ color: "white", fontSize: 24 }}>New Entry</Text>

        <Pressable
          onPress={handleCallAPI}
          style={{
            backgroundColor: "#8b5cf6",
            padding: 16,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            {loading ? "Loading..." : "Call API"}
          </Text>
        </Pressable>

        {response && (
          <YStack padding="$4" backgroundColor="$gray3" borderRadius="$4">
            <Text style={{ color: "white", fontFamily: "monospace" }}>
              {response}
            </Text>
          </YStack>
        )}
      </YStack>
    </SafeAreaView>
  );
};

export default NewEntry;
