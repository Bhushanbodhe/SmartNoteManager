import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  Fab,
  IconButton,
  useMediaQuery,
  Drawer,
  Tooltip,
} from '@mui/material';
import {
  AddRounded,
  AutoAwesomeRounded,
  MenuRounded,
  RefreshRounded,
} from '@mui/icons-material';
import Sidebar from './components/Sidebar';
import NoteGrid from './components/NoteGrid';
import NoteEditor from './components/NoteEditor';
import SearchBar from './components/SearchBar';
import AiAssistant from './components/AiAssistant';
import { noteApi } from './api/noteApi';

export default function App() {
  // State
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeView, setActiveView] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery('(max-width:768px)');

  // ========================
  // Data Fetching
  // ========================

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      let data;

      if (searchQuery) {
        data = await noteApi.search(searchQuery);
      } else if (activeView === 'archived') {
        data = await noteApi.getArchived();
      } else if (activeView === 'pinned') {
        data = await noteApi.getAll();
        data = data.filter(n => n.isPinned);
      } else if (activeView.startsWith('category:')) {
        const cat = activeView.replace('category:', '');
        data = await noteApi.getByCategory(cat);
      } else {
        data = await noteApi.getAll();
      }

      setNotes(data);
    } catch (error) {
      showSnackbar('Failed to load notes. Is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeView, searchQuery]);

  const fetchCategories = async () => {
    try {
      const cats = await noteApi.getCategories();
      setCategories(cats);
    } catch {
      // Silently fail — categories are non-critical
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // ========================
  // Handlers
  // ========================

  const handleCreateNote = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (noteData.id) {
        await noteApi.update(noteData.id, noteData);
        showSnackbar('Note updated successfully');
      } else {
        await noteApi.create(noteData);
        showSnackbar('Note created successfully');
      }
      setEditorOpen(false);
      setEditingNote(null);
      fetchNotes();
      fetchCategories();
    } catch (error) {
      showSnackbar('Failed to save note', 'error');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await noteApi.delete(id);
      showSnackbar('Note deleted');
      fetchNotes();
      fetchCategories();
    } catch {
      showSnackbar('Failed to delete note', 'error');
    }
  };

  const handleTogglePin = async (id) => {
    try {
      await noteApi.togglePin(id);
      fetchNotes();
    } catch {
      showSnackbar('Failed to update pin', 'error');
    }
  };

  const handleToggleArchive = async (id) => {
    try {
      await noteApi.toggleArchive(id);
      showSnackbar('Note archive status updated');
      fetchNotes();
      fetchCategories();
    } catch {
      showSnackbar('Failed to archive note', 'error');
    }
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleViewChange = (view) => {
    setActiveView(view);
    setSearchQuery('');
    if (isMobile) setMobileDrawerOpen(false);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // ========================
  // View Title
  // ========================

  const getViewTitle = () => {
    if (searchQuery) return 'Search Results';
    switch (activeView) {
      case 'all': return 'All Notes';
      case 'pinned': return 'Pinned Notes';
      case 'archived': return 'Archived Notes';
      default:
        if (activeView.startsWith('category:')) {
          return activeView.replace('category:', '');
        }
        return 'Notes';
    }
  };

  const getViewSubtitle = () => {
    if (searchQuery) return `${notes.length} result${notes.length !== 1 ? 's' : ''} for "${searchQuery}"`;
    return `${notes.length} note${notes.length !== 1 ? 's' : ''}`;
  };

  // ========================
  // Sidebar content (shared for desktop & mobile drawer)
  // ========================

  const sidebarContent = (
    <Sidebar
      activeView={activeView}
      onViewChange={handleViewChange}
      categories={categories}
      noteCount={notes.length}
      onAiClick={() => { setAiOpen(true); if (isMobile) setMobileDrawerOpen(false); }}
    />
  );

  // ========================
  // Render
  // ========================

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && sidebarContent}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          PaperProps={{
            sx: {
              background: 'rgba(10, 10, 26, 0.98)',
              backdropFilter: 'blur(20px)',
              width: 280,
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        {/* Top bar */}
        <Box
          sx={{
            px: { xs: 2, md: 4 },
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            borderBottom: '1px solid rgba(148, 163, 184, 0.06)',
            background: 'rgba(10, 10, 26, 0.6)',
            backdropFilter: 'blur(15px)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isMobile && (
              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ color: 'text.secondary' }}
                className="sidebar-mobile-toggle"
              >
                <MenuRounded />
              </IconButton>
            )}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.15rem', md: '1.35rem' } }}>
                {getViewTitle()}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                {getViewSubtitle()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <SearchBar onSearch={handleSearch} />
            </Box>

            <Tooltip title="Refresh" arrow>
              <IconButton
                onClick={fetchNotes}
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main', background: 'rgba(124, 58, 237, 0.08)' },
                }}
              >
                <RefreshRounded />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={handleCreateNote}
              id="create-note-button"
              sx={{
                whiteSpace: 'nowrap',
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              New Note
            </Button>
          </Box>
        </Box>

        {/* Mobile search bar */}
        {isMobile && (
          <Box sx={{ px: 2, pt: 2 }}>
            <SearchBar onSearch={handleSearch} />
          </Box>
        )}

        {/* Notes Grid */}
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3, flex: 1 }}>
          <NoteGrid
            notes={notes}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
            onTogglePin={handleTogglePin}
            onToggleArchive={handleToggleArchive}
            viewType={activeView}
            searchQuery={searchQuery}
          />
        </Box>
      </Box>

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          onClick={handleCreateNote}
          id="mobile-create-note-fab"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            boxShadow: '0 6px 20px rgba(124, 58, 237, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            },
          }}
        >
          <AddRounded />
        </Fab>
      )}

      {/* Note Editor Dialog */}
      <NoteEditor
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingNote(null); }}
        onSave={handleSaveNote}
        note={editingNote}
        categories={categories}
      />

      {/* AI Assistant Drawer */}
      <AiAssistant
        open={aiOpen}
        onClose={() => setAiOpen(false)}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: 3,
            fontWeight: 500,
            backdropFilter: 'blur(10px)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
