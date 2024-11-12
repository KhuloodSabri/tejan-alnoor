import {
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import React, { useEffect } from "react";
import {
  exportDetailedStudentProgress,
  exportStudentProgress,
  useStudentsSummariesFolderUrl,
} from "../../../../services/students";

import UpdateListButton from "./updateListButton";
import FolderIcon from "@mui/icons-material/Folder";
import { useCurrentSemesterDetails } from "../../../../services/configs";
import SemesterInput from "../../../../components/semesterInput";

export default function ExportProgressPage() {
  const { data: summariesFolderUrl, loading: summariesFolderLoading } =
    useStudentsSummariesFolderUrl();

  const {
    data: currentSemesterDetails,
    loading: currentSemesterDetailsLoading,
  } = useCurrentSemesterDetails();

  const [selectedYear, setSelectedYear] = React.useState(
    currentSemesterDetails?.year
  );
  const [selectedSemester, setSelectedSemester] = React.useState(
    currentSemesterDetails?.semester
  );

  useEffect(() => {
    setSelectedYear(currentSemesterDetails?.year);
    setSelectedSemester(currentSemesterDetails?.semester);
  }, [currentSemesterDetails]);

  if (summariesFolderLoading || currentSemesterDetailsLoading) {
    return (
      <Box width="fit-content" mx="auto" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!summariesFolderUrl || !currentSemesterDetails) {
    return null;
  }

  return (
    <Stack rowGap={2}>
      <UpdateListButton
        buttonText="اضغط لتحديث قائمة الورد للطلاب"
        submit={exportStudentProgress}
      />

      <Divider sx={{ mt: 4, mb: 2 }} />

      <Box mb={2}>
        <Button
          size="large"
          startIcon={<FolderIcon />}
          target="blank"
          href={summariesFolderUrl}
        >
          مجلد القوائم
        </Button>
      </Box>
      <Stack direction="row" rowGap={2} flexWrap="wrap" columnGap={2}>
        <SemesterInput
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedSemester={selectedSemester}
          setSelectedSemester={setSelectedSemester}
        />
        <Box>
          <UpdateListButton
            buttonText="اضغط لتحديث قائمة الجرد للفصل المختار"
            submit={(token) =>
              exportDetailedStudentProgress(
                token,
                selectedYear,
                selectedSemester
              )
            }
          />
        </Box>
      </Stack>
    </Stack>
  );
}
