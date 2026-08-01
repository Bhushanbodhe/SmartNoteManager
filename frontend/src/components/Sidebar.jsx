import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  Avatar,
} from '@mui/material';
import {
  NotesRounded,
  PushPinRounded,
  ArchiveRounded,
  CategoryRounded,
  AutoAwesomeRounded,
  FolderRounded,
} from '@mui/icons-material';

const SIDEBAR_WIDTH = 280;

const navItems = [
  { id: 'all', label: 'All Notes', icon: <NotesRounded />, color: '#7c3aed' },
  { id: 'pinned', label: 'Pinned', icon: <PushPinRounded />, color: '#f59e0b' },
  { id: 'archived', label: 'Archived', icon: <ArchiveRounded />, color: '#06b6d4' },
];

export default function Sidebar({ activeView, onViewChange, categories, noteCount, onAiClick }) {
  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        minWidth: SIDEBAR_WIDTH,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        py: 3,
        px: 2,
        background: 'rgba(10, 10, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(148, 163, 184, 0.08)',
        position: 'sticky',
        top: 0,
      }}
      className="sidebar-desktop"
    >
      {/* Logo / Brand */}
      <Box sx={{ px: 1.5, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              fontSize: '1.1rem',
              fontWeight: 800,
            }}
          >
            N
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
              }}
            >
              Smart Notes
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              AI-Powered Manager
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Navigation */}
      <List sx={{ px: 0, mb: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeView === item.id}
              onClick={() => onViewChange(item.id)}
              sx={{
                borderRadius: 3,
                py: 1.2,
                px: 2,
                '&.Mui-selected': {
                  background: `linear-gradient(135deg, ${item.color}18, ${item.color}08)`,
                  border: `1px solid ${item.color}25`,
                  '& .MuiListItemIcon-root': { color: item.color },
                  '& .MuiListItemText-primary': { color: '#e2e8f0', fontWeight: 600 },
                },
                '&:hover': {
                  background: 'rgba(124, 58, 237, 0.06)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              />
              {item.id === 'all' && noteCount > 0 && (
                <Chip
                  label={noteCount}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: 'rgba(124, 58, 237, 0.15)',
                    color: '#a78bfa',
                    border: 'none',
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 1, my: 2, borderColor: 'rgba(148, 163, 184, 0.08)' }} />

      {/* Categories */}
      <Box sx={{ px: 2, mb: 1 }}>
        <Typography
          variant="overline"
          sx={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: 'text.secondary',
            letterSpacing: '0.1em',
          }}
        >
          Categories
        </Typography>
      </Box>
      <List sx={{ px: 0, flex: 1, overflow: 'auto' }}>
        {categories && categories.length > 0 ? (
          categories.map((cat) => (
            <ListItem key={cat} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                selected={activeView === `category:${cat}`}
                onClick={() => onViewChange(`category:${cat}`)}
                sx={{
                  borderRadius: 3,
                  py: 0.8,
                  px: 2,
                  '&.Mui-selected': {
                    background: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                  },
                  '&:hover': {
                    background: 'rgba(124, 58, 237, 0.06)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                  <FolderRounded sx={{ fontSize: '1.1rem' }} />
                </ListItemIcon>
                <ListItemText
                  primary={cat}
                  primaryTypographyProps={{
                    fontSize: '0.825rem',
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <Box sx={{ px: 2.5, py: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              No categories yet
            </Typography>
          </Box>
        )}
      </List>

      <Divider sx={{ mx: 1, my: 2, borderColor: 'rgba(148, 163, 184, 0.08)' }} />

      {/* AI Assistant Button */}
      <Box sx={{ px: 0.5 }}>
        <ListItemButton
          onClick={onAiClick}
          sx={{
            borderRadius: 3,
            py: 1.5,
            px: 2,
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(6, 182, 212, 0.08))',
            border: '1px solid rgba(124, 58, 237, 0.15)',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.18), rgba(6, 182, 212, 0.12))',
              border: '1px solid rgba(124, 58, 237, 0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <ListItemIcon sx={{ minWidth: 38 }}>
            <AutoAwesomeRounded sx={{ color: '#a78bfa' }} />
          </ListItemIcon>
          <ListItemText
            primary="AI Assistant"
            secondary="Ask about your notes"
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            secondaryTypographyProps={{
              fontSize: '0.7rem',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}
