import React from "react";

import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddSemesterDialog from "./addSemesterDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import _ from "lodash";

export default function SemestersStatusHistory({
  formik,
  targetSemesters,
  title,
  noHistoryMsg,
  onChange,
  semestersWithAnotherStatus,
}) {
  const [addSemesterDialogOpen, setAddSemesterDialogOpen] =
    React.useState(false);

  return (
    <Stack>
      <Typography variant="body1" fontSize={17}>
        {title}{" "}
      </Typography>
      {!formik.values[targetSemesters].length && (
        <Typography variant="caption">{noHistoryMsg}</Typography>
      )}
      {!!formik.values[targetSemesters].length && (
        <Box width="fit-content">
          <List>
            {formik.values[targetSemesters].map((semester, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    color="error"
                    onClick={() => {
                      const newSemesters = formik.values[
                        targetSemesters
                      ].filter(
                        (s) =>
                          s.year !== semester.year ||
                          s.semester !== semester.semester
                      );

                      formik.setFieldValue(targetSemesters, newSemesters);
                      onChange?.(targetSemesters, newSemesters);
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${semester.year} - الفصل ${semester.semester}`}
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
            setAddSemesterDialogOpen(true);
          }}
        >
          إضافة فصل
        </Button>
      </Box>
      <AddSemesterDialog
        open={addSemesterDialogOpen}
        onClose={() => setAddSemesterDialogOpen(false)}
        onAdd={(semester, setErrorMessage) => {
          if (
            semestersWithAnotherStatus?.find(
              (s) =>
                s.year === semester.year && s.semester === semester.semester
            )
          ) {
            setErrorMessage?.(
              "لا يمكن إضافة فصل له حالة مختلفة - الرجاء إزالة الفصل من القائمة الأخرى أولا"
            );
            return;
          }

          setErrorMessage?.(null);
          const exists = formik.values[targetSemesters].find(
            (s) => s.year === semester.year && s.semester === semester.semester
          );

          if (!exists) {
            const newSemesters = _.orderBy(
              [...formik.values[targetSemesters], semester],
              ["year", "semester"],
              ["asc", "asc"]
            );

            formik.setFieldValue(targetSemesters, newSemesters);

            onChange?.(targetSemesters, newSemesters);
          }

          setAddSemesterDialogOpen(false);
        }}
      />
    </Stack>
  );
}
