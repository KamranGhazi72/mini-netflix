
package com.data_intensive.netflix.controller;

import com.data_intensive.netflix.model.*;
import com.data_intensive.netflix.repository.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MainController {

    private final MovieRepository movieRepository;
    private final MovieDetailsRepository detailsRepository;
    private final StringRedisTemplate redisTemplate;

    public MainController(MovieRepository movieRepository, 
                          MovieDetailsRepository detailsRepository, 
                          StringRedisTemplate redisTemplate) {
        this.movieRepository = movieRepository;
        this.detailsRepository = detailsRepository;
        this.redisTemplate = redisTemplate;
    }

    // ==========================================
    // 1. POSTGRESQL ENDPOINTS (CRUD)
    // ==========================================
    @GetMapping("/postgres/movies")
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    @PostMapping("/postgres/movies")
    public Movie createMovie(@RequestBody Movie movie) {
        return movieRepository.save(movie);
    }

    @DeleteMapping("/postgres/movies/{id}")
    public void deleteMovie(@PathVariable Long id) {
        movieRepository.deleteById(id);
    }

    // ==========================================
    // 2. MONGODB ENDPOINTS (CRUD)
    // ==========================================
    @GetMapping("/mongo/details")
    public List<MovieDetails> getAllDetails() {
        return detailsRepository.findAll();
    }

    @GetMapping("/mongo/details/movie/{movieId}")
    public Optional<MovieDetails> getDetailsByMovieId(@PathVariable Long movieId) {
        return detailsRepository.findByMovieId(movieId);
    }

    @PostMapping("/mongo/details")
    public MovieDetails createDetails(@RequestBody MovieDetails details) {
        return detailsRepository.save(details);
    }

    // ==========================================
    // 3. REDIS ENDPOINTS (Key-Value)
    // ==========================================
    @GetMapping("/redis/progress/{userId}/{movieId}")
    public Map<String, Object> getProgress(@PathVariable String userId, @PathVariable Long movieId) {
        String key = "progress:" + userId + ":" + movieId;
        String val = redisTemplate.opsForValue().get(key);
        Map<String, Object> res = new HashMap<>();
        res.put("key", key);
        res.put("progressSeconds", val != null ? Integer.parseInt(val) : 0);
        return res;
    }

    @PostMapping("/redis/progress")
    public Map<String, String> updateProgress(@RequestBody WatchProgress progress) {
        String key = "progress:" + progress.getUserId() + ":" + progress.getMovieId();
        redisTemplate.opsForValue().set(key, String.valueOf(progress.getProgressSeconds()));
        return Map.of("status", "success", "key", key, "value", String.valueOf(progress.getProgressSeconds()));
    }

    @GetMapping("/redis/keys")
    public Map<String, String> getAllRedisKeys() {
        Set<String> keys = redisTemplate.keys("progress:*");
        Map<String, String> result = new HashMap<>();
        if (keys != null) {
            for (String k : keys) {
                result.put(k, redisTemplate.opsForValue().get(k));
            }
        }
        return result;
    }

    // ==========================================
// DATA SEEDING (Dummy Data Initializer)
// ==========================================
@PostMapping("/seed")
public String seedData() {
    movieRepository.deleteAll();
    detailsRepository.deleteAll();

    // Movie 1: استفاده از لینک تست استریم مستقیم W3C / VideoJS
    Movie m1 = movieRepository.save(new Movie(
        null, 
        "Big Buck Bunny", 
        "Animation", 
        2008, 
        "https://vjs.zencdn.net/v/oceans.mp4"
    ));
    
    detailsRepository.save(new MovieDetails(
        null, 
        m1.getId(), 
        "A large and lovable rabbit deals with bullying forest creatures in this open-source classic.", 
        List.of("Bunny", "Rinky", "Gimera"), 
        List.of(new MovieDetails.Comment("Alex", "Classic animation!", 5))
    ));
    redisTemplate.opsForValue().set("progress:user123:" + m1.getId(), "45");

    // Movie 2: استفاده از لینک تست استریم Sintel
    Movie m2 = movieRepository.save(new Movie(
        null, 
        "Sintel Trailer", 
        "Fantasy", 
        2011, 
        "https://media.w3.org/2010/05/sintel/trailer.mp4"
    ));
    
    detailsRepository.save(new MovieDetails(
        null, 
        m2.getId(), 
        "The story of two friends exploring a giant surreal machine world.", 
        List.of("Proog", "Emo"), 
        List.of(new MovieDetails.Comment("Sara", "Very artistic and surreal.", 4))
    ));
    redisTemplate.opsForValue().set("progress:user123:" + m2.getId(), "120");

    return "Successfully seeded PostgreSQL, MongoDB, and Redis!";
}
}
