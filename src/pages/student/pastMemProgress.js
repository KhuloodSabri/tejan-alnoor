import React from "react";
import { getLevelMemorizingDirection } from "../../utils/levels";
import { colors, Typography } from "@mui/material";
import _ from "lodash";
import { getPositiveProgressPrefix } from "./utils";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { translateNumberToArabic } from "../../utils/numbers";

export default function PastMemProgress({ student }) {
  const currentDirection = getLevelMemorizingDirection(student.levelID);

  const pastLevelsWithOppositeDirection = student.levelChanges?.filter(
    (change) => {
      return (
        getLevelMemorizingDirection(change.fromLevelID) !== currentDirection
      );
    }
  );

  const maxOppositeProgress = _.max(
    pastLevelsWithOppositeDirection?.map((change) => change.memorizingProgress)
  );

  const prefix = getPositiveProgressPrefix(student);

  if (!pastLevelsWithOppositeDirection?.length) {
    return null;
  }

  if (currentDirection === "desc") {
    return (
      <Typography fontWeight={400} variant="body1" color={colors.teal["700"]}>
        <KeyboardDoubleArrowLeftIcon sx={{ verticalAlign: "text-bottom" }} />
        كما {prefix} الحفظ من أول المصحف حتى صفحة{" "}
        {translateNumberToArabic(maxOppositeProgress)}{" "}
      </Typography>
    );
  }

  let description = `كما ${prefix} سابقا `;
  const completedJuzsCount =
    maxOppositeProgress < 23
      ? 0
      : Math.floor((maxOppositeProgress - 23) / 20) + 1;

  const leftCompletedPages =
    maxOppositeProgress < 23
      ? maxOppositeProgress
      : (maxOppositeProgress - 23) % 20;

  if (completedJuzsCount === 1) {
    description += ` حفظ الجزء ${translateNumberToArabic(30)}`;
  } else if (completedJuzsCount > 1) {
    description += ` حفظ الأجزاء ${translateNumberToArabic(
      30 - completedJuzsCount + 1
    )} إلى ${translateNumberToArabic(30)}`;
  }

  if (completedJuzsCount > 0 && leftCompletedPages > 0) {
    description += " و";
  }

  if (leftCompletedPages > 0) {
    description += `الحفظ حتى صفحة ${translateNumberToArabic(
      leftCompletedPages
    )} من جزء ${translateNumberToArabic(30 - completedJuzsCount)}`;
  }

  return (
    <Typography fontWeight={400} variant="body1" color={colors.teal["700"]}>
      <KeyboardDoubleArrowLeftIcon sx={{ verticalAlign: "text-bottom" }} />
      {description}
    </Typography>
  );
}
