import React, { useCallback, useEffect } from "react";
import FileUploadButton from "../../../../components/fileUploadButton";
import Papa from "papaparse";
import { Alert, Box, Divider, Stack } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { createStudents } from "../../../../services/students";
import ImportSample from "./importSample";
import ImportResult from "./importResult";

const cleanPhoneNumber = (phoneNumber) => {
  return `${phoneNumber}`.replace(
    /[\s\u0000-\u001F\u007F-\u00A0\u200B-\u200D\u200E-\u206F]/g,
    ""
  );
};

const formatPhoneNumber = (phoneNumber) => {
  // for scinetific notation
  const hasNonDigits = `${phoneNumber}`
    .split("")
    .find((letter) => isNaN(Number(letter)));

  return hasNonDigits ? `${Number(phoneNumber)}` : `${phoneNumber}`;
};

export default function ImportStudents() {
  const [error, setError] = React.useState(false);
  const [validationErrorMessages, setValidationErrorMessages] = React.useState(
    []
  );

  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [submittedSuccessfully, setSubmittedSuccessfully] =
    React.useState(false);
  const [submitResult, setSubmitResult] = React.useState();
  const fileInput = React.useRef(null);

  const { getAccessTokenSilently } = useAuth0();

  const validateData = useCallback((data) => {
    const errors = [];
    data.forEach((row, index) => {
      if (!row["اسم الطالب/ة"]) {
        errors.push(`الطالب/ة الصف ${index + 2} لا يحتوي على اسم`);
      }

      if (!row["الجنس"]) {
        errors.push(
          `الطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
            index + 2
          } لا يحتوي على الجنس`
        );
      } else if (row["الجنس"] !== "ذكر" && row["الجنس"] !== "أنثى") {
        errors.push(
          `الطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
            index + 2
          } لديه جنس غير صحيح - يجب أن يكون ذكر أو أنثى`
        );
      }

      if (!row["اسم المشرف/ة"]) {
        errors.push(
          `الطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
            index + 2
          } لا يحتوي على اسم المشرف/ة`
        );
      }

      if (!row["المستوى"]) {
        errors.push(
          `الطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
            index + 2
          } لا يحتوي على المستوى`
        );
      }

      if (!row["الدفعة"]) {
        errors.push(
          `الطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
            index + 2
          } لا يحتوي على الدفعة`
        );
      } else if (isNaN(Number(row["الدفعة"]))) {
        errors.push(
          `دفعة الطالب ${row["اسم الطالب/ة"]} في الصف ${index + 2} ليست رقما`
        );
      }

      if (!row["سنة الانضمام"]) {
        errors.push(
          `الطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
            index + 2
          } لا يحتوي على سنة الانضمام`
        );
      } else {
        const year = Number(row["سنة الانضمام"]);
        if (isNaN(year)) {
          errors.push(
            `سنة الانضمام للطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
              index + 2
            } ليست رقما`
          );
        } else if (year < 2020) {
          errors.push(
            `الطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
              index + 2
            } لديه سنة انضمام قديمة`
          );
        }
      }

      if (!row["فصل الانضمام"]) {
        errors.push(
          `الطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
            index + 2
          } لا يحتوي على فصل الانضمام`
        );
      } else {
        const semester = Number(row["فصل الانضمام"]);
        if (isNaN(semester)) {
          errors.push(
            `فصل الانضمام للطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
              index + 2
            } ليست رقما`
          );
        } else if (semester < 1 || semester > 3) {
          errors.push(
            `الطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
              index + 2
            } لديه فصل انضمام غير صحيح - يجب أن يكون 1 أو 2 أو 3`
          );
        }
      }

      if (!row["شهر الانضمام"]) {
        errors.push(
          `الطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
            index + 2
          } لا يحتوي على شهر الانضمام`
        );
      } else {
        const month = Number(row["شهر الانضمام"]);
        if (isNaN(month)) {
          errors.push(
            `شهر الانضمام للطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
              index + 2
            } ليست رقما`
          );
        } else {
          const maxMonth = Number(row["فصل الانضمام"]) === 3 ? 1 : 3;
          const hint =
            Number(row["فصل الانضمام"]) === 3
              ? "هناك شهر واحد بالفصل الصيفي"
              : "هناك 3 أشهر بالفصل العادي";

          if (month < 1 || month > maxMonth) {
            errors.push(
              `الطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
                index + 2
              } لديه شهر انضمام غير صحيح - ${hint}`
            );
          }
        }
      }

      if (row["رقم الهاتف"]) {
        let phoneNumber = cleanPhoneNumber(row["رقم الهاتف"]);
        if (isNaN(Number(phoneNumber))) {
          errors.push(
            `رقم الهاتف للطالب/ة ${phoneNumber} في الصف ${index + 2} ليست رقما`
          );
        } else {
          phoneNumber = formatPhoneNumber(phoneNumber);

          if (
            `${phoneNumber}`.length !== 10 &&
            `${phoneNumber}`.length !== 12 &&
            `${phoneNumber}`.length !== 14
          ) {
            errors.push(
              `رقم الهاتف للطالب/ة ${row["اسم الطالب/ة"]} في الصف ${
                index + 2
              } يجب أن يكون 7 أرقام أو 12 أو 14 رقما (مع الكود الدولي)`
            );
          }
        }
      }
    });

    const namesCount = data.reduce((acc, row) => {
      if (!row["اسم الطالب/ة"]?.trim()) return acc;

      return {
        ...acc,
        [row["اسم الطالب/ة"]]: (acc[row["اسم الطالب/ة"]] || 0) + 1,
      };
    }, {});

    Object.entries(namesCount).forEach(([row, count]) => {
      if (count > 1) {
        errors.push(`الطالب/ة ${row} مكرر في الملف`);
      }
    });

    const phoneNumbersCount = data.reduce((acc, row) => {
      if (!`${row["رقم الهاتف"] ?? ""}`?.trim()) return acc;

      return {
        ...acc,
        [row["رقم الهاتف"]]: (acc[row["رقم الهاتف"]] || 0) + 1,
      };
    }, {});

    Object.entries(phoneNumbersCount).forEach(([phoneNumber, count]) => {
      if (count > 1) {
        errors.push(`رقم الهاتف ${phoneNumber} مكرر في الملف`);
      }
    }, {});

    return errors;
  }, []);

  const mapRowsToStudents = useCallback((rows) => {
    return rows.map((row) => {
      return {
        studentName: row["اسم الطالب/ة"],
        gender: row["الجنس"],
        supervisorName: row["اسم المشرف/ة"],
        level: row["المستوى"],
        groupNumber: row["الدفعة"],
        joinYear: row["سنة الانضمام"],
        joinSemester: row["فصل الانضمام"],
        joinMonth: row["شهر الانضمام"],
        phoneNumber: formatPhoneNumber(cleanPhoneNumber(row["رقم الهاتف"])),
      };
    });
  }, []);

  useEffect(() => {
    if (file) {
      Papa.parse(file, {
        header: true, // Set to true if the first row contains headers
        dynamicTyping: (field) => {
          if (field === "رقم الهاتف") {
            return false;
          }

          return true;
        },
        complete: async function (results) {
          const errors = validateData(results.data);
          if (errors.length > 0) {
            setValidationErrorMessages(errors);
            setError(true);
          } else {
            const token = await getAccessTokenSilently({});
            const students = mapRowsToStudents(results.data);
            try {
              setSubmitResult({
                ...(await createStudents(token, students)),
                inputStudents: students,
              });
              setSubmittedSuccessfully(true);
            } catch (error) {
              console.error(error);
              setError(true);

              if (
                typeof error.response === "object" &&
                error.response &&
                error.response.data &&
                error.response.data.validationErrors
              ) {
                setValidationErrorMessages(
                  error?.response?.data?.validationErrors ?? []
                );
              } else {
                setValidationErrorMessages(["حدث خطأ غير معروف"]);
              }
            }
          }

          setLoading(false);
        },
        error: function (error) {
          console.error(error.message);
          setError(true);
          setLoading(false);
        },
      });

      if (fileInput.current) {
        fileInput.current.value = "";
      }
    }
  }, [file, validateData, getAccessTokenSilently, mapRowsToStudents]);

  const handleFileUpload = useCallback((event) => {
    setLoading(true);
    setError(false);
    setValidationErrorMessages([]);
    const files = event.target.files; // Get the file
    if (files.length === 0) return; // If no file is selected, return
    setFile(files[0]);
  }, []);

  if (submittedSuccessfully) {
    return <ImportResult {...submitResult} />;
  }

  return (
    <Stack spacing={1}>
      <FileUploadButton
        handleUpload={handleFileUpload}
        loading={loading}
        ref={fileInput}
      />

      <ImportSample />

      <Stack spacing={1} mt={4}>
        {error && (
          <Alert severity="error">
            لم ينجح تحميل الملف. يرجى التأكد من صحة الملف ومحاولة تحميله مرة
            أخرى
            <Divider sx={{ my: 2 }} />
            {validationErrorMessages.map((message, index) => (
              <Box key={index}>{message}</Box>
            ))}
          </Alert>
        )}
      </Stack>
    </Stack>
  );
}
