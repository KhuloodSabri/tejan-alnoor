import {
  Box,
  Button,
  CircularProgress,
  colors,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";

import { useStudentSummary } from "../../services/students";
import RevisitProgressInput from "./revisitProgressInput";
import SimpleProgressInput from "./simpleProgressInput";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link as RouterLink } from "react-router-dom";
import { useCurrentSemesterDetails } from "../../services/configs";
import StudentTests from "./studentTests";
import PastMemProgress from "./pastMemProgress";
import { getLevelMemorizingDirection } from "../../utils/levels";

export default function StudenPage() {
  const { studentId } = useParams();

  const { data: student, loading } = useStudentSummary(studentId);
  const {
    data: currentSemesterDetails,
    loading: currentSemesterDetailsLoading,
  } = useCurrentSemesterDetails();

  const theme = useTheme();
  const smScreen = useMediaQuery(theme.breakpoints.up("sm"));

  if (loading || currentSemesterDetailsLoading) {
    return (
      <Stack justifyContent="center" mt={5} alignItems="center">
        <Box width="fit-content">
          <CircularProgress />
        </Box>
      </Stack>
    );
  }

  if (!student || !currentSemesterDetails) {
    return;
  }

  return (
    <Stack
      width="100%"
      maxWidth={"calc(100vw - 50px)"}
      rowGap={2}
      boxSizing="border-box"
      position="relative"
    >
      <Button
        size={smScreen ? "large" : "small"}
        sx={{
          position: "absolute",
          top: -40,
          left: { xs: -16, md: -40 },
          boxShadow: "none",
          backgroundColor: colors.teal["50"],
          borderRadius: "0 0 10px 0",
          pr: { xs: 1, md: 2 },
          fontWeight: 700,
        }}
        component={RouterLink}
        to={`/tejan-alnoor`}
        startIcon={<ArrowForwardIcon />}
      >
        العودة للبحث
      </Button>
      <Typography variant="h4" align="center" color={colors.teal["700"]}>
        {student.gender === "male" ? "الطالب" : "الطالبة"} {student.studentName}
      </Typography>
      <Divider />
      <Typography variant="h6" color={colors.teal["700"]}>
        <Typography
          component="span"
          fontWeight={600}
          variant="h6"
          color={colors.teal["700"]}
        >
          <KeyboardDoubleArrowLeftIcon sx={{ verticalAlign: "text-bottom" }} />
          المستوى
        </Typography>
        {": "}
        {student.levelName}
      </Typography>

      <Typography variant="h6" color={colors.teal["700"]}>
        <Typography
          component="span"
          fontWeight={600}
          variant="h6"
          color={colors.teal["700"]}
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
        description={
          getLevelMemorizingDirection(student.levelID) === "asc"
            ? "الحفظ حتى صفحة "
            : " حفظ"
        }
        postfixDescription={
          getLevelMemorizingDirection(student.levelID) === "asc" ? "" : " صفحة"
        }
      />

      <PastMemProgress student={student} />

      <RevisitProgressInput
        student={student}
        currentSemesterDetails={currentSemesterDetails}
      />

      <StudentTests
        student={student}
        currentSemesterDetails={currentSemesterDetails}
      />
    </Stack>
  );
}
