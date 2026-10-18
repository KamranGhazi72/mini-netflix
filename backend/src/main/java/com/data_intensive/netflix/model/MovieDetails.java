

package com.data_intensive.netflix.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.List;

@Document(collection = "movie_details")
@Data
public class MovieDetails {
    @Id
    private String id;
    private Long movieId;
    private String synopsis;
    private List<String> cast;
    private List<Comment> comments;

    public MovieDetails() {}

    public MovieDetails(String id, Long movieId, String synopsis, List<String> cast, List<Comment> comments) {
        this.id = id;
        this.movieId = movieId;
        this.synopsis = synopsis;
        this.cast = cast;
        this.comments = comments;
    }

    @Data
    public static class Comment {
        private String user;
        private String text;
        private int rating;

        public Comment() {}

        public Comment(String user, String text, int rating) {
            this.user = user;
            this.text = text;
            this.rating = rating;
        }
    }
}
