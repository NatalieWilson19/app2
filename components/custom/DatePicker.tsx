import { useMemo } from "react";
import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";
import { DatePickerSingleProps } from "react-native-ui-datepicker/lib/typescript/datetime-picker";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  ChevronDownIcon,
  ChevronLeft,
  ChevronRight,
  ChevronUpIcon,
} from "lucide-react-native";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { Icon } from "../ui/icon";

export default function DatePickerSingleItem({
  value,
  setValue,
  title,
  ...props
}: {
  value: Date;
  title: string;
  setValue: (v: Date) => void;
} & Omit<DatePickerSingleProps, "mode">) {
  const defaultStyles = useDefaultStyles();
  const dateText = useMemo(() => value.toLocaleDateString(), [value]);

  return (
    <Accordion
      size="md"
      type="single"
      variant="unfilled"
      className="border border-outline-200"
    >
      <AccordionItem value="a">
        <AccordionHeader>
          <AccordionTrigger>
            {({ isExpanded }) => {
              return (
                <>
                  <HStack className="flex-grow items-center justify-between">
                    <Text bold size="md">
                      {title + ":"}
                    </Text>
                    <Text className="bg-background-100 p-2 font-normal">
                      {dateText}
                    </Text>
                  </HStack>
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
          <DateTimePicker
            styles={defaultStyles}
            {...props}
            mode="single"
            date={value}
            onChange={({ date }) => setValue(date as Date)}
            components={{
              IconPrev: <Icon as={ChevronLeft} />,
              IconNext: <Icon as={ChevronRight} />,
            }}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
