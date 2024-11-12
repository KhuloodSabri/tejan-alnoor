import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3033/supervisor/students"
    : "https://5nvqhwbweydlc2yfyoqca5dyie0sonpg.lambda-url.eu-north-1.on.aws/students";

const ADMIN_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3033/admin/students"
    : "https://dtoo4lhm5ojwgql5xfxpmo6nru0alhkp.lambda-url.eu-north-1.on.aws/students";

export const useStudents = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const url = `${BASE_URL}`;

      try {
        const response = await axios.get(url);

        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    data,
    loading,
  };
};

export const useStudentSummary = (studentId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const url = `${BASE_URL}/${studentId}`;

      try {
        const response = await axios.get(url);

        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  return {
    data,
    loading,
  };
};

export const updateStudentProgress = async (studentId, updates) => {
  const url = `${BASE_URL}/${studentId}`;
  const response = await axios.put(url, {
    ...updates,
    studentID: studentId,
  });

  if (response.status !== 200) {
    throw new Error("Failed to update student progress");
  }

  return response.data;
};

export const exportStudentProgress = async (token) => {
  const url = `${ADMIN_BASE_URL}/exportProgress`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error("Failed to export student progress");
  }

  return response.data;
};

export const exportDetailedStudentProgress = async (token, year, semester) => {
  const url = `${ADMIN_BASE_URL}/exportProgressDetailed?year=${year}&semester=${semester}`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error("Failed to export student progress");
  }

  return response.data;
};

export const createStudents = async (token, students) => {
  const url = `${ADMIN_BASE_URL}`;
  const response = await axios.post(url, students, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error("Failed to create students");
  }

  return response.data;
};

export const replaceStudents = async (token, students) => {
  const url = `${ADMIN_BASE_URL}`;
  const response = await axios.put(url, students, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error("Failed to update students");
  }

  return response.data;
};

export const useStudentsSummariesFolderUrl = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const token = await getAccessTokenSilently();

        const url = `${ADMIN_BASE_URL}/summariesFolder`;
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status !== 200) {
          throw new Error("Failed to get summaries folder");
        }

        setData(
          `https://drive.google.com/drive/folders/${response.data.folderId}`
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAccessTokenSilently]);

  return {
    data,
    loading,
  };
};

export const useStudentsByName = (name) => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!name) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchData = async () => {
      try {
        const token = await getAccessTokenSilently();

        const url = `${ADMIN_BASE_URL}?name=${encodeURIComponent(name)}`;
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status !== 200) {
          throw new Error("Failed to search students");
        }

        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAccessTokenSilently, name]);

  return {
    data,
    loading,
  };
};

export const useStudentDetails = (studentId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const url = `${ADMIN_BASE_URL}/${studentId}`;
      const token = await getAccessTokenSilently();

      try {
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAccessTokenSilently, studentId]);

  return {
    data,
    loading,
  };
};

export const useUpdateStudent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { getAccessTokenSilently } = useAuth0();

  const updateStudent = useCallback(
    async (studentId, updates) => {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const url = `${ADMIN_BASE_URL}/${studentId}`;
      const response = await axios.put(url, updates, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200) {
        setLoading(false);
        setError(true);
      }

      setData(response.data);
      setLoading(false);
      setError(false);
    },
    [getAccessTokenSilently]
  );

  return {
    updateStudent,
    data,
    loading,
    error,
  };
};
