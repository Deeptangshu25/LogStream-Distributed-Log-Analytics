package com.logstream.backend.websocket;

import com.logstream.backend.model.LogEntry;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

class LiveLogBroadcasterTest {

    @Test
    void shouldAddAndRemoveWebSocketSession() {
        LiveLogBroadcaster broadcaster = new LiveLogBroadcaster();

        WebSocketSession session = mock(WebSocketSession.class);

        when(session.getId()).thenReturn("session-001");

        broadcaster.addSession(session);

        assertEquals(1, broadcaster.getConnectedClientCount());

        broadcaster.removeSession(session);

        assertEquals(0, broadcaster.getConnectedClientCount());
    }

    @Test
    void shouldBroadcastLogToConnectedSession() throws Exception {
        LiveLogBroadcaster broadcaster = new LiveLogBroadcaster();

        WebSocketSession session = mock(WebSocketSession.class);

        when(session.getId()).thenReturn("session-001");
        when(session.isOpen()).thenReturn(true);

        broadcaster.addSession(session);

        LogEntry log = new LogEntry(
                "log-001",
                Instant.parse("2026-09-14T13:40:00Z"),
                LogEntry.LogLevel.ERROR,
                "payment-service",
                "server-01",
                "Payment failed",
                920,
                "trace-001"
        );

        broadcaster.broadcast(log);

        ArgumentCaptor<TextMessage> captor =
                ArgumentCaptor.forClass(TextMessage.class);

        verify(session, times(1))
                .sendMessage(captor.capture());

        String message = captor.getValue().getPayload();

        assertTrue(message.contains("\"id\":\"log-001\""));
        assertTrue(message.contains("\"level\":\"ERROR\""));
        assertTrue(message.contains("\"service\":\"payment-service\""));
        assertTrue(message.contains("\"message\":\"Payment failed\""));
        assertTrue(message.contains("\"timestamp\":\"2026-09-14T13:40:00Z\""));
    }

    @Test
    void shouldRemoveClosedSessionDuringBroadcast() throws Exception {
        LiveLogBroadcaster broadcaster = new LiveLogBroadcaster();

        WebSocketSession session = mock(WebSocketSession.class);

        when(session.getId()).thenReturn("session-001");
        when(session.isOpen()).thenReturn(false);

        broadcaster.addSession(session);

        assertEquals(1, broadcaster.getConnectedClientCount());

        LogEntry log = new LogEntry(
                "log-002",
                Instant.parse("2026-09-14T13:45:00Z"),
                LogEntry.LogLevel.INFO,
                "order-service",
                "server-02",
                "Order processed",
                120,
                "trace-002"
        );

        broadcaster.broadcast(log);

        verify(session, never()).sendMessage(any(TextMessage.class));

        assertEquals(0, broadcaster.getConnectedClientCount());
    }
}