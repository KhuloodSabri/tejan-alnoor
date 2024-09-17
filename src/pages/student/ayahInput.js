import React, { useEffect, useState } from "react";

import TextField from "@mui/material/TextField";

import { Autocomplete, Stack, Typography } from "@mui/material";
import { commulativeSuar } from "../../utils/surah";
import FuzzySearch from "fuzzy-search";
import { normalizeString } from "../../utils/string";
import { translateNumberToEnglish } from "../../utils/numbers";

export default function AyahInput({
  label,
  setValue,
  setErrorMessage,
  minValue,
  maxValue,
  onChange,
}) {
  const [surah, setSurah] = useState();
  const [ayah, setAyah] = useState("");

  useEffect(() => {
    onChange?.();
    let error = null;

    if (!surah) {
      error = "الرجاء اختيار سورة";
    } else if (!ayah) {
      error = "الرجاء إدخال رقم آية";
    } else {
      const ayahNum = Number(translateNumberToEnglish(ayah));
      if (isNaN(ayahNum) || ayahNum < 1) {
        error = `رقم الآية (${ayah}) غير صحيح`;
      } else if (parseInt(ayahNum) !== ayahNum) {
        error = `رقم الآية (${ayah}) غير صحيح`;
      } else if (ayahNum < 1 || ayahNum > surah.ayah) {
        error = `رقم الآية ${ayahNum} غير موجود في سورة ${surah.surah}`;
      } else if (
        (minValue && surah.commulativeOffset + Number(ayah) < minValue) ||
        (maxValue && surah.commulativeOffset + Number(ayah) > maxValue)
      ) {
        error = "يجب أن تكون بداية المراجعة المدخلة أصغر من نهايتها";
      }
    }

    if (error) {
      setValue(null);
      setErrorMessage(error);
      return;
    }

    setValue(surah.commulativeOffset + Number(ayah));
    setErrorMessage(null);
  }, [surah, ayah, setValue, setErrorMessage, minValue, maxValue, onChange]);

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
