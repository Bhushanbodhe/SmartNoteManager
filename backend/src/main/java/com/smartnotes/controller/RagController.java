package com.smartnotes.controller;

import com.smartnotes.service.RagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rag")
public class RagController {

    private final RagService ragService;

    /**
     * RagService may not be present if rag.enabled=false,
     * so we use optional injection.
     */
    @Autowired(required = false)
    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    /**
     * Default constructor for when RAG is disabled.
     */
    public RagController() {
        this.ragService = null;
    }

    /**
     * POST /api/rag/ask — Ask the AI assistant a question.
     */
    @PostMapping("/ask")
    public ResponseEntity<Map<String, Object>> askQuestion(@RequestBody Map<String, String> request) {
        if (ragService == null) {
            return ResponseEntity.ok(Map.of(
                    "answer", "AI assistant is not enabled. Set rag.enabled=true in application.properties and ensure Ollama is running.",
                    "sources", java.util.List.of()
            ));
        }

        String question = request.get("question");
        if (question == null || question.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Question is required"
            ));
        }

        Map<String, Object> response = ragService.askQuestion(question.trim());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/rag/status — Check if RAG is available.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        boolean available = ragService != null && ragService.isAvailable();
        return ResponseEntity.ok(Map.of(
                "enabled", ragService != null,
                "available", available,
                "message", available
                        ? "AI assistant is ready"
                        : "AI assistant is not available. Ensure Ollama is running and rag.enabled=true."
        ));
    }

    /**
     * POST /api/rag/reindex — Manually trigger re-indexing.
     */
    @PostMapping("/reindex")
    public ResponseEntity<Map<String, String>> reindex() {
        if (ragService == null) {
            return ResponseEntity.ok(Map.of("message", "RAG is not enabled"));
        }
        ragService.reindexNotes();
        return ResponseEntity.ok(Map.of("message", "Re-indexing completed"));
    }
}
