import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Autocomplete,
  Stack,
} from '@mui/material';
import {
  CloseRounded,
  SaveRounded,
  PaletteRounded,
} from '@mui/icons-material';

const NOTE_COLORS = [
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Green', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Indigo', value: '#6366f1' },
];

export default function NoteEditor({ open, onClose, onSave, note, categories }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [color, setColor] = useState('#7c3aed');
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(note?.id);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setCategory(note.category || '');
      setTags(note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
      setColor(note.color || '#7c3aed');
    } else {
      setTitle('');
      setContent('');
      setCategory('');
      setTags([]);
      setColor('#7c3aed');
      setTagInput('');
    }
    setErrors({});
  }, [note, open]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const noteData = {
      ...(note?.id && { id: note.id }),
      title: title.trim(),
      content: content.trim(),
      category: category.trim() || null,
      tags: tags.length > 0 ? tags.join(', ') : null,
      color: color,
      isPinned: note?.isPinned || false,
      isArchived: note?.isArchived || false,
    };

    onSave(noteData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '85vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {isEditing ? 'Edit Note' : 'Create New Note'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Stack spacing={2.5}>
          {/* Title */}
          <TextField
            autoFocus
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors({}); }}
            error={Boolean(errors.title)}
            helperText={errors.title}
            placeholder="Give your note a title..."
            variant="outlined"
            id="note-title-input"
          />

          {/* Content */}
          <TextField
            label="Content"
            fullWidth
            multiline
            minRows={5}
            maxRows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note content here..."
            variant="outlined"
            id="note-content-input"
          />

          {/* Category */}
          <Autocomplete
            freeSolo
            options={categories || []}
            value={category}
            onInputChange={(e, newValue) => setCategory(newValue || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                placeholder="Select or create a category"
                variant="outlined"
                id="note-category-input"
              />
            )}
          />

          {/* Tags */}
          <Box>
            <TextField
              label="Tags"
              fullWidth
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type a tag and press Enter"
              variant="outlined"
              id="note-tags-input"
            />
            {tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onDelete={() => handleRemoveTag(tag)}
                    sx={{
                      background: 'rgba(124, 58, 237, 0.12)',
                      color: '#a78bfa',
                      border: '1px solid rgba(124, 58, 237, 0.2)',
                      '& .MuiChip-deleteIcon': {
                        color: '#a78bfa',
                        '&:hover': { color: '#ef4444' },
                      },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Color Picker */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary', fontSize: '0.8rem' }}>
              <PaletteRounded sx={{ fontSize: '0.9rem', mr: 0.5, verticalAlign: 'middle' }} />
              Note Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {NOTE_COLORS.map((c) => (
                <Box
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: c.value,
                    cursor: 'pointer',
                    border: color === c.value ? '3px solid #fff' : '3px solid transparent',
                    boxShadow: color === c.value ? `0 0 12px ${c.value}60` : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.15)',
                      boxShadow: `0 0 12px ${c.value}40`,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': { background: 'rgba(148, 163, 184, 0.08)' },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<SaveRounded />}
          id="note-save-button"
        >
          {isEditing ? 'Update Note' : 'Create Note'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
