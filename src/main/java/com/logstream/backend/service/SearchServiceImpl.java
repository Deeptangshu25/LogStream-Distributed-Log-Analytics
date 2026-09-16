package com.logstream.backend.service;

import com.logstream.backend.model.SearchRequest;
import com.logstream.backend.model.SearchResult;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class SearchServiceImpl implements SearchService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    @Override
    public SearchResult search(SearchRequest request) {

        if (request == null) {
            request = new SearchRequest();
        }

        int page = request.getPage();
        int size = request.getSize();

        if (page < 0) {
            page = DEFAULT_PAGE;
        }

        if (size <= 0) {
            size = DEFAULT_SIZE;
        }

        if (size > MAX_SIZE) {
            size = MAX_SIZE;
        }

        return new SearchResult(
                Collections.emptyList(),
                0,
                page,
                size
        );
    }
}