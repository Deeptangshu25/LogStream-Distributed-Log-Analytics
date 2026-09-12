package com.logstream.backend.ingestion;

import com.logstream.backend.service.LogIndexerService;
import com.logstream.backend.service.LogIngestionService;
import com.logstream.backend.service.LoggingLogIndexerService;
import com.logstream.proto.LogLevel;
import com.logstream.proto.LogMessage;
import com.logstream.proto.LogResponse;
import io.grpc.stub.StreamObserver;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GrpcLogServiceTest {

    @Test
    void shouldAcceptValidLog() {

        LogValidator validator = new LogValidator();

        LogIndexerService indexerService =
                new LoggingLogIndexerService();

        LogIngestionService ingestionService =
                new LogIngestionService(
                        validator,
                        indexerService
                );

        GrpcLogService grpcService =
                new GrpcLogService(ingestionService);

        LogMessage request = LogMessage.newBuilder()
                .setId("log-001")
                .setTimestamp("2026-09-11T17:30:00Z")
                .setLevel(LogLevel.INFO)
                .setService("payment-service")
                .setHost("server-01")
                .setMessage("Payment processed successfully")
                .setResponseTimeMs(120)
                .setTraceId("trace-001")
                .build();

        TestStreamObserver observer =
                new TestStreamObserver();

        grpcService.sendLog(request, observer);

        assertNotNull(observer.response);
        assertTrue(observer.response.getSuccess());
        assertEquals(1, observer.response.getAcceptedCount());
        assertEquals(0, observer.response.getRejectedCount());
        assertTrue(observer.completed);
    }

    private static class TestStreamObserver
            implements StreamObserver<LogResponse> {

        private LogResponse response;
        private boolean completed;

        @Override
        public void onNext(LogResponse response) {
            this.response = response;
        }

        @Override
        public void onError(Throwable throwable) {
            fail("gRPC call failed: " + throwable.getMessage());
        }

        @Override
        public void onCompleted() {
            completed = true;
        }
    }
}