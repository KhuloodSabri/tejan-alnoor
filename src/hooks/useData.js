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
      const url = `${BASE_URL}?token=${encodeURIComponent(getToken())}`;

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
      const url = `${BASE_URL}/${studentId}?token=${encodeURIComponent(
        getToken()
      )}`;

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
