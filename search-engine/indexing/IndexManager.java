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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.util.Objects;

@Component
public final class IndexManager implements AutoCloseable {

    private final Directory directory;
    private final Analyzer analyzer;
    private final IndexWriter writer;

    private DirectoryReader reader;
    private boolean closed;

    /*
     * Constructor used by Spring.
     * Creates the shared Lucene IndexManager.
     */
    @Autowired
    public IndexManager() throws IOException {
        this(new LuceneConfig());
    }

    /*
     * Constructor for normal Lucene configuration.
     */
    public IndexManager(LuceneConfig config) throws IOException {

        Objects.requireNonNull(
                config,
                "config must not be null"
        );

        Files.createDirectories(
                config.getIndexPath()
        );

        this.directory =
                FSDirectory.open(
                        config.getIndexPath()
                );

        this.analyzer =
                config.createAnalyzer();

        this.writer =
                new IndexWriter(
                        directory,
                        new IndexWriterConfig(analyzer)
                );
    }

    /*
     * Constructor used by tests/custom Lucene directories.
     */
    public IndexManager(
            Directory directory,
            Analyzer analyzer
    ) throws IOException {

        this.directory =
                Objects.requireNonNull(
                        directory,
                        "directory must not be null"
                );

        this.analyzer =
                Objects.requireNonNull(
                        analyzer,
                        "analyzer must not be null"
                );

        this.writer =
                new IndexWriter(
                        directory,
                        new IndexWriterConfig(analyzer)
                );
    }

    /*
     * Insert or update one document.
     */
    public synchronized void update(
            String id,
            Document document
    ) throws IOException {

        ensureOpen();

        writer.updateDocument(
                new Term(
                        LuceneConfig.FIELD_ID,
                        id
                ),
                document
        );

        writer.commit();

        refreshReader();
    }

    /*
     * Insert or update multiple documents.
     */
    public synchronized void updateBatch(
            Iterable<IndexedDocument> documents
    ) throws IOException {

        ensureOpen();

        for (IndexedDocument indexedDocument : documents) {

            writer.updateDocument(
                    new Term(
                            LuceneConfig.FIELD_ID,
                            indexedDocument.id()
                    ),
                    indexedDocument.document()
            );
        }

        writer.commit();

        refreshReader();
    }

    /*
     * Execute a search operation against
     * the current Lucene index.
     */
    public synchronized <T> T withSearcher(
            SearchOperation<T> operation
    ) throws IOException {

        ensureOpen();

        refreshReader();

        return operation.execute(
                new IndexSearcher(reader)
        );
    }

    /*
     * Refresh the DirectoryReader so that
     * newly committed documents are searchable.
     */
    private void refreshReader() throws IOException {

        if (reader == null) {

            reader =
                    DirectoryReader.open(writer);

            return;
        }

        DirectoryReader updatedReader =
                DirectoryReader.openIfChanged(
                        reader,
                        writer
                );

        if (updatedReader != null) {

            reader.close();

            reader = updatedReader;
        }
    }

    /*
     * Prevent operations after closing.
     */
    private void ensureOpen() {

        if (closed) {

            throw new IllegalStateException(
                    "IndexManager is closed"
            );
        }
    }

    /*
     * Close all Lucene resources.
     */
    @Override
    public synchronized void close()
            throws IOException {

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

    /*
     * Represents a document that should
     * be indexed.
     */
    public record IndexedDocument(
            String id,
            Document document
    ) {

        public IndexedDocument {

            Objects.requireNonNull(
                    id,
                    "id must not be null"
            );

            Objects.requireNonNull(
                    document,
                    "document must not be null"
            );
        }
    }

    /*
     * Functional interface used by withSearcher().
     */
    @FunctionalInterface
    public interface SearchOperation<T> {

        T execute(
                IndexSearcher searcher
        ) throws IOException;
    }
}