import React, { useCallback, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { getNegativeProgressPrefix, getPositiveProgressPrefix } from "./utils";
import { Autocomplete, Box, colors, Stack, Typography } from "@mui/material";
import { getCommulativeAyahDetails, suar } from "../../utils/surah";
import FuzzySearch from "fuzzy-search";
import { normalizeString } from "../../utils/string";
import AyahInput from "./ayahInput";
import { updateStudentProgress } from "../../services/students";
import LoadingButton from "@mui/lab/LoadingButton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PageInput from "./pageInput";

export default function RevisitProgressDialog({
  student,
  mode,
  open,
  onClose,
  onSubmit,
}) {
  const [fromValue, setFromValue] = useState();
  const [toValue, setToValue] = useState();
  const [fromErrorMessage, setFromErrorMessage] = useState();
  const [toErrorMessage, setToErrorMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const onChange = useCallback(() => setShowError(false), []);

  const handleSubmit = async () => {
    if (fromErrorMessage || toErrorMessage) {
      setShowError(true);
      return;
    }

    let response = undefined;
    setLoading(true);
    if (mode === "add") {
      response = await updateStudentProgress(student.studentID, {
        revisitProgress: [...student.revisitProgress, [fromValue, toValue]],
      });
    } else {
      const oldProgress = student.revisitProgress;
      let newProgress = [];

      if (oldProgress.length === 0) {
        return;
      }

      // deleted range is completely outside the current ranges
      if (
        toValue < oldProgress[0][0] ||
        fromValue > oldProgress[oldProgress.length - 1][1]
      ) {
        return;
      }

      const part1LastIndex = oldProgress.findLastIndex(
        (progress) => progress[1] < fromValue
      );

      //   range starts before the deleted range and ends within it
      const partialRange1Index = oldProgress.findIndex(
        (progress) => progress[0] < fromValue && progress[1] >= fromValue
      );

      //   range starts within the deleted range and ends after it
      const partialRange2Index = oldProgress.findLastIndex(
        (progress) => progress[0] <= toValue && progress[1] > toValue
      );

      //   last range that falls completely withen the deleted range
      const part2FirstIndex = oldProgress.findLastIndex(
        (progress) => progress[0] > toValue
      );

      if (part1LastIndex >= 0) {
        newProgress = oldProgress.slice(0, part1LastIndex + 1);
      }

      if (partialRange1Index >= 0) {
        newProgress = [
          ...newProgress,
          [oldProgress[partialRange1Index][0], fromValue - 1],
        ];
      }

      if (
        partialRange2Index >= 0 &&
        partialRange2Index !== partialRange1Index
      ) {
        newProgress = [
          ...newProgress,
          [toValue + 1, oldProgress[partialRange2Index][1]],
        ];
      }

      if (part2FirstIndex >= 0) {
        newProgress = [...newProgress, ...oldProgress.slice(part2FirstIndex)];
      }

      response = await updateStudentProgress(student.studentID, {
        revisitProgress: newProgress,
      });
    }

    onSubmit(response.revisitProgress);
    setFromValue(null);
    setToValue(null);
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Stack rowGap={2} justifyContent="center" alignItems="center">
          <Typography fontWeight={600} variant="h6">
            {mode === "add" && (
              <CheckCircleIcon
                sx={{
                  verticalAlign: "text-bottom",
                  color: colors.teal["300"],
                  mr: 1,
                }}
              />
            )}
            {mode === "remove" && (
              <CancelIcon
                sx={{
                  verticalAlign: "text-bottom",
                  color: colors.red["300"],
                  mr: 1,
                }}
              />
            )}
            {mode === "add"
              ? getPositiveProgressPrefix(student)
              : getNegativeProgressPrefix(student)}
            المراجعة
          </Typography>
          {student.progressUnit === "ayah" ? (
            <AyahInput
              label="من"
              maxValue={toValue}
              absoluteMinValue={student.start}
              absoluteMaxValue={student.end}
              setValue={setFromValue}
              setErrorMessage={setFromErrorMessage}
              onChange={onChange}
            />
          ) : (
            <PageInput
              label="من"
              maxValue={toValue}
              absoluteMinValue={student.start}
              absoluteMaxValue={student.end}
              setValue={setFromValue}
              setErrorMessage={setFromErrorMessage}
              onChange={onChange}
            />
          )}
          {student.progressUnit === "ayah" ? (
            <AyahInput
              label="إلى"
              minValue={fromValue}
              absoluteMinValue={student.start}
              absoluteMaxValue={student.end}
              setValue={setToValue}
              setErrorMessage={setToErrorMessage}
              onChange={onChange}
            />
          ) : (
            <PageInput
              label="إلى"
              minValue={fromValue}
              absoluteMinValue={student.start}
              absoluteMaxValue={student.end}
              setValue={setToValue}
              setErrorMessage={setToErrorMessage}
              onChange={onChange}
            />
          )}
        </Stack>
        {showError && (
          <Stack mt={2} direction="row" justifyContent="flex-end">
            <Typography color={colors.red["300"]} variant="body1">
              {fromErrorMessage || toErrorMessage}
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          إلغاء
        </Button>
        <LoadingButton
          variant="contained"
          onClick={handleSubmit}
          loading={loading}
          sx={{ boxShadow: "none" }}
        >
          {mode === "add" ? "حفظ الإضافة" : "حفظ الإزالة"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
