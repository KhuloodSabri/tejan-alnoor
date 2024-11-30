import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import React from "react";
import SemesterInput from "../../../../../components/semesterInput";

export default function AddSemesterDialog({ open, onClose, onAdd }) {
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [semester, setSemester] = React.useState(1);
  const [errorMessage, setErrorMessage] = React.useState(null);

  return (
    <Dialog open={open} sx={{ ".MuiPaper-root": { p: 2 } }}>
      <DialogContent>
        <SemesterInput
          selectedYear={year}
          setSelectedYear={setYear}
          selectedSemester={semester}
          setSelectedSemester={setSemester}
        />

        {errorMessage && (
          <Typography color="error" sx={{ mt: 2 }} variant="body2">
            {errorMessage}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center" }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => onAdd({ year, semester }, setErrorMessage)}
        >
          إضافة
        </Button>
        <Button variant="outlined" size="small" onClick={onClose}>
          إلغاء
        </Button>
      </DialogActions>
    </Dialog>
  );
}
