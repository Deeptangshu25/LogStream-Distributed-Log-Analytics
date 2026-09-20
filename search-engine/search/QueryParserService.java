package com.logstream.searchengine.search;

import com.logstream.searchengine.indexing.LuceneConfig;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.index.Term;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.MatchAllDocsQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.TermQuery;

import java.util.Objects;

public final class QueryParserService implements AutoCloseable {

	private final Analyzer analyzer;
	private final QueryParser parser;

	public QueryParserService() {
		this(new StandardAnalyzer());
	}

	public QueryParserService(Analyzer analyzer) {
		this.analyzer = Objects.requireNonNull(analyzer, "analyzer must not be null");
		this.parser = new QueryParser(LuceneConfig.FIELD_MESSAGE, analyzer);
		this.parser.setAllowLeadingWildcard(false);
	}

	public Query parse(String query) {
		if (query == null || query.isBlank()) {
			return new MatchAllDocsQuery();
		}

		String normalizedQuery = query.trim();
		try {
			return parser.parse(normalizedQuery);
		} catch (ParseException exception) {
			return new TermQuery(new Term(LuceneConfig.FIELD_MESSAGE, normalizedQuery));
		}
	}

	@Override
	public void close() {
		analyzer.close();
	}
}
