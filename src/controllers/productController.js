import * as productService from "../services/productServices.js";
//import asyncHandler from "../utils/errorHandler.js";


export const createProduct = async (req, res) => {
    try {
        const productData = {
            ...req.body,
            seller: req.user.id
        };
        const product = await productService.createProduct(productData);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await productService.getProducts(req.query);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this product' });
        }

        const updatedProduct = await productService.updateProduct(
            req.params.id,
            req.body
        );
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log('Product seller', product.seller.toString());
        console.log('User ID', req.user.id);
        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this product' });
        }

        await productService.deleteProduct(req.params.id);
        res.status(204).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};