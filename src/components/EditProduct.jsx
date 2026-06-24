import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import productDataStore from "../zustand/Store/productDataStore";
// import ProductForm from "./ProductForm";
import { toast } from "react-toastify";
import { useConfirm } from "./ConfirmProvider";
import AddProduct from "./AddProduct";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { confirm } = useConfirm();

  const getProductById = productDataStore((state) => state.getProductById);
  const updateProduct = productDataStore((state) => state.updateProduct);

  const [productList, setProductList] = useState({
    product_name: "",
    product_description: "",
    catch_phrase: "",
    images: [],
    variants: [],
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await getProductById(id);

      setProductList({
        product_name: res.product_name || "",
        product_description: res.product_description || "",
        catch_phrase: res.catch_phrase || "",
        images: res.images || [],
        variants: res.variants || [],
      });
    } catch {
      toast.error("Failed to fetch product");
    }
  };

  const handleUpdateProduct = async () => {
    try {
      const confirmMessage = await confirm({
        title: "Update Product",
        message: "Save changes to this product?",
      });

      if (!confirmMessage) return;

      const formData = new FormData();

      formData.append("productData", JSON.stringify(productList));

      productList.images.forEach((file) => {
        formData.append("product_images", file);
      });

      await updateProduct(id, formData);

      toast.success("Product updated successfully");

      navigate("/dashboard/product");
    } catch {
      toast.error("Product update failed");
    }
  };

  return (
    <AddProduct
      mode="edit"
      productList={productList}
      setProductList={setProductList}
      onSubmit={handleUpdateProduct}
    />
  );
};

export default EditProduct;