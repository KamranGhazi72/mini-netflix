

package com.data_intensive.netflix.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "movies")
@Data
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String genre;
    private Integer releaseYear;
    private String videoUrl;

    public Movie() {}

    public Movie(Long id, String title, String genre, Integer releaseYear, String videoUrl) {
        this.id = id;
        this.title = title;
        this.genre = genre;
        this.releaseYear = releaseYear;
        this.videoUrl = videoUrl;
    }
}
