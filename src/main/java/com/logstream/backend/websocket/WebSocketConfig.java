package com.logstream.backend.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final LiveLogHandler liveLogHandler;

    public WebSocketConfig(LiveLogHandler liveLogHandler) {
        this.liveLogHandler = liveLogHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(liveLogHandler, "/ws/logs")
        .setAllowedOriginPatterns("*");
    }
}