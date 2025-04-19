import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import SemesterInput from "../../../../../components/semesterInput";
import {
  getStudentSemesterStartWeek,
  getSemesterName,
  compareSemesters,
  getSemestersMonthsDiff,
} from "../../../../../utils/semesters";
import { getCommulativeAyahDetails } from "../../../../../utils/surah";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import _ from "lodash";

export default function ChangeLevelDialog({
  open,
  onClose,
  onConfirm,
  levels,
  student,
  formik,
  defaultNewLevelId,
  currentSemesterDetails,
}) {
  const formikValues = formik.values;
  const [year, setYear] = React.useState(currentSemesterDetails.year);
  const [semester, setSemester] = React.useState(
    currentSemesterDetails.semester
  );
  const [month, setMonth] = React.useState(currentSemesterDetails.month);
  const [newLevelID, setNewLevelID] = useState(
    _.isNil(defaultNewLevelId) ? student.levelID : defaultNewLevelId
  );

  const [errorMessage, setErrorMessage] = React.useState(null);

  //   const lastChange = useMemo(() => {
  //     if (formikValues.levelChanges?.length) {
  //       return formikValues.levelChanges.find(
  //         (change) =>
  //           compareSemesters(change.semester, { year, semester, month }) < 0
  //       );
  //     }
  //     return null;
  //   }, [formikValues.levelChanges, month, semester, year]);

  const oldLevel = useMemo(() => {
    // if (lastChange) {
    //   return levels.find((level) => level.levelID === lastChange.toLevelID);
    // }

    return levels.find((level) => level.levelID === formikValues.levelID);
  }, [formikValues.levelID, levels]);

  const planWeekOffset = useMemo(() => {
    return (
      (month - 1) * 4 +
      getStudentSemesterStartWeek(
        {
          ...student,
          ...{
            frozenSemesters: formikValues.frozenSemesters,
          },
        },
        {
          year,
          semester,
        }
      )
    );
  }, [formikValues.frozenSemesters, month, semester, student, year]);

  const lastMonthExpectedMemorizingProgress = useMemo(
    () =>
      planWeekOffset / 4 === 0
        ? 0
        : oldLevel.monthsPlanByPage[planWeekOffset / 4 - 1],
    [oldLevel.monthsPlanByPage, planWeekOffset]
  );

  const lastMonthExpectedRevisitProgress = useMemo(
    () =>
      !planWeekOffset
        ? null
        : [
            oldLevel.weeksPlan?.[0]?.[0],
            oldLevel.weeksPlan?.[planWeekOffset - 1]?.[1],
          ],
    [oldLevel.weeksPlan, planWeekOffset]
  );

  const newLevelStartMonthProgress = useMemo(() => {
    if (!newLevelID) {
      return null;
    }
    const newLevel = levels.find((level) => level.levelID === newLevelID);
    return newLevel.monthsPlanByPage.find(
      (monthProgress) => student.memorizingProgress < monthProgress
    );
  }, [levels, newLevelID, student.memorizingProgress]);

  const lastMonthRevisitLabel = useMemo(() => {
    if (
      !lastMonthExpectedRevisitProgress ||
      !lastMonthExpectedRevisitProgress?.[1]
    ) {
      return "?";
    }

    if (oldLevel.progressUnit === "page") {
      return ` صفحة ${lastMonthExpectedRevisitProgress[1]}`;
    }

    const ayahDetails = getCommulativeAyahDetails(
      lastMonthExpectedRevisitProgress[1]
    );

    return `سورة ${ayahDetails.surah} آية ${ayahDetails.ayah}`;
  }, [lastMonthExpectedRevisitProgress, oldLevel.progressUnit]);

  const finishedMemorizingLastMonth =
    student.memorizingProgress >= lastMonthExpectedMemorizingProgress;

  const finishedRevisitingLastMonth = useMemo(() => {
    if (!lastMonthExpectedRevisitProgress) {
      return true;
    }

    return student.revisitProgress.find(
      (progress) =>
        progress[0] <= lastMonthExpectedRevisitProgress[0] &&
        progress[1] >= lastMonthExpectedRevisitProgress[1]
    );
  }, [lastMonthExpectedRevisitProgress, student.revisitProgress]);

  useEffect(() => {
    setNewLevelID(defaultNewLevelId);
  }, [defaultNewLevelId]);

  useEffect(() => {
    const alreadyChanged = formikValues.levelChanges?.find(
      (change) =>
        change.semester.year === year &&
        change.semester.semester === semester &&
        change.semester.month === month
    );

    if (alreadyChanged) {
      setErrorMessage(
        " هناك تغيير آخر على المستوى  في الفصل و الشهر المحدد، الرجاء إلغاء التعديل السابق أولا"
      );
    } else if (
      compareSemesters(
        {
          year: formikValues.joinYear,
          semester: formikValues.joinSemester,
          month: formikValues.joinMonth,
        },
        {
          year,
          semester,
          month,
        }
      ) > 0
    ) {
      setErrorMessage("لا يمكن تغيير مستوى الطالب قبل تاريخ انضمامه");
    } else if (
      compareSemesters(currentSemesterDetails, { year, semester, month }) > 0
    ) {
      setErrorMessage("لا يمكن تغيير مستوى الطالب لشهر سابق");
    } else if (
      getSemestersMonthsDiff(currentSemesterDetails, {
        year,
        semester,
        month,
      }) > 1
    ) {
      setErrorMessage(
        "لا يمكن تغيير مستوى الطالب إلا للشهر الحالي أو الشهر التالي، و لايمكن التغيير لعدة أشهر للأمام لأن إنجاز الطالب سيتم تحديثه حتى ذلك الوقت"
      );
    } else {
      setErrorMessage(null);
    }
  }, [
    currentSemesterDetails,
    formikValues.joinMonth,
    formikValues.joinSemester,
    formikValues.joinYear,
    formikValues.levelChanges,
    month,
    semester,
    year,
  ]);

  const prevMonthLabel = useMemo(() => {
    if (month > 1) {
      return `شهر ${month - 1} - ${getSemesterName({
        year,
        semester,
      })}`;
    } else if (semester > 1) {
      return `شهر 3 - ${getSemesterName({ year, semester: semester - 1 })}`;
    } else {
      return `شهر 1 - ${getSemesterName({ year: year - 1, semester: 3 })}`;
    }
  }, [month, semester, year]);

  const changedSinceJoin =
    compareSemesters(
      {
        year: formikValues.joinYear,
        semester: formikValues.joinSemester,
        month: formikValues.joinMonth,
      },
      {
        year,
        semester,
        month,
      }
    ) === 0;

  return (
    <Dialog open={open} sx={{ ".MuiPaper-root": { p: 2 }, minWidth: "md" }}>
      <DialogContent>
        <Stack rowGap={2}>
          <Stack direction="row" columnGap={1} alignItems="center">
            <Typography>ابتداء من</Typography>
            <SemesterInput
              selectedYear={year}
              setSelectedYear={setYear}
              selectedSemester={semester}
              setSelectedSemester={setSemester}
              selectedMonth={month}
              setSelectedMonth={setMonth}
            />
          </Stack>
          <Stack direction="row" columnGap={1} alignItems="center">
            <Typography>
              سيتم تغيير مستوى الطالب من {oldLevel.levelName} إلى
            </Typography>
            <Select
              label="المستوى"
              size="small"
              value={newLevelID}
              onChange={(event) => setNewLevelID(event.target.value)}
              sx={{ maxWidth: 150 }}
            >
              {levels.map((level) => (
                <MenuItem value={level.levelID} key={level.levelID}>
                  {level.levelName}
                </MenuItem>
              ))}
            </Select>
          </Stack>

          {changedSinceJoin && (
            <Alert severity={"info"} sx={{ py: "4px !important" }}>
              سيتم تغيير مستوى الطالب منذ انضمامه
            </Alert>
          )}

          {!changedSinceJoin && !errorMessage && (
            <>
              <Alert severity={"info"} sx={{ py: "4px !important" }}>
                حتى الآن أتم الطالب التسميع حتى صفحة{" "}
                {student.memorizingProgress}. في الشهر الأول بعد التغيير يتوقع
                من الطالب أن يتم التسميع حتى صفحة{" "}
                {newLevelStartMonthProgress ?? "?"}
              </Alert>

              <Alert
                severity={finishedMemorizingLastMonth ? "success" : "warning"}
                sx={{ py: "4px !important" }}
              >
                {finishedMemorizingLastMonth ? "أتم" : "لم يتم"} الطالب التسميع
                المطلوب منه لنهاية الشهر السابق ({prevMonthLabel}) حتى صفحة{" "}
                {lastMonthExpectedMemorizingProgress ?? "?"}
              </Alert>
              <Alert
                severity={finishedRevisitingLastMonth ? "success" : "warning"}
                sx={{ py: "4px !important" }}
              >
                {finishedRevisitingLastMonth ? "أتم" : "لم يتم"} الطالب المراجعة
                المطلوبة منه لنهاية الشهر السابق ({prevMonthLabel}) حتى{" "}
                {lastMonthRevisitLabel}
              </Alert>
            </>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ py: "4px !important" }}>
              {errorMessage}
            </Alert>
          )}

          <Button
            size="small"
            href={`/tejan-alnoor/students/${student.studentID}`}
            target="_blank"
            endIcon={<OpenInNewIcon fontSize="small" />}
          >
            صفحة إنجاز الطالب
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center" }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            onConfirm(newLevelID, year, semester, month);
            onClose();
          }}
          disabled={!!errorMessage || newLevelID === oldLevel.levelID}
        >
          تأكيد
        </Button>
        <Button variant="outlined" size="small" onClick={onClose}>
          إلغاء
        </Button>
      </DialogActions>
    </Dialog>
  );
}
