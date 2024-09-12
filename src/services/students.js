import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL =
  "https://5nvqhwbweydlc2yfyoqca5dyie0sonpg.lambda-url.eu-north-1.on.aws/students";

const getToken = () => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  return params.get("token");
};

export const useStudents = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const url = `${BASE_URL}`;

      try {
        const response = await axios.get(url);
        console.log("response", response);
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
        console.log("response", response);
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

  console.log("PUT response", response);

  if (response.status !== 200) {
    throw new Error("Failed to update student progress");
  }

  return response.data;
};