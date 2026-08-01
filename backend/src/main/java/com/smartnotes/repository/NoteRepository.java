package com.smartnotes.repository;

import com.smartnotes.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    /**
     * Find all active (non-archived) notes, pinned first, then by most recently updated.
     */
    List<Note> findByIsArchivedFalseOrderByIsPinnedDescUpdatedAtDesc();

    /**
     * Find all archived notes, ordered by most recently updated.
     */
    List<Note> findByIsArchivedTrueOrderByUpdatedAtDesc();

    /**
     * Search notes by keyword across title, content, category, and tags.
     */
    @Query("SELECT n FROM Note n WHERE n.isArchived = false AND (" +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(n.category) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(n.tags) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
           " ORDER BY n.isPinned DESC, n.updatedAt DESC")
    List<Note> searchNotes(@Param("keyword") String keyword);

    /**
     * Find notes by category.
     */
    List<Note> findByCategoryAndIsArchivedFalseOrderByIsPinnedDescUpdatedAtDesc(String category);

    /**
     * Get all distinct categories.
     */
    @Query("SELECT DISTINCT n.category FROM Note n WHERE n.category IS NOT NULL AND n.category <> '' ORDER BY n.category")
    List<String> findDistinctCategories();

    /**
     * Find all pinned, non-archived notes.
     */
    List<Note> findByIsPinnedTrueAndIsArchivedFalseOrderByUpdatedAtDesc();
}
