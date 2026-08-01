package com.smartnotes.controller;

import com.smartnotes.model.Note;
import com.smartnotes.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    /**
     * GET /api/notes — List all active notes
     */
    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes() {
        return ResponseEntity.ok(noteService.getAllActiveNotes());
    }


    /**
     * GET /api/notes/categories — List all categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(noteService.getCategories());
    }


    /**
     * GET /api/notes/category/{name} — Get notes by category
     */
    @GetMapping("/category/{name}")
    public ResponseEntity<List<Note>> getNotesByCategory(
            @PathVariable String name
    ) {
        return ResponseEntity.ok(noteService.getNotesByCategory(name));
    }


    /**
     * GET /api/notes/archived — List archived notes
     */
    @GetMapping("/archived")
    public ResponseEntity<List<Note>> getArchivedNotes() {
        return ResponseEntity.ok(noteService.getArchivedNotes());
    }


    /**
     * GET /api/notes/search?q=keyword — Search notes
     */
    @GetMapping("/search")
    public ResponseEntity<List<Note>> searchNotes(
            @RequestParam("q") String query
    ) {
        return ResponseEntity.ok(noteService.searchNotes(query));
    }


    /**
     * GET /api/notes/{id} — Get single note
     */
    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(
            @PathVariable Long id
    ) {
        return noteService.getNoteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    /**
     * POST /api/notes — Create note
     */
    @PostMapping
    public ResponseEntity<Note> createNote(
            @Valid @RequestBody Note note
    ) {
        Note created = noteService.createNote(note);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }


    /**
     * PUT /api/notes/{id} — Update note
     */
    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(
            @PathVariable Long id,
            @Valid @RequestBody Note noteDetails
    ) {
        return noteService.updateNote(id, noteDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    /**
     * DELETE /api/notes/{id} — Delete note
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNote(
            @PathVariable Long id
    ) {
        if (noteService.deleteNote(id)) {
            return ResponseEntity.ok(
                    Map.of("message", "Note deleted successfully")
            );
        }

        return ResponseEntity.notFound().build();
    }


    /**
     * PUT /api/notes/{id}/pin — Toggle pin
     */
    @PutMapping("/{id}/pin")
    public ResponseEntity<Note> togglePin(
            @PathVariable Long id
    ) {
        return noteService.togglePin(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    /**
     * PUT /api/notes/{id}/archive — Toggle archive
     */
    @PutMapping("/{id}/archive")
    public ResponseEntity<Note> toggleArchive(
            @PathVariable Long id
    ) {
        return noteService.toggleArchive(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}