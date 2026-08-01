package com.smartnotes.service;

import com.smartnotes.model.Note;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@ConditionalOnProperty(name = "rag.enabled", havingValue = "true")
public class RagService {

    private static final Logger log = LoggerFactory.getLogger(RagService.class);

    private final NoteService noteService;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.base-url}")
    private String groqBaseUrl;

    @Value("${groq.model}")
    private String groqModel;

    private ChatLanguageModel chatModel;
    private boolean initialized = false;

    public RagService(NoteService noteService) {
        this.noteService = noteService;
    }

    @PostConstruct
    public void initialize() {
        try {
            chatModel = OpenAiChatModel.builder()
                    .apiKey(groqApiKey)
                    .baseUrl(groqBaseUrl)
                    .modelName(groqModel)
                    .build();

            initialized = true;

            log.info("Groq initialized successfully");

        } catch (Exception e) {
            initialized = false;

            log.error("Failed to initialize Groq", e);
        }
    }

    /**
     * Ask the AI assistant a question based on note content.
     */
    public Map<String, Object> askQuestion(String question) {
        Map<String, Object> result = new HashMap<>();

        if (!initialized) {
            result.put("answer", "AI Assistant is unavailable.");
            result.put("sources", List.of());

            return result;
        }

        try {
            List<Note> notes = noteService.getAllNotes();

            String context = notes.stream()
                    .map(note ->
                            "Title: " + note.getTitle()
                                    + "\nContent: "
                                    + note.getContent()
                    )
                    .collect(Collectors.joining("\n\n"));

            String prompt = """
You are an AI assistant.

Answer ONLY using the notes below.

If the answer is not available, say:

"I couldn't find that information in your notes."

Notes:

%s

Question:

%s
""".formatted(context, question);

            String answer = chatModel.generate(prompt);

            result.put("answer", answer);
            result.put("sources", List.of());

        } catch (Exception e) {
            result.put("answer", e.getMessage());
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
}