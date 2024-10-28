import { Button, colors, Stack, Typography } from "@mui/material";
import React from "react";

import {
  getNextSemester,
  getPrevSemester,
  getSemesterName,
} from "../../utils/semesters";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function SemesterNavigator({
  student,
  currentSemesterDetails,
  setSelectedSemester,
  selectedSemester,
}) {
  return (
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
          setSelectedSemester(getPrevSemester(selectedSemester));
        }}
        disabled={
          selectedSemester.year === student.joinYear &&
          selectedSemester.semester === student.joinSemester
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
        {getSemesterName(selectedSemester)}
      </Typography>
      <Button
        size="small"
        sx={{ maxHeight: 16, fontSize: 13 }}
        endIcon={<ArrowBackIcon />}
        onClick={() => {
          setSelectedSemester(getNextSemester(selectedSemester));
        }}
        disabled={
          selectedSemester.year === currentSemesterDetails.year &&
          selectedSemester.semester === currentSemesterDetails.semester
        }
      >
        التالي
      </Button>
    </Stack>
  );
}
