import { Box, MenuItem, Select, Stack, TextField } from "@mui/material";
import React, { useEffect } from "react";

export default function SemesterInput({
  selectedYear,
  setSelectedYear,
  selectedSemester,
  setSelectedSemester,
  selectedMonth,
  setSelectedMonth,
}) {
  useEffect(() => {
    if (selectedSemester === 3) {
      setSelectedMonth?.(1);
    }
  }, [setSelectedMonth, selectedSemester]);

  return (
    <Stack direction="row" columnGap={1}>
      <Box maxWidth={80}>
        <TextField
          label="السنة"
          type="number"
          variant="outlined"
          size="small"
          value={Number(selectedYear)}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        />
      </Box>
      <Box>
        <Select
          value={selectedSemester}
          size="small"
          onChange={(e) => setSelectedSemester(e.target.value)}
        >
          <MenuItem value={1}>الفصل الأول</MenuItem>
          <MenuItem value={2}>الفصل الثاني</MenuItem>
          <MenuItem value={3}>الفصل الصيفي</MenuItem>
        </Select>
      </Box>
      {!!setSelectedMonth && (
        <Select
          label="الشهر"
          size="small"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <MenuItem value={1}>شهر 1</MenuItem>
          {selectedSemester < 3 && <MenuItem value={2}>شهر 2</MenuItem>}
          {selectedSemester < 3 && <MenuItem value={3}>شهر 3</MenuItem>}
        </Select>
      )}
    </Stack>
  );
}
