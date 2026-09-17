package com.logstream.backend.api;

import com.logstream.backend.websocket.LiveLogBroadcaster;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    private final LiveLogBroadcaster liveLogBroadcaster;

    public SystemController(LiveLogBroadcaster liveLogBroadcaster) {
        this.liveLogBroadcaster = liveLogBroadcaster;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {

        Map<String, Object> status = new LinkedHashMap<>();

        status.put("status", "UP");
        status.put("service", "logstream-backend");
        status.put("timestamp", Instant.now().toString());
        status.put(
                "webSocketClients",
                liveLogBroadcaster.getConnectedClientCount()
        );

        return ResponseEntity.ok(status);
    }
}