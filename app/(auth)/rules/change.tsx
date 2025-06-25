import { chainUpdate } from "@/api/chain";
import { Chain } from "@/api/types";
import FormLabel from "@/components/custom/FormLabel";
import {
  FaqListItem,
  useFaqCustom,
  useFaqDefault,
} from "@/components/custom/rules/shared";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { authStore } from "@/store/auth";
import { useStore } from "@tanstack/react-store";
import { router, useNavigation } from "expo-router";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  RefreshCcwIcon,
  Trash2Icon,
} from "lucide-react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, Text } from "react-native";

export default function Change() {
  const currentChain = useStore(authStore, (s) => s.currentChain);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const rulesDefault = useFaqDefault();
  const rulesCustom = useFaqCustom();

  const [rules, setRules] = useState([] as FaqListItem[]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleHeaderSave}>
          <Text>{t("save")}</Text>
        </Pressable>
      ),
    });
  }, [rules, t]);

  useEffect(() => {
    if (rulesCustom) {
      setRules(rulesCustom);
    } else {
      setRules(rulesDefault);
    }
  }, [rulesCustom, rulesDefault]);

  function setText(i: number, key: keyof FaqListItem, v: string) {
    setRules((s) => {
      const newList = [...s];
      newList[i] = {
        ...newList[i],
        [key]: v,
      };
      return newList;
    });
  }

  function handleHeaderSave() {
    // console.log("save", rules.length);
    saveAndReturn(rules);
  }

  async function saveAndReturn(faq: FaqListItem[] | null) {
    const rules_override = faq?.length ? JSON.stringify(faq) : null;
    await chainUpdate({
      uid: currentChain!.uid,
      rules_override,
    });
    authStore.setState((s) => ({
      ...s,
      currentChain: {
        ...(s.currentChain as Chain),
        rules_override,
      },
    }));
    router.back();
  }

  function reset() {
    Alert.alert(t("resetRules"), t("resetDescription"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("reset"),
        style: "destructive",
        onPress() {
          setRules(rulesDefault);
          saveAndReturn(null);
        },
      },
    ]);
  }

  function deleteItem(index: number) {
    setRules((s) => s.filter((_, i) => i !== index));
  }

  function addItem() {
    setRules((s) => [...s, { title: "", content: "" }]);
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="mb-4">
      {rulesCustom ? (
        <HStack className="items-center gap-2 bg-background-900 p-2">
          <Icon
            as={RefreshCcwIcon}
            size="xl"
            className="mx-3 text-background-100"
          />
          <Box className="flex-shrink">
            <Text className="text-lg text-background-100">
              {t("resetRules")}
            </Text>
            <Text className="text-background-100">{t("resetDescription")}</Text>
          </Box>
          <Button onPress={reset} action="negative">
            <ButtonText>{t("reset")}</ButtonText>
          </Button>
        </HStack>
      ) : null}

      <VStack>
        <Accordion type="multiple" isCollapsible>
          {rules.map((r, i) => (
            <AccordionItem key={i} value={i + ""}>
              <AccordionHeader>
                <AccordionTrigger>
                  {({ isExpanded }) => {
                    return (
                      <>
                        <AccordionTitleText>{r.title}</AccordionTitleText>
                        <Button
                          onPress={() => deleteItem(i)}
                          size="sm"
                          action="negative"
                        >
                          <ButtonIcon as={Trash2Icon} />
                        </Button>
                        {isExpanded ? (
                          <AccordionIcon as={ChevronUpIcon} className="ml-3" />
                        ) : (
                          <AccordionIcon
                            as={ChevronDownIcon}
                            className="ml-3"
                          />
                        )}
                      </>
                    );
                  }}
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <FormLabel label={t("title")}>
                  <Input>
                    <InputField
                      value={r.title}
                      onChangeText={(v) => setText(i, "title", v)}
                    />
                  </Input>
                </FormLabel>
                <FormLabel label={t("description")}>
                  <Textarea>
                    <TextareaInput
                      value={r.content}
                      onChangeText={(v) => setText(i, "content", v)}
                    ></TextareaInput>
                  </Textarea>
                </FormLabel>
              </AccordionContent>
            </AccordionItem>
          ))}
          <VStack className="p-4">
            <Button onPress={addItem} action="positive" variant="outline">
              <ButtonIcon as={PlusIcon} size="lg" />
            </Button>
          </VStack>
        </Accordion>
      </VStack>
    </ScrollView>
  );
}
