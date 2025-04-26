export const levels = ["جزء عم", "مستوى ١", "مستوى ٢", "مستوى ٣"];

export const getLevelMemorizingDirection = (levelID) => {
  if (levelID === 0) {
    return "desc";
  }
  return "asc";
};
