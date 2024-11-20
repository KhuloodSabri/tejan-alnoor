import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useStudentsByName } from "../../../../services/students";
import SearchStudentResultItem from "../../../../components/searchStudentResultItem";

export default function EditStudentsPage() {
  const [name, setName] = React.useState("");
  const [submittedName, setSubmittedName] = React.useState(null);
  const students = useStudentsByName(submittedName);
  return (
    <Stack rowGap={2}>
      <Stack direction="row" columnGap={2}>
        <TextField
          size="small"
          label="اسم الطالبـ/ـة"
          onChange={(e) => setName(e.target.value)}
        ></TextField>

        <Button
          variant="contained"
          sx={{ boxShadow: "none" }}
          onClick={() => setSubmittedName(name)}
        >
          بحث
        </Button>
      </Stack>
      <Divider />
      <Stack>
        {students.loading && (
          <Box mx="auto">
            <CircularProgress />
          </Box>
        )}
        {submittedName && !students.loading && !students.data?.length && (
          <Typography>لا يوجد نتائج مطابقة للبحث</Typography>
        )}

        {students.data && (
          <Stack>
            {students.data.map((student) => (
              <Box key={student.studentID}>
                <SearchStudentResultItem
                  option={student}
                  optionPath={`/tejan-alnoor/admin/editStudents/${student?.studentID}`}
                  sx={{ px: 2 }}
                />
                <Divider />
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
