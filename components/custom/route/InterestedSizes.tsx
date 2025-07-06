import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { TFunction } from "i18next";
import { HStack } from "@/components/ui/hstack";
import { useMemo } from "react";
import { Image } from "@/components/ui/image";
import { ImageSourcePropType } from "react-native";

export enum Sizes {
  baby = "1",
  "1To4YearsOld" = "2",
  "5To12YearsOld" = "3",
  womenSmall = "4",
  womenMedium = "5",
  womenLarge = "6",
  womenPlusSize = "7",
  menSmall = "8",
  menMedium = "9",
  menLarge = "A",
  menPlusSize = "B",
  womenMaternity = "C",
  teenGirls = "D",
  teenBoys = "E",
}
type ICategories = Record<Categories, Sizes[]>;
export const SizeLetters: (t: TFunction) => Record<Sizes | string, string> = (
  t,
) => ({
  "1": t("baby"),
  "2": "≤4",
  "3": "5-12",
  "4": "(X)S",
  "5": "M",
  "6": "(X)L",
  "7": "XL≤",
  "8": "(X)S",
  "9": "M",
  A: "(X)L",
  B: "XL≤",
  C: t("womenMaternity"),
  D: t("teenGirls"),
  E: t("teenBoys"),
});
export enum Categories {
  children = "1",
  women = "2",
  men = "3",
  toys = "4",
  books = "5",
}

const categoriesIcons: Record<Categories, ImageSourcePropType> = {
  [Categories.children]: require("@/assets/images/categories/baby-50.png"),
  [Categories.women]: require("@/assets/images/categories/woman-50.png"),
  [Categories.men]: require("@/assets/images/categories/man-50.png"),
  [Categories.toys]: require("@/assets/images/categories/toys-50.png"),
  [Categories.books]: require("@/assets/images/categories/books-50.png"),
};

const categories: ICategories = {
  [Categories.children]: [
    Sizes["baby"],
    Sizes["1To4YearsOld"],
    Sizes["5To12YearsOld"],
  ],
  [Categories.women]: [
    Sizes["teenGirls"],
    Sizes["womenSmall"],
    Sizes["womenMedium"],
    Sizes["womenLarge"],
    Sizes["womenPlusSize"],
    Sizes["womenMaternity"],
  ],
  [Categories.men]: [
    Sizes["teenBoys"],
    Sizes["menSmall"],
    Sizes["menMedium"],
    Sizes["menLarge"],
    Sizes["menPlusSize"],
  ],
  [Categories.toys]: [],
  [Categories.books]: [],
};
export default function InterestedSizes(props: {
  categories: Categories[];
  sizes: Sizes[];
}) {
  const { t } = useTranslation();
  const sizeLetters = SizeLetters(t);
  const stack = useMemo(() => {
    const stack: Array<{
      category: Categories;
      sizes: Sizes[];
    }> = props.categories.map((c) => ({ category: c, sizes: [] }));
    props.sizes.forEach((s) => {
      const cat = Object.entries(categories).find(([, sizes]) =>
        sizes.includes(s),
      ) as [Categories, Sizes[]] | undefined;
      if (!cat) return;
      const st = stack.find((st) => st.category == cat[0]);
      if (!st) {
        stack.push({
          category: cat[0],
          sizes: [s],
        });
      } else {
        st.sizes.push(s);
      }
    });
    const categoriesSortIndex = Object.keys(categories);
    stack.sort(
      (a, b) =>
        categoriesSortIndex.indexOf(a.category) -
        categoriesSortIndex.indexOf(a.category),
    );
    return stack;
  }, [props.sizes, props.categories, t]);
  return (
    <VStack className="px-4 py-2">
      <Text size="sm" bold className="rtl:self-start">
        {t("interestedSizes")}
      </Text>
      <VStack className="gap-1">
        {stack.map((st) => (
          <HStack
            key={st.category}
            reversed
            className="gap-1 self-end rounded-full bg-background-100 px-3 py-1"
          >
            <Image
              alt={"icon " + st.category}
              source={categoriesIcons[st.category]}
              className="h-6 w-6"
              key={st.category}
            />
            <HStack className="gap-2">
              {st.sizes.map((s) => (
                <Text key={s}>{sizeLetters[s]}</Text>
              ))}
            </HStack>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}
