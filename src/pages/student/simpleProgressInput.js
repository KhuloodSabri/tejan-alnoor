import {
  Box,
  Button,
  colors,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import React, { useState } from "react";
import {
  translateNumberToArabic,
  translateNumberToEnglish,
} from "../../utils/numbers";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { updateStudentProgress } from "../../services/students";

import { getPositiveProgressPrefix } from "./utils";

export default function SimpleProgressInput({
  student,
  progressKey,
  description,
}) {
  const [editing, setEditing] = useState(false);
  const prefix = getPositiveProgressPrefix(student);
  const [value, setValue] = useState(
    translateNumberToArabic(student[progressKey])
  );
  const [validationError, setValidationError] = useState(false);
  const [saveStatus, setSaveStatus] = useState({
    loading: false,
    error: null,
  });

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    setValidationError(false);
  };

  const handleSave = async () => {
    const number = translateNumberToEnglish(value);

    if (isNaN(number)) {
      setValidationError(true);
      return;
    }
    console.log("submit number", number);
    setSaveStatus({ loading: true, error: null });

    try {
      await updateStudentProgress(student.studentID, {
        [progressKey]: number,
      });

      setSaveStatus({ loading: false, error: null });
      setEditing(false);
    } catch (error) {
      setSaveStatus({ loading: false, error });
    }
  };

  return (
    <Stack direction="row" columnGap={1} alignItems="center">
      <Typography variant="h6" color={colors.teal["600"]}>
        <Typography
          component="span"
          fontWeight={600}
          variant="h6"
          color={colors.teal["600"]}
        >
          <KeyboardDoubleArrowLeftIcon sx={{ verticalAlign: "text-bottom" }} />
        </Typography>
        {prefix} {description}{" "}
        {!editing
          ? value && Number(translateNumberToEnglish(value)) > 0
            ? translateNumberToArabic(value)
            : "...."
          : ""}
      </Typography>
      {!editing && (
        <Box>
          <Button
            size="small"
            // variant="outlined"
            onClick={() => setEditing(true)}
            startIcon={<EditIcon />}
            sx={{
              //   boxShadow: "none",
              fontWeight: 600,
              paddingTop: 0.1,
              paddingBottom: 0.1,
            }}
          >
            تعديل
          </Button>
        </Box>
      )}
      {editing && (
        <TextField
          dir="rtl"
          value={value}
          size="small"
          variant="outlined"
          sx={{
            width: 80,
            fieldset: { borderColor: validationError ? "red" : undefined },
          }}
          onChange={handleChange}
        />
      )}

      {editing && (
        <Box>
          <LoadingButton
            size="small"
            // variant="outlined"
            onClick={handleSave}
            endIcon={<SaveIcon />}
            loading={saveStatus.loading}
            disabled={
              saveStatus.loading ||
              translateNumberToEnglish(value) === student[progressKey]
            }
            sx={{
              //   boxShadow: "none",
              fontWeight: 600,
              //   paddingTop: 0.1,
              //   paddingBottom: 0.1,
            }}
          >
            حفظ
          </LoadingButton>
        </Box>
      )}
      {validationError && (
        <Typography color="red" variant="caption">
          الرجاء إدخال رقم
        </Typography>
      )}
    </Stack>
  );
}
