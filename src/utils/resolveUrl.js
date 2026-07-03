const baseUrl = import.meta.env.VITE_API_URL_PROD;
const resolveUrl = (image) =>{
    const result = `${baseUrl}/${image}`
    return result;
}
export default resolveUrl