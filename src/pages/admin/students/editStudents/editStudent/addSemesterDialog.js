import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import React from "react";
import SemesterInput from "../../../../../components/semesterInput";

export default function AddSemesterDialog({ open, onClose, onAdd }) {
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [semester, setSemester] = React.useState(1);

  return (
    <Dialog open={open} sx={{ ".MuiPaper-root": { p: 2 } }}>
      <DialogContent>
        <SemesterInput
          selectedYear={year}
          setSelectedYear={setYear}
          selectedSemester={semester}
          setSelectedSemester={setSemester}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center" }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => onAdd({ year, semester })}
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
