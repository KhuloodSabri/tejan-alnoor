export const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export const translateNumberToArabic = (number) => {
  return number
    .toString()
    .split("")
    .map((number) => arabicNumbers[number])
    .join("");
};
