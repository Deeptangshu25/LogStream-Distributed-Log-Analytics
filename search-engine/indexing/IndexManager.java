package com.logstream.searchengine.indexing;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;

import java.io.IOException;
import java.nio.file.Files;
import java.util.Objects;

public final class IndexManager implements AutoCloseable {

	private final Directory directory;
	private final Analyzer analyzer;
	private final IndexWriter writer;
	private DirectoryReader reader;
	private boolean closed;

	public IndexManager() throws IOException {
		this(new LuceneConfig());
	}

	public IndexManager(LuceneConfig config) throws IOException {
		Objects.requireNonNull(config, "config must not be null");
		Files.createDirectories(config.getIndexPath());
		this.directory = FSDirectory.open(config.getIndexPath());
		this.analyzer = config.createAnalyzer();
		this.writer = new IndexWriter(directory, new IndexWriterConfig(analyzer));
	}

	public IndexManager(Directory directory, Analyzer analyzer) throws IOException {
		this.directory = Objects.requireNonNull(directory, "directory must not be null");
		this.analyzer = Objects.requireNonNull(analyzer, "analyzer must not be null");
		this.writer = new IndexWriter(directory, new IndexWriterConfig(analyzer));
	}

	public synchronized void update(String id, Document document) throws IOException {
		ensureOpen();
		writer.updateDocument(new Term(LuceneConfig.FIELD_ID, id), document);
		writer.commit();
		refreshReader();
	}

	public synchronized void updateBatch(Iterable<IndexedDocument> documents) throws IOException {
		ensureOpen();
		for (IndexedDocument indexedDocument : documents) {
			writer.updateDocument(
					new Term(LuceneConfig.FIELD_ID, indexedDocument.id()),
					indexedDocument.document());
		}
		writer.commit();
		refreshReader();
	}

	public synchronized <T> T withSearcher(SearchOperation<T> operation) throws IOException {
		ensureOpen();
		refreshReader();
		return operation.execute(new IndexSearcher(reader));
	}

	private void refreshReader() throws IOException {
		if (reader == null) {
			reader = DirectoryReader.open(writer);
			return;
		}

		DirectoryReader updatedReader = DirectoryReader.openIfChanged(reader, writer);
		if (updatedReader != null) {
			reader.close();
			reader = updatedReader;
		}
	}

	private void ensureOpen() {
		if (closed) {
			throw new IllegalStateException("IndexManager is closed");
		}
	}

	@Override
	public synchronized void close() throws IOException {
		if (closed) {
			return;
		}
		closed = true;
		if (reader != null) {
			reader.close();
		}
		writer.close();
		analyzer.close();
		directory.close();
	}

	public record IndexedDocument(String id, Document document) {
		public IndexedDocument {
			Objects.requireNonNull(id, "id must not be null");
			Objects.requireNonNull(document, "document must not be null");
		}
	}

	@FunctionalInterface
	public interface SearchOperation<T> {
		T execute(IndexSearcher searcher) throws IOException;
	}
}
