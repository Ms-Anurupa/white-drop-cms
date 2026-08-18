const baseUrl = import.meta.env.VITE_API_URL_PROD;
const bucketName = import.meta.env.VITE_FIREBASE_BUCKETNAME; 

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


const resolveFirebaseUrl = ({folderName, fileName, token = null}) => {
  console.log(folderName)
  console.log(fileName)
  // 1. Combine the folder and file name into a single path
  const fullPath = `${folderName}/${fileName}`;

  // 2. URL-encode the path (this handles turning '/' into '%2F')
  const encodedPath = encodeURIComponent(fullPath);

  
  if (!bucketName) {
    throw new Error('bucketName is not defined in your environment variables');
  }

  // 4. Construct the base public URL
  let url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;

  // 5. If a token was provided (for private files), append it to the URL
  if (token) {
    url += `&token=${token}`;
  }

  return url;
};

export { resolveUrl, resolveFirebaseUrl};