import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Rating,
    Box,
    Typography
} from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getToken } from '../../Utils/helpers';

const ReviewDialog = ({ open, onClose, productId, existingReview, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment);
        } else {
            setRating(0);
            setComment('');
        }
    }, [existingReview, open]);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please write a review comment');
            return;
        }

        setLoading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            };

            if (existingReview) {
                // Update existing review
                await axios.patch(
                    `${import.meta.env.VITE_API}/review`,
                    {
                        rating,
                        comment,
                        productId,
                        reviewId: existingReview._id
                    },
                    config
                );
                toast.success('Review updated successfully! 🌸');
            } else {
                // Create new review
                await axios.put(
                    `${import.meta.env.VITE_API}/review`,
                    {
                        rating,
                        comment,
                        productId
                    },
                    config
                );
                toast.success('Review posted successfully! 🌸');
            }

            setRating(0);
            setComment('');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error submitting review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                style: {
                    borderRadius: '15px',
                    padding: '10px'
                }
            }}
        >
            <DialogTitle style={{
                color: '#6b46c1',
                fontWeight: 'bold',
                fontSize: '1.5rem',
                paddingBottom: '10px'
            }}>
                {existingReview ? 'Update Your Review' : 'Write a Review'}
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                    {/* Rating */}
                    <Box>
                        <Typography 
                            variant="subtitle1" 
                            gutterBottom
                            style={{ fontWeight: '600', color: '#333', marginBottom: '10px' }}
                        >
                            Your Rating *
                        </Typography>
                        <Rating
                            name="rating"
                            value={rating}
                            onChange={(event, newValue) => setRating(newValue)}
                            size="large"
                            sx={{
                                '& .MuiRating-iconFilled': {
                                    color: '#fdcc0d',
                                },
                                '& .MuiRating-iconHover': {
                                    color: '#ffc107',
                                }
                            }}
                        />
                    </Box>

                    {/* Comment */}
                    <Box>
                        <TextField
                            label="Your Review *"
                            multiline
                            rows={4}
                            fullWidth
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: '#6b46c1',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#6b46c1',
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#6b46c1',
                                }
                            }}
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions style={{ padding: '20px 24px' }}>
                <Button 
                    onClick={onClose}
                    style={{
                        color: '#666',
                        textTransform: 'none',
                        fontWeight: '600',
                        padding: '8px 20px'
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="contained"
                    style={{
                        backgroundColor: '#6b46c1',
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: '600',
                        padding: '8px 30px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(107, 70, 193, 0.3)'
                    }}
                >
                    {loading ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReviewDialog;
