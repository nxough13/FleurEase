import React, { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import MetaData from '../Layout/MetaData';
import Sidebar from './Sidebar';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';

const productSchema = yup.object().shape({
    name: yup.string()
        .required('Product name is required')
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name cannot exceed 100 characters'),
    price: yup.number()
        .required('Price is required')
        .positive('Price must be positive')
        .min(1, 'Price must be at least ₱1'),
    description: yup.string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description cannot exceed 1000 characters'),
    category: yup.string()
        .required('Please select a category'),
    stock: yup.number()
        .required('Stock is required')
        .integer('Stock must be a whole number')
        .min(0, 'Stock cannot be negative')
});

const NewProduct = () => {
    const [images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(productSchema)
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/categories/active`);
            setCategories(data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const onChange = (e) => {
        const files = Array.from(e.target.files);

        if (files.length + images.length > 10) {
            toast.error('Maximum 10 images allowed');
            return;
        }

        setImages([]);
        setImagesPreview([]);

        files.forEach(file => {
            const reader = new FileReader();

            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview(oldArray => [...oldArray, reader.result]);
                    setImages(oldArray => [...oldArray, reader.result]);
                }
            };

            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagesPreview.filter((_, i) => i !== index);
        
        setImages(newImages);
        setImagesPreview(newPreviews);

        if (mainImageIndex === index) {
            setMainImageIndex(0);
        } else if (mainImageIndex > index) {
            setMainImageIndex(mainImageIndex - 1);
        }
    };

    const onSubmit = async (data) => {
        if (images.length === 0) {
            toast.error('Please upload at least one product image');
            return;
        }

        setLoading(true);

        const formData = {
            name: data.name,
            price: data.price,
            description: data.description,
            category: data.category,
            stock: data.stock,
            seller: 'FleurEase',
            images: images,
            mainImage: mainImageIndex
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            await axios.post(
                `${import.meta.env.VITE_API}/admin/product/new`,
                formData,
                config
            );

            toast.success('Product created successfully! 🌸');
            navigate('/admin/products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating product');
            setLoading(false);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <Fragment>
            <MetaData title={'Create New Product'} />
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div style={{
                marginLeft: sidebarOpen ? '250px' : '0',
                transition: 'margin-left 0.3s ease',
                padding: '20px',
                minHeight: '100vh',
                backgroundColor: '#f8f9fa'
            }}>
                <div className="row">
                    <div className="col-12 col-md-10 mx-auto">
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            padding: '30px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            <h1 style={{ color: '#6b46c1', fontWeight: 'bold', marginBottom: '30px' }}>
                                <i className="fa fa-plus-circle mr-2"></i>
                                Create New Product
                            </h1>

                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="row">
                                    {/* Product Name */}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label style={{ fontWeight: '500', color: '#333' }}>
                                                Product Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                {...register('name')}
                                                placeholder="e.g., Red Rose Bouquet"
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    border: errors.name ? '1px solid #dc3545' : '1px solid #ddd'
                                                }}
                                            />
                                            {errors.name && (
                                                <div className="invalid-feedback d-block">
                                                    <i className="fa fa-exclamation-circle mr-1"></i>
                                                    {errors.name.message}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label style={{ fontWeight: '500', color: '#333' }}>
                                                Price (₱) <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                                                {...register('price')}
                                                placeholder="0.00"
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    border: errors.price ? '1px solid #dc3545' : '1px solid #ddd'
                                                }}
                                            />
                                            {errors.price && (
                                                <div className="invalid-feedback d-block">
                                                    <i className="fa fa-exclamation-circle mr-1"></i>
                                                    {errors.price.message}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label style={{ fontWeight: '500', color: '#333' }}>
                                                Category <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                                                {...register('category')}
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    border: errors.category ? '1px solid #dc3545' : '1px solid #ddd'
                                                }}
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(category => (
                                                    <option key={category._id} value={category.name}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.category && (
                                                <div className="invalid-feedback d-block">
                                                    <i className="fa fa-exclamation-circle mr-1"></i>
                                                    {errors.category.message}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stock */}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label style={{ fontWeight: '500', color: '#333' }}>
                                                Stock <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
                                                {...register('stock')}
                                                placeholder="0"
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    border: errors.stock ? '1px solid #dc3545' : '1px solid #ddd'
                                                }}
                                            />
                                            {errors.stock && (
                                                <div className="invalid-feedback d-block">
                                                    <i className="fa fa-exclamation-circle mr-1"></i>
                                                    {errors.stock.message}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label style={{ fontWeight: '500', color: '#333' }}>
                                                Description <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                                {...register('description')}
                                                rows="4"
                                                placeholder="Describe the product..."
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    border: errors.description ? '1px solid #dc3545' : '1px solid #ddd'
                                                }}
                                            />
                                            {errors.description && (
                                                <div className="invalid-feedback d-block">
                                                    <i className="fa fa-exclamation-circle mr-1"></i>
                                                    {errors.description.message}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Images */}
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label style={{ fontWeight: '500', color: '#333' }}>
                                                Product Images <span className="text-danger">*</span>
                                            </label>
                                            <div className="custom-file">
                                                <input
                                                    type="file"
                                                    name="images"
                                                    className="custom-file-input"
                                                    id="customFile"
                                                    accept="image/*"
                                                    onChange={onChange}
                                                    multiple
                                                />
                                                <label className="custom-file-label" htmlFor="customFile">
                                                    Choose Images (Max 10)
                                                </label>
                                            </div>
                                            <small className="form-text text-muted">
                                                <i className="fa fa-info-circle mr-1"></i>
                                                Upload 1-10 images. Select which one is the main display image.
                                            </small>
                                        </div>
                                    </div>

                                    {/* Image Preview Grid */}
                                    {imagesPreview.length > 0 && (
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label style={{ fontWeight: '500', color: '#333' }}>
                                                    Image Preview ({imagesPreview.length}/10)
                                                </label>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                                    gap: '15px',
                                                    padding: '20px',
                                                    backgroundColor: '#f8f9fa',
                                                    borderRadius: '8px'
                                                }}>
                                                    {imagesPreview.map((img, index) => (
                                                        <div key={index} style={{ position: 'relative' }}>
                                                            <img
                                                                src={img}
                                                                alt={`Preview ${index + 1}`}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '150px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '8px',
                                                                    border: mainImageIndex === index ? '3px solid #6b46c1' : '1px solid #ddd'
                                                                }}
                                                            />
                                                            {mainImageIndex === index && (
                                                                <span style={{
                                                                    position: 'absolute',
                                                                    top: '5px',
                                                                    left: '5px',
                                                                    backgroundColor: '#6b46c1',
                                                                    color: 'white',
                                                                    padding: '3px 8px',
                                                                    borderRadius: '5px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    MAIN
                                                                </span>
                                                            )}
                                                            <div style={{
                                                                marginTop: '8px',
                                                                display: 'flex',
                                                                gap: '5px',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setMainImageIndex(index)}
                                                                    className="btn btn-sm"
                                                                    style={{
                                                                        backgroundColor: mainImageIndex === index ? '#6b46c1' : '#6c757d',
                                                                        color: 'white',
                                                                        fontSize: '0.75rem',
                                                                        padding: '3px 8px'
                                                                    }}
                                                                >
                                                                    {mainImageIndex === index ? 'Main' : 'Set Main'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeImage(index)}
                                                                    className="btn btn-sm btn-danger"
                                                                    style={{
                                                                        fontSize: '0.75rem',
                                                                        padding: '3px 8px'
                                                                    }}
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Buttons */}
                                    <div className="col-md-12">
                                        <div className="form-group mt-4">
                                            <button
                                                type="submit"
                                                className="btn btn-lg mr-3"
                                                disabled={loading}
                                                style={{
                                                    backgroundColor: '#6b46c1',
                                                    color: 'white',
                                                    borderRadius: '25px',
                                                    padding: '12px 40px',
                                                    fontWeight: '500',
                                                    border: 'none'
                                                }}
                                            >
                                                {loading ? (
                                                    <>
                                                        <i className="fa fa-spinner fa-spin mr-2"></i>
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa fa-check mr-2"></i>
                                                        Create Product
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => navigate('/admin/products')}
                                                className="btn btn-lg"
                                                style={{
                                                    backgroundColor: '#6c757d',
                                                    color: 'white',
                                                    borderRadius: '25px',
                                                    padding: '12px 40px',
                                                    fontWeight: '500',
                                                    border: 'none'
                                                }}
                                            >
                                                <i className="fa fa-times mr-2"></i>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default NewProduct;
