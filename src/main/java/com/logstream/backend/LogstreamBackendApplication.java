package com.logstream.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
        "com.logstream.backend",
        "com.logstream.searchengine"
})
public class LogstreamBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(LogstreamBackendApplication.class, args);
    }
}