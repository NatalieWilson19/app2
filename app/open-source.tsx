import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionIcon,
  AccordionContent,
  AccordionContentText,
} from "@/components/ui/accordion";
import { SafeAreaView, ScrollView } from "react-native";
import OpenSourceLicenses from "@/assets/open_source_licenses.json";
import Contributers from "@/assets/contributers.json";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  GithubIcon,
  LanguagesIcon,
} from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";
import { useCallback, useState } from "react";
import { ExternalPathString } from "expo-router";
import OptionalLink from "@/components/custom/OptionalLink";
import Donate from "@/components/custom/Donate";

export default function OpenSource() {
  const [accordionItemsOpen, setAccordionItemsOpen] = useState<string[]>([]);

  const renderContributors = useCallback(() => {
    return Contributers.map((item, i) => (
      <OptionalLink href={item.link as ExternalPathString | undefined} key={i}>
        <Box className="flex-row items-center px-4 py-2">
          <Box className="flex-grow">
            <Text bold className="text-black">
              {item.name}
            </Text>
            <Text size="sm">{item.role}</Text>
          </Box>
          {item.link ? (
            <Icon
              as={ExternalLinkIcon}
              className="me-3 text-info-700"
              size="sm"
            />
          ) : null}
          {item.icon === "github" ? (
            <Icon as={GithubIcon} />
          ) : item.icon === "languages" ? (
            <Icon as={LanguagesIcon} />
          ) : null}
        </Box>
      </OptionalLink>
    ));
  }, []);
  const renderOpenSourceAccordionItem = useCallback(
    (item: (typeof OpenSourceLicenses)[0]) => {
      const isOpen = accordionItemsOpen.includes(item.name);
      return (
        <AccordionItem value={item.name} key={item.name}>
          <AccordionHeader>
            <AccordionTrigger>
              {({ isExpanded }: { isExpanded: boolean }) => {
                return (
                  <>
                    <AccordionTitleText>{item.name}</AccordionTitleText>
                    {isExpanded ? (
                      <AccordionIcon as={ChevronUpIcon} className="ml-3" />
                    ) : (
                      <AccordionIcon as={ChevronDownIcon} className="ml-3" />
                    )}
                  </>
                );
              }}
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            {isOpen
              ? item.modules.map((module, i) => (
                  <AccordionContentText key={item.name + i} className="py-1">
                    {module}
                  </AccordionContentText>
                ))
              : null}
          </AccordionContent>
        </AccordionItem>
      );
    },

    [accordionItemsOpen],
  );

  return (
    <SafeAreaView className="relative">
      <Donate />
      <ScrollView stickyHeaderIndices={[0, 2]}>
        <Box className="sticky top-0 bg-background-100 px-4 py-1">
          <Text bold>Team</Text>
        </Box>
        <Box className="bg-background-0">{renderContributors()}</Box>
        <Box className="bg-background-100 px-4 py-1">
          <Text bold>App dependencies</Text>
        </Box>
        <Accordion
          value={accordionItemsOpen}
          onValueChange={setAccordionItemsOpen}
        >
          {OpenSourceLicenses.map(renderOpenSourceAccordionItem)}
        </Accordion>
      </ScrollView>
    </SafeAreaView>
  );
}
