import React from "react";
import axios from "axios";

async function Home() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await axios.get(`${baseUrl}/api/realEstateTrends`);
    return <div>{JSON.stringify(response.data)}</div>;
  } catch (error) {
    console.error("Error fetching data:", error);
    return <div>Error loading data: {error.message}</div>;
  }
}

export default Home;
