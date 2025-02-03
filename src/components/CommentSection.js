import React, { useState, useEffect } from 'react';
import { Box, Avatar, TextField, Button, Typography, Divider, IconButton, Paper, Chip } from '@mui/material';
import { Reply as ReplyIcon, Send as SendIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import CommentService from '../services/comment.service';
import ReplyService from '../services/reply.service';

const CommentSection = ({ eventId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyStates, setReplyStates] = useState({});
    const [replyContents, setReplyContents] = useState({});

    useEffect(() => {
        fetchComments();
    }, [eventId]);

    const fetchComments = async () => {
        try {
            const response = await CommentService.getCommentsByEventId(eventId);
            console.log('Comments response:', response.data);
            if (response.data && response.data.data) {
                const commentsData = response.data.data;
                console.log('Comments with replies:', commentsData);
                commentsData.forEach(comment => {
                    if (comment.replies) {
                        comment.replies.forEach(reply => {
                            console.log('Reply:', reply);
                            console.log('Reply owner status:', reply.eventOwnerReply);
                        });
                    }
                });
                setComments(commentsData);
            } else {
                setComments([]);
            }
        } catch (error) {
            console.error('Yorumlar yüklenirken hata oluştu:', error);
            setComments([]);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await CommentService.createComment(eventId, { content: newComment });
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error('Yorum gönderilirken hata oluştu:', error);
        }
    };

    const toggleReplyForm = (commentId) => {
        setReplyStates(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    const handleReplySubmit = async (commentId) => {
        const replyContent = replyContents[commentId];
        if (!replyContent?.trim()) return;

        try {
            await ReplyService.createReply(commentId, { content: replyContent });
            setReplyContents(prev => ({ ...prev, [commentId]: '' }));
            setReplyStates(prev => ({ ...prev, [commentId]: false }));
            fetchComments();
        } catch (error) {
            console.error('Yanıt gönderilirken hata oluştu:', error);
        }
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'ffffff', fontWeight: 600 }}>
                    Yorumlar
                </Typography>
                
                {/* Yorum Yazma Formu */}
                <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            variant="outlined"
                            placeholder="Bir yorum yazın..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'rgba(0, 0, 0, 0.02)'
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={!newComment.trim()}
                            endIcon={<SendIcon />}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                py: 1.5,
                                bgcolor: '#1a237e',
                                '&:hover': { bgcolor: '#0d47a1' }
                            }}
                        >
                            Gönder
                        </Button>
                    </Box>
                </Box>

                {/* Yorumlar Listesi */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {comments.map((comment) => (
                        <Box key={comment.id}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Avatar 
                                    src={comment.user.profilePicture} 
                                    alt={comment.user.firstName}
                                    sx={{ width: 40, height: 40 }}
                                />
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffffff' }}>
                                            {comment.user.firstName} {comment.user.lastName}
                                        </Typography>
                                        <Typography variant="caption" color="rgba(255, 255, 255, 0.6)">
                                            {format(new Date(comment.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: '#ffffff', mb: 1 }}>
                                        {comment.content}
                                    </Typography>
                                    
                                    <Button
                                        size="small"
                                        startIcon={<ReplyIcon />}
                                        onClick={() => toggleReplyForm(comment.id)}
                                        sx={{ 
                                            textTransform: 'none',
                                            color: replyStates[comment.id] ? '#1a237e' : '#666'
                                        }}
                                    >
                                        Yanıtla
                                    </Button>

                                    {/* Yanıt Formu */}
                                    {replyStates[comment.id] && (
                                        <Box sx={{ mt: 2, ml: 2, display: 'flex', gap: 2 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                                placeholder="Yanıtınızı yazın..."
                                                value={replyContents[comment.id] || ''}
                                                onChange={(e) => setReplyContents(prev => ({
                                                    ...prev,
                                                    [comment.id]: e.target.value
                                                }))}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        bgcolor: 'rgba(0, 0, 0, 0.02)'
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="contained"
                                                onClick={() => handleReplySubmit(comment.id)}
                                                disabled={!replyContents[comment.id]?.trim()}
                                                endIcon={<SendIcon />}
                                                sx={{
                                                    borderRadius: 2,
                                                    bgcolor: '#1a237e',
                                                    '&:hover': { bgcolor: '#0d47a1' }
                                                }}
                                            >
                                                Yanıtla
                                            </Button>
                                        </Box>
                                    )}

                                    {/* Yanıtlar */}
                                    {comment.replies?.map((reply) => (
                                        <Paper
                                            key={reply.id}
                                            elevation={0}
                                            sx={{
                                                mt: 2,
                                                ml: 2,
                                                p: 2,
                                                bgcolor: reply.eventOwnerReply ? 'rgba(26, 35, 126, 0.12)' : 'rgba(0, 0, 0, 0.02)',
                                                borderRadius: 2,
                                                border: '2px solid',
                                                borderColor: reply.eventOwnerReply ? '#1a237e' : 'transparent',
                                                position: 'relative',
                                                boxShadow: reply.eventOwnerReply ? '0 2px 8px rgba(26, 35, 126, 0.15)' : 'none'
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Avatar 
                                                    src={reply.user.profilePicture} 
                                                    alt={reply.user.firstName}
                                                    sx={{ 
                                                        width: 32, 
                                                        height: 32,
                                                        border: reply.eventOwnerReply ? '2px solid #1a237e' : 'none',
                                                        boxShadow: reply.eventOwnerReply ? '0 0 0 2px rgba(26, 35, 126, 0.2)' : 'none'
                                                    }}
                                                />
                                                <Box sx={{ flex: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                        <Typography 
                                                            variant="subtitle2" 
                                                            sx={{ 
                                                                fontWeight: reply.eventOwnerReply ? 700 : 600,
                                                                color: reply.eventOwnerReply ? '#90caf9' : '#ffffff',
                                                                fontSize: reply.eventOwnerReply ? '0.95rem' : '0.875rem'
                                                            }}
                                                        >
                                                            {reply.user.firstName} {reply.user.lastName}
                                                        </Typography>
                                                        {reply.eventOwnerReply && (
                                                            <Chip
                                                                label="Organizatör"
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: '#1a237e',
                                                                    color: 'white',
                                                                    height: '20px',
                                                                    '& .MuiChip-label': {
                                                                        px: 1,
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: 600,
                                                                        letterSpacing: '0.4px'
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                        <Typography variant="caption" color="text.secondary">
                                                            {format(new Date(reply.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                                                        </Typography>
                                                    </Box>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            color: reply.eventOwnerReply ? '#90caf9' : '#ffffff',
                                                            fontWeight: reply.eventOwnerReply ? 500 : 400,
                                                            lineHeight: 1.6
                                                        }}
                                                    >
                                                        {reply.content}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Box>
                            </Box>
                            <Divider sx={{ mt: 3 }} />
                        </Box>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
};

export default CommentSection; 