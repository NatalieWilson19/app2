import { Link } from "expo-router";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { Icon } from "../ui/icon";
import { Trans, useTranslation } from "react-i18next";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react-native";
import { I18nManager } from "react-native";

const Chevron = I18nManager.isRTL ? ChevronLeftIcon : ChevronRightIcon;

export default function LegalLinks() {
  const { t } = useTranslation();
  return (
    <VStack className="w-full flex-1">
      <Link href="/privacy-policy">
        <HStack className="w-full justify-between bg-background-100 p-3">
          <Text>{t("privacyPolicy")}</Text>
          <Icon as={Chevron} />
        </HStack>
      </Link>
      <Link href="/open-source">
        <HStack className="w-full justify-between bg-background-100 p-3">
          <Text>{t("openSource")}</Text>
          <Icon as={Chevron} />
        </HStack>
      </Link>
      <VStack className="bg-background-100 p-3 items-start" >
        <Text size="sm" bold>
          {t("deleteAccount")}
        </Text>
        <Text className="text-left">
          <Trans
            t={t}
            i18nKey="deleteAccountExplanation"
            components={{
              "1": (
                <Link
                  href="https://clothingloop.org/admin/dashboard"
                  className="text-error-600"
                />
              ),
            }}
          />
        </Text>
      </VStack>
    </VStack>
  );
}
