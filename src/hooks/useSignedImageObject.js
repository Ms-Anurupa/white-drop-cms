/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import deliveryPartnerStore from "../zustand/Store/deliveryPartnerStore";

const useSignedImageObject = (images = {}, folderName) => {
  const getSignedUrl = deliveryPartnerStore((state) => state.getSignedUrl);

  const [signedImages, setSignedImages] = useState({});

  // Cache signed urls so same image never calls API twice
  const cacheRef = useRef(new Map());

  // Stable dependency
  const imageKey = JSON.stringify(images);

  useEffect(() => {
    let cancelled = false;

    const loadImages = async () => {
      const result = {};

      await Promise.all(
        Object.entries(images).map(async ([key, value]) => {
          if (!value) {
            result[key] = "";
            return;
          }

          // File selected from input
          if (value instanceof File) {
            result[key] = URL.createObjectURL(value);
            return;
          }

          // Already a blob
          if (typeof value === "string" && value.startsWith("blob:")) {
            result[key] = value;
            return;
          }

          // Already signed url
          if (
            typeof value === "string" &&
            (value.startsWith("http://") || value.startsWith("https://"))
          ) {
            result[key] = value;
            return;
          }

          // Handle array
          // Handle multiple images
          if (Array.isArray(value)) {
            const urls = await Promise.all(
              value.map(async (fileName) => {
                if (!fileName) return "";

                if (cacheRef.current.has(fileName)) {
                  return cacheRef.current.get(fileName);
                }

                try {
                  const url = await getSignedUrl(fileName, folderName);
                  cacheRef.current.set(fileName, url);
                  return url;
                } catch (err) {
                  console.error(err);
                  return "";
                }
              }),
            );

            result[key] = urls.filter(Boolean);
            return;
          }

          // Handle single image
          const fileName = value;

          if (!fileName) {
            result[key] = "";
            return;
          }

          if (cacheRef.current.has(fileName)) {
            result[key] = cacheRef.current.get(fileName);
            return;
          }

          try {
            const url = await getSignedUrl(fileName, folderName);

            cacheRef.current.set(fileName, url);

            result[key] = url;
          } catch (err) {
            console.error(err);
            result[key] = "";
          }
        }),
      );

      if (!cancelled) {
        setSignedImages((prev) => {
          const prevKey = JSON.stringify(prev);
          const nextKey = JSON.stringify(result);

          if (prevKey === nextKey) return prev;

          return result;
        });
      }
    };

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [imageKey, folderName]);

  return signedImages;
};

export default useSignedImageObject;
