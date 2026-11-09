import type { PropsWithChildren } from "react";
import { Image } from "expo-image";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DISPLAY_FONT } from "@/utils/display-font";

export const Page = ({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string }>) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafaf8" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="mx-auto w-full max-w-xl flex-1 gap-8 px-6 pb-6 pt-4">
            <View className="gap-3">
              <View className="flex-row items-center justify-between gap-4">
                <View className="flex-1 gap-3">
                  <View className="h-px w-8 bg-clay" />
                  <Text className="text-sm text-secondary">
                    Payment transfer
                  </Text>
                  <Text className="text-sm text-secondary">
                    Simulated backend
                  </Text>
                </View>
                <View
                  pointerEvents="none"
                  accessible={false}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <Image
                    source={require("@/assets/images/botanical-branch.svg")}
                    contentFit="contain"
                    accessible={false}
                    style={{ width: 100, height: 108 }}
                  />
                </View>
              </View>
              <Text
                accessibilityRole="header"
                style={DISPLAY_FONT}
                className="text-4xl text-ink"
              >
                {title}
              </Text>
              {subtitle ? (
                <Text className="text-base leading-6 text-secondary">
                  {subtitle}
                </Text>
              ) : null}
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
