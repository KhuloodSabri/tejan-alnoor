import {
  Box,
  Button,
  ClickAwayListener,
  colors,
  lighten,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import React, { useMemo } from "react";
import { getCommulativeAyahDetails } from "../../utils/surah";
import { translateNumberToArabic } from "../../utils/numbers";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import _ from "lodash";
import {
  getNegativeProgressPrefix,
  getNextSemester,
  getPositiveProgressPrefix,
  getPrevSemester,
  getSemesterMonthsCount,
  getSemesterName,
  getStudentSemesterStartWeek,
} from "./utils";
import RevisitProgressDialog from "./revisitProgressDialog";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

function ProgressLabel({ position, text, color }) {
  return (
    <Box
      boxSizing="border-box"
      sx={{
        position: "absolute",
        borderLeft: `2px solid ${color ?? colors.teal["A700"]}`,
        left: position,
        backgroundColor: colors.common.white,
      }}
    >
      <Typography
        variant="subtitle2"
        lineHeight={1}
        whiteSpace="nowrap"
        fontSize={{ xs: 13, sm: 14 }}
        component="div"
        color={color ?? colors.teal["400"]}
        sx={{
          mt: "auto",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          rotate: "-180deg",
          py: 2,
          fontWeight: 700,
          letterSpacing: 0.6,
          minHeight: 90,
          textAlign: "center",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

export default function RevisitProgressInput({
  student,
  currentSemesterDetails,
}) {
  const [hintIndexOpen, setHintIndexOpen] = React.useState(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState("add");
  const [revisitProgress, setRevisitProgress] = React.useState(
    student.revisitProgress
  );

  const [visibleSemester, setVisibleSemester] = React.useState(
    currentSemesterDetails
  );

  const visibleRevisitInterval = useMemo(() => {
    const startWeek = getStudentSemesterStartWeek(student, visibleSemester);

    let endWeek = startWeek + getSemesterMonthsCount(visibleSemester) * 4;

    if (!student.levelRevisitWeeksPlan[startWeek]) {
      return undefined;
    }

    while (!student.levelRevisitWeeksPlan[endWeek]) {
      endWeek--;
    }

    console.log([
      student.levelRevisitWeeksPlan[startWeek],
      student.levelRevisitWeeksPlan[endWeek],
    ]);

    return [
      student.levelRevisitWeeksPlan[startWeek][0],
      student.levelRevisitWeeksPlan[endWeek][1],
    ];
  }, [visibleSemester, student]);

  const getPrgoressLabel = (progress) => {
    if (student.progressUnit === "ayah") {
      return `${progress.surah} (${translateNumberToArabic(progress.ayah)})`;
    }

    return `صفــ ${translateNumberToArabic(progress.page)} ــحة`;
  };

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
    ? (revisitProgress ?? []).map((range) => [
        {
          offset: range[0] - visibleRevisitInterval[0],
          ...(student.progressUnit === "ayah"
            ? getCommulativeAyahDetails(range[0])
            : { page: range[0] }),
        },
        {
          offset: range[1] - visibleRevisitInterval[0],
          ...(student.progressUnit === "ayah"
            ? getCommulativeAyahDetails(range[1])
            : { page: range[1] }),
        },
      ])
    : [];

  const total =
    visibleRevisitInterval?.[1] ?? 0 - visibleRevisitInterval?.[0] ?? 0 + 1;

  return (
    <Stack rowGap={1}>
      <Box>
        <Typography variant="h6" color={colors.teal["700"]}>
          <Typography
            component="span"
            fontWeight={600}
            variant="h6"
            color={colors.teal["700"]}
          >
            <KeyboardDoubleArrowLeftIcon
              sx={{ verticalAlign: "text-bottom" }}
            />
          </Typography>
          {progressPrefix} المراجعة كما هو موضح في الشكل أدناه
        </Typography>
        <Typography
          variant="subtitle2"
          color={colors.teal["700"]}
          sx={{ my: 0.8 }}
        >
          *اضغط على المساحات الخضراء للمزيد من التفاصيل
        </Typography>
      </Box>
      <Stack direction="row" columnGap={2} pl={3}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ boxShadow: "none" }}
          size="small"
          onClick={() => {
            setDialogMode("add");
            setDialogOpen(true);
          }}
        >
          مراجعة جديدة
        </Button>
        <Button
          variant="outlined"
          startIcon={<RemoveIcon />}
          sx={{ boxShadow: "none" }}
          size="small"
          onClick={() => {
            setDialogMode("remove");
            setDialogOpen(true);
          }}
        >
          إزالة مراجعة{" "}
        </Button>
      </Stack>
      <Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          mt={1}
          px={0.5}
          boxSizing={"border-box"}
        >
          <Button
            size="small"
            sx={{ maxHeight: 16, fontSize: 13 }}
            startIcon={<ArrowForwardIcon />}
            onClick={() => {
              setVisibleSemester(getPrevSemester(visibleSemester));
            }}
            disabled={
              visibleSemester.year === student.joinTime.year &&
              visibleSemester.semester === student.joinTime.semester
            }
          >
            السابق
          </Button>
          <Typography
            variant="body2"
            component="div"
            color={colors.teal["700"]}
            fontSize={13}
          >
            {getSemesterName(visibleSemester)}
          </Typography>
          <Button
            size="small"
            sx={{ maxHeight: 16, fontSize: 13 }}
            endIcon={<ArrowBackIcon />}
            onClick={() => {
              setVisibleSemester(getNextSemester(visibleSemester));
            }}
            disabled={
              visibleSemester.year === currentSemesterDetails.year &&
              visibleSemester.semester === currentSemesterDetails.semester
            }
          >
            التالي
          </Button>
        </Stack>
        {!visibleRevisitInterval && (
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
              لم يتم تحديث خطة المراجعة للفصل الدراسي الحالي
            </Typography>
          </Stack>
        )}
        {visibleRevisitInterval && (
          <Box width="100%">
            <Box
              minWidth="100%"
              minHeight={50}
              // mt={1}
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
                          ((range[1].offset - range[0].offset + 1) / total) *
                            100 +
                          "%"
                        } // inclusive
                        minHeight={50}
                        borderRadius={
                          range[0].offset === 0
                            ? "10px 0 0 10px"
                            : range[1].offset === total
                            ? "0 10px 0 10px"
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
            <Stack minWidth="100%" position="relative" height={160}>
              {(!rangesWithDetails?.length ||
                rangesWithDetails[0][0] !== visibleRevisitInterval[0]) && (
                <ProgressLabel
                  position={`2px`}
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
                    <ProgressLabel
                      position={`calc(${
                        (range[0].offset / total) * 100
                      }% + 2px);`} // 2px for border
                      text={getPrgoressLabel(range[0])}
                    />
                    <ProgressLabel
                      position={`${((range[1].offset + 1) / total) * 100}%`}
                      text={getPrgoressLabel(range[1])}
                    />
                  </Box>
                ))}

              {(!rangesWithDetails?.length ||
                rangesWithDetails[rangesWithDetails.length - 1][1] !==
                  visibleRevisitInterval[1]) && (
                <ProgressLabel
                  position={`calc(100% - 2px)`}
                  text={getPrgoressLabel(
                    student.progressUnit === "ayah"
                      ? getCommulativeAyahDetails(visibleRevisitInterval[1])
                      : { page: visibleRevisitInterval[1] }
                  )}
                  color={colors.blueGrey["100"]}
                />
              )}
            </Stack>
          </Box>
        )}
      </Stack>

      <RevisitProgressDialog
        student={{ ...student, revisitProgress }}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
        onSubmit={(updatedValue) => {
          setRevisitProgress(updatedValue);
        }}
      />
    </Stack>
  );
}
