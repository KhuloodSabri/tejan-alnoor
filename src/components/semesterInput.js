import { Box, MenuItem, Select, Stack, TextField } from "@mui/material";
import React from "react";

export default function SemesterInput({
  selectedYear,
  setSelectedYear,
  selectedSemester,
  setSelectedSemester,
}) {
  return (
    <Stack direction="row" columnGap={1}>
      <Box maxWidth={80}>
        <TextField
          label="السنة"
          type="number"
          variant="outlined"
          size="small"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
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
    </Stack>
  );
}
