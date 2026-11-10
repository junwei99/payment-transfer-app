import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

type TBiometricOutcome = "SUCCESS" | "CANCELLED" | "FALLBACK" | "FAILED";

export const authentication = {
  canUseBiometrics: async () => {
    const [hasHardware, isEnrolled, level] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.getEnrolledLevelAsync(),
    ]);

    const { BIOMETRIC_STRONG } = LocalAuthentication.SecurityLevel;

    return (
      hasHardware &&
      isEnrolled &&
      (Platform.OS !== "android" || level === BIOMETRIC_STRONG)
    );
  },
  authenticate: async (): Promise<TBiometricOutcome> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Approve transfer",
      cancelLabel: "Cancel",
      fallbackLabel: "Use banking PIN",
      disableDeviceFallback: true,
      biometricsSecurityLevel: "strong",
    });

    if (result.success) {
      return "SUCCESS";
    }

    switch (result.error) {
      case "user_cancel":
      case "app_cancel":
        return "CANCELLED";

      case "user_fallback":
      case "lockout":
      case "not_available":
      case "not_enrolled":
      case "passcode_not_set":
        return "FALLBACK";

      default:
        return "FAILED";
    }
  },
  cancel: async () => {
    if (Platform.OS === "android") {
      await LocalAuthentication.cancelAuthenticate();
    }
  },
};
