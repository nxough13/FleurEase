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

const UpdateCategory = () => {
    const [image, setImage] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [oldImage, setOldImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { id } = useParams();
    const navigate = useNavigate();

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(categorySchema)
    });

    useEffect(() => {
        fetchCategory();
    }, [id]);

    const fetchCategory = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/admin/category/${id}`,
                config
            );

            setValue('name', data.category.name);
            setValue('description', data.category.description);
            setImagePreview(data.category.image.url);
            setOldImage(data.category.image.url);
            setLoading(false);
        } catch (error) {
            toast.error('Error loading category');
            navigate('/admin/categories');
        }
    };

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
        setUpdating(true);

        const formData = {
            name: data.name,
            description: data.description,
            image: image || oldImage
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            await axios.put(
                `${import.meta.env.VITE_API}/admin/category/${id}`,
                formData,
                config
            );

            toast.success('Category updated successfully! 🌸');
            navigate('/admin/categories');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating category');
            setUpdating(false);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <Fragment>
            <MetaData title={'Update Category'} />
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
                                Update Category
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

                                {/* Current Image */}
                                <div className="form-group">
                                    <label style={{ fontWeight: '500', color: '#333' }}>
                                        Current Image
                                    </label>
                                    <div style={{
                                        border: '2px solid #e9d5ff',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        backgroundColor: '#f8f9fa'
                                    }}>
                                        <img
                                            src={imagePreview}
                                            alt="Current Category"
                                            style={{
                                                maxWidth: '200px',
                                                maxHeight: '200px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Replace Image */}
                                <div className="form-group">
                                    <label style={{ fontWeight: '500', color: '#333' }}>
                                        Replace Image (Optional)
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
                                            Choose New Image
                                        </label>
                                    </div>
                                    <small className="form-text text-muted">
                                        <i className="fa fa-info-circle mr-1"></i>
                                        Leave empty to keep current image
                                    </small>
                                </div>

                                {/* Buttons */}
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
                                                Update Category
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

export default UpdateCategory;
