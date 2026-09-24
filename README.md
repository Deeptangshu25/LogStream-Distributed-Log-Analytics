# LogStream – Distributed Log Analytics & Alerting Platform

A distributed log analytics and alerting platform designed to ingest, validate, index, search, analyze, and monitor application logs from multiple services in real time.

## Project Overview


Modern distributed applications generate large volumes of logs across multiple services and hosts. LogStream provides a centralized platform for collecting logs through REST and gRPC, validating and processing them, indexing them for search, analyzing them, and streaming live logs through WebSockets.

## Key Features

### Log Ingestion
- REST API for single log ingestion
- REST API for batch log ingestion
- gRPC-based log ingestion
- Input validation
- Accepted and rejected log tracking

### Real-Time Log Streaming
- WebSocket-based live log streaming
- Broadcast validated logs to connected clients
- Support for multiple WebSocket clients

### Log Analytics
- Total log count
- ERROR, WARN, INFO, and DEBUG counts
- Average response time
- Service-wise log distribution

### Log Search
- Free-text query
- Service filtering
- Log-level filtering
- Host filtering
- Start/end time filtering
- Pagination
- Maximum page-size control

### System Monitoring
- Backend status
- Service name
- Current timestamp
- Connected WebSocket client count

### Alerting
The architecture includes support for alert rules, log-based alert detection, alert management, and alerting integration with the search/analytics pipeline.

## Architecture

```text
Distributed Services
        │
        ├──────── REST
        │
        └──────── gRPC
                 │
                 ▼
        ┌─────────────────┐
        │  Spring Boot    │
        │     Backend     │
        └────────┬────────┘
                 │
                 ▼
           Log Validation
                 │
                 ▼
        Log Ingestion Service
                 │
       ┌─────────┼─────────┐
       │         │         │
       ▼         ▼         ▼
   LogStore  Indexer  WebSocket
       │         │         │
       │         ▼         ▼
       │      Lucene   Live Logs
       │
       ▼
    Analytics
       │
       ▼
   Search / Analytics
       │
       ▼
 React Dashboard
```

## Log Processing Flow

```text
Log Producer
     │
     ▼
REST / gRPC
     │
     ▼
Log Message
     │
     ▼
Validation
     │
     ├── Invalid ──► Rejected
     │
     ▼
Valid Log
     │
     ├──────────────► LogStore
     ├──────────────► Indexing
     └──────────────► WebSocket
                            │
                            ▼
                       Live Dashboard
```

LogStream is designed to ingest, index, search, analyze, and monitor large volumes of application logs.
## GitHub Public Event Collector

LogStream includes a Node.js-based collector that consumes public activity from the GitHub Events API and transforms those events into LogStream-compatible log entries.

> Note: These are public GitHub activity events, not GitHub's private internal server/application logs.

### Data Flow

```text
GitHub Public Events API
          │
          ▼
   Node.js Collector
    (log-generator)
          │
          │ Transform GitHub Event
          ▼
   LogStream LogEntry
          │
          │ POST /api/logs
          ▼
   Spring Boot Backend
          │
     ┌────┼─────────────┐
     ▼    ▼             ▼
  LogStore Lucene    WebSocket
           │             │
           ▼             ▼
        Search       Live Tail
           │
           ▼
       Analytics
Supported GitHub Events

The collector converts GitHub public events into the following LogStream log levels:

GitHub Event	Log Level
PushEvent	INFO
ReleaseEvent	INFO
CreateEvent	INFO
WatchEvent	DEBUG
ForkEvent	DEBUG
IssuesEvent	WARN
PullRequestEvent	WARN
DeleteEvent	ERROR
Collector Structure
log-generator/
├── package.json
├── package-lock.json
└── server.js
Requirements
Node.js
npm
LogStream backend running on port 8081
Install Dependencies

From the project root:

cd log-generator
npm install
Start the Collector

Make sure the LogStream backend is running first:

mvn spring-boot:run

Then start the GitHub collector:

cd log-generator
node server.js

The collector will:

Fetch public GitHub events.
Detect new events.
Convert GitHub events into LogStream LogEntry objects.
Send them to POST /api/logs.
Repeat periodically while avoiding duplicate event IDs.

Example output:

🚀 GitHub → LogStream Collector
📡 GitHub API: https://api.github.com/events
📡 LogStream: http://localhost:8081/api/logs

🔄 Fetching GitHub public events...
📥 Received 30 GitHub events
✅ [INFO] github-public-events → ...
✅ [DEBUG] github-public-events → ...
📤 Sent new events to LogStream
Example Converted Log

A GitHub public event is transformed into the LogStream format:

{
  "id": "github-123456789",
  "timestamp": "2026-09-23T18:30:00Z",
  "level": "INFO",
  "service": "github-public-events",
  "host": "api.github.com",
  "message": "user pushed changes to owner/repository",
  "responseTimeMs": 120,
  "traceId": "github-123456789"
}
Real-Time Dashboard

Once the collector is running, the events enter the normal LogStream pipeline:

GitHub
  ↓
Node.js Collector
  ↓
REST Ingestion API
  ↓
Validation
  ↓
LogStore + Lucene + WebSocket
  ↓
Live Tail
  ↓
Analytics / Search / Alerts

This allows the dashboard to visualize real public GitHub activity alongside logs generated by other applications.


### Also update the Project Structure

Your current README's structure currently ends with `README.md`. :contentReference[oaicite:1]{index=1}

Add:

```text
├── log-generator/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js

So that part becomes:

├── log-generator/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── pom.xml
└── README.md
## Technology Stack

### Backend
- Java
- Spring Boot
- Maven
- gRPC
- Protocol Buffers
- WebSockets

### Search & Analytics
- Apache Lucene
- Java-based search and indexing
- Log aggregation and analytics

### Frontend
- React
- ECharts
- WebSocket client
- REST API integration

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/logs` | Ingest a single log |
| `POST` | `/api/logs/batch` | Ingest multiple logs |
| `GET` | `/api/logs/search` | Search and filter logs |
| `GET` | `/api/logs/analytics` | Get log analytics |
| `GET` | `/api/system/status` | Get backend system status |
| `WebSocket` | `/ws/logs` | Receive live log updates |

## REST API

### Ingest a Single Log

```http
POST /api/logs
Content-Type: application/json
```

Example:

```json
{
  "id": "log-001",
  "timestamp": "2026-09-17T12:00:00Z",
  "level": "INFO",
  "service": "payment-service",
  "host": "server-01",
  "message": "Payment processed successfully",
  "responseTimeMs": 120,
  "traceId": "trace-001"
}
```

Response:

```text
Log accepted successfully
```

### Batch Log Ingestion

```http
POST /api/logs/batch
Content-Type: application/json
```

The batch endpoint supports multiple log entries and returns accepted and rejected log counts.

## Search API

```http
GET /api/logs/search
```

Supported query parameters:

| Parameter | Description |
|---|---|
| `query` | Free-text search query |
| `service` | Filter by service |
| `level` | Filter by log level |
| `host` | Filter by host |
| `startTime` | Start time |
| `endTime` | End time |
| `page` | Page number |
| `size` | Number of results per page |

Example:

```text
GET /api/logs/search?query=payment%20failed&service=payment-service&level=ERROR&page=0&size=20
```

Example response structure:

```json
{
  "logs": [],
  "totalHits": 0,
  "page": 0,
  "size": 20
}
```

## Analytics API

```http
GET /api/logs/analytics
```

Example response:

```json
{
  "averageResponseTimeMs": 200.0,
  "debugCount": 0,
  "errorCount": 1,
  "infoCount": 1,
  "logsByService": {
    "payment-service": 2,
    "user-service": 1
  },
  "totalLogs": 3,
  "warnCount": 1
}
```

## System Status API

```http
GET /api/system/status
```

Example:

```json
{
  "status": "UP",
  "service": "logstream-backend",
  "timestamp": "2026-09-17T12:44:56Z",
  "webSocketClients": 0
}
```

## WebSocket

Live logs are streamed through:

```text
ws://localhost:8081/ws/logs
```

Example message:

```json
{
  "id": "log-001",
  "timestamp": "2026-09-17T12:00:00Z",
  "level": "INFO",
  "service": "payment-service",
  "host": "server-01",
  "message": "Payment processed successfully",
  "responseTimeMs": 120,
  "traceId": "trace-001"
}
```

## gRPC

The backend provides:

```text
Service: LogIngestionService
Port: 9090
```

RPC methods:

```text
SendLog(LogMessage)
SendLogs(LogBatch)
```

The Protocol Buffers definition is located at:

```text
proto/log.proto
```

## Log Data Model

A log entry contains:

```text
id
timestamp
level
service
host
message
responseTimeMs
traceId
```

Supported log levels:

```text
DEBUG
INFO
WARN
ERROR
```

## Validation

Logs are validated before entering the processing pipeline.

Validation includes:

- Log ID must be present
- Timestamp must be present
- Log level must be present
- Service must be present
- Host must be present
- Message must be present
- Response time must not be negative

Invalid logs are rejected and are not forwarded to the indexing or live-streaming pipeline.

## Indexing Architecture

The backend uses an abstraction to keep ingestion independent from the concrete search engine.

```text
LogIngestionService
        │
        ▼
LogIndexerService
        │
        ▼
Lucene Indexer
```

The indexing boundary provides:

```java
void index(LogEntry log);
void indexBatch(Iterable<LogEntry> logs);
```

## Search Architecture

```text
SearchController
       │
       ▼
SearchRequest
       │
       ▼
SearchService
       │
       ▼
Lucene Search
       │
       ▼
SearchResult
```

The `SearchResult` contains:

```text
logs
totalHits
page
size
```

## Project Structure

```text
LogStream-Distributed-Log-Analytics/
│
├── docs/
│   ├── API_CONTRACT.md
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── SETUP.md
│   └── TESTING.md
│
├── proto/
│   └── log.proto
│
├── search-engine/
│   ├── indexing/
│   ├── search/
│   ├── aggregation/
│   └── alerting/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── charts/
│       └── websocket/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/logstream/backend/
│   │   │       ├── api/
│   │   │       ├── config/
│   │   │       ├── ingestion/
│   │   │       ├── model/
│   │   │       ├── service/
│   │   │       └── websocket/
│   │   └── resources/
│   │
│   └── test/
│       └── java/
│
├── pom.xml
└── README.md
```

## Backend Components

### API Layer

Responsible for exposing HTTP endpoints.

Current controllers include:

```text
LogController
SearchController
AnalyticsController
SystemController
AlertController
```

### Ingestion Layer

Responsible for:

- gRPC log reception
- Log validation
- Conversion of incoming messages into internal log objects

### Service Layer

Responsible for:

- Log ingestion
- Analytics
- Search
- Indexing abstraction
- Alerting
- Log storage

### WebSocket Layer

Responsible for:

- Managing WebSocket connections
- Broadcasting validated logs
- Supporting live dashboard updates

## Testing

The backend currently contains automated tests covering:

- REST log ingestion
- gRPC log ingestion
- Log validation
- Batch processing
- LogStore integration
- Analytics service
- Analytics controller
- Search service
- Search controller
- Search request filters
- System status
- WebSocket broadcasting

Current test status:

```text
Tests run: 30
Failures: 0
Errors: 0
Skipped: 0
```

Run the complete test suite with:

```bash
mvn clean test
```

## Running the Backend

### Requirements

Install:

- Java
- Maven

Verify Java:

```bash
java -version
```

Verify Maven:

```bash
mvn -version
```

### Start the Application

```bash
mvn spring-boot:run
```

HTTP server:

```text
http://localhost:8081
```

gRPC server:

```text
localhost:9090
```

## Example End-to-End Flow

### 1. Send a log

```bash
curl -X POST http://localhost:8081/api/logs \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"log-001\",\"timestamp\":\"2026-09-17T12:00:00Z\",\"level\":\"INFO\",\"service\":\"payment-service\",\"host\":\"server-01\",\"message\":\"Payment processed successfully\",\"responseTimeMs\":120,\"traceId\":\"trace-001\"}"
```

### 2. Request analytics

```bash
curl http://localhost:8081/api/logs/analytics
```

### 3. Search logs

```bash
curl "http://localhost:8081/api/logs/search?query=payment&page=0&size=20"
```

### 4. Check system status

```bash
curl http://localhost:8081/api/system/status
```

## Development Status

### Completed

- [x] Project structure
- [x] Spring Boot backend
- [x] Log data model
- [x] Log validation
- [x] REST log ingestion
- [x] Batch log ingestion
- [x] gRPC log ingestion
- [x] WebSocket live log streaming
- [x] Log indexing abstraction
- [x] In-memory LogStore
- [x] Analytics service
- [x] Analytics REST API
- [x] System status API
- [x] Search API foundation
- [x] Search request filter handling
- [x] Backend API documentation
- [x] Automated backend tests

### In Progress

- [ ] Lucene indexing integration
- [ ] Lucene search integration
- [ ] Search aggregation
- [ ] Alerting implementation/integration
- [ ] Frontend dashboard integration
- [ ] Full backend/frontend integration
- [ ] End-to-end testing
- [ ] Final deployment configuration

## Team Responsibilities

### Deeptangshu Sen

**Core Backend & Integration**

Responsibilities include:

- Spring Boot backend
- REST APIs
- gRPC ingestion
- Log validation
- Log processing
- WebSocket integration
- Analytics
- Search API contract
- Backend integration
- Final system integration and testing

### Miriyalapujitha

**Search Engine**

Responsibilities include:

- Apache Lucene indexing
- Search implementation
- Search aggregation
- Alerting/search-engine components

### RANJITH A

**Frontend**

Responsibilities include:

- React dashboard
- UI components
- Analytics visualization
- Search interface
- WebSocket client
- Frontend/backend integration

## Integration Boundaries

### Backend → Search Engine

```text
LogIndexerService
        ↓
Lucene Indexing
```

### Backend → Search

```text
SearchService
        ↓
Lucene Search
```

### Backend → Frontend

```text
REST APIs
    +
WebSocket
```

This separation allows each team member to develop their module independently and integrate the components later.

## Documentation

Additional project documentation is available in the `docs/` directory:

```text
docs/
├── API_CONTRACT.md
├── ARCHITECTURE.md
├── DATA_MODEL.md
├── SETUP.md
└── TESTING.md
```

## Future Improvements

Potential future improvements include:

- Persistent distributed storage
- Advanced Lucene queries
- Log aggregation and visualization
- Advanced alert rules
- Role-based access control
- Authentication and authorization
- Log retention policies
- Exporting analytics reports
- Distributed deployment
- Containerization
- Monitoring and observability
- Performance optimization for high-volume ingestion

## License

This project is developed for academic and educational purposes.
