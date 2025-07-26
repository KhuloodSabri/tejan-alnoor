import {
  Box,
  Button,
  CircularProgress,
  colors,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import React from "react";

import { getSemesterMonthsCount } from "../../utils/semesters";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import RevisitProgressDialog from "./revisitProgressDialog";

import SemesterNavigator from "./semesterNavigator";
import RevisitMonthProgress from "./revistMonthProgress";

export default function RevisitProgressInput({
  student,
  currentSemesterDetails,
  levels,
  levelsLoading,
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState("add");
  const [revisitProgress, setRevisitProgress] = React.useState(
    student.revisitProgress
  );

  const [visibleSemester, setVisibleSemester] = React.useState(
    currentSemesterDetails
  );

  const monthsCount = getSemesterMonthsCount(visibleSemester);

  if (levelsLoading || !levels?.length) {
    return (
      <Box width="fit-content" mx="auto" mt={1}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack rowGap={1} my={3}>
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
          المراجعة
        </Typography>
        <Stack>
          <Divider />
          <Stack direction="row" columnGap={2} pl={3} py={2}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ boxShadow: "none" }}
              size="small"
              onClick={() => {
                setDialogMode("add");
                setDialogOpen(true);
              }}
            >
              إضافة مراجعة
            </Button>
            <Button
              variant="outlined"
              startIcon={<RemoveIcon />}
              sx={{ boxShadow: "none" }}
              size="small"
              onClick={() => {
                setDialogMode("remove");
                setDialogOpen(true);
              }}
              color="error"
            >
              إزالة مراجعة{" "}
            </Button>
          </Stack>

          <Divider />
          <SemesterNavigator
            student={student}
            currentSemesterDetails={currentSemesterDetails}
            selectedSemester={visibleSemester}
            setSelectedSemester={setVisibleSemester}
          />
          <Divider sx={{ mt: 0.5 }} />
        </Stack>
        <Box>
          <Typography
            variant="subtitle2"
            color={colors.teal["700"]}
            sx={{ mt: 1.5, mb: 0.8, mx: 1.5 }}
          >
            * كل مستطيل في الشكل أدناه يمثل شهرًا، اضغط على المساحات الخضراء
            للمزيد من التفاصيل{" "}
          </Typography>
        </Box>

        <Stack mt={1}>
          <Stack
            direction="row"
            my={2}
            width={"100%"}
            alignItems={"center"}
            px={1.5}
            boxSizing={"border-box"}
          >
            {Array.from({ length: monthsCount }, (_, i) => i + 1).map(
              (month) => (
                <Box
                  width={`${100 / monthsCount}%`}
                  key={month}
                  px={0.5}
                  boxSizing={"border-box"}
                >
                  <RevisitMonthProgress
                    key={month}
                    student={student}
                    revisitProgress={revisitProgress}
                    selectedSemester={visibleSemester}
                    selectedMonth={month}
                    labelsPosition={month % 2 === 0 ? "top" : "bottom"}
                    levels={levels}
                  />
                </Box>
              )
            )}
          </Stack>
        </Stack>

        <RevisitProgressDialog
          student={{ ...student, revisitProgress }}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          mode={dialogMode}
          onSubmit={(updatedValue) => {
            setRevisitProgress(updatedValue);
          }}
        />
      </Stack>
    </Stack>
  );
}
