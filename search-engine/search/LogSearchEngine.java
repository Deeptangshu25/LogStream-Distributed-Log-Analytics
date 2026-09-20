package com.logstream.searchengine.search;

import com.logstream.backend.model.LogEntry;
import com.logstream.backend.model.SearchRequest;
import com.logstream.backend.model.SearchResult;
import com.logstream.backend.service.SearchService;
import com.logstream.searchengine.indexing.IndexManager;
import com.logstream.searchengine.indexing.LuceneConfig;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.LongPoint;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.MatchNoDocsQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.TermQuery;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class LogSearchEngine implements SearchService, AutoCloseable {

	private final IndexManager indexManager;
	private final QueryParserService queryParserService;

	public LogSearchEngine() throws IOException {
		this(new IndexManager(), new QueryParserService());
	}

	public LogSearchEngine(IndexManager indexManager) {
		this(indexManager, new QueryParserService());
	}

	public LogSearchEngine(IndexManager indexManager, QueryParserService queryParserService) {
		this.indexManager = Objects.requireNonNull(indexManager, "indexManager must not be null");
		this.queryParserService = Objects.requireNonNull(queryParserService, "queryParserService must not be null");
	}

	@Override
	public SearchResult search(SearchRequest request) {
		SearchFilter filter = SearchFilter.from(request);
		Query query = buildQuery(filter);
		try {
			return indexManager.withSearcher(searcher -> {
				long totalHits = searcher.count(query);
				long offset = (long) filter.page() * filter.size();
				if (offset >= totalHits) {
					return new SearchResult(List.of(), totalHits, filter.page(), filter.size());
				}

				int topN = Math.toIntExact(Math.min(totalHits, offset + filter.size()));
				var topDocs = searcher.search(query, topN);
				int from = Math.toIntExact(offset);
				int to = Math.min(topDocs.scoreDocs.length, from + filter.size());
				List<LogEntry> logs = new ArrayList<>(Math.max(0, to - from));
				for (int index = from; index < to; index++) {
					logs.add(toLogEntry(searcher.doc(topDocs.scoreDocs[index].doc)));
				}
				return new SearchResult(logs, totalHits, filter.page(), filter.size());
			});
		} catch (IOException exception) {
			throw new IllegalStateException("Unable to search logs", exception);
		}
	}

	private Query buildQuery(SearchFilter filter) {
		BooleanQuery.Builder builder = new BooleanQuery.Builder();
		builder.add(queryParserService.parse(filter.query()), BooleanClause.Occur.MUST);
		addExactFilter(builder, LuceneConfig.FIELD_SERVICE, filter.service());
		addExactFilter(builder, LuceneConfig.FIELD_LEVEL, filter.level());
		addExactFilter(builder, LuceneConfig.FIELD_HOST, filter.host());
		addTimeFilter(builder, filter.startTime(), filter.endTime());
		return builder.build();
	}

	private static void addExactFilter(BooleanQuery.Builder builder, String field, String value) {
		if (value != null && !value.isBlank()) {
			builder.add(new TermQuery(new Term(field, value)), BooleanClause.Occur.FILTER);
		}
	}

	private static void addTimeFilter(BooleanQuery.Builder builder, Instant start, Instant end) {
		if (start == null && end == null) {
			return;
		}
		long lower = start == null ? Long.MIN_VALUE : start.toEpochMilli();
		long upper = end == null ? Long.MAX_VALUE : end.toEpochMilli();
		if (lower > upper) {
			builder.add(new MatchNoDocsQuery(), BooleanClause.Occur.MUST);
			return;
		}
		builder.add(LongPoint.newRangeQuery(LuceneConfig.FIELD_TIMESTAMP, lower, upper), BooleanClause.Occur.FILTER);
	}

	private static LogEntry toLogEntry(Document document) {
		String traceId = document.get(LuceneConfig.FIELD_TRACE_ID);
		if (traceId != null && traceId.isEmpty()) {
			traceId = null;
		}
		return new LogEntry(
				document.get(LuceneConfig.FIELD_ID),
				Instant.ofEpochMilli(document.getField(LuceneConfig.FIELD_TIMESTAMP).numericValue().longValue()),
				LogEntry.LogLevel.valueOf(document.get(LuceneConfig.FIELD_LEVEL)),
				document.get(LuceneConfig.FIELD_SERVICE),
				document.get(LuceneConfig.FIELD_HOST),
				document.get(LuceneConfig.FIELD_MESSAGE),
				document.getField(LuceneConfig.FIELD_RESPONSE_TIME_MS).numericValue().longValue(),
				traceId);
	}

	@Override
	public void close() throws IOException {
		queryParserService.close();
		indexManager.close();
	}
}
