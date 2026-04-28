package com.klu.repo;

import com.klu.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByUsernameAndYearAndSemester(String username, String year, String semester);
    List<Feedback> findByYearAndSemester(String year, String semester);
 // NEW METHOD: Checks ALL 4 fields (Username, Year, Semester, Subject)
    @Query("SELECT f FROM Feedback f WHERE f.username = :username AND f.year = :year AND f.semester = :semester AND f.subject = :subject")
    List<Feedback> findByUsernameAndYearAndSemesterAndSubject(
        @Param("username") String username, 
        @Param("year") String year, 
        @Param("semester") String semester, 
        @Param("subject") String subject
    );
}