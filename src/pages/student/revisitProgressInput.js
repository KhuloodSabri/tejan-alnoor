import {
  Box,
  Button,
  CircularProgress,
  colors,
  Stack,
  Typography,
} from "@mui/material";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import React from "react";

import { getSemesterMonthsCount } from "../../utils/semesters";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import { getPositiveProgressPrefix } from "./utils";
import RevisitProgressDialog from "./revisitProgressDialog";

import SemesterNavigator from "./semesterNavigator";
import RevisitMonthProgress from "./revistMonthProgress";
import { useLevels } from "../../services/levels";

export default function RevisitProgressInput({
  student,
  currentSemesterDetails,
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState("add");
  const [revisitProgress, setRevisitProgress] = React.useState(
    student.revisitProgress
  );

  const [visibleSemester, setVisibleSemester] = React.useState(
    currentSemesterDetails
  );

  const progressPrefix = getPositiveProgressPrefix(student);

  const monthsCount = getSemesterMonthsCount(visibleSemester);

  const { data: levels, levelsLoading } = useLevels();

  if (levelsLoading || !levels?.length) {
    return (
      <Box width="fit-content" mx="auto" mt={1}>
        <CircularProgress />
      </Box>
    );
  }

  console.log("in parent levels", levels);

  return (
    <Stack rowGap={1} mb={2}>
      <Box>
        <Typography variant="h6" color={colors.teal["700"]}>
          <Typography
            component="span"
            fontWeight={600}
            variant="h6"
            color={colors.teal["700"]}
          >
            <KeyboardDoubleArrowLeftIcon
              sx={{ verticalAlign: "text-bottom" }}
            />
          </Typography>
          {progressPrefix} المراجعة كما هو موضح في الشكل أدناه
        </Typography>
        <Typography
          variant="subtitle2"
          color={colors.teal["700"]}
          sx={{ my: 0.8 }}
        >
          *اضغط على المساحات الخضراء للمزيد من التفاصيل
        </Typography>
      </Box>
      <Stack direction="row" columnGap={2} pl={3}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ boxShadow: "none" }}
          size="small"
          onClick={() => {
            setDialogMode("add");
            setDialogOpen(true);
          }}
        >
          مراجعة جديدة
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
        >
          إزالة مراجعة{" "}
        </Button>
      </Stack>
      <Stack mt={1}>
        <SemesterNavigator
          student={student}
          currentSemesterDetails={currentSemesterDetails}
          selectedSemester={visibleSemester}
          setSelectedSemester={setVisibleSemester}
        />
        <Stack
          direction="row"
          mt={2}
          width={"100%"}
          alignItems={"center"}
          px={1.5}
          boxSizing={"border-box"}
        >
          {Array.from({ length: monthsCount }, (_, i) => i + 1).map((month) => (
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
          ))}
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
  );
}
