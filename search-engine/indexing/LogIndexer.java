package com.logstream.searchengine.indexing;

import com.logstream.backend.model.LogEntry;
import com.logstream.backend.service.LogIndexerService;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.LongPoint;
import org.apache.lucene.document.StoredField;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@Primary
public final class LogIndexer
        implements LogIndexerService, AutoCloseable {

    private final IndexManager indexManager;

    public LogIndexer(IndexManager indexManager) {

        this.indexManager =
                Objects.requireNonNull(
                        indexManager,
                        "indexManager must not be null"
                );
    }

    @Override
    public void index(LogEntry log) {

        LogEntry validLog =
                requireIndexableLog(log);

        try {

            indexManager.update(
                    validLog.getId(),
                    toDocument(validLog)
            );

        } catch (java.io.IOException exception) {

            throw new IllegalStateException(
                    "Unable to index log " + validLog.getId(),
                    exception
            );
        }
    }

    @Override
    public void indexBatch(
            Iterable<LogEntry> logs
    ) {

        Objects.requireNonNull(
                logs,
                "logs must not be null"
        );

        List<IndexManager.IndexedDocument> documents =
                new ArrayList<>();

        for (LogEntry log : logs) {

            LogEntry validLog =
                    requireIndexableLog(log);

            documents.add(
                    new IndexManager.IndexedDocument(
                            validLog.getId(),
                            toDocument(validLog)
                    )
            );
        }

        if (documents.isEmpty()) {
            return;
        }

        try {

            indexManager.updateBatch(documents);

        } catch (java.io.IOException exception) {

            throw new IllegalStateException(
                    "Unable to index log batch",
                    exception
            );
        }
    }

    private static LogEntry requireIndexableLog(
            LogEntry log
    ) {

        if (log == null) {
            throw new IllegalArgumentException(
                    "log must not be null"
            );
        }

        if (log.getId() == null ||
                log.getId().isBlank()) {

            throw new IllegalArgumentException(
                    "log id must not be blank"
            );
        }

        if (log.getTimestamp() == null) {

            throw new IllegalArgumentException(
                    "log timestamp must not be null"
            );
        }

        if (log.getLevel() == null) {

            throw new IllegalArgumentException(
                    "log level must not be null"
            );
        }

        if (log.getService() == null ||
                log.getService().isBlank()) {

            throw new IllegalArgumentException(
                    "log service must not be blank"
            );
        }

        if (log.getHost() == null ||
                log.getHost().isBlank()) {

            throw new IllegalArgumentException(
                    "log host must not be blank"
            );
        }

        if (log.getMessage() == null ||
                log.getMessage().isBlank()) {

            throw new IllegalArgumentException(
                    "log message must not be blank"
            );
        }

        if (log.getResponseTimeMs() < 0) {

            throw new IllegalArgumentException(
                    "log response time must not be negative"
            );
        }

        return log;
    }

    private static Document toDocument(
            LogEntry log
    ) {

        long timestamp =
                log.getTimestamp().toEpochMilli();

        Document document =
                new Document();

        addExactField(
                document,
                LuceneConfig.FIELD_ID,
                log.getId()
        );

        addExactField(
                document,
                LuceneConfig.FIELD_LEVEL,
                log.getLevel().name()
        );

        addExactField(
                document,
                LuceneConfig.FIELD_SERVICE,
                log.getService()
        );

        addExactField(
                document,
                LuceneConfig.FIELD_HOST,
                log.getHost()
        );

        addExactField(
                document,
                LuceneConfig.FIELD_TRACE_ID,
                valueOrEmpty(log.getTraceId())
        );

        document.add(
                new TextField(
                        LuceneConfig.FIELD_MESSAGE,
                        log.getMessage(),
                        Field.Store.YES
                )
        );

        document.add(
                new LongPoint(
                        LuceneConfig.FIELD_TIMESTAMP,
                        timestamp
                )
        );

        document.add(
                new StoredField(
                        LuceneConfig.FIELD_TIMESTAMP,
                        timestamp
                )
        );

        document.add(
                new LongPoint(
                        LuceneConfig.FIELD_RESPONSE_TIME_MS,
                        log.getResponseTimeMs()
                )
        );

        document.add(
                new StoredField(
                        LuceneConfig.FIELD_RESPONSE_TIME_MS,
                        log.getResponseTimeMs()
                )
        );

        return document;
    }

    private static void addExactField(
            Document document,
            String field,
            String value
    ) {

        document.add(
                new StringField(
                        field,
                        valueOrEmpty(value),
                        Field.Store.YES
                )
        );
    }

    private static String valueOrEmpty(
            String value
    ) {

        return value == null
                ? ""
                : value;
    }

    @Override
    public void close()
            throws java.io.IOException {

        indexManager.close();
    }
}