import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Fade,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  EventAvailable,
  Close as CloseIcon,
  NotificationsActive,
  Group,
  Event,
  Info,
  Circle as CircleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import NotificationService from '../services/notification.service';
import { notificationEvents } from '../components/layout/Navbar';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await NotificationService.getUnreadNotifications();
      const notificationsData = response.data.data || [];
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Bildirimler alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await NotificationService.markAsRead(notification.id);
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        notificationEvents.emit('notificationRead');
      }
    } catch (error) {
      console.error('Bildirim işaretlenemedi:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'EVENT_INVITATION':
        return <EventAvailable sx={{ color: '#2196F3', fontSize: 28 }} />;
      case 'EVENT_UPDATE':
        return <Event sx={{ color: '#4CAF50', fontSize: 28 }} />;
      case 'NEW_PARTICIPANT':
        return <Group sx={{ color: '#FF9800', fontSize: 28 }} />;
      default:
        return <Info sx={{ color: '#9C27B0', fontSize: 28 }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'EVENT_INVITATION':
        return '#E3F2FD';
      case 'EVENT_UPDATE':
        return '#E8F5E9';
      case 'NEW_PARTICIPANT':
        return '#FFF3E0';
      default:
        return '#F3E5F5';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const dateFormatted = format(date, "dd.MM.yyyy", { locale: tr });
      const timeFormatted = format(date, "HH:mm", { locale: tr });
      return `${dateFormatted} • ${timeFormatted}`;
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          pt: '64px',
          bgcolor: '#001E3C'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#001E3C',
        pt: '84px',
        pb: 4
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            borderRadius: '16px',
            overflow: 'hidden',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Box
            sx={{
              p: 3,
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              bgcolor: '#F8F9FA'
            }}
          >
            <Avatar sx={{ bgcolor: '#1a237e', width: 40, height: 40 }}>
              <NotificationsActive />
            </Avatar>
            <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
              Bildirimler
            </Typography>
          </Box>

          {notifications.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <NotificationsActive sx={{ fontSize: 48, color: 'rgba(0, 0, 0, 0.2)', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                Bildiriminiz Bulunmuyor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yeni bildirimleriniz burada görüntülenecektir.
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <Fade in key={notification.id}>
                  <Box>
                    <ListItem
                      sx={{
                        p: 3,
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        bgcolor: notification.isRead ? 'transparent' : getNotificationColor(notification.type),
                        '&:hover': {
                          bgcolor: notification.isRead 
                            ? 'rgba(0, 0, 0, 0.04)' 
                            : `${getNotificationColor(notification.type)}99`
                        },
                        position: 'relative'
                      }}
                    >
                      {!notification.isRead && (
                        <CircleIcon 
                          sx={{ 
                            position: 'absolute',
                            left: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#1a237e',
                            fontSize: 8
                          }} 
                        />
                      )}
                      <ListItemIcon sx={{ minWidth: 56 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: `${getNotificationColor(notification.type)}99`,
                            width: 44,
                            height: 44
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: notification.isRead ? 400 : 600,
                              color: '#1a237e',
                              mb: 0.5,
                              fontSize: '0.95rem',
                              lineHeight: 1.5
                            }}
                          >
                            {notification.message}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Event sx={{ fontSize: 16, opacity: 0.7 }} />
                            <Typography
                              variant="caption"
                              sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.85rem'
                              }}
                            >
                              {formatDate(notification.timestamp)}
                            </Typography>
                          </Box>
                        }
                      />
                      <IconButton
                        edge="end"
                        onClick={() => handleNotificationClick(notification)}
                        sx={{ 
                          color: 'rgba(0, 0, 0, 0.54)',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </ListItem>
                    {index < notifications.length - 1 && (
                      <Divider sx={{ opacity: 0.5 }} />
                    )}
                  </Box>
                </Fade>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Notifications; 