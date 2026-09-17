# LogStream API Contract

## Base URL

```text
http://localhost:8081
```

---

## 1. Ingest Single Log

### Endpoint

```http
POST /api/logs
```

### Request

```json
{
  "id": "log-001",
  "timestamp": "2026-09-17T12:00:00Z",
  "level": "ERROR",
  "service": "payment-service",
  "host": "server-01",
  "message": "Payment failed",
  "responseTimeMs": 920,
  "traceId": "trace-001"
}
```

### Success Response

```text
200 OK
Log accepted successfully
```

### Validation Failure

```text
400 Bad Request
Log rejected during validation
```

---

## 2. Ingest Log Batch

### Endpoint

```http
POST /api/logs/batch
```

### Request

```json
[
  {
    "id": "log-001",
    "timestamp": "2026-09-17T12:00:00Z",
    "level": "INFO",
    "service": "payment-service",
    "host": "server-01",
    "message": "Payment started",
    "responseTimeMs": 120,
    "traceId": "trace-001"
  }
]
```

### Response

```json
{
  "acceptedCount": 1,
  "rejectedCount": 0,
  "acceptedLogs": [],
  "rejectedLogs": []
}
```

---

## 3. Search Logs

### Endpoint

```http
GET /api/logs/search
```

### Query Parameters

| Parameter | Description |
|---|---|
| `query` | Text search query |
| `service` | Filter by service |
| `level` | Filter by log level |
| `host` | Filter by host |
| `startTime` | Start of time range |
| `endTime` | End of time range |
| `page` | Zero-based page number |
| `size` | Number of results per page |

### Example

```http
GET /api/logs/search?query=payment&level=ERROR&page=0&size=20
```

### Response

```json
{
  "logs": [],
  "totalHits": 0,
  "page": 0,
  "size": 20
}
```

---

## 4. System Status

### Endpoint

```http
GET /api/system/status
```

### Response

```json
{
  "status": "UP",
  "service": "logstream-backend",
  "timestamp": "2026-09-17T12:00:00Z",
  "webSocketClients": 0
}
```

---

## 5. WebSocket Live Logs

### Endpoint

```text
ws://localhost:8081/ws/logs
```

The server broadcasts validated logs to connected WebSocket clients.

### Example Message

```json
{
  "id": "log-001",
  "timestamp": "2026-09-17T12:00:00Z",
  "level": "ERROR",
  "service": "payment-service",
  "host": "server-01",
  "message": "Payment failed",
  "responseTimeMs": 920,
  "traceId": "trace-001"
}
```

---

## 6. gRPC

### Server

```text
localhost:9090
```

### Service

```text
LogIngestionService
```

### RPC Methods

```text
SendLog(LogMessage) returns (LogResponse)
SendLogs(LogBatch) returns (LogResponse)
```

---

## 7. Log Validation

A log is accepted only when:

- `id` is present and non-blank
- `timestamp` is valid
- `level` is present
- `service` is present and non-blank
- `host` is present and non-blank
- `message` is present and non-blank
- `responseTimeMs` is not negative

Invalid logs are rejected before indexing and live broadcasting.

---

## 8. Pagination

### Default Values

```text
page = 0
size = 20
```

### Maximum Page Size

```text
100
```

Negative page numbers are converted to `0`.

Non-positive page sizes are converted to the default size of `20`.

---

## 9. Integration Boundary

Validated logs are forwarded through:

```java
LogIndexerService
```

The interface is responsible for connecting backend ingestion with the search/indexing implementation.

The backend does not depend directly on the concrete search-engine implementation.