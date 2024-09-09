import {
  Box,
  colors,
  lighten,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import { commulativeSuar } from "../../utils/surah";
import { arabicNumbers, translateNumberToArabic } from "../../utils/numbers";
// import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import NorthIcon from "@mui/icons-material/North";
import { useStudent } from "../../hooks/useData";
import RevisitProgressBar from "./revisitProgressBar";

export default function StudenPage() {
  const { studentId: studentIdStr } = useParams();
  const studentId = parseInt(studentIdStr);

  const { data: student, loading } = useStudent(studentId);

  if (!student) {
    return;
  }

  return (
    <Box width="100%">
      <Typography variant="h4" align="center">
        الطالبة {studentId}
      </Typography>

      <RevisitProgressBar student={student} />
    </Box>
  );
}
