package com.klu.controller;

import com.klu.entity.Student;
import com.klu.entity.Feedback;
import com.klu.repo.StudentRepository;
import com.klu.repo.FeedbackRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*") // Allow React to connect
public class AdminController {

    // Changed to static map so status persists across requests
    public static Map<String, Boolean> feedbackStatusMap = new HashMap<>();

    @Autowired private StudentRepository studentRepo;
    @Autowired private FeedbackRepository feedbackRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    // Changed to POST with body to match Frontend
    @PostMapping("/feedback/toggle")
    public ResponseEntity<?> toggleFeedback(@RequestBody Map<String, String> body) {
        String semester = body.get("semester");
        String year = body.get("year");
        boolean isEnabled = Boolean.parseBoolean(body.get("enabled"));
        
        if(semester != null && year != null) {
            feedbackStatusMap.put(year + "-" + semester, isEnabled);
            return ResponseEntity.ok("Feedback " + (isEnabled ? "Enabled" : "Disabled"));
        }
        return ResponseEntity.badRequest().body("Invalid params");
    }

    // Check specific status for a year/sem
    @PostMapping("/feedback/check-status") // Changed to POST to accept body
    public ResponseEntity<?> checkStatus(@RequestBody Map<String, String> body) {
        String key = body.get("year") + "-" + body.get("semester");
        boolean enabled = feedbackStatusMap.getOrDefault(key, false);
        return ResponseEntity.ok(Map.of("enabled", enabled));
    }
    
    // Keep existing CRUD methods...
    @PostMapping("/students")
    public Student createStudent(@RequestBody Student student) {
        student.setPassword(passwordEncoder.encode(student.getPassword()));
        return studentRepo.save(student);
    }

    @PutMapping("/students/{id}")
    public Student updateStudent(@PathVariable Long id, @RequestBody Student details) {
        Student s = studentRepo.findById(id).orElseThrow();
        s.setUsername(details.getUsername());
        s.setEmail(details.getEmail());
        s.setBranch(details.getBranch());
        if(details.getPassword() != null && !details.getPassword().isEmpty()) {
             s.setPassword(passwordEncoder.encode(details.getPassword()));
        }
        return studentRepo.save(s);
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        studentRepo.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
    @GetMapping("/students")
    public List<Student> getAllStudents() {
        return studentRepo.findAll();
    }
    
    @GetMapping("/analysis/{year}/{semester}")
    public List<Feedback> getAnalysis(@PathVariable String year, @PathVariable String semester) {
        return feedbackRepo.findByYearAndSemester(year, semester);
    }
    
    // Keep Excel export...
    @GetMapping("/students/export")
    public ResponseEntity<byte[]> exportToExcel() throws Exception {
        // (Keep your existing Excel code here exactly as is)
        List<Student> students = studentRepo.findAll();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Students");
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("ID");
        headerRow.createCell(1).setCellValue("Username");
        headerRow.createCell(2).setCellValue("Email");
        headerRow.createCell(3).setCellValue("Branch");

        int rowNum = 1;
        for (Student s : students) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(s.getId());
            row.createCell(1).setCellValue(s.getUsername());
            row.createCell(2).setCellValue(s.getEmail());
            row.createCell(3).setCellValue(s.getBranch());
        }
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "students.xlsx");
        return new ResponseEntity<>(out.toByteArray(), headers, HttpStatus.OK);
    }
}