import React, { Fragment, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
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

const UpdateProduct = () => {
    const [images, setImages] = useState([]);
    const [oldImages, setOldImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { id } = useParams();
    const navigate = useNavigate();

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(productSchema)
    });

    useEffect(() => {
        fetchProduct();
        fetchCategories();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/product/${id}`,
                config
            );

            setValue('name', data.product.name);
            setValue('price', data.product.price);
            setValue('description', data.product.description);
            setValue('category', data.product.category);
            setValue('stock', data.product.stock);

            setOldImages(data.product.images);
            setMainImageIndex(data.product.mainImage || 0);
            setLoading(false);
        } catch (error) {
            toast.error('Error loading product');
            navigate('/admin/products');
        }
    };

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

        if (files.length > 10) {
            toast.error('Maximum 10 images allowed');
            return;
        }

        setImages([]);
        setImagesPreview([]);
        setOldImages([]);

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

    const removeOldImage = (index) => {
        const newOldImages = oldImages.filter((_, i) => i !== index);
        setOldImages(newOldImages);

        if (mainImageIndex === index) {
            setMainImageIndex(0);
        } else if (mainImageIndex > index) {
            setMainImageIndex(mainImageIndex - 1);
        }
    };

    const removeNewImage = (index) => {
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
        if (oldImages.length === 0 && images.length === 0) {
            toast.error('Please upload at least one product image');
            return;
        }

        setUpdating(true);

        const formData = {
            name: data.name,
            price: data.price,
            description: data.description,
            category: data.category,
            stock: data.stock,
            seller: 'FleurEase',
            images: images.length > 0 ? images : oldImages,
            mainImage: mainImageIndex
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            await axios.put(
                `${import.meta.env.VITE_API}/admin/product/${id}`,
                formData,
                config
            );

            toast.success('Product updated successfully! 🌸');
            navigate('/admin/products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating product');
            setUpdating(false);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (loading) {
        return <Loader />;
    }

    const displayImages = images.length > 0 ? imagesPreview : oldImages.map(img => img.url);

    return (
        <Fragment>
            <MetaData title={'Update Product'} />
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
                                <i className="fa fa-edit mr-2"></i>
                                Update Product
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

                                    {/* Current Images */}
                                    {oldImages.length > 0 && images.length === 0 && (
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label style={{ fontWeight: '500', color: '#333' }}>
                                                    Current Images ({oldImages.length})
                                                </label>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                                    gap: '15px',
                                                    padding: '20px',
                                                    backgroundColor: '#f8f9fa',
                                                    borderRadius: '8px'
                                                }}>
                                                    {oldImages.map((img, index) => (
                                                        <div key={index} style={{ position: 'relative' }}>
                                                            <img
                                                                src={img.url}
                                                                alt={`Current ${index + 1}`}
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
                                                                    onClick={() => removeOldImage(index)}
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

                                    {/* Replace Images */}
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label style={{ fontWeight: '500', color: '#333' }}>
                                                {images.length > 0 ? 'New Images' : 'Replace All Images (Optional)'}
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
                                                    Choose New Images (Max 10)
                                                </label>
                                            </div>
                                            <small className="form-text text-muted">
                                                <i className="fa fa-info-circle mr-1"></i>
                                                Leave empty to keep current images
                                            </small>
                                        </div>
                                    </div>

                                    {/* New Images Preview */}
                                    {images.length > 0 && (
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label style={{ fontWeight: '500', color: '#333' }}>
                                                    New Images Preview ({images.length}/10)
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
                                                                alt={`New ${index + 1}`}
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
                                                                    onClick={() => removeNewImage(index)}
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
                                                disabled={updating}
                                                style={{
                                                    backgroundColor: '#6b46c1',
                                                    color: 'white',
                                                    borderRadius: '25px',
                                                    padding: '12px 40px',
                                                    fontWeight: '500',
                                                    border: 'none'
                                                }}
                                            >
                                                {updating ? (
                                                    <>
                                                        <i className="fa fa-spinner fa-spin mr-2"></i>
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa fa-save mr-2"></i>
                                                        Update Product
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

export default UpdateProduct;
