import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  PushPinRounded,
  PushPinOutlined,
  ArchiveRounded,
  UnarchiveRounded,
  DeleteOutlineRounded,
  EditRounded,
} from '@mui/icons-material';

const DEFAULT_COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

export default function NoteCard({ note, onEdit, onDelete, onTogglePin, onToggleArchive, index }) {
  const [isHovered, setIsHovered] = useState(false);

  const noteColor = note.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const tags = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'relative',
        overflow: 'visible',
        cursor: 'pointer',
        animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
      }}
      onClick={() => onEdit(note)}
    >
      {/* Color strip */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 16,
          bottom: 16,
          width: 4,
          borderRadius: 4,
          background: `linear-gradient(180deg, ${noteColor}, ${noteColor}88)`,
        }}
      />

      {/* Pin indicator */}
      {note.isPinned && (
        <Box
          sx={{
            position: 'absolute',
            top: -6,
            right: 12,
            zIndex: 1,
          }}
        >
          <PushPinRounded
            sx={{
              fontSize: '1.1rem',
              color: '#f59e0b',
              filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3))',
              transform: 'rotate(45deg)',
            }}
          />
        </Box>
      )}

      <CardContent sx={{ pl: 3, pr: 2, py: 2.5 }}>
        {/* Header row: title + actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              fontSize: '0.95rem',
              lineHeight: 1.3,
              flex: 1,
              pr: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {note.title}
          </Typography>

          {/* Action buttons — show on hover */}
          <Stack
            direction="row"
            spacing={0}
            sx={{
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s ease',
              flexShrink: 0,
            }}
          >
            <Tooltip title={note.isPinned ? 'Unpin' : 'Pin'} arrow>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); }}
                sx={{
                  color: note.isPinned ? '#f59e0b' : 'text.secondary',
                  '&:hover': { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' },
                }}
              >
                {note.isPinned ? <PushPinRounded fontSize="small" /> : <PushPinOutlined fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title={note.isArchived ? 'Unarchive' : 'Archive'} arrow>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onToggleArchive(note.id); }}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)' },
                }}
              >
                {note.isArchived ? <UnarchiveRounded fontSize="small" /> : <ArchiveRounded fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" arrow>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' },
                }}
              >
                <DeleteOutlineRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Content preview */}
        {note.content && (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8rem',
              lineHeight: 1.6,
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1.5,
            }}
          >
            {note.content}
          </Typography>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
            {tags.slice(0, 4).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  background: 'rgba(124, 58, 237, 0.1)',
                  color: '#a78bfa',
                  border: '1px solid rgba(124, 58, 237, 0.15)',
                }}
              />
            ))}
            {tags.length > 4 && (
              <Chip
                label={`+${tags.length - 4}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  background: 'rgba(148, 163, 184, 0.1)',
                  color: 'text.secondary',
                }}
              />
            )}
          </Box>
        )}

        {/* Footer: category + date */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {note.category && (
            <Chip
              label={note.category}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.68rem',
                fontWeight: 600,
                background: `${noteColor}15`,
                color: noteColor,
                border: `1px solid ${noteColor}25`,
              }}
            />
          )}
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', ml: 'auto' }}>
            {formatDate(note.updatedAt)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
