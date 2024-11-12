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

export default function SemestersHistory({
  formik,
  targetSemesters,
  title,
  noHistoryMsg,
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
        onAdd={(semester) => {
          const exists = formik.values[targetSemesters].find(
            (s) => s.year === semester.year && s.semester === semester.semester
          );

          if (!exists) {
            formik.setFieldValue(
              targetSemesters,
              _.orderBy(
                [...formik.values[targetSemesters], semester],
                ["year", "semester"],
                ["asc", "asc"]
              )
            );
          }

          setAddSemesterDialogOpen(false);
        }}
      />
    </Stack>
  );
}
