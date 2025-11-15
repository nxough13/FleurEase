import React from 'react';
import { getUser } from '../../Utils/helpers';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Rating,
    IconButton,
    Chip,
    Divider
} from '@mui/material';

const ListReviews = ({ reviews, onEdit, onDelete }) => {
    const user = getUser();

    return (
        <Box sx={{ width: '100%', maxWidth: '900px', mt: 5, mb: 5 }}>
            <Typography 
                variant="h5" 
                sx={{ 
                    color: '#6b46c1', 
                    fontWeight: 'bold', 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <i className="fa fa-comments" style={{ marginRight: '8px' }}></i>
                Customer Reviews ({reviews.length})
            </Typography>
            <Divider sx={{ mb: 3, borderColor: '#e9d5ff', borderWidth: 2 }} />
            
            {reviews && reviews.length > 0 ? (
                reviews.map(review => (
                    <Card 
                        key={review._id}
                        sx={{
                            mb: 2,
                            borderRadius: '12px',
                            border: user && review.user === user._id ? '2px solid #6b46c1' : '1px solid #e0e0e0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                            }
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    {/* Rating */}
                                    <Rating 
                                        value={review.rating} 
                                        readOnly 
                                        size="medium"
                                        sx={{ mb: 1 }}
                                    />

                                    {/* Reviewer Name */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: '600', color: '#333' }}>
                                            by {review.name}
                                        </Typography>
                                        {user && review.user === user._id && (
                                            <Chip 
                                                label="Your Review" 
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#6b46c1',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        )}
                                    </Box>

                                    {/* Review Comment */}
                                    <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 1 }}>
                                        {review.comment}
                                    </Typography>

                                    {/* Review Date */}
                                    {review.createdAt && (
                                        <Typography variant="caption" sx={{ color: '#999' }}>
                                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Edit/Delete Buttons */}
                                {user && review.user === user._id && (
                                    <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                                        <IconButton
                                            onClick={() => onEdit(review)}
                                            size="small"
                                            sx={{
                                                color: '#6b46c1',
                                                border: '2px solid #6b46c1',
                                                '&:hover': {
                                                    backgroundColor: '#6b46c1',
                                                    color: 'white'
                                                }
                                            }}
                                        >
                                            <i className="fa fa-edit"></i>
                                        </IconButton>
                                        <IconButton
                                            onClick={() => onDelete(review._id)}
                                            size="small"
                                            sx={{
                                                color: '#dc3545',
                                                border: '2px solid #dc3545',
                                                '&:hover': {
                                                    backgroundColor: '#dc3545',
                                                    color: 'white'
                                                }
                                            }}
                                        >
                                            <i className="fa fa-trash"></i>
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Card sx={{ textAlign: 'center', p: 5, backgroundColor: '#f8f9fa' }}>
                    <i className="fa fa-comment-o" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '15px', display: 'block' }}></i>
                    <Typography variant="body1" sx={{ color: '#999' }}>
                        No reviews yet. Be the first to review this product!
                    </Typography>
                </Card>
            )}
        </Box>
    );
};

export default ListReviews;
