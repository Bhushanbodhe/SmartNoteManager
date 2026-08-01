import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  CloseRounded,
  SendRounded,
  AutoAwesomeRounded,
  SmartToyRounded,
  PersonRounded,
  ArticleRounded,
} from '@mui/icons-material';
import { ragApi } from '../api/noteApi';

const DRAWER_WIDTH = 420;

export default function AiAssistant({ open, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. Ask me anything about your notes and I\'ll find relevant information for you.',
      sources: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ragStatus, setRagStatus] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      checkStatus();
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkStatus = async () => {
    try {
      const status = await ragApi.getStatus();
      setRagStatus(status);
    } catch {
      setRagStatus({ available: false, message: 'Cannot connect to the backend.' });
    }
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: question, sources: [] }]);
    setInput('');
    setLoading(true);

    try {
      const response = await ragApi.ask(question);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer || 'Sorry, I couldn\'t generate a response.',
          sources: response.sources || [],
        },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, an error occurred. Make sure the backend is running and RAG is enabled in application.properties.',
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: DRAWER_WIDTH,
          maxWidth: '90vw',
          background: 'rgba(10, 10, 26, 0.98)',
          backdropFilter: 'blur(30px)',
          borderLeft: '1px solid rgba(148, 163, 184, 0.08)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.06), rgba(6, 182, 212, 0.04))',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AutoAwesomeRounded sx={{ fontSize: '1.2rem', color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>
              AI Assistant
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: ragStatus?.available ? '#10b981' : '#f59e0b',
                  boxShadow: ragStatus?.available ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none',
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                {ragStatus?.available ? 'Connected' : 'Limited mode'}
              </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseRounded />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeInUp 0.3s ease-out',
            }}
          >
            {/* Avatar + Name */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              {msg.role === 'assistant' ? (
                <SmartToyRounded sx={{ fontSize: '0.85rem', color: '#7c3aed' }} />
              ) : (
                <PersonRounded sx={{ fontSize: '0.85rem', color: '#06b6d4' }} />
              )}
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 600 }}>
                {msg.role === 'assistant' ? 'AI Assistant' : 'You'}
              </Typography>
            </Box>

            {/* Message bubble */}
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 1.5,
                maxWidth: '88%',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(124, 58, 237, 0.1))'
                  : 'rgba(18, 18, 42, 0.6)',
                border: msg.role === 'user'
                  ? '1px solid rgba(124, 58, 237, 0.2)'
                  : '1px solid rgba(148, 163, 184, 0.06)',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.825rem',
                  lineHeight: 1.6,
                  color: 'text.primary',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content}
              </Typography>
            </Paper>

            {/* Sources */}
            {msg.sources && msg.sources.length > 0 && (
              <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', mr: 0.5 }}>
                  Sources:
                </Typography>
                {msg.sources.map((src, sIdx) => (
                  <Chip
                    key={sIdx}
                    icon={<ArticleRounded sx={{ fontSize: '0.75rem !important' }} />}
                    label={src.title}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.62rem',
                      background: 'rgba(6, 182, 212, 0.08)',
                      color: '#22d3ee',
                      border: '1px solid rgba(6, 182, 212, 0.15)',
                      '& .MuiChip-icon': { color: '#22d3ee' },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}

        {/* Typing indicator */}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, animation: 'fadeIn 0.3s ease' }}>
            <SmartToyRounded sx={{ fontSize: '0.85rem', color: '#7c3aed' }} />
            <Box className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(148, 163, 184, 0.08)',
          background: 'rgba(10, 10, 26, 0.8)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            size="small"
            placeholder="Ask about your notes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            id="ai-assistant-input"
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'rgba(18, 18, 42, 0.5)',
                borderRadius: 3,
                fontSize: '0.85rem',
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || loading}
            id="ai-send-button"
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: '#fff',
              borderRadius: 2.5,
              '&:hover': {
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              },
              '&.Mui-disabled': {
                background: 'rgba(124, 58, 237, 0.2)',
                color: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            {loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SendRounded sx={{ fontSize: '1.1rem' }} />}
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}
