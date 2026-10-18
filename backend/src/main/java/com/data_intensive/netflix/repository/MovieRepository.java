

package com.data_intensive.netflix.repository;

import com.data_intensive.netflix.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;


public interface MovieRepository extends JpaRepository<Movie, Long> {
}
