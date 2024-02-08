const apiUrl = 'http://127.0.0.1:8000'


export const getHotel = async (searchTerm) => {
  console.log("Data:", searchTerm);

  try {
    if (!apiUrl) {
      throw new Error("API URL is not defined");
    }

    if (!searchTerm) {
      throw new Error("Search term is missing");
    }

    const response = await fetch(`${apiUrl}/location?location=${searchTerm}`);

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response from server:", data);
    return data;
  } catch (error) {
    console.error("Error:", error.message);
    throw error; 
  }
};
