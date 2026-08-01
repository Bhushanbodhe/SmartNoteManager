import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { NoteAddRounded, ArchiveRounded, SearchOffRounded } from '@mui/icons-material';
import NoteCard from './NoteCard';

export default function NoteGrid({ notes, onEdit, onDelete, onTogglePin, onToggleArchive, viewType, searchQuery }) {

  // Determine empty state
  if (!notes || notes.length === 0) {
    let icon, title, subtitle;

    if (searchQuery) {
      icon = <SearchOffRounded sx={{ fontSize: 72, color: 'rgba(124, 58, 237, 0.2)' }} />;
      title = 'No results found';
      subtitle = `No notes match "${searchQuery}". Try a different search term.`;
    } else if (viewType === 'archived') {
      icon = <ArchiveRounded sx={{ fontSize: 72, color: 'rgba(6, 182, 212, 0.2)' }} />;
      title = 'No archived notes';
      subtitle = 'Notes you archive will appear here.';
    } else {
      icon = <NoteAddRounded sx={{ fontSize: 72, color: 'rgba(124, 58, 237, 0.2)' }} />;
      title = 'No notes yet';
      subtitle = 'Create your first note to get started!';
    }

    return (
      <Box className="empty-state">
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(124, 58, 237, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            border: '2px dashed rgba(124, 58, 237, 0.12)',
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: 'text.primary', mb: 1, fontSize: '1.1rem' }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontSize: '0.85rem', maxWidth: 300, textAlign: 'center' }}
        >
          {subtitle}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2.5}>
      {notes.map((note, index) => (
        <Grid item xs={12} sm={6} lg={4} key={note.id}>
          <NoteCard
            note={note}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onTogglePin={onTogglePin}
            onToggleArchive={onToggleArchive}
          />
        </Grid>
      ))}
    </Grid>
  );
}
