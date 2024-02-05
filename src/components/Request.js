const apiUrl = process.env.URL;

export const getHotel = async (searchTerm) => {
  try {
    const response = await fetch(`${apiUrl}${searchTerm}`);

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response from server:", data);
    return data;
  } catch (error) {
    console.error("Error:", error.message);
  }
};
