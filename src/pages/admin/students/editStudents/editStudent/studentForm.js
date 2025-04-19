import React, { useCallback } from "react";
import { useFormik } from "formik";
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  Divider,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SupervisorsSearch from "./supervisorsSearch";
import SemesterInput from "../../../../../components/semesterInput";
import SemestersStatusHistory from "./semestersStatusHistory";
import * as Yup from "yup";
import _ from "lodash";
import { useUpdateStudent } from "../../../../../services/students";
import LoadingButton from "@mui/lab/LoadingButton";
import { useCurrentSemesterDetails } from "../../../../../services/configs";
import { useLevels } from "../../../../../services/levels";
import ChangeLevelDialog from "./changeLevelDialog";
import LevelHistory from "./levelHistory";
import { compareSemesters } from "../../../../../utils/semesters";

const statuses = ["منتظم/ة", "منسحب/ة", "جمد/ت الفصل", "مفصول/ة"];
const semestersListToStatusMap = {
  withdrawnSemesters: "منسحب/ة",
  frozenSemesters: "جمد/ت الفصل",
  dismissedSemesters: "مفصول/ة",
};

const validationSchema = Yup.object().shape({
  studentName: Yup.string()
    .required("يجب إدخال اسم الطالبـ/ـة")
    .max(100, "اسم الطالبـ/ـة لا يمكن أن يتجاوز 100 حرف"),

  gender: Yup.string()
    .oneOf(["male", "female"], 'الجنس يجب أن يكون "ذكر" أو "أنثى"')
    .required("يجب اختيار الجنس"),

  groupNumber: Yup.number()
    .required("يجب إدخال رقم الدفعة")
    .integer("رقم الدفعة يجب أن يكون عدد صحيح"),

  supervisor: Yup.object()
    .shape({
      supervisorID: Yup.string().nullable(),
      supervisorName: Yup.string().required("Supervisor name is required"),
    })
    .required("يجب اختيار مشرفـ/ـة"),

  phoneNumber: Yup.string().matches(
    /^\d{10}(\d{2})?(\d{2})?$/,
    "رقم الهاتف يجب أن يتكون من 10 أرقام أو 12 أو 14 رقمًًا مع الكود الدولي "
  ),

  levelID: Yup.string()
    .required("يجب اختيار المستوى")
    .min(0, "الستوى المختار غير صحيح")
    .max(3, "المستوى المختار غير صحيح"),

  status: Yup.string()
    .required("يجب اختيار الحالة")
    .oneOf(statuses, "الحالة المدخلة غير صحيحة"),

  joinYear: Yup.number()
    .required("يجب إدخال سنة الالتحاق")
    .integer("سنة الالتحاق يجب أن تكون عدد صحيح")
    .min(1900, "سنة الالتحاق يجب أن تكون بعد عام 1900"),

  joinSemester: Yup.number()
    .required("يجب اختيار فصل الالتحاق")
    .integer("فصل الالتحاق يجب أن يكون عدد صحيح")
    .min(1, "فصل الالتحاق المختار غير صحيح")
    .max(3, "فصل الالتحاق المختار غير صحيح"),

  joinMonth: Yup.number()
    .required("يجب اختيار شهر الالتحاق")
    .integer("شهر الالتحاق يجب أن يكون عدد صحيح")
    .min(1, "شهر الالتحاق يجب أن يكون بين 1 - 3")
    .max(3, "شهر الالتحاق يجب أن يكون بين 1 - 3"),

  withdrawnSemesters: Yup.array().of(
    Yup.object().shape({
      year: Yup.number()
        .required("يجب إدخال سنة الانسحاب")
        .integer("سنة الانسحاب يجب أن تكون عدد صحيح")
        .min(1900, "سنة الانسحاب يجب أن تكون بعد عام 1900"),
      semester: Yup.number()
        .required("يجب اختيار فصل الانسحاب")
        .integer("فصل الانسحاب يجب أن يكون عدد صحيح")
        .min(1, "فصل الانسحاب المختار غير صحيح")
        .max(3, "فصل الانسحاب المختار غير صحيح"),
    })
  ),

  frozenSemesters: Yup.array().of(
    Yup.object().shape({
      year: Yup.number()
        .required("يجب إدخال سنة الانسحاب")
        .integer("سنة الانسحاب يجب أن تكون عدد صحيح")
        .min(1900, "سنة الانسحاب يجب أن تكون بعد عام 1900"),
      semester: Yup.number()
        .required("يجب اختيار فصل الانسحاب")
        .integer("فصل الانسحاب يجب أن يكون عدد صحيح")
        .min(1, "فصل الانسحاب المختار غير صحيح")
        .max(3, "فصل الانسحاب المختار غير صحيح"),
    })
  ),

  dismissedSemesters: Yup.array().of(
    Yup.object().shape({
      year: Yup.number()
        .required("يجب إدخال سنة الانسحاب")
        .integer("سنة الانسحاب يجب أن تكون عدد صحيح")
        .min(1900, "سنة الانسحاب يجب أن تكون بعد عام 1900"),
      semester: Yup.number()
        .required("يجب اختيار فصل الانسحاب")
        .integer("فصل الانسحاب يجب أن يكون عدد صحيح")
        .min(1, "فصل الانسحاب المختار غير صحيح")
        .max(3, "فصل الانسحاب المختار غير صحيح"),
    })
  ),
});

export default function StudentForm({ student }) {
  const { loading, error, updateStudent } = useUpdateStudent();
  const [resultDialogOpen, setResultDialogOpen] = React.useState(false);
  // this is not confirmed value
  const [newLevelID, setNewLevelID] = React.useState(undefined);
  const {
    data: currentSemesterDetails,
    loading: currentSemesterDetailsLoading,
  } = useCurrentSemesterDetails();

  const { data: levels } = useLevels();

  const formik = useFormik({
    initialValues: {
      studentName: student.studentName,
      gender: student.gender,
      groupNumber: student.groupNumber,
      supervisor: {
        supervisorID: student.supervisorID,
        supervisorName: student.supervisorName,
      },
      phoneNumber: student.phoneNumber,
      levelID: student.levelID,
      status: student.status,
      joinYear: student.joinYear,
      joinSemester: student.joinSemester,
      joinMonth: student.joinMonth,
      withdrawnSemesters: student.withdrawnSemesters,
      frozenSemesters: student.frozenSemesters,
      dismissedSemesters: student.dismissedSemesters,
      levelChanges: student.levelChanges,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await updateStudent(student.studentID, values);
      setResultDialogOpen(true);
    },
  });

  const { setFieldValue } = formik;

  const setJoinMonth = useCallback(
    (newValue) => setFieldValue("joinMonth", newValue),
    [setFieldValue]
  );

  const onStatusChange = useCallback(
    (newStatus) => {
      if (currentSemesterDetailsLoading || !currentSemesterDetails) return;

      for (const [semestersList, status] of Object.entries(
        semestersListToStatusMap
      )) {
        const currentSemesterInList = formik.values[semestersList]?.some(
          (semester) =>
            semester.year === currentSemesterDetails?.year &&
            semester.semester === currentSemesterDetails?.semester
        );

        if (newStatus !== status && currentSemesterInList) {
          setFieldValue(
            semestersList,
            formik.values[semestersList].filter(
              (semester) =>
                semester.year !== currentSemesterDetails?.year ||
                semester.semester !== currentSemesterDetails?.semester
            )
          );
        } else if (newStatus === status && !currentSemesterInList) {
          setFieldValue(semestersList, [
            ...formik.values[semestersList],
            {
              year: currentSemesterDetails?.year,
              semester: currentSemesterDetails?.semester,
            },
          ]);
        }
      }
    },
    [
      currentSemesterDetails,
      currentSemesterDetailsLoading,
      formik.values,
      setFieldValue,
    ]
  );

  const onSemestersListChange = useCallback(
    (targetSemestersList, newValue) => {
      if (currentSemesterDetailsLoading || !currentSemesterDetails) return;

      const currentSemesterInList = newValue?.some(
        (semester) =>
          semester.year === currentSemesterDetails?.year &&
          semester.semester === currentSemesterDetails?.semester
      );

      if (
        currentSemesterInList &&
        formik.values.status !== semestersListToStatusMap[targetSemestersList]
      ) {
        setFieldValue("status", semestersListToStatusMap[targetSemestersList]);
      }
    },
    [
      currentSemesterDetails,
      currentSemesterDetailsLoading,
      formik.values.status,
      setFieldValue,
    ]
  );

  const shouldAddLevelChange = useCallback(
    (year, semester, month) => {
      if (
        formik.values.joinYear === year &&
        formik.values.joinSemester === semester &&
        formik.values.joinMonth === month
      ) {
        console.log("should not add level change");
        return false;
      }

      console.log("should add level change");
      return true;
    },
    [
      formik.values.joinMonth,
      formik.values.joinSemester,
      formik.values.joinYear,
    ]
  );

  const shouldUpdateCurrentStudentLevel = useCallback(
    (year, semester, month) => {
      const semesterObj = {
        year,
        semester,
        month,
      };
      // changed after the current change and the change already took effect
      const changedAfter = formik.values.levelChanges?.some((change) => {
        return (
          compareSemesters(change?.semester, semesterObj) > 0 &&
          compareSemesters(change?.semester, currentSemesterDetails) <= 0
        );
      });

      return (
        !changedAfter &&
        compareSemesters(semesterObj, currentSemesterDetails) <= 0
      );
    },
    [currentSemesterDetails, formik.values.levelChanges]
  );

  const onLevelChangeConfirm = useCallback(
    (levelID, year, semester, month) => {
      setNewLevelID(undefined);
      const newLevelChange = {
        fromLevelID: formik.values.levelID,
        toLevelID: levelID,
        semester: {
          year,
          semester,
          month,
        },
      };

      const newLevelChanges = _.orderBy(
        [...(formik.values.levelChanges ?? []), newLevelChange],
        ["semester.year", "semester.semester", "semester.month"],
        ["asc", "asc", "asc"]
      );

      if (
        !shouldAddLevelChange(year, semester, month) ||
        shouldUpdateCurrentStudentLevel(year, semester, month)
      ) {
        setFieldValue("levelID", levelID);
      }

      if (shouldAddLevelChange(year, semester, month)) {
        setFieldValue("levelChanges", newLevelChanges);
      }
    },
    [
      formik.values.levelChanges,
      formik.values.levelID,
      setFieldValue,
      shouldAddLevelChange,
      shouldUpdateCurrentStudentLevel,
    ]
  );

  const onLevelChangeDelete = useCallback(
    (year, semester, month) => {
      if (!formik.values.levelChanges?.length) {
        return;
      }

      const deletedChangeIndex = formik.values.levelChanges.findIndex(
        (change) => {
          return (
            change.semester.year === year &&
            change.semester.semester === semester &&
            change.semester.month === month
          );
        }
      );

      let deletedChange = undefined;
      let newLevelChanges = [...formik.values.levelChanges];

      if (deletedChangeIndex !== -1) {
        deletedChange = formik.values.levelChanges[deletedChangeIndex];

        if (deletedChangeIndex < formik.values.levelChanges.length - 1) {
          newLevelChanges[deletedChangeIndex + 1].fromLevelID =
            deletedChange.fromLevelID;
        }

        newLevelChanges = formik.values.levelChanges.filter((change) => {
          return (
            change.semester.year !== year ||
            change.semester.semester !== semester ||
            change.semester.month !== month
          );
        });

        if (shouldUpdateCurrentStudentLevel(year, semester, month)) {
          setFieldValue("levelID", deletedChange.fromLevelID);
        }

        setFieldValue("levelChanges", newLevelChanges);
      }
    },
    [formik.values.levelChanges, setFieldValue, shouldUpdateCurrentStudentLevel]
  );

  if (currentSemesterDetailsLoading) {
    return (
      <Box mx="auto" width="fit-content" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack rowGap={3} maxWidth={400} mx="auto" mt={2}>
      <TextField
        label="اسم الطالبـ/ـة"
        size="small"
        value={formik.values.studentName}
        onChange={(event) =>
          formik.setFieldValue("studentName", event.target.value)
        }
      />
      <Stack direction="row" columnGap={1}>
        <Select
          label="الجنس"
          size="small"
          value={formik.values.gender}
          onChange={(event) =>
            formik.setFieldValue("gender", event.target.value)
          }
          sx={{ maxWidth: 100 }}
        >
          <MenuItem value="male">ذكر</MenuItem>
          <MenuItem value="female">أنثى</MenuItem>
        </Select>
        <TextField
          label="رقم الواتس"
          size="small"
          value={formik.values.phoneNumber ?? ""}
          onChange={(event) =>
            formik.setFieldValue("phoneNumber", event.target.value)
          }
        />
        <TextField
          label="رقم الدفعة"
          size="small"
          sx={{ maxWidth: 70 }}
          value={formik.values.groupNumber}
          type="number"
          onChange={(event) =>
            formik.setFieldValue("groupNumber", event.target.value)
          }
        />
      </Stack>

      <SupervisorsSearch
        value={formik.values.supervisor}
        setValue={(value) => formik.setFieldValue("supervisor", value)}
      />

      <Stack rowGap={1.5}>
        <Box>
          <Typography variant="body2">تاريخ الالتحاق</Typography>
          <Typography variant="caption">
            * إذا انسحب الطالب و أعاد الالتجاق فهذا هو تاريخ إعادة الالتحاق
          </Typography>
        </Box>

        <Stack direction="row" columnGap={1}>
          <SemesterInput
            selectedYear={formik.values.joinYear}
            setSelectedYear={(value) => formik.setFieldValue("joinYear", value)}
            selectedSemester={formik.values.joinSemester}
            setSelectedSemester={(value) =>
              formik.setFieldValue("joinSemester", value)
            }
            selectedMonth={formik.values.joinMonth}
            setSelectedMonth={setJoinMonth}
          />
        </Stack>
      </Stack>

      {!!currentSemesterDetails && !!levels.length && (
        <Stack rowGap={0.5}>
          <Typography variant="body2">
            مستوى و حالة الطالب في الوقت الحالي
          </Typography>

          <Typography variant="caption">
            أي سنة {currentSemesterDetails.year} - فصل{" "}
            {currentSemesterDetails.semester} - شهر{" "}
            {currentSemesterDetails.month}
          </Typography>

          <Stack direction="row" columnGap={2}>
            <Select
              label="المستوى"
              size="small"
              value={formik.values.levelID}
              onChange={(event) => {
                setNewLevelID(event.target.value);
              }}
              sx={{ maxWidth: 150 }}
            >
              {levels.map((level) => (
                <MenuItem value={level.levelID} key={level.levelID}>
                  {level.levelName}
                </MenuItem>
              ))}
            </Select>
            <Select
              label="الحالة"
              size="small"
              value={formik.values.status}
              onChange={(event) => {
                formik.setFieldValue("status", event.target.value);
                onStatusChange(event.target.value);
              }}
            >
              {statuses.map((status, index) => (
                <MenuItem key={index} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Stack>
      )}
      <Divider />
      {!_.isEmpty(currentSemesterDetails) && !_.isEmpty(levels) && (
        <LevelHistory
          onAddConfirm={onLevelChangeConfirm}
          onDeleteConfirm={onLevelChangeDelete}
          currentSemesterDetails={currentSemesterDetails}
          levels={levels}
          student={student}
          formik={formik}
        />
      )}
      <Divider />
      <SemestersStatusHistory
        title={"الفصول التي انسحب/سينسحب فيها الطالب"}
        noHistoryMsg={"لم ينسحب الطالب سابقا"}
        formik={formik}
        targetSemesters="withdrawnSemesters"
        onChange={onSemestersListChange}
        semestersWithAnotherStatus={[
          ...formik.values.frozenSemesters,
          ...formik.values.dismissedSemesters,
        ]}
      />
      <Divider />
      <SemestersStatusHistory
        title={"الفصول التي جمدها/سيجمدها الطالب"}
        noHistoryMsg={"لم يجمد الطالب أي فصل"}
        formik={formik}
        targetSemesters="frozenSemesters"
        onChange={onSemestersListChange}
        semestersWithAnotherStatus={[
          ...formik.values.withdrawnSemesters,
          ...formik.values.dismissedSemesters,
        ]}
      />
      <Divider />
      <SemestersStatusHistory
        title={"الفصول التي فُصل فيها الطالب"}
        noHistoryMsg={"لم يتم فصل الطالب سابقا"}
        formik={formik}
        targetSemesters="dismissedSemesters"
        onChange={onSemestersListChange}
        semestersWithAnotherStatus={[
          ...formik.values.withdrawnSemesters,
          ...formik.values.frozenSemesters,
        ]}
      />

      {formik.submitCount > 0 && !_.isEmpty(formik.errors) && (
        <Stack rowGap={0.5}>
          <Divider />
          <Typography variant="body2" color="error">
            يوجد أخطاء في البيانات المدخلة:
          </Typography>

          {_.entries(formik.errors).map(([errorKey, errorValue]) => (
            <Typography key={errorKey} variant="body2" color="error">
              * {errorValue}
            </Typography>
          ))}
        </Stack>
      )}
      <LoadingButton
        variant="contained"
        sx={{ boxShadow: "none" }}
        onClick={formik.handleSubmit}
        loading={loading}
      >
        حفظ
      </LoadingButton>
      <Dialog
        open={resultDialogOpen}
        onClose={() => setResultDialogOpen(false)}
      >
        <Box width={400}>
          <Alert severity={error ? "error" : "success"}>
            {error ? "حدث خطأ أثناء تحديث الطالب" : "تم تحديث الطالب بنجاح"}
          </Alert>
        </Box>
      </Dialog>
      {!!levels.length && (
        <ChangeLevelDialog
          open={newLevelID !== undefined && newLevelID !== student.levelID}
          onClose={() => setNewLevelID(undefined)}
          onConfirm={onLevelChangeConfirm}
          levels={levels}
          student={student}
          formik={formik}
          defaultNewLevelId={newLevelID ?? 0}
          currentSemesterDetails={currentSemesterDetails}
        />
      )}
    </Stack>
  );
}
