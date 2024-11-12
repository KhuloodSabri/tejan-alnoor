import { Autocomplete, Button, TextField } from "@mui/material";
import React, { useCallback } from "react";
import { useSupervisorsByName } from "../../../../../services/supervisors";
import _ from "lodash";
import AddIcon from "@mui/icons-material/Add";

export default function SupervisorsSearch({ value, setValue }) {
  const [inputValue, setInputValue] = React.useState(
    value?.supervisorName ?? ""
  );

  const { data: supervisors, loading } = useSupervisorsByName(inputValue);
  const [unsubmittedInputValue, setUnsubmittedInputValue] =
    React.useState(false);

  const onInputChange = useCallback(
    _.debounce((newInputValue) => {
      setInputValue(newInputValue);
      setUnsubmittedInputValue(false);
    }, 500),
    []
  );

  return (
    <Autocomplete
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.supervisorName
      }
      filterOptions={(options) => {
        if (
          !options?.length &&
          !loading &&
          !!inputValue?.length &&
          !unsubmittedInputValue
        ) {
          return [
            {
              supervisorID: null,
              supervisorName: inputValue,
            },
          ];
        }

        return options;
      }}
      options={supervisors ?? []}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={inputValue}
      loading={loading}
      noOptionsText="لا يوجد نتائج مطابقة"
      onChange={(event, newValue) => {
        setValue(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setUnsubmittedInputValue(true);
        onInputChange(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="المشرفـ/ـة" fullWidth size="small" />
      )}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        if (option.supervisorID) {
          return (
            <li key={key} {...optionProps}>
              {option.supervisorName}
            </li>
          );
        }

        return (
          <li key={key} {...optionProps}>
            <Button startIcon={<AddIcon />}>
              إضافة ({option.supervisorName})
            </Button>
          </li>
        );
      }}
    />
  );
}
