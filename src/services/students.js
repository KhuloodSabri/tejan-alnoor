import { useEffect, useState } from "react";
import axios from "axios";

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

export const useStudent = (studentId) => {
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
