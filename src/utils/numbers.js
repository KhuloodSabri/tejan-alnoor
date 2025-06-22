import _ from "lodash";

const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
const charMapEnToAr = {
  ".": ",",
};

export const translateNumberToArabic = (number) => {
  return number
    .toString()
    .split("")
    .map((number) => arabicNumbers[number] ?? charMapEnToAr[number] ?? number)
    .join("");
};

export const translateNumberToEnglish = (number) => {
  return number
    .toString()
    .split("")
    .map((number) =>
      arabicNumbers.indexOf(number) >= 0
        ? arabicNumbers.indexOf(number)
        : _.invert(charMapEnToAr)[number] ?? number
    )
    .join("");
};

export const arabicOrdinals = {
  1: "أول",
  2: "ثاني",
  3: "ثالث",
  4: "رابع",
  5: "خامس",
  6: "سادس",
  7: "سابع",
  8: "ثامن",
  9: "تاسع",
  10: "عاشر",
};
