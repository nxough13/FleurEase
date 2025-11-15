import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import MetaData from '../Layout/MetaData';
import Sidebar from './Sidebar';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';
import { toast } from 'react-toastify';

// Validation Schema
const categorySchema = yup.object().shape({
    name: yup.string()
        .required('Category name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters'),
    description: yup.string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description cannot exceed 500 characters')
});

const NewCategory = () => {
    const [image, setImage] = useState('');
    const [imagePreview, setImagePreview] = useState('/images/default_category.jpg');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(categorySchema)
    });

    const onChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.readyState === 2) {
                setImagePreview(reader.result);
                setImage(reader.result);
            }
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data) => {
        if (!image) {
            toast.error('Please upload a category image');
            return;
        }

        setLoading(true);

        const formData = {
            name: data.name,
            description: data.description,
            image: image
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const response = await axios.post(
                `${import.meta.env.VITE_API}/admin/category/new`,
                formData,
                config
            );

            toast.success('Category created successfully! 🌸');
            navigate('/admin/categories');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating category');
            setLoading(false);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <Fragment>
            <MetaData title={'Create New Category'} />
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
                                Create New Category
                            </h1>

                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Category Name */}
                                <div className="form-group">
                                    <label style={{ fontWeight: '500', color: '#333' }}>
                                        Category Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        {...register('name')}
                                        placeholder="e.g., Roses, Bouquets, Wedding Flowers"
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

                                {/* Description */}
                                <div className="form-group">
                                    <label style={{ fontWeight: '500', color: '#333' }}>
                                        Description <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                        {...register('description')}
                                        rows="4"
                                        placeholder="Describe this category..."
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

                                {/* Category Image */}
                                <div className="form-group">
                                    <label style={{ fontWeight: '500', color: '#333' }}>
                                        Category Image <span className="text-danger">*</span>
                                    </label>
                                    <div className="custom-file">
                                        <input
                                            type="file"
                                            name="image"
                                            className="custom-file-input"
                                            id="customFile"
                                            accept="image/*"
                                            onChange={onChange}
                                        />
                                        <label className="custom-file-label" htmlFor="customFile">
                                            Choose Image
                                        </label>
                                    </div>
                                    {!image && (
                                        <small className="form-text text-muted">
                                            <i className="fa fa-info-circle mr-1"></i>
                                            Please upload a category image (JPG, PNG, max 5MB)
                                        </small>
                                    )}
                                </div>

                                {/* Image Preview */}
                                <div className="form-group">
                                    <label style={{ fontWeight: '500', color: '#333' }}>Image Preview</label>
                                    <div style={{
                                        border: '2px dashed #ddd',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        backgroundColor: '#f8f9fa'
                                    }}>
                                        <img
                                            src={imagePreview}
                                            alt="Category Preview"
                                            style={{
                                                maxWidth: '300px',
                                                maxHeight: '300px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Buttons */}
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
                                                Create Category
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/categories')}
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
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default NewCategory;
