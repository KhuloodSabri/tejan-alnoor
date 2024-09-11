import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { getNegativeProgressPrefix, getPositiveProgressPrefix } from "./utils";
import {
  Autocomplete,
  Box,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { commulativeSuar } from "../../utils/surah";
import FuzzySearch from "fuzzy-search";
import { normalizeString } from "../../utils/string";
import { translateNumberToEnglish } from "../../utils/numbers";

export default function AyahInput({ label, value, setValue, setErrorMessage }) {
  const [surah, setSurah] = useState();
  const [ayah, setAyah] = useState("");

  useEffect(() => {
    let error = null;

    if (!surah) {
      error = "الرجاء اختيار سورة";
    } else if (!ayah) {
      error = "الرجاء إدخال رقم آية";
    } else {
      const ayahNum = Number(translateNumberToEnglish(ayah));
      if (isNaN(ayahNum)) {
        error = "الرجاء إدخال رقم آية صحيح";
      } else if (parseInt(ayahNum) !== ayahNum) {
        error = "الرجاء إدخال رقم آية صحيح";
      } else if (ayahNum < 1 || ayahNum > surah.ayah) {
        error = "رقم الآية المدخل غير موجود في السورة المختارة";
      }
    }

    if (error) {
      setValue(null);
      setErrorMessage(error);
      return;
    }

    setValue(surah.commulativeOffset + ayah);
  }, [surah, ayah, setValue, setErrorMessage]);

  const filterOptions = (options, { inputValue }) => {
    const normalizedOptions =
      options.map((option) => ({
        ...option,
        normalizedSurah: normalizeString(option.surah),
      })) ?? [];

    const searcher = new FuzzySearch(
      normalizedOptions,
      ["surah", "normalizedSurah"],
      {
        caseSensitive: true,
        sort: true,
      }
    );
    return searcher.search(normalizeString(inputValue));
  };

  return (
    <Stack direction="row" columnGap={2}>
      <Typography fontWeight={600} variant="h6">
        {label}
      </Typography>
      <Autocomplete
        dir="rtl"
        disablePortal
        options={commulativeSuar}
        renderInput={(params) => (
          <TextField
            {...params}
            label="سورة"
            size="small"
            sx={{ minWidth: 150 }}
          />
        )}
        getOptionLabel={(option) => option.surah}
        filterOptions={filterOptions}
        onChange={(_event, newValue) => {
          setSurah(newValue);
        }}
      />
      <TextField
        label="آية"
        value={ayah}
        size="small"
        sx={{ width: 80 }}
        onChange={(e) => setAyah(e.target.value ?? "")}
      />
    </Stack>
  );
}
