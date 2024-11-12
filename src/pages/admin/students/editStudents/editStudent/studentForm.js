import React, { useEffect } from "react";
import { useFormik } from "formik";
import {
  Alert,
  Box,
  Dialog,
  Divider,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SupervisorsSearch from "./supervisorsSearch";
import { levels } from "../../../../../utils/levels";
import SemesterInput from "../../../../../components/semesterInput";
import SemestersHistory from "./semestersHistory";
import * as Yup from "yup";
import _ from "lodash";
import { useUpdateStudent } from "../../../../../services/students";
import LoadingButton from "@mui/lab/LoadingButton";

const statuses = ["منتظم/ة", "منسحب/ة", "جمد/ت الفصل", "مفصول/ة"];

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

  phoneNumber: Yup.string()
    .matches(
      /^\d{10}(\d{2})?(\d{2})?$/,
      "رقم الهاتف يجب أن يتكون من 10 أرقام أو 12 أو 14 رقمًًا مع الكود الدولي "
    )
    .required("يجب إدخال رقم الهاتف"),

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
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await updateStudent(student.studentID, values);
      setResultDialogOpen(true);
    },
  });

  const { setFieldValue } = formik;

  useEffect(() => {
    if (formik.values.joinSemester === 3) {
      setFieldValue("joinMonth", 1);
    }
  }, [formik.values.joinSemester, setFieldValue]);

  return (
    <Stack rowGap={3} maxWidth={300} mx="auto" mt={2}>
      <TextField
        label="اسم الطالبـ/ـة"
        size="small"
        value={formik.values.studentName}
        onChange={(event) =>
          formik.setFieldValue("studentName", event.target.value)
        }
      />
      <Stack direction="row" columnGap={2}>
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
          value={formik.values.phoneNumber}
          onChange={(event) =>
            formik.setFieldValue("phoneNumber", event.target.value)
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
          />
          <Select
            label="الشهر"
            size="small"
            value={formik.values.joinMonth}
            onChange={(event) =>
              formik.setFieldValue("joinMonth", event.target.value)
            }
          >
            <MenuItem value={1}>شهر 1</MenuItem>
            {formik.values.joinSemester < 3 && (
              <MenuItem value={2}>شهر 2</MenuItem>
            )}
            {formik.values.joinSemester < 3 && (
              <MenuItem value={3}>شهر 3</MenuItem>
            )}
          </Select>
        </Stack>
      </Stack>
      <Stack direction="row" columnGap={2}>
        <Select
          label="المستوى"
          size="small"
          value={formik.values.levelID}
          onChange={(event) =>
            formik.setFieldValue("levelID", event.target.value)
          }
          sx={{ maxWidth: 100 }}
          disabled={true}
        >
          {levels.map((levelName, index) => (
            <MenuItem value={index} key={index}>
              {levelName}
            </MenuItem>
          ))}
        </Select>
        <Select
          label="الحالة"
          size="small"
          value={formik.values.status}
          onChange={(event) =>
            formik.setFieldValue("status", event.target.value)
          }
        >
          {statuses.map((status, index) => (
            <MenuItem key={index} value={status}>
              {status}
            </MenuItem>
          ))}
        </Select>
        <TextField
          label="رقم الدفعة"
          size="small"
          value={formik.values.groupNumber}
          type="number"
          onChange={(event) =>
            formik.setFieldValue("groupNumber", event.target.value)
          }
        />
      </Stack>
      <Divider />
      <SemestersHistory
        title={"الفصول التي انسحب فيها الطالب"}
        noHistoryMsg={"لم ينسحب الطالب سابقا"}
        formik={formik}
        targetSemesters="withdrawnSemesters"
      />
      <Divider />
      <SemestersHistory
        title={"الفصول التي جمدها الطالب"}
        noHistoryMsg={"لم يجمد الطالب أي فصل"}
        formik={formik}
        targetSemesters="frozenSemesters"
      />
      <Divider />
      <SemestersHistory
        title={"الفصول التي فُصل فيها الطالب"}
        noHistoryMsg={"لم يتم فصل الطالب سابقا"}
        formik={formik}
        targetSemesters="dismissedSemesters"
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
    </Stack>
  );
}
