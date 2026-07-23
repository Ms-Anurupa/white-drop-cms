/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import deliveryPartnerStore from "../zustand/Store/deliveryPartnerStore";

const useSignedImages = (
  items = [],
  imageField,
  folderName,
  idField = "id",
) => {
  const [imageUrls, setImageUrls] = useState({});

  const getSignedUrl = deliveryPartnerStore(
    (state) => state.getSignedUrl,
  );

  useEffect(() => {
    if (!items?.length) {
      setImageUrls({});
      return;
    }

    let cancelled = false;

    const loadImages = async () => {
      const urls = {};

      await Promise.all(
        items.map(async (item) => {
          let file = item?.[imageField];

          if (Array.isArray(file)) {
            file = file[0];
          }

          if (!file) return;

          if (
            typeof file === "string" &&
            (file.startsWith("blob:") ||
              file.startsWith("http://") ||
              file.startsWith("https://"))
          ) {
            urls[item[idField]] = file;
            return;
          }

          try {
            urls[item[idField]] = await getSignedUrl(
              file,
              folderName,
            );
          } catch (err) {
            console.error(err);
          }
        }),
      );

      if (!cancelled) {
        setImageUrls(urls);
      }
    };

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [items, imageField, folderName]);

  return imageUrls;
};

export default useSignedImages;