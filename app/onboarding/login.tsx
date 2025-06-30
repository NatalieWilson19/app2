import axios from "@/api/axios";
import { loginEmail, loginValidate } from "@/api/login";
import FormLabel from "@/components/custom/FormLabel";
import OnboardingArrows from "@/components/custom/onboarding/Arrows";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Image } from "@/components/ui/image";
import { VStack } from "@/components/ui/vstack";
import { useForm } from "@tanstack/react-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Response } from "redaxios";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Input, InputField } from "@/components/ui/input";
import { Box } from "@/components/ui/box";
import LegalLinks from "@/components/custom/LegalLinks";
import { createRef, useContext, useState } from "react";
import Sleep from "@/utils/sleep";
import { SavedStoreContext } from "@/store/saved";

export default function Step2() {
  const theme = useColorScheme() ?? "light";
  const { setSaved } = useContext(SavedStoreContext);
  const refInputFieldPasscode = createRef<any>();
  const [emailSent, setEmailSent] = useState(false);
  const [tokenSent, setTokenSent] = useState(false);
  const [tokenOverride, setTokenOverride] = useState("");
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mutateLoginEmail = useMutation({
    async mutationFn(email: string) {
      return loginEmail(email, true).then((res) => res.data);
    },
  });
  const mutateLoginPasscode = useMutation({
    async mutationFn(d: { email: string; passcode: string }) {
      let emailBase64 = btoa(d.email);
      let passcode = d.passcode;
      if (tokenOverride && d.passcode === "12345678") {
        passcode = tokenOverride;
      }
      return loginValidate(emailBase64, passcode).then((res) => res.data);
    },
    onSuccess(data) {
      setSaved({
        userUID: data.user.uid,
        token: data.token,
        chainUID: "",
      });

      axios.defaults.auth = "Bearer " + data.token;
      queryClient.invalidateQueries({
        queryKey: ["auth"],
        refetchType: "all",
        exact: false,
      });
    },
    onError(err) {
      Alert.alert("invalid passcode please request another email", err.message);
    },
    retry: false,
  });

  const formPasscode = useForm({
    defaultValues: {
      email: "",
      passcode: "",
    },
    onSubmit({ value }) {
      if (tokenSent) return;
      setTokenSent(true);
      return mutateLoginPasscode.mutateAsync({
        email: value.email,
        passcode: value.passcode,
      });
    },
  });
  const formLogin = useForm({
    defaultValues: {
      email: "",
    },
    async onSubmit({ value }) {
      if (emailSent) return;
      formPasscode.setFieldValue("passcode", "");
      setEmailSent(true);
      await mutateLoginEmail
        .mutateAsync(value.email)
        .then((res) => {
          Sleep(5000).then(() => setEmailSent(false));
          setTokenOverride(res || "");
          // setTimeout(() => {
          //   console.log("refInputFieldPasscode", refInputFieldPasscode.current);
          // }, 200);
          return res;
        })
        .catch((err) => {
          setEmailSent(false);
          throw err;
        })
        .finally(() => {
          setTokenSent(false);
        });
      formPasscode.setFieldValue("email", value.email);
    },
  });

  async function handleOpenMailApp() {
    const email = formLogin.getFieldValue("email");
    const platform = Platform.OS;
    let url = "mailto:" + email;
    if (platform == "ios") {
      if (await Linking.canOpenURL(url)) {
        url = "com.apple.mobilemail://" + email;
      }
    }

    Linking.openURL(url);
  }
  const mutateLoginEmailErr = (
    mutateLoginEmail.error as any as Response<string> | undefined
  )?.data;
  const mutateLoginPasscodeErr = (
    mutateLoginPasscode.error as any as Response<string> | undefined
  )?.data;
  return (
    <SafeAreaView className="flex-1">
      <Box className="relative flex-1">
        <ScrollView className="flex-grow">
          <Box className="flex items-center pt-12">
            {theme == "light" ? (
              <Image
                source={require("@/assets/images/v2_logo_black.png")}
                resizeMode="contain"
                className="h-44 w-44"
                alt="logo"
              />
            ) : (
              <Image
                src={require("@/assets/images/v2_logo_white.png")}
                resizeMode="contain"
                alt="logo"
                className="h-44 w-44"
              />
            )}
          </Box>
          <VStack className="mx-4 my-10 gap-4 bg-background-0 p-4">
            <Text className="text-xl">{t("login")}</Text>
            <FormLabel
              label={t("pleaseEnterYourEmailAddress")}
              error={mutateLoginEmailErr}
            >
              <formLogin.Field name="email">
                {(field) => (
                  <Input id="email" key="email-address">
                    <InputField
                      autoFocus
                      onSubmitEditing={formLogin.handleSubmit}
                      value={field.state.value}
                      autoCapitalize="none"
                      onChangeText={field.setValue}
                      onBlur={field.handleBlur}
                      inputMode="email"
                      keyboardType="email-address"
                      returnKeyType="send"
                      placeholder={t("yourEmailAddress")}
                      type="text"
                    ></InputField>
                  </Input>
                )}
              </formLogin.Field>
            </FormLabel>
            <HStack reversed className="gap-3">
              <Button
                action={mutateLoginEmail.isError ? "negative" : "primary"}
                isDisabled={emailSent}
                onPress={formLogin.handleSubmit}
              >
                <ButtonText>{t("send")}</ButtonText>
              </Button>
              {mutateLoginEmail.isSuccess ? (
                <Button variant="outline" onPress={handleOpenMailApp}>
                  <ButtonText>{t("openMailApp")}</ButtonText>
                </Button>
              ) : null}
            </HStack>

            <VStack className="gap-4">
              <Text
                className={
                  mutateLoginEmail.isSuccess ? "" : "text-typography-400"
                }
              >
                {t("enterThePasscodeYouReceivedInYourEmail")}
              </Text>
              <FormLabel
                label={t("passcode")}
                error={mutateLoginPasscodeErr}
                isDisabled={!mutateLoginEmail.isSuccess}
              >
                <formPasscode.Field name="passcode">
                  {(field) => (
                    <Input>
                      <InputField
                        keyboardType="numeric"
                        placeholder="••••••"
                        value={field.state.value}
                        onChangeText={field.setValue}
                        onBlur={field.handleBlur}
                      />
                    </Input>
                  )}
                </formPasscode.Field>
              </FormLabel>
              <Button
                onPress={formPasscode.handleSubmit}
                isDisabled={!mutateLoginEmail.isSuccess || tokenSent}
                className="self-end"
              >
                <ButtonText>{t("login")}</ButtonText>
              </Button>
            </VStack>
          </VStack>
          <LegalLinks />
          <Box className="h-32" />
        </ScrollView>
        <Box className="absolute bottom-0 left-0 right-0 h-32" />
        <OnboardingArrows onPressPrev={() => router.dismissTo("./step2")} />
      </Box>
    </SafeAreaView>
  );
}
