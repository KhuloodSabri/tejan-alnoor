import React, { useEffect, useState } from "react";

import TextField from "@mui/material/TextField";

import { translateNumberToEnglish } from "../../utils/numbers";
import { Stack, Typography } from "@mui/material";

export default function PageInput({
  label,
  setValue,
  setErrorMessage,
  minValue,
  maxValue,
  onChange,
}) {
  const [page, setPage] = useState("");

  useEffect(() => {
    onChange?.();
    let error = null;

    if (!page) {
      error = "الرجاء إدخال رقم صفحة";
    } else {
      const pageNum = Number(translateNumberToEnglish(page));
      if (isNaN(pageNum) || pageNum < 1) {
        error = `رقم الصفحة (${page}) غير صحيح`;
      } else if (parseInt(pageNum) !== pageNum) {
        error = `رقم الآية (${page}) غير صحيح`;
      } else if (pageNum < minValue || pageNum > maxValue) {
        error = "يجب أن تكون بداية المراجعة المدخلة أصغر من نهايتها";
      }
    }

    if (error) {
      setValue(null);
      setErrorMessage(error);
      return;
    }

    setValue(Number(page));
    setErrorMessage(null);
  }, [setValue, setErrorMessage, minValue, maxValue, onChange, page]);

  return (
    <Stack direction="row" columnGap={2}>
      <Typography fontWeight={600} variant="h6">
        {label}
      </Typography>

      <TextField
        label="صفحة"
        value={page}
        size="small"
        sx={{ width: 80 }}
        onChange={(e) => setPage(e.target.value ?? "")}
      />
    </Stack>
  );
}
