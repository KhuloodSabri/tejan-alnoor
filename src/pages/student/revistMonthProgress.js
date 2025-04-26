import {
  Box,
  ClickAwayListener,
  colors,
  lighten,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import React, { useMemo } from "react";
import { getCommulativeAyahDetails } from "../../utils/surah";
import { translateNumberToArabic } from "../../utils/numbers";
import {
  compareSemesters,
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

  hideStartLabel = false,
  hideEndLabel = false,
  labelProps,
}) {
  const getPrgoressLabel = (progress) => {
    if (student.progressUnit === "ayah") {
      return `${progress.surah} (${translateNumberToArabic(progress.ayah)})`;
    }

    return `صفــ ${translateNumberToArabic(progress.page)} ــحة`;
  };

  return (
    <Stack minWidth="100%" position="relative" height={85}>
      {(!rangesWithDetails?.length ||
        rangesWithDetails[0][0]?.absoluteOffset !==
          visibleRevisitInterval[0]) && (
        <ProgressLabel
          {...labelProps}
          left={`2px`}
          text={getPrgoressLabel(
            student.progressUnit === "ayah"
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
            student.progressUnit === "ayah"
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
}) {
  const [hintIndexOpen, setHintIndexOpen] = React.useState(null);

  const visibleRevisitInterval = useMemo(() => {
    let startWeek = getStudentSemesterStartWeek(student, selectedSemester);
    startWeek += (selectedMonth - 1) * 4; // 4 weeks in a month

    if (
      student.joinYear === selectedSemester.year &&
      student.joinSemester === selectedSemester.semester
    ) {
      if (student.joinMonth > selectedMonth) {
        return [];
      }

      startWeek -= (student.joinMonth - 1) * 4;
    }

    // minus 1 because the last week is inclusive
    let endWeek = startWeek + 4 - 1;

    if (!student.levelRevisitWeeksPlan[startWeek]) {
      return undefined;
    }

    while (!student.levelRevisitWeeksPlan[endWeek]) {
      endWeek--;
    }

    return [
      student.levelRevisitWeeksPlan[startWeek][0],
      student.levelRevisitWeeksPlan[endWeek][1],
    ];
  }, [selectedMonth, selectedSemester, student]);

  const progressPrefix = getPositiveProgressPrefix(student);

  const getHint = (progressRange) => {
    if (student.progressUnit === "ayah") {
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
    ? (revisitProgress ?? [])
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
              ...(student.progressUnit === "ayah"
                ? getCommulativeAyahDetails(start)
                : { page: start }),
              absoluteOffset: start,
            },
            {
              offset: end - visibleRevisitInterval[0],
              ...(student.progressUnit === "ayah"
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
          <Typography color={colors.grey["400"]} textAlign="center">
            {showFrozenLabel
              ? student.gender === "male"
                ? "جمد الطالب التحاقه  بهذا الفصل الدراسي"
                : "جمدت الطالبة التحاقها بهذا الفصل الدراسي"
              : didNotJoinYet
              ? student.gender === "male"
                ? "لم ينضم الطالب بعد"
                : "لم تنضم الطالبة بعد"
              : "لم يتم تحديث الخطة الدراسية "}
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
