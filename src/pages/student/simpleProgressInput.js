import {
  Box,
  Button,
  colors,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import React, { useEffect, useState } from "react";
import {
  translateNumberToArabic,
  translateNumberToEnglish,
} from "../../utils/numbers";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { updateStudentProgress } from "../../services/students";

import { getPositiveProgressPrefix } from "./utils";

function getNestedValue(obj, path) {
  // Split the path into keys and indices
  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");

  // Use reduce to traverse the object
  return keys.reduce((acc, key) => {
    // Return undefined if the key doesn't exist
    return acc ? acc[key] : undefined;
  }, obj);
}

function updateObjectAtPath(obj, path, value) {
  // Convert the path into an array of keys, handling both dot and bracket notations
  const keys = path.replace(/\[(\w+)\]/g, ".$1").split(".");

  // Iterate through the keys, except for the last one
  keys.slice(0, -1).reduce((acc, key) => {
    // If the key doesn't exist, create an empty object
    if (!acc[key]) acc[key] = {};
    return acc[key];
  }, obj)[keys[keys.length - 1]] = value; // Set the value at the final key

  return obj;
}

export default function SimpleProgressInput({
  student,
  progressKey,
  description,
  postfixDescription,
}) {
  const [editing, setEditing] = useState(false);
  const prefix = getPositiveProgressPrefix(student);
  const [value, setValue] = useState(
    translateNumberToArabic(getNestedValue(student, progressKey) ?? "")
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

    setSaveStatus({ loading: true, error: null });

    try {
      await updateStudentProgress(
        student.studentID,
        updateObjectAtPath({}, progressKey, number)
      );

      setSaveStatus({ loading: false, error: null });
      setEditing(false);
    } catch (error) {
      setSaveStatus({ loading: false, error });
    }
  };

  useEffect(() => {
    setValue(
      translateNumberToArabic(getNestedValue(student, progressKey) ?? "")
    );
  }, [student, progressKey]);

  return (
    <Stack
      direction="row"
      columnGap={1}
      alignItems="center"
      flexWrap="wrap"
      width={{ xs: undefined, sm: "fit-content" }}
    >
      <Typography variant="h6" color={colors.teal["700"]}>
        <Typography
          component="span"
          fontWeight={600}
          variant="h6"
          color={colors.teal["700"]}
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

      <Typography variant="h6" color={colors.teal["700"]}>
        {postfixDescription}
      </Typography>

      {!editing && (
        <Box ml="auto">
          <Button
            size="small"
            onClick={() => setEditing(true)}
            startIcon={<EditIcon />}
            sx={{
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
        <Box ml={"auto"}>
          <LoadingButton
            size="small"
            onClick={handleSave}
            endIcon={<SaveIcon />}
            loading={saveStatus.loading}
            disabled={saveStatus.loading}
            sx={{
              fontWeight: 600,
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
