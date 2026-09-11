package com.logstream.backend.ingestion;

import com.logstream.backend.model.LogEntry;
import com.logstream.backend.service.LogIngestionService;
import com.logstream.proto.LogBatch;
import com.logstream.proto.LogLevel;
import com.logstream.proto.LogMessage;
import com.logstream.proto.LogResponse;
import com.logstream.proto.LogIngestionServiceGrpc;
import io.grpc.stub.StreamObserver;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
public class GrpcLogService extends LogIngestionServiceGrpc.LogIngestionServiceImplBase {

    private final LogIngestionService logIngestionService;

    public GrpcLogService(LogIngestionService logIngestionService) {
        this.logIngestionService = logIngestionService;
    }

    @Override
    public void sendLog(LogMessage request,
                        StreamObserver<LogResponse> responseObserver) {

        LogEntry logEntry = convertToLogEntry(request);
        boolean accepted = logIngestionService.ingest(logEntry);

        LogResponse response = LogResponse.newBuilder()
                .setSuccess(accepted)
                .setMessage(
                        accepted
                                ? "Log accepted successfully"
                                : "Log rejected during validation"
                )
                .setAcceptedCount(accepted ? 1 : 0)
                .setRejectedCount(accepted ? 0 : 1)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void sendLogs(LogBatch request,
                         StreamObserver<LogResponse> responseObserver) {

        List<LogEntry> logs = new ArrayList<>();

        for (LogMessage message : request.getLogsList()) {
            logs.add(convertToLogEntry(message));
        }

        LogIngestionService.IngestionResult result =
                logIngestionService.ingestBatch(logs);

        LogResponse response = LogResponse.newBuilder()
                .setSuccess(result.getRejectedCount() == 0)
                .setMessage(
                        "Batch processed: "
                                + result.getAcceptedCount()
                                + " accepted, "
                                + result.getRejectedCount()
                                + " rejected"
                )
                .setAcceptedCount(result.getAcceptedCount())
                .setRejectedCount(result.getRejectedCount())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    private LogEntry convertToLogEntry(LogMessage message) {

        Instant timestamp = parseTimestamp(message.getTimestamp());
        LogEntry.LogLevel level = convertLevel(message.getLevel());

        return new LogEntry(
                message.getId(),
                timestamp,
                level,
                message.getService(),
                message.getHost(),
                message.getMessage(),
                message.getResponseTimeMs(),
                message.getTraceId()
        );
    }

    private Instant parseTimestamp(String timestamp) {

        if (timestamp == null || timestamp.isBlank()) {
            return null;
        }

        try {
            return Instant.parse(timestamp);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private LogEntry.LogLevel convertLevel(LogLevel level) {

        return switch (level) {
            case DEBUG -> LogEntry.LogLevel.DEBUG;
            case INFO -> LogEntry.LogLevel.INFO;
            case WARN -> LogEntry.LogLevel.WARN;
            case ERROR -> LogEntry.LogLevel.ERROR;
            case LOG_LEVEL_UNSPECIFIED -> null;
            case UNRECOGNIZED -> null;
        };
    }
}