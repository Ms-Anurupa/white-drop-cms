const baseUrl = import.meta.env.VITE_API_URL_PROD;

const resolveUrl = (image, folder = "") => {
  if (!image) return "";

  // File object
  if (image instanceof File) {
    return URL.createObjectURL(image);
  }

  // Must be a string after this
  if (typeof image !== "string") {
    // console.warn("resolveUrl received:", image);
    return "";
  }

  if (image.startsWith("blob:")) return image;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const folderPath = folder
    ? `${folder.replace(/^\/|\/$/g, "")}/`
    : "";

  return `${baseUrl}/${folderPath}${image}`;
};

export default resolveUrl;