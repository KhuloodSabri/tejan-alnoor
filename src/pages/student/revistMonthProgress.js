import {
  Box,
  ClickAwayListener,
  colors,
  lighten,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import React, { useEffect, useMemo } from "react";
import {
  convertAyahProgressToPage,
  convertPageProgressToAyah,
  getCommulativeAyahDetails,
} from "../../utils/surah";
import { translateNumberToArabic } from "../../utils/numbers";
import {
  compareSemesters,
  getStudentSemesterLevelChangesPlanShift,
  getStudentSemesterLevelID,
  getStudentSemesterStartWeek,
} from "../../utils/semesters";

import _ from "lodash";
import { getNegativeProgressPrefix, getPositiveProgressPrefix } from "./utils";

function ProgressLabel({ left, bottom, text, color }) {
  return (
    <Box
      boxSizing="border-box"
      sx={{
        position: "absolute",
        borderLeft: `2px solid ${color ?? colors.teal["A700"]}`,
        left: left,
        bottom: bottom,
        backgroundColor: colors.common.white,
      }}
    >
      <Typography
        variant="subtitle2"
        lineHeight={1}
        whiteSpace="nowrap"
        fontSize={12}
        component="div"
        color={color ?? colors.teal["400"]}
        sx={{
          mt: "auto",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          rotate: "-180deg",
          py: 0.75,
          fontWeight: 700,
          letterSpacing: 0.6,
          minHeight: 70,
          textAlign: "center",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

function StudentProgressLabels({
  student,
  visibleRevisitInterval,
  rangesWithDetails,
  total,
  targetLevel,

  hideStartLabel = false,
  hideEndLabel = false,
  labelProps,
}) {
  const getPrgoressLabel = (progress) => {
    if (targetLevel.progressUnit === "ayah") {
      return `${progress.surah} (${translateNumberToArabic(progress.ayah)})`;
    }

    return `صفــ ${translateNumberToArabic(progress.page)} ــحة`;
  };

  console.log("rangesWithDetails", rangesWithDetails);
  console.log("visibleRevisitInterval", visibleRevisitInterval);

  return (
    <Stack minWidth="100%" position="relative" height={85}>
      {(!rangesWithDetails?.length ||
        rangesWithDetails[0][0]?.absoluteOffset !==
          visibleRevisitInterval[0]) && (
        <ProgressLabel
          {...labelProps}
          left={`2px`}
          text={getPrgoressLabel(
            targetLevel.progressUnit === "ayah"
              ? getCommulativeAyahDetails(visibleRevisitInterval[0])
              : { page: visibleRevisitInterval[0] }
          )}
          color={colors.blueGrey["100"]}
        />
      )}
      {rangesWithDetails?.length > 0 &&
        rangesWithDetails.map((range) => (
          <Box key={range[0].offset}>
            {(!hideStartLabel ||
              range[0]?.absoluteOffset !== visibleRevisitInterval[0]) && (
              <ProgressLabel
                {...labelProps}
                left={`calc(${(range[0].offset / total) * 100}% + 2px);`} // 2px for border
                text={getPrgoressLabel(range[0])}
              />
            )}
            {(!hideEndLabel ||
              range[1]?.absoluteOffset !== visibleRevisitInterval[1]) && (
              <ProgressLabel
                {...labelProps}
                left={`${((range[1].offset + 1) / total) * 100}%`}
                text={getPrgoressLabel(range[1])}
              />
            )}
          </Box>
        ))}

      {(!rangesWithDetails?.length ||
        rangesWithDetails[rangesWithDetails.length - 1][1]?.absoluteOffset !==
          visibleRevisitInterval[1]) && (
        <ProgressLabel
          {...labelProps}
          left={`calc(100% - 2px)`}
          text={getPrgoressLabel(
            targetLevel.progressUnit === "ayah"
              ? getCommulativeAyahDetails(visibleRevisitInterval[1])
              : { page: visibleRevisitInterval[1] }
          )}
          color={colors.blueGrey["100"]}
        />
      )}
    </Stack>
  );
}

export default function RevisitMonthProgress({
  student,
  revisitProgress,
  selectedSemester,
  selectedMonth,
  hideStartLabel = false,
  hideEndLabel = false,
  labelsPosition = "bottom",
  levels,
}) {
  const [hintIndexOpen, setHintIndexOpen] = React.useState(null);

  const targetLevel = useMemo(() => {
    const targetLevelID = getStudentSemesterLevelID(student, {
      ...selectedSemester,
      month: selectedMonth,
    });
    return levels.find((level) => level.levelID === targetLevelID);
  }, [student, selectedSemester, selectedMonth, levels]);

  const [targetRevisitProgress, setTargetRevisitProgress] = React.useState(
    revisitProgress,
    []
  );

  useEffect(() => {
    const getTargetRevisitProgress = async () => {
      if (
        student.progressUnit === "ayah" &&
        targetLevel.progressUnit === "page"
      ) {
        const res = await convertAyahProgressToPage(revisitProgress);
        setTargetRevisitProgress(res);
      } else if (
        student.progressUnit === "page" &&
        targetLevel.progressUnit === "ayah"
      ) {
        const res = await convertPageProgressToAyah(revisitProgress);
        setTargetRevisitProgress(res);
      } else {
        setTargetRevisitProgress(revisitProgress);
      }

      // HERE IMPORTANT!!
      // TODO: make sure to update frontend in correct unit
    };

    getTargetRevisitProgress();
  }, [revisitProgress, student.progressUnit, targetLevel.progressUnit]);

  const visibleRevisitInterval = useMemo(() => {
    if (
      student.joinYear === selectedSemester.year &&
      student.joinSemester === selectedSemester.semester &&
      student.joinMonth > selectedMonth
    ) {
      return [];
    }

    let startWeek = getStudentSemesterStartWeek(student, {
      ...selectedSemester,
      month: selectedMonth,
    });

    const levelChangesShift = getStudentSemesterLevelChangesPlanShift(
      student,
      {
        ...selectedSemester,
        month: selectedMonth,
      },
      levels
    );

    startWeek += levelChangesShift;
    // startWeek += (selectedMonth - 1) * 4; // 4 weeks in a month

    // if (
    //   student.joinYear === selectedSemester.year &&
    //   student.joinSemester === selectedSemester.semester
    // ) {
    //   if (student.joinMonth > selectedMonth) {
    //     return [];
    //   }

    //   startWeek -= (student.joinMonth - 1) * 4;
    // }

    // minus 1 because the last week is inclusive
    let endWeek = startWeek + 4 - 1;

    if (!targetLevel.weeksPlan[startWeek]) {
      return undefined;
    }

    while (!targetLevel.weeksPlan[endWeek]) {
      endWeek--;
    }

    return [
      targetLevel.weeksPlan[startWeek][0],
      targetLevel.weeksPlan[endWeek][1],
    ];
  }, [levels, selectedMonth, selectedSemester, student, targetLevel]);

  const progressPrefix = getPositiveProgressPrefix(student);

  const getHint = (progressRange) => {
    if (targetLevel.progressUnit === "ayah") {
      return `${progressPrefix} مراجعة الآيات من سورة ${
        progressRange[0].surah
      } آية (${translateNumberToArabic(progressRange[0].ayah)}) إلى سورة ${
        progressRange[1].surah
      } آية (${translateNumberToArabic(progressRange[1].ayah)})`;
    }

    return `${progressPrefix} مراجعة الصفحات من صفحة ${translateNumberToArabic(
      progressRange[0].page
    )} إلى صفحة ${translateNumberToArabic(progressRange[1].page)}`;
  };

  const rangesWithDetails = visibleRevisitInterval
    ? (targetRevisitProgress ?? [])
        .filter((range) => {
          if (range[1] < visibleRevisitInterval[0]) {
            return false;
          }

          if (range[0] > visibleRevisitInterval[1]) {
            return false;
          }

          return true;
        })
        .map((range) => {
          const start =
            range[0] < visibleRevisitInterval[0]
              ? visibleRevisitInterval[0]
              : range[0];
          const end =
            range[1] > visibleRevisitInterval[1]
              ? visibleRevisitInterval[1]
              : range[1];

          return [
            {
              offset: start - visibleRevisitInterval[0],
              ...(targetLevel.progressUnit === "ayah"
                ? getCommulativeAyahDetails(start)
                : { page: start }),
              absoluteOffset: start,
            },
            {
              offset: end - visibleRevisitInterval[0],
              ...(targetLevel.progressUnit === "ayah"
                ? getCommulativeAyahDetails(end)
                : { page: end }),
              absoluteOffset: end,
            },
          ];
        })
    : [];

  const total =
    (visibleRevisitInterval?.[1] ?? 0) - (visibleRevisitInterval?.[0] ?? 0) + 1;

  const showFrozenLabel = (student.frozenSemesters || []).some(
    (semester) =>
      semester.year === selectedSemester.year &&
      semester.semester === selectedSemester.semester
  );

  const didNotJoinYet =
    compareSemesters(
      {
        year: selectedSemester.year,
        semester: selectedSemester.semester,
        month: selectedMonth,
      },
      {
        year: student.joinYear,
        semester: student.joinSemester,
        month: student.joinMonth,
      }
    ) < 0;

  if (_.isEmpty(visibleRevisitInterval) || showFrozenLabel) {
    return (
      <Stack>
        <Box minHeight={85} />
        <Stack
          minWidth="100%"
          minHeight={50}
          sx={{
            border: `2px solid ${colors.teal["A700"]}`,
            borderRadius: 3,
          }}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Typography
            color={colors.grey["400"]}
            textAlign="center"
            fontSize={{ xs: 12, sm: 15 }}
          >
            {showFrozenLabel
              ? student.gender === "male"
                ? "جمد الطالب التحاقه  هذا الشهر"
                : "جمدت الطالبة التحاقها هذا الشهر"
              : didNotJoinYet
              ? student.gender === "male"
                ? "لم ينضم الطالب بعد"
                : "لم تنضم الطالبة بعد"
              : "لم يتم تحديث الخطة  "}
          </Typography>
        </Stack>
        <Box minHeight={85} />
      </Stack>
    );
  }

  return (
    <Stack>
      {labelsPosition === "top" ? (
        <StudentProgressLabels
          student={student}
          visibleRevisitInterval={visibleRevisitInterval}
          rangesWithDetails={rangesWithDetails}
          targetLevel={targetLevel}
          total={total}
          hideStartLabel={hideStartLabel}
          hideEndLabel={hideEndLabel}
          labelProps={{
            bottom: 0,
          }}
        />
      ) : (
        <Box minHeight={85} />
      )}
      <Box width="100%">
        <Box
          minWidth="100%"
          minHeight={50}
          sx={{
            border: `2px solid ${colors.teal["A700"]}`,
            borderRadius: 3,
          }}
          position="relative"
        >
          {_.isEmpty(rangesWithDetails) && (
            <Stack height={50} justifyContent="center" alignItems="center">
              <Typography color={colors.grey["400"]}>
                لم {getNegativeProgressPrefix(student)} أي مراجعة بعد
              </Typography>
            </Stack>
          )}
          {rangesWithDetails.map((range, index) => (
            <ClickAwayListener
              key={range[0].offset}
              onClickAway={() => {
                if (hintIndexOpen === index) {
                  setHintIndexOpen(null);
                }
              }}
            >
              <Box
                onMouseLeave={() => {
                  setHintIndexOpen(null);
                }}
              >
                <Tooltip
                  title={getHint(range)}
                  open={hintIndexOpen === index}
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                  slotProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: colors.teal["500"],
                        fontSize: 15,
                        fontWeight: 500,
                        lineHeight: 1.5,
                        letterSpacing: 0.5,
                      },
                    },
                  }}
                >
                  <Box
                    key={range[0].offset}
                    bgcolor={lighten(colors.teal["A700"], 0.85)}
                    position={"absolute"}
                    left={(range[0].offset / total) * 100 + "%"}
                    width={
                      ((range[1].offset - range[0].offset + 1) / total) * 100 +
                      "%"
                    } // inclusive
                    minHeight={50}
                    borderRadius={
                      range[0].offset === 0 && range[1].offset === total - 1
                        ? "10px"
                        : range[0].offset === 0
                        ? "10px 0 0 10px"
                        : range[1].offset === total - 1
                        ? "0 10px 10px 0px"
                        : 0
                    }
                    onClick={() => {
                      setHintIndexOpen(index);
                    }}
                    onMouseEnter={() => {
                      setHintIndexOpen(index);
                    }}
                  ></Box>
                </Tooltip>
              </Box>
            </ClickAwayListener>
          ))}
        </Box>

        {labelsPosition === "bottom" ? (
          <StudentProgressLabels
            student={student}
            visibleRevisitInterval={visibleRevisitInterval}
            rangesWithDetails={rangesWithDetails}
            total={total}
            targetLevel={targetLevel}
            hideStartLabel={hideStartLabel}
            hideEndLabel={hideEndLabel}
          />
        ) : (
          <Box minHeight={85} />
        )}
      </Box>
    </Stack>
  );
}
