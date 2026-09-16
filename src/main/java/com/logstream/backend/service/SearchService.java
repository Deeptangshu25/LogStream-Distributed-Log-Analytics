package com.logstream.backend.service;

import com.logstream.backend.model.SearchRequest;
import com.logstream.backend.model.SearchResult;

public interface SearchService {

    SearchResult search(SearchRequest request);
}