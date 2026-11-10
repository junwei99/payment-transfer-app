import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useReviewTransfer } from "@/hooks/useReviewTransfer";
import { useTransferField } from "@/hooks/useTransferField";
import { ACCOUNT_OPTIONS } from "@/query/banking";
import type {
  TTransferFormOutput,
  TTransferFormValues,
} from "@/schemas/transfer-form.schema";
import { RecipientSection } from "@/screens/transfer/components/RecipientSection";
import { TransferAmountField } from "@/screens/transfer/components/TransferAmountField";
import { useTransferStore } from "@/stores/transfer";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useFormContext } from "react-hook-form";
import { Keyboard } from "react-native";
import Animated, {
  LinearTransition,
  ReduceMotion,
} from "react-native-reanimated";

const fieldLayoutTransition = LinearTransition.duration(220).reduceMotion(
  ReduceMotion.System,
);

export const TransferForm = () => {
  const { handleSubmit } = useFormContext<
    TTransferFormValues,
    undefined,
    TTransferFormOutput
  >();

  const note = useTransferField("note");
  const account = useQuery(ACCOUNT_OPTIONS);
  const review = useReviewTransfer();
  const { dispatch } = useTransferStore.getState();

  const reviewTransfer = () => {
    if (!account.data) {
      return;
    }

    if (!dispatch({ type: "INVALIDATE_REVIEW" })) {
      return;
    }

    Keyboard.dismiss();

    void handleSubmit((values) => {
      if (!review(values)) {
        return;
      }

      router.navigate("/review");
    })();
  };

  return (
    <>
      <Animated.View layout={fieldLayoutTransition}>
        <RecipientSection />
      </Animated.View>
      <Animated.View layout={fieldLayoutTransition}>
        <TransferAmountField />
      </Animated.View>
      <Animated.View layout={fieldLayoutTransition}>
        <Field
          {...note}
          label="Note (optional)"
          hint="Up to 200 characters."
          multiline
        />
      </Animated.View>
      <Animated.View layout={fieldLayoutTransition}>
        <Button
          label="Review transfer"
          disabled={!account.data}
          onPress={reviewTransfer}
        />
      </Animated.View>
    </>
  );
};
