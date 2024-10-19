import { Alert, Box, Stack, Typography } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import StudentsTable from "./studentsTable";
import StudentsDownload from "./studentsDownload";
import { useAuth0 } from "@auth0/auth0-react";
import { replaceStudents } from "../../../../services/students";
import LoadingButton from "@mui/lab/LoadingButton";

const getCountLabel = (count) => {
  if (count === 1) {
    return "طالبا واحدا";
  }

  if (count <= 10 && count > 0) {
    return `${count} طلاب`;
  }

  return `${count} طالباً`;
};

export default function ImportResult({
  createdStudentsCount,
  failedToInsert,
  existingStudents,
  inputStudents,
}) {
  const { getAccessTokenSilently } = useAuth0();
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [submitResult, setSubmitResult] = useState();

  const tableRows = useMemo(
    () =>
      existingStudents.map((student) => {
        const match = inputStudents?.find(
          (inputStudent) =>
            `${inputStudent.phoneNumber}` === `${student.phoneNumber}` ||
            inputStudent.studentName === student.studentName
        );

        return {
          ...student,
          id: student.studentID,
          inputStudentName: match.studentName,
          inputPhoneNumber: match.phoneNumber,
        };
      }),
    [existingStudents, inputStudents]
  );

  const csvRows = useMemo(
    () =>
      existingStudents.map((student) => {
        const match = inputStudents?.find(
          (inputStudent) =>
            `${inputStudent.phoneNumber}` === `${student.phoneNumber}` ||
            inputStudent.studentName === student.studentName
        );

        return match;
      }),
    [existingStudents, inputStudents]
  );

  const handleSubmit = useCallback(async () => {
    const token = await getAccessTokenSilently();
    setSubmitting(true);
    console.log(
      selectedStudentIds,
      existingStudents.filter((student) =>
        selectedStudentIds.includes(student.studentID)
      )
    );

    setSubmitResult(
      await replaceStudents(
        token,
        existingStudents
          .filter((student) => selectedStudentIds.includes(student.studentID))
          .map((student) => {
            const match = inputStudents?.find(
              (inputStudent) =>
                `${inputStudent.phoneNumber}` === `${student.phoneNumber}` ||
                inputStudent.studentName === student.studentName
            );

            return match;
          })
      )
    );

    setSubmittedSuccessfully(true);
    setSubmitting(false);
  }, [
    existingStudents,
    getAccessTokenSilently,
    inputStudents,
    selectedStudentIds,
  ]);

  if (submittedSuccessfully) {
    return (
      <Alert severity="success">
        تم استبدال {getCountLabel(submitResult.updatedStudentsCount)} بنجاح
      </Alert>
    );
  }

  return (
    <Stack rowGap={2}>
      <Alert severity="success">
        تم إضافة {getCountLabel(createdStudentsCount)} بنجاح
      </Alert>

      {existingStudents.length > 0 && (
        <Stack rowGap={1}>
          <Alert severity="warning">
            <Stack rowGap={1}>
              <Typography variant="body2">
                لم يتم إضافة {getCountLabel(existingStudents.length)}، لأنهم
                موجودين في قاعدة البيانات. يمكنك اختيار إما استبدال المعلومات
                الموجودة لهؤلاء الطلاب بالمعلومات الجديدة، أو الإبقاء على
                المعلومات القديمة.
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                من الجدير بالذكر أن استبدال معلومات طالب ما يعني فقدان أي إنجاز
                قام به الطالب في الفصول الماضية. ذلك متوقع في حالة الطلاب
                المنسحبين عادة.
              </Typography>
            </Stack>
          </Alert>

          <Stack direction="row" columnGap={1} mt={3} mb={1}>
            <Stack rowGap={0.5}>
              <Box>
                <StudentsDownload
                  students={csvRows}
                  text="تنزيل قائمة الطلاب الذين لم يتم إضافتهم"
                />
              </Box>

              <Typography variant="caption" fontWeight={550}>
                يمكنك رفع هذا الملف لاحقا و الاستمرار من حيث توقفت
              </Typography>
            </Stack>
            <Box>
              <LoadingButton
                variant="outlined"
                size="small"
                sx={{ boxShadow: "none" }}
                loading={submitting}
                onClick={handleSubmit}
                disabled={!selectedStudentIds.length}
              >
                استبدال الطلاب الذين تم تحديدهم ({selectedStudentIds.length})
              </LoadingButton>
            </Box>
          </Stack>

          <Box mt={2}>
            <StudentsTable
              students={tableRows}
              setSelectedStudentIds={setSelectedStudentIds}
            />
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
