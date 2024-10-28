import React, { useState } from "react";
import SimpleProgressInput from "./simpleProgressInput";
import { Box, colors, Divider, Stack, Typography } from "@mui/material";
import SemesterNavigator from "./semesterNavigator";

export default function StudentTests({ student, currentSemesterDetails }) {
  const [visibleSemester, setVisibleSemester] = useState(
    currentSemesterDetails
  );

  const fieldPrefix = `tests[${visibleSemester.year}][${visibleSemester.semester}]`;
  return (
    <Stack border={`1px solid ${colors.teal["A700"]}`} borderRadius={3}>
      <Typography
        fontWeight={500}
        variant="h5"
        color={colors.teal["700"]}
        textAlign="center"
        sx={{
          bgcolor: colors.grey[200],
          py: 1,
          borderRadius: "12px 12px 0 0",
        }}
      >
        الاختبارات
      </Typography>
      <Box>
        <Divider />
        <SemesterNavigator
          student={student}
          currentSemesterDetails={currentSemesterDetails}
          selectedSemester={visibleSemester}
          setSelectedSemester={setVisibleSemester}
        />
        <Divider sx={{ mt: 0.5 }} />
      </Box>

      <Stack rowGap={2} py={3} px={1.5}>
        <SimpleProgressInput
          student={student}
          progressKey={`${fieldPrefix}[1]`}
          description="الاختبار الأول بعلامة  "
        />
        <SimpleProgressInput
          student={student}
          progressKey={`${fieldPrefix}[2]`}
          description="الاختبار الثاني بعلامة  "
        />
        <SimpleProgressInput
          student={student}
          progressKey={`${fieldPrefix}[3]`}
          description="الاختبار الثالث بعلامة  "
        />
        <SimpleProgressInput
          student={student}
          progressKey={`${fieldPrefix}[4]`}
          description="الاختبار الرابع بعلامة  "
        />
        <SimpleProgressInput
          student={student}
          progressKey={`${fieldPrefix}[5]`}
          description="الاختبار الخامس بعلامة  "
        />
      </Stack>
    </Stack>
  );
}
