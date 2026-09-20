package com.logstream.searchengine.search;

import com.logstream.backend.model.SearchRequest;

import java.time.Instant;
import java.time.format.DateTimeParseException;

public record SearchFilter(
		String query,
		String service,
		String level,
		String host,
		Instant startTime,
		Instant endTime,
		int page,
		int size) {

	public static final int DEFAULT_PAGE = 0;
	public static final int DEFAULT_SIZE = 20;
	public static final int MAX_SIZE = 100;

	public static SearchFilter from(SearchRequest request) {
		if (request == null) {
			return new SearchFilter(null, null, null, null, null, null, DEFAULT_PAGE, DEFAULT_SIZE);
		}

		int page = Math.max(request.getPage(), DEFAULT_PAGE);
		int size = request.getSize() <= 0 ? DEFAULT_SIZE : Math.min(request.getSize(), MAX_SIZE);
		return new SearchFilter(
				request.getQuery(),
				request.getService(),
				request.getLevel(),
				request.getHost(),
				parseTime(request.getStartTime(), "startTime"),
				parseTime(request.getEndTime(), "endTime"),
				page,
				size);
	}

	private static Instant parseTime(String value, String field) {
		if (value == null || value.isBlank()) {
			return null;
		}
		try {
			return Instant.parse(value);
		} catch (DateTimeParseException exception) {
			throw new IllegalArgumentException(field + " must be an ISO-8601 instant", exception);
		}
	}
}
