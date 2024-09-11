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
