package com.logstream.backend.config;

import com.logstream.backend.ingestion.GrpcLogService;
import io.grpc.Server;
import io.grpc.ServerBuilder;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class GrpcConfig {

    private final GrpcLogService grpcLogService;

    private Server grpcServer;

    public GrpcConfig(GrpcLogService grpcLogService) {
        this.grpcLogService = grpcLogService;
    }

    @PostConstruct
    public void startGrpcServer() throws IOException {

        grpcServer = ServerBuilder
                .forPort(9090)
                .addService(grpcLogService)
                .build()
                .start();

        System.out.println("gRPC server started on port 9090");

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            GrpcConfig.this.stopGrpcServer();
        }));
    }

    @PreDestroy
    public void stopGrpcServer() {

        if (grpcServer != null) {
            grpcServer.shutdown();
            System.out.println("gRPC server stopped");
        }
    }
}