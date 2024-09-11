import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { getNegativeProgressPrefix, getPositiveProgressPrefix } from "./utils";
import { Autocomplete, Box, Stack, Typography } from "@mui/material";
import { getCommulativeAyahDetails, suar } from "../../utils/surah";
import FuzzySearch from "fuzzy-search";
import { normalizeString } from "../../utils/string";
import AyahInput from "./ayahInput";

export default function RevisitProgressDialog({
  student,
  mode,
  open,
  handleClose,
}) {
  const [fromValue, setFromValue] = useState();
  const [toValue, setToValue] = useState();
  const [fromErrorMessage, setFromErrorMessage] = useState();
  const [toErrorMessage, setToErrorMessage] = useState();

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        <Stack rowGap={2} justifyContent="center" alignItems="center">
          <Typography fontWeight={600} variant="h6">
            {mode === "add"
              ? getPositiveProgressPrefix(student)
              : getNegativeProgressPrefix(student)}
            المراجعة
          </Typography>
          {student.progressUnit === "ayah" ? (
            <AyahInput
              label="من"
              value={fromValue}
              setValue={setFromValue}
              setErrorMessage={setFromErrorMessage}
            />
          ) : (
            <> </>
          )}
          {student.progressUnit === "ayah" ? (
            <AyahInput
              label="إلى"
              value={toValue}
              setValue={setToValue}
              setErrorMessage={setToErrorMessage}
            />
          ) : (
            <> </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          إلغاء
        </Button>
        <Button variant="contained">حفظ</Button>
      </DialogActions>
    </Dialog>
  );
}
