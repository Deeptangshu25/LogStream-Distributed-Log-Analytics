package com.logstream.backend.api;

import com.logstream.backend.websocket.LiveLogBroadcaster;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class SystemControllerTest {

    @Test
    void shouldReturnSystemStatus() {

        LiveLogBroadcaster broadcaster = new LiveLogBroadcaster();
        SystemController controller = new SystemController(broadcaster);

        ResponseEntity<Map<String, Object>> response =
                controller.getStatus();

        assertEquals(200, response.getStatusCode().value());

        Map<String, Object> body = response.getBody();

        assertNotNull(body);
        assertEquals("UP", body.get("status"));
        assertEquals("logstream-backend", body.get("service"));
        assertNotNull(body.get("timestamp"));
        assertEquals(0, body.get("webSocketClients"));
    }
}