package com.logstream.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.logstream.backend.model.LogEntry;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class LiveLogHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;

    public LiveLogHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        System.out.println("WebSocket client connected: " + session.getId());
    }

    public void sendLog(WebSocketSession session, LogEntry log) {
        try {
            String json = objectMapper.writeValueAsString(log);
            session.sendMessage(new TextMessage(json));
        } catch (Exception e) {
            System.err.println("Failed to send log: " + e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(
            WebSocketSession session,
            org.springframework.web.socket.CloseStatus status) {

        System.out.println("WebSocket client disconnected: " + session.getId());
    }
}