import React from "react";
import { useParams } from "react-router-dom";

import { Box, Button, CircularProgress, Stack } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useStudentDetails } from "../../../../../services/students";
import StudentForm from "./studentForm";

export default function EditStudentPage() {
  const { studentId } = useParams();
  const { data: student, loading } = useStudentDetails(studentId);

  if (loading) {
    return (
      <Box mx="auto" width="fit-content" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <Stack rowGap={2} maxWidth={400} mx="auto">
      <Stack direction="row" columnGap={4}>
        <Button
          size="small"
          href={`/tejan-alnoor/students/${studentId}`}
          target="_blank"
          endIcon={<OpenInNewIcon fontSize="small" />}
        >
          صفحة إنجاز الطالب
        </Button>
        <Button size="small" endIcon={<OpenInNewIcon fontSize="small" />}>
          ملخص الأجزاء المنجزة
        </Button>
      </Stack>
      <StudentForm student={student} />
    </Stack>
  );
}
