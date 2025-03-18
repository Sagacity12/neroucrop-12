import Product from "../models/productmodel.js";

export const createProduct = async (productData) => {
    return Product.create(productData);
};

export const getProducts = async (filter = {}) => {
    return Product.find(filter).populate('seller', 'username email');
};

export const getProductById = async (id) => {
    return Product.findById(id)
};

export const updateProduct = async (id, updateData) => {
    return Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

export const deleteProduct = async (id) => {
    return Product.findByIdAndDelete(id);
};
