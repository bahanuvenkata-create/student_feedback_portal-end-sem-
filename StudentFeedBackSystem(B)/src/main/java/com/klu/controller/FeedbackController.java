package com.klu.controller;

import com.klu.entity.Feedback;
import com.klu.repo.FeedbackRepository;
import com.klu.controller.AdminController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*") // Good to keep this for React connection
public class FeedbackController {

    @Autowired private FeedbackRepository feedbackRepo;

    // 1. CHECK STATUS
    @PostMapping("/status") 
    public ResponseEntity<?> isFeedbackAllowed(@RequestBody Map<String, String> body) {
        String year = body.get("year");
        String semester = body.get("semester");
        
        // DEBUG: Print to console so you can see if React sends the right data
        System.out.println(">>> Checking Feedback Status for: " + year + " - " + semester);
        
        String key = year + "-" + semester;
        boolean enabled = AdminController.feedbackStatusMap.getOrDefault(key, false);
        
        System.out.println(">>> Result for key (" + key + "): " + enabled);

        return ResponseEntity.ok(Map.of("enabled", enabled));
    }

    // 2. SUBMIT FEEDBACK
    @PostMapping("/submit")
    public ResponseEntity<?> submitFeedback(@RequestBody List<Feedback> feedbacks) {
        if(feedbacks == null || feedbacks.isEmpty()) {
            return ResponseEntity.badRequest().body("Empty data");
        }
        
        // Determine the key from the first feedback item
        Feedback first = feedbacks.get(0);
        String year = first.getYear();
        String semester = first.getSemester();
        String key = year + "-" + semester;

        System.out.println(">>> Submitting Feedback for key: " + key);

        // Check if enabled for that specific key
        if (!AdminController.feedbackStatusMap.getOrDefault(key, false)) {
            System.out.println(">>> Submission FAILED: Feedback disabled for " + key);
            return ResponseEntity.badRequest().body("Feedback is disabled for " + year + " - " + semester);
        }
        
        feedbackRepo.saveAll(feedbacks);
        return ResponseEntity.ok("Feedback Submitted Successfully");
    }

    // 3. CHECK IF ALREADY SUBMITTED
    @GetMapping("/check/{username}/{year}/{semester}")
    public ResponseEntity<?> checkIfSubmitted(@PathVariable String username, @PathVariable String year, @PathVariable String semester) {
        List<Feedback> list = feedbackRepo.findByUsernameAndYearAndSemester(username, year, semester);
        return ResponseEntity.ok(Map.of("submitted", list.size() > 0));
    }
    // NEW: Check if student submitted for a specific subject
    // Updated check-subject method
    @PostMapping("/check-subject")
    public ResponseEntity<?> checkSubjectSubmission(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String year = body.get("year");
        String semester = body.get("semester");
        String subject = body.get("subject");

        // USE THE NEW SPECIFIC REPOSITORY METHOD
        List<Feedback> list = feedbackRepo.findByUsernameAndYearAndSemesterAndSubject(
            username, year, semester, subject
        );
        
        // Only return true if there is actually a record for THAT specific subject
        boolean hasSubmitted = list.size() > 0;

        System.out.println("Checking submission for: " + subject + " -> " + hasSubmitted);

        return ResponseEntity.ok(Map.of("hasSubmitted", hasSubmitted));
    }
}