import { colors, Divider, Stack, Typography } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";

import { useStudent } from "../../services/students";
import RevisitProgressInput from "./revisitProgressInput";
import SimpleProgressInput from "./simpleProgressInput";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

export default function StudenPage() {
  const { studentId: studentIdStr } = useParams();
  const studentId = parseInt(studentIdStr);

  const { data: student, loading } = useStudent(studentId);

  if (!student) {
    return;
  }

  return (
    <Stack width="100%" rowGap={2}>
      <Typography variant="h4" align="center" color={colors.teal["600"]}>
        {student.gender === "male" ? "الطالب" : "الطالبة"} {student.studentName}
      </Typography>
      <Divider />
      <Typography variant="h6" color={colors.teal["600"]}>
        <Typography
          component="span"
          fontWeight={600}
          variant="h6"
          color={colors.teal["600"]}
        >
          <KeyboardDoubleArrowLeftIcon sx={{ verticalAlign: "text-bottom" }} />
          المستوى
        </Typography>
        {": "}
        {student.levelName}
      </Typography>

      <Typography variant="h6" color={colors.teal["600"]}>
        <Typography
          component="span"
          fontWeight={600}
          variant="h6"
          color={colors.teal["600"]}
        >
          <KeyboardDoubleArrowLeftIcon sx={{ verticalAlign: "text-bottom" }} />
          المشرفـ / ـة
        </Typography>
        {": "}
        {student.supervisorName}
      </Typography>

      <SimpleProgressInput
        student={student}
        progressKey="memorizingProgress"
        description="التسميع حتى صفحة "
      />
      <RevisitProgressInput student={student} />

      <SimpleProgressInput
        student={student}
        progressKey="test1"
        description="الاختبار الأول بعلامة  "
      />
      <SimpleProgressInput
        student={student}
        progressKey="test2"
        description="الاختبار الثاني بعلامة  "
      />
      <SimpleProgressInput
        student={student}
        progressKey="test3"
        description="الاختبار الثالث بعلامة  "
      />
      <SimpleProgressInput
        student={student}
        progressKey="test4"
        description="الاختبار الرابع بعلامة  "
      />
      <SimpleProgressInput
        student={student}
        progressKey="test5"
        description="الاختبار الخامس بعلامة  "
      />
    </Stack>
  );
}
