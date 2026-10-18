

package com.data_intensive.netflix.repository;

import com.data_intensive.netflix.model.MovieDetails;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;


public interface MovieDetailsRepository extends MongoRepository<MovieDetails, String> {
    Optional<MovieDetails> findByMovieId(Long movieId);
}
