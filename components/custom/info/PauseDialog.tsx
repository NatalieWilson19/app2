import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { FC, useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";
import { useForm } from "@tanstack/react-form";
import { UID } from "@/api/types";
import { AuthStoreContext } from "@/store/auth";
import { IsPausedHowResult } from "@/utils/user";
import { Alert } from "react-native";
import { useActionSheet } from "@expo/react-native-action-sheet";
import dayjs from "dayjs";

export interface SetPause {
  isPausedOrUntil: boolean | Date;
  chainUid?: UID;
}
const minDate = dayjs().add(1, "day").toDate();

export default function usePauseDialog(props: {
  onSubmit: (o: SetPause) => Promise<void>;
}): {
  handleOpenPause: (isPauseHow: IsPausedHowResult) => void;
  PauseDateDialog: FC;
} {
  const [openPauseDuration, setOpenPauseDuration] = useState(false);
  const { currentChain } = useContext(AuthStoreContext);
  const { showActionSheetWithOptions } = useActionSheet();
  const form = useForm({
    defaultValues: {
      until: minDate,
    },
    onSubmitMeta: "" as
      | "on_user"
      | "on_loop"
      | "on_user_until"
      | "off_loop"
      | "off_user",
    onSubmit({ value, meta }) {
      const chainUid = currentChain?.uid;
      let prom: Promise<void>;
      switch (meta) {
        case "on_user":
          prom = props.onSubmit({
            isPausedOrUntil: true,
          });
          break;
        case "on_loop":
          prom = props.onSubmit({
            isPausedOrUntil: true,
            chainUid,
          });
          break;
        case "on_user_until":
          prom = props.onSubmit({ isPausedOrUntil: value.until });
          break;
        case "off_loop":
          prom = props.onSubmit({ isPausedOrUntil: false, chainUid });
          break;
        case "off_user":
          prom = props.onSubmit({ isPausedOrUntil: false });
          break;
        default:
          throw "invalid pause type submitted";
      }

      prom.then((res) => {
        setOpenPauseDuration(false);
        return res;
      });
    },
  });
  const { t } = useTranslation();
  const defaultStyles = useDefaultStyles();

  function handleOpenPause(isPausedHow: IsPausedHowResult) {
    if (isPausedHow.sum) {
      Alert.alert(t("unPause"), t("areYouSureUnPause"), [
        {
          text: t("unPause"),
          style: "destructive",
          onPress() {
            form.handleSubmit(isPausedHow.chain ? "off_loop" : "off_user");
          },
        },
        {
          text: t("cancel"),
          style: "cancel",
        },
      ]);
    } else {
      showActionSheetWithOptions(
        {
          title: t("pauseUntil"),
          options: [
            t("selectPauseDuration"),
            t("pauseOnlyLoop"),
            t("untilITurnItBackOn"),
            t("cancel"),
          ],
          cancelButtonIndex: 3,
        },
        (selectedIndex) => {
          switch (selectedIndex) {
            case 0:
              // selectPauseDuration
              setOpenPauseDuration((s) => !s);
              break;
            case 1:
              // pauseOnlyLoop
              form.handleSubmit("on_loop");
              break;
            case 2:
              // untilITurnItBackOn
              form.handleSubmit("on_user");
              break;
          }
        },
      );
    }
  }

  const PauseDateDialog = useCallback(
    () => (
      <AlertDialog
        useRNModal
        closeOnOverlayClick={false}
        isOpen={openPauseDuration}
        onClose={() => setOpenPauseDuration(false)}
        size="md"
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Text className="font-semibold text-typography-950" size="md">
              {t("selectPauseDuration")}
            </Text>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-3 flex-col items-stretch gap-4">
            <form.Field name="until">
              {(field) => (
                <VStack>
                  <DateTimePicker
                    styles={defaultStyles}
                    mode="single"
                    minDate={minDate}
                    onChange={({ date }) => field.setValue(date as Date)}
                    date={field.state.value}
                  />
                  <Button
                    size="lg"
                    action="primary"
                    onPress={() => form.handleSubmit("on_user_until")}
                  >
                    <ButtonText>
                      {t("pauseUntil") +
                        " " +
                        field.state.value.toLocaleDateString()}
                    </ButtonText>
                  </Button>
                </VStack>
              )}
            </form.Field>

            <Button
              size="lg"
              variant="outline"
              action="secondary"
              onPress={() => setOpenPauseDuration(false)}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
    [openPauseDuration, form],
  );
  return { PauseDateDialog, handleOpenPause };
}
