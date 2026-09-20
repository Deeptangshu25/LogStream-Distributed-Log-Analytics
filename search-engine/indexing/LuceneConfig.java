package com.logstream.searchengine.indexing;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;

import java.nio.file.Path;
import java.nio.file.Paths;

public final class LuceneConfig {

	public static final String INDEX_PATH_PROPERTY = "logstream.index.path";
	public static final String DEFAULT_INDEX_DIRECTORY = "data/lucene-index";

	public static final String FIELD_ID = "id";
	public static final String FIELD_TIMESTAMP = "timestamp";
	public static final String FIELD_LEVEL = "level";
	public static final String FIELD_SERVICE = "service";
	public static final String FIELD_HOST = "host";
	public static final String FIELD_MESSAGE = "message";
	public static final String FIELD_RESPONSE_TIME_MS = "responseTimeMs";
	public static final String FIELD_TRACE_ID = "traceId";

	private final Path indexPath;

	public LuceneConfig() {
		this(resolveIndexPath());
	}

	public LuceneConfig(Path indexPath) {
		if (indexPath == null) {
			throw new IllegalArgumentException("indexPath must not be null");
		}
		this.indexPath = indexPath;
	}

	public Path getIndexPath() {
		return indexPath;
	}

	public Analyzer createAnalyzer() {
		return new StandardAnalyzer();
	}

	private static Path resolveIndexPath() {
		String configuredPath = System.getProperty(INDEX_PATH_PROPERTY);
		if (configuredPath == null || configuredPath.isBlank()) {
			configuredPath = DEFAULT_INDEX_DIRECTORY;
		}
		return Paths.get(configuredPath);
	}
}
