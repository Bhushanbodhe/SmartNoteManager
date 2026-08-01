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

    private static final Logger log =
            LoggerFactory.getLogger(RagService.class);

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


    /**
     * Initialize Groq AI model
     */
    @PostConstruct
    public void initialize() {

        try {

            chatModel = OpenAiChatModel.builder()
                    .apiKey(groqApiKey)
                    .baseUrl(groqBaseUrl)
                    .modelName(groqModel)
                    .build();


            initialized = true;

            log.info("Groq AI initialized successfully");


        } catch (Exception e) {

            initialized = false;

            log.error("Failed to initialize Groq AI", e);
        }
    }



    /**
     * Ask AI question using notes as context
     */
    public Map<String, Object> askQuestion(String question) {


        Map<String, Object> response = new HashMap<>();


        if (!initialized) {

            response.put(
                    "answer",
                    "AI Assistant is currently unavailable."
            );

            response.put(
                    "sources",
                    List.of()
            );

            return response;
        }



        try {


            List<Note> notes = noteService.getAllNotes();



            String context = notes.stream()

                    .map(note ->
                            "Title: "
                                    + note.getTitle()
                                    + "\nContent: "
                                    + note.getContent()
                    )

                    .collect(Collectors.joining("\n\n"));



            String prompt = """
                    You are an AI assistant for Smart Note Manager.

                    Answer the user's question using ONLY the notes provided.

                    If the answer is not available in the notes,
                    reply:
                    "I couldn't find that information in your notes."


                    NOTES:

                    %s


                    USER QUESTION:

                    %s
                    """.formatted(
                            context,
                            question
                    );



            String answer =
                    chatModel.generate(prompt);



            response.put(
                    "answer",
                    answer
            );


            response.put(
                    "sources",
                    List.of()
            );



        } catch (Exception e) {


            log.error(
                    "Error while generating AI response",
                    e
            );


            response.put(
                    "answer",
                    "Something went wrong while processing your request."
            );


            response.put(
                    "sources",
                    List.of()
            );

        }


        return response;
    }




    /**
     * Check RAG availability
     */
    public boolean isAvailable() {

        return initialized;
    }




    /**
     * Rebuild RAG index.
     *
     * Current implementation:
     * Uses direct database retrieval,
     * so no vector index rebuilding is required.
     */
    public void reindexNotes() {


        log.info(
                "Reindex requested. Current RAG implementation uses direct note retrieval."
        );

    }

}