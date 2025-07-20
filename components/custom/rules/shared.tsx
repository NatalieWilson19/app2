import { AuthStoreContext } from "@/store/auth";
import { TOptionsBase } from "i18next";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";

export const faqListKeys = [
  "howDoesItWork",
  "whereAreTheBags",
  "whoDoIGiveTheBagTo",
  "whatCanYouTakeFromTheBag",
  "whatCantYouTakeFromTheBag",
  "whatToDoWithBulkyItems",
  "awayOrBusy",
  "foundSomethingYouLike",
  "newMembers",
  "privacy",
  "feedback",
];

export interface FaqListItem {
  title: string;
  content: string;
}

export const faqI18nOptions: TOptionsBase = {
  ns: "faq",
  returnObjects: true,
  defaultValue: {
    title: "🔴 Error",
    content: "Translation not found",
  },
};
export function useFaqDefault() {
  const { t } = useTranslation("faq");
  return useMemo(() => {
    return faqListKeys.map((k) => {
      return t(k, faqI18nOptions as string) as any as FaqListItem;
    });
  }, [t]);
}

export function useFaqCustom(): undefined | FaqListItem[] {
  const { currentChain } = useContext(AuthStoreContext);
  return useMemo(() => {
    if (!currentChain?.rules_override) return undefined;
    const json = JSON.parse(currentChain.rules_override);
    if (Array.isArray(json)) {
      return json as FaqListItem[];
    }
    return undefined;
  }, [currentChain]);
}
