const bucketName = import.meta.env.VITE_FIREBASE_BUCKETNAME;

const getProductUrl = (fileName) => {
  if (!fileName) return null;

  const encodedPath = encodeURIComponent(`productImages/${fileName}`);

  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;
};

export { getProductUrl };
