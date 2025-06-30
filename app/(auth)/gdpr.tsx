import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import { useContext, useEffect } from "react";
import { WebView } from "react-native-webview";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import { CheckIcon, StampIcon } from "lucide-react-native";
import { AuthStoreContext } from "@/store/auth";
import { useForm } from "@tanstack/react-form";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { userUpdate } from "@/api/user";
import { SavedStoreContext } from "@/store/saved";

export default function AcceptDpa() {
  const { authUser, setAuthUser } = useContext(AuthStoreContext);
  const { saved: savedStore } = useContext(SavedStoreContext);
  const form = useForm({
    defaultValues: {
      accepted_dpa: false,
      accepted_toh: false,
    },
    async onSubmit({ value }) {
      if (!authUser) throw "Please login first";
      if (!value.accepted_dpa || !value.accepted_toh)
        throw "Must first accept both the Data Processing Agreement and the Terms of Hosts";
      await userUpdate({
        user_uid: authUser.uid,
        accepted_legal: true,
      }).then((res) => {
        setAuthUser((s) => ({
          ...s!,
          accepted_dpa: true,
          accepted_toh: true,
        }));
      });
    },
  });
  const { t, i18n } = useTranslation();
  useEffect(() => {
    if (!authUser) return;
    if (authUser.accepted_dpa && authUser.accepted_toh) {
      if (savedStore.chainUID) {
        router.replace("/(auth)/(tabs)/(index)");
      } else {
        router.replace("/(auth)/select-chain");
      }
    }
    form.setFieldValue("accepted_dpa", Boolean(authUser.accepted_dpa));
    form.setFieldValue("accepted_toh", Boolean(authUser.accepted_toh));
  }, [authUser?.accepted_dpa, authUser?.accepted_toh]);
  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <VStack className="flex-1 flex-grow">
        <form.Subscribe selector={(s) => s.values.accepted_dpa}>
          {(accepted_dpa) =>
            accepted_dpa ? null : (
              <VStack className="flex-grow gap-2 bg-background-100 p-5">
                <WebView
                  className="h-full flex-1"
                  style={{ flex: 1 }}
                  source={{
                    uri: `https://www.clothingloop.org/${i18n.language}/data-processing-agreement/`,
                  }}
                />
              </VStack>
            )
          }
        </form.Subscribe>
        <form.Field name="accepted_dpa">
          {(field) => (
            <Checkbox
              value="dpa"
              className="p-4"
              isChecked={field.state.value}
              onChange={field.setValue}
              size="md"
              isInvalid={false}
              isDisabled={false}
            >
              <CheckboxLabel className="flex-grow text-lg">
                {t("dpa")}
              </CheckboxLabel>
              <CheckboxIndicator>
                <CheckboxIcon as={CheckIcon} />
              </CheckboxIndicator>
            </Checkbox>
          )}
        </form.Field>
        <form.Subscribe selector={(s) => s.values}>
          {({ accepted_toh, accepted_dpa }) => (
            <>
              {!accepted_toh && accepted_dpa ? (
                <VStack className="flex-grow gap-2 bg-background-100 p-5">
                  <WebView
                    className="h-full flex-1"
                    style={{ flex: 1 }}
                    source={{
                      uri: `https://www.clothingloop.org/${i18n.language}/terms-of-hosts/`,
                    }}
                  />
                </VStack>
              ) : null}
              <form.Field name="accepted_toh">
                {(field) => (
                  <Checkbox
                    value="dpa"
                    className="p-4"
                    isChecked={field.state.value}
                    onChange={field.setValue}
                    size="md"
                    isInvalid={false}
                    isDisabled={!accepted_dpa}
                  >
                    <CheckboxLabel className="flex-grow text-lg">
                      {t("termsOfHosts")}
                    </CheckboxLabel>
                    <CheckboxIndicator>
                      <CheckboxIcon as={CheckIcon} />
                    </CheckboxIndicator>
                  </Checkbox>
                )}
              </form.Field>
              {accepted_dpa && accepted_toh ? (
                <Box className="flex-1 items-center justify-center">
                  <Box className="relative items-center justify-center">
                    <Icon
                      as={StampIcon}
                      className="mx-6 my-8 h-28 w-28 text-typography-500"
                    />
                    <Icon
                      as={CheckIcon}
                      className="absolute bottom-0 right-0 h-14 w-14 text-success-400"
                    />
                  </Box>
                  <Text className="text-2xl">{t("ready")}</Text>
                </Box>
              ) : null}
            </>
          )}
        </form.Subscribe>
      </VStack>
      <Box className="p-4">
        <form.Subscribe selector={(s) => s.values}>
          {({ accepted_toh, accepted_dpa }) => (
            <Button
              onPress={form.handleSubmit}
              className="h-14"
              isDisabled={!accepted_dpa || !accepted_toh}
            >
              <ButtonText className="text-lg">{t("accept")}</ButtonText>
            </Button>
          )}
        </form.Subscribe>
      </Box>
    </SafeAreaView>
  );
}
