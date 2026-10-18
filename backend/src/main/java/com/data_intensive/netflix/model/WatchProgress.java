

package com.data_intensive.netflix.model;

import lombok.Data;

@Data
public class WatchProgress {
    private String userId;
    private Long movieId;
    private Integer progressSeconds;

    public WatchProgress() {}

    public WatchProgress(String userId, Long movieId, Integer progressSeconds) {
        this.userId = userId;
        this.movieId = movieId;
        this.progressSeconds = progressSeconds;
    }
}
