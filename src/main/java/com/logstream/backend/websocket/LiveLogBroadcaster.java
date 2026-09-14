package com.logstream.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.logstream.backend.model.LogEntry;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class LiveLogBroadcaster {

    private final ObjectMapper objectMapper =
            new ObjectMapper()
                    .registerModule(new JavaTimeModule())
                    .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private final Set<WebSocketSession> sessions =
            new CopyOnWriteArraySet<>();

    public LiveLogBroadcaster() {
    }

    public void addSession(WebSocketSession session) {

        sessions.add(session);

        System.out.println(
                "WebSocket client connected: " + session.getId()
        );
    }

    public void removeSession(WebSocketSession session) {

        sessions.remove(session);

        System.out.println(
                "WebSocket client disconnected: " + session.getId()
        );
    }

    public void broadcast(LogEntry log) {

        try {

            String json =
                    objectMapper.writeValueAsString(log);

            TextMessage message =
                    new TextMessage(json);

            for (WebSocketSession session : sessions) {

                if (session.isOpen()) {

                    session.sendMessage(message);

                } else {

                    sessions.remove(session);
                }
            }

        } catch (Exception e) {

            System.err.println(
                    "Failed to broadcast log: "
                            + e.getMessage()
            );
        }
    }

    public int getConnectedClientCount() {

        return sessions.size();
    }
}