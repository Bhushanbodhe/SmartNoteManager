import React, { useState, useEffect, useCallback } from 'react';
import { TextField, InputAdornment, Box } from '@mui/material';
import { SearchRounded, CloseRounded } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 420 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search notes by title, content, tags..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        id="search-notes-input"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
            </InputAdornment>
          ),
          endAdornment: query ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear} sx={{ color: 'text.secondary' }}>
                <CloseRounded sx={{ fontSize: '1rem' }} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            background: 'rgba(18, 18, 42, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            fontSize: '0.875rem',
            '& fieldset': {
              borderColor: 'rgba(148, 163, 184, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(124, 58, 237, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7c3aed',
              borderWidth: 1,
            },
          },
        }}
      />
    </Box>
  );
}
