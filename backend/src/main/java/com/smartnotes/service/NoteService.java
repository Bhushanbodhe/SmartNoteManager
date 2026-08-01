package com.smartnotes.service;

import com.smartnotes.model.Note;
import com.smartnotes.repository.NoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    /**
     * Get all active (non-archived) notes.
     */
    public List<Note> getAllActiveNotes() {
        return noteRepository.findByIsArchivedFalseOrderByIsPinnedDescUpdatedAtDesc();
    }

    /**
     * Get a note by ID.
     */
    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }

    /**
     * Create a new note.
     */
    public Note createNote(Note note) {
        return noteRepository.save(note);
    }

    /**
     * Update an existing note.
     */
    public Optional<Note> updateNote(Long id, Note noteDetails) {
        return noteRepository.findById(id).map(existingNote -> {
            if (noteDetails.getTitle() != null) {
                existingNote.setTitle(noteDetails.getTitle());
            }
            if (noteDetails.getContent() != null) {
                existingNote.setContent(noteDetails.getContent());
            }
            if (noteDetails.getCategory() != null) {
                existingNote.setCategory(noteDetails.getCategory());
            }
            if (noteDetails.getTags() != null) {
                existingNote.setTags(noteDetails.getTags());
            }
            if (noteDetails.getColor() != null) {
                existingNote.setColor(noteDetails.getColor());
            }
            if (noteDetails.getIsPinned() != null) {
                existingNote.setIsPinned(noteDetails.getIsPinned());
            }
            if (noteDetails.getIsArchived() != null) {
                existingNote.setIsArchived(noteDetails.getIsArchived());
            }
            return noteRepository.save(existingNote);
        });
    }

    /**
     * Delete a note by ID.
     */
    public boolean deleteNote(Long id) {
        if (noteRepository.existsById(id)) {
            noteRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Search notes by keyword.
     */
    public List<Note> searchNotes(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllActiveNotes();
        }
        return noteRepository.searchNotes(keyword.trim());
    }

    /**
     * Get all archived notes.
     */
    public List<Note> getArchivedNotes() {
        return noteRepository.findByIsArchivedTrueOrderByUpdatedAtDesc();
    }

    /**
     * Toggle pin status of a note.
     */
    public Optional<Note> togglePin(Long id) {
        return noteRepository.findById(id).map(note -> {
            note.setIsPinned(!note.getIsPinned());
            return noteRepository.save(note);
        });
    }

    /**
     * Toggle archive status of a note.
     */
    public Optional<Note> toggleArchive(Long id) {
        return noteRepository.findById(id).map(note -> {
            note.setIsArchived(!note.getIsArchived());
            // Unpin when archiving
            if (note.getIsArchived()) {
                note.setIsPinned(false);
            }
            return noteRepository.save(note);
        });
    }

    /**
     * Get all distinct categories.
     */
    public List<String> getCategories() {
        return noteRepository.findDistinctCategories();
    }

    /**
     * Get notes by category.
     */
    public List<Note> getNotesByCategory(String category) {
        return noteRepository.findByCategoryAndIsArchivedFalseOrderByIsPinnedDescUpdatedAtDesc(category);
    }

    /**
     * Get all notes (for RAG indexing).
     */
    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }
}
