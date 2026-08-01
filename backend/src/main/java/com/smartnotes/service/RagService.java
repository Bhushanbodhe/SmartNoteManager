package com.smartnotes.service;

import com.smartnotes.model.Note;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.model.ollama.OllamaEmbeddingModel;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@ConditionalOnProperty(name = "rag.enabled", havingValue = "true")
public class RagService {

    private static final Logger log = LoggerFactory.getLogger(RagService.class);

    private final NoteService noteService;

    @Value("${rag.ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${rag.ollama.chat-model:llama3.2}")
    private String chatModelName;

    @Value("${rag.ollama.embedding-model:nomic-embed-text}")
    private String embeddingModelName;

    private ChatLanguageModel chatModel;
    private EmbeddingModel embeddingModel;
    private EmbeddingStore<TextSegment> embeddingStore;
    private boolean initialized = false;

    public RagService(NoteService noteService) {
        this.noteService = noteService;
    }

    @PostConstruct
    public void initialize() {
        try {
            log.info("Initializing RAG service with Ollama at {}", ollamaBaseUrl);

            // Initialize models
            this.chatModel = OllamaChatModel.builder()
                    .baseUrl(ollamaBaseUrl)
                    .modelName(chatModelName)
                    .temperature(0.7)
                    .build();

            this.embeddingModel = OllamaEmbeddingModel.builder()
                    .baseUrl(ollamaBaseUrl)
                    .modelName(embeddingModelName)
                    .build();

            this.embeddingStore = new InMemoryEmbeddingStore<>();

            // Index existing notes
            reindexNotes();

            this.initialized = true;
            log.info("RAG service initialized successfully");

        } catch (Exception e) {
            log.warn("Failed to initialize RAG service: {}. AI features will be unavailable.", e.getMessage());
            this.initialized = false;
        }
    }

    /**
     * Re-index all notes into the embedding store.
     */
    public void reindexNotes() {
        if (embeddingModel == null || embeddingStore == null) {
            log.warn("RAG models not initialized. Skipping re-index.");
            return;
        }

        try {
            // Clear existing embeddings
            this.embeddingStore = new InMemoryEmbeddingStore<>();

            List<Note> allNotes = noteService.getAllNotes();
            if (allNotes.isEmpty()) {
                log.info("No notes to index.");
                return;
            }

            // Convert notes to documents
            List<Document> documents = allNotes.stream()
                    .map(this::noteToDocument)
                    .collect(Collectors.toList());

            // Ingest documents
            EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                    .documentSplitter(DocumentSplitters.recursive(300, 50))
                    .embeddingModel(embeddingModel)
                    .embeddingStore(embeddingStore)
                    .build();

            ingestor.ingest(documents);
            log.info("Indexed {} notes into embedding store", allNotes.size());

        } catch (Exception e) {
            log.error("Failed to re-index notes: {}", e.getMessage());
        }
    }

    /**
     * Ask the AI assistant a question based on note content.
     */
    public Map<String, Object> askQuestion(String question) {
        Map<String, Object> result = new HashMap<>();

        if (!initialized) {
            result.put("answer", "AI assistant is not available. Please ensure Ollama is running and RAG is enabled.");
            result.put("sources", List.of());
            return result;
        }

        try {
            // Retrieve relevant content
            EmbeddingStoreContentRetriever retriever = EmbeddingStoreContentRetriever.builder()
                    .embeddingStore(embeddingStore)
                    .embeddingModel(embeddingModel)
                    .maxResults(5)
                    .minScore(0.5)
                    .build();

            var query = dev.langchain4j.rag.query.Query.from(question);
            var relevantContent = retriever.retrieve(query);

            // Build context from retrieved content
            StringBuilder context = new StringBuilder();
            List<Map<String, String>> sources = new ArrayList<>();

            for (var content : relevantContent) {
                context.append(content.textSegment().text()).append("\n\n");
                var metadata = content.textSegment().metadata();
                if (metadata.getString("noteTitle") != null) {
                    Map<String, String> source = new HashMap<>();
                    source.put("title", metadata.getString("noteTitle"));
                    source.put("category", metadata.getString("category") != null ? metadata.getString("category") : "");
                    // Avoid duplicate sources
                    if (sources.stream().noneMatch(s -> s.get("title").equals(source.get("title")))) {
                        sources.add(source);
                    }
                }
            }

            // Generate answer
            String prompt = String.format(
                    "You are a helpful AI assistant for a notes application. " +
                    "Answer the user's question based on the following notes content. " +
                    "If the notes don't contain relevant information, say so honestly.\n\n" +
                    "Notes content:\n%s\n\nQuestion: %s\n\nAnswer:",
                    context.toString(), question
            );

            String answer = chatModel.generate(prompt);

            result.put("answer", answer);
            result.put("sources", sources);

        } catch (Exception e) {
            log.error("Error generating AI response: {}", e.getMessage());
            result.put("answer", "Sorry, an error occurred while processing your question: " + e.getMessage());
            result.put("sources", List.of());
        }

        return result;
    }

    /**
     * Check if RAG service is available.
     */
    public boolean isAvailable() {
        return initialized;
    }

    /**
     * Convert a Note entity to a LangChain4j Document.
     */
    private Document noteToDocument(Note note) {
        StringBuilder text = new StringBuilder();
        text.append("Title: ").append(note.getTitle()).append("\n");
        if (note.getContent() != null && !note.getContent().isEmpty()) {
            text.append("Content: ").append(note.getContent()).append("\n");
        }
        if (note.getCategory() != null && !note.getCategory().isEmpty()) {
            text.append("Category: ").append(note.getCategory()).append("\n");
        }
        if (note.getTags() != null && !note.getTags().isEmpty()) {
            text.append("Tags: ").append(note.getTags()).append("\n");
        }

        Metadata metadata = new Metadata();
        metadata.put("noteId", String.valueOf(note.getId()));
        metadata.put("noteTitle", note.getTitle());
        if (note.getCategory() != null) {
            metadata.put("category", note.getCategory());
        }

        return Document.from(text.toString(), metadata);
    }
}
