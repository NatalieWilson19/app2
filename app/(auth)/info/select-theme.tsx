import { chainUpdate } from "@/api/chain";
import { authStore } from "@/store/auth";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { useTranslation } from "react-i18next";
import { SafeAreaView, ScrollView } from "react-native";
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "@/components/ui/radio";
import { CircleIcon } from "lucide-react-native";
import { router } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";
import { basicThemeColors, flagFlags } from "@/constants/Colors";
import { useEffect } from "react";
import { Box } from "@/components/ui/box";

const themeOptions = [
  ["default", "rgb(95, 156, 138)"],
  ...Object.entries(basicThemeColors),
  ["rainbow", flagFlags["rainbow"][0]],
];

export default function SelectTheme() {
  const { t } = useTranslation();
  const currentChain = useStore(authStore, (s) => s.currentChain);

  const form = useForm({
    defaultValues: {
      theme: "default",
    },
    async onSubmit({ value }) {
      if (!value.theme) throw "Please select a theme";
      await chainUpdate({
        uid: currentChain!.uid,
        theme: value.theme,
      });
      authStore.setState((s) => ({
        ...s,
        currentChain: { ...s.currentChain!, theme: value.theme },
      }));
      router.back();
    },
  });
  useEffect(() => {
    form.setFieldValue("theme", currentChain?.theme || "default");
  }, [currentChain?.theme]);

  return (
    <SafeAreaView className="flex-1 bg-background-0 pb-4">
      <ScrollView contentInsetAdjustmentBehavior="automatic" className="grow">
        <form.Field name="theme">
          {(field) => (
            <RadioGroup
              aria-labelledby="Select one item"
              className="gap-0"
              value={field.state.value}
              onChange={(e) => {
                field.setValue(e);
              }}
            >
              {themeOptions?.map(([k, v]) => {
                return (
                  <Radio
                    value={k}
                    key={k}
                    size="md"
                    className="relative m-0 items-center justify-between p-4"
                    style={k !== "rainbow" ? { backgroundColor: v } : undefined}
                  >
                    {k === "rainbow" ? (
                      <Box className="absolute inset-0 -z-10 flex-row">
                        {flagFlags.rainbow.map((c) => (
                          <Box
                            className="flex-grow"
                            key={c}
                            style={{ backgroundColor: c }}
                          ></Box>
                        ))}
                      </Box>
                    ) : null}
                    <RadioLabel aria-label={k}>&nbsp;</RadioLabel>
                    <RadioIndicator className="!bg-white/70">
                      <RadioIcon as={CircleIcon} />
                    </RadioIndicator>
                  </Radio>
                );
              })}
            </RadioGroup>
          )}
        </form.Field>
      </ScrollView>
      <Button onPress={form.handleSubmit} size="xl" className="m-6">
        <ButtonText>{t("select")}</ButtonText>
      </Button>
    </SafeAreaView>
  );
}
