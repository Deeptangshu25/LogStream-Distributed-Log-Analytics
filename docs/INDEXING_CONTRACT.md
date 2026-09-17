# LogStream Indexing Contract

## Purpose

The indexing layer receives validated `LogEntry` objects from the backend ingestion service and makes them available to the search engine.

The backend communicates with the indexing layer through the `LogIndexerService` interface.

---

## Interface

```java
public interface LogIndexerService {

    void index(LogEntry log);

    void indexBatch(Iterable<LogEntry> logs);
}