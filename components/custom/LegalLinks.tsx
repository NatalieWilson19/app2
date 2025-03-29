import { Link } from "expo-router";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { Icon } from "../ui/icon";
import { Trans, useTranslation } from "react-i18next";
import { ChevronRightIcon } from "lucide-react-native";

export default function LegalLinks() {
  const { t } = useTranslation();
  return (
    <VStack className="w-full flex-1">
      <Link href="/privacy-policy">
        <HStack className="w-full justify-between bg-background-100 p-3">
          <Text>{t("privacyPolicy")}</Text>
          <Icon as={ChevronRightIcon} />
        </HStack>
      </Link>
      <Link href="/open-source">
        <HStack className="w-full justify-between bg-background-100 p-3">
          <Text>{t("openSource")}</Text>
          <Icon as={ChevronRightIcon} />
        </HStack>
      </Link>
      <VStack className="bg-background-100 p-3">
        <Text size="sm" bold>
          {t("deleteAccount")}
        </Text>
        <Text>
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
