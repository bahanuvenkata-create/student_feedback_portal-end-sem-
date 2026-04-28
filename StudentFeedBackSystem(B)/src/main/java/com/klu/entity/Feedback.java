package com.klu.entity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String password;
    private String email;
    private String branch;
    private String phone;
    private String parentName;
    private String address;
    private String year;
    private String semester;
}