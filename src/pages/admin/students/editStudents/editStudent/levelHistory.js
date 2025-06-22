import React, { useMemo } from "react";

import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { compareSemesters } from "../../../../../utils/semesters";
import DeleteIcon from "@mui/icons-material/Delete";
import _ from "lodash";
import ChangeLevelDialog from "./changeLevelDialog";
import { getLevelMemorizingDirection } from "../../../../../utils/levels";

export default function LevelHistory({
  onAddConfirm,
  onDeleteConfirm,
  levels,
  student,
  formik,
  currentSemesterDetails,
}) {
  const formikValues = formik.values;
  const [changeLevelDialogOpen, setChangeLevelDialogOpen] =
    React.useState(false);

  const levelsMap = _.keyBy(levels, "levelID");

  const willDeletingChangeCauseLosingProgress = useMemo(() => {
    if (!formikValues.levelChanges?.length) {
      return false;
    }

    const lastChange =
      formikValues.levelChanges[formikValues.levelChanges.length - 1];

    // change was added now
    if (lastChange.memorizingProgress === undefined) {
      return false;
    }

    if (compareSemesters(currentSemesterDetails, lastChange.semester) < 0) {
      // change did not yet take effect
      return false;
    }

    let prevChangeSameDirIndex = -1;

    for (let i = (student.levelChanges?.length ?? 0) - 1; i >= 0; i--) {
      if (
        getLevelMemorizingDirection(student.levelChanges[i].fromLevelID) ===
        getLevelMemorizingDirection(lastChange.toLevelID)
      ) {
        prevChangeSameDirIndex = i;
      }
    }

    if (
      (prevChangeSameDirIndex === -1 && student.memorizingProgress > 0) ||
      (prevChangeSameDirIndex !== -1 &&
        student.levelChanges[prevChangeSameDirIndex].memorizingProgress !==
          student.memorizingProgress)
    ) {
      return true;
    }

    return false;
  }, [
    currentSemesterDetails,
    formikValues.levelChanges,
    student.levelChanges,
    student.memorizingProgress,
  ]);

  return (
    <Stack>
      <Typography variant="body1" fontSize={17}>
        التغييرات على مستوى الطالب{" "}
      </Typography>
      {!formikValues.levelChanges?.length && (
        <Typography variant="caption">
          لم يغير الطالب مستواه منذ انضمامه
        </Typography>
      )}
      {!!formikValues.levelChanges?.length && (
        <Box width="fit-content">
          <List>
            <ListItem>
              <ListItemText
                primary={`${
                  levelsMap[formikValues.levelChanges[0].fromLevelID].levelName
                } منذ الانضمام`}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </ListItem>
            {formikValues.levelChanges.map((change, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  index === formikValues.levelChanges.length - 1 &&
                  compareSemesters(currentSemesterDetails, change.semester) <=
                    0 && (
                    <Tooltip
                      title={
                        willDeletingChangeCauseLosingProgress
                          ? "لا يمكن حذف تغيير من أو إلى جزء عم اذا كان الطالب حقق إانجازا بعد هذا التغيير"
                          : null
                      }
                    >
                      <Box>
                        <IconButton
                          edge="end"
                          size="small"
                          color="error"
                          disabled={willDeletingChangeCauseLosingProgress}
                          onClick={() => {
                            onDeleteConfirm(
                              change.semester.year,
                              change.semester.semester,
                              change.semester.month
                            );
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Box>
                    </Tooltip>
                  )
                }
              >
                <ListItemText
                  primary={`${levelsMap[change.toLevelID].levelName}
                    ابتداء من ${change.semester.year} - فصل ${
                    change.semester.semester
                  } - شهر ${change.semester.month}`}
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Box>
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            setChangeLevelDialogOpen(true);
          }}
        >
          إضافة تغيير
        </Button>
      </Box>
      <ChangeLevelDialog
        open={changeLevelDialogOpen}
        onClose={() => setChangeLevelDialogOpen(false)}
        onConfirm={onAddConfirm}
        levels={levels}
        student={student}
        formik={formik}
        currentSemesterDetails={currentSemesterDetails}
        defaultNewLevelId={formikValues.levelID}
      />
    </Stack>
  );
}
