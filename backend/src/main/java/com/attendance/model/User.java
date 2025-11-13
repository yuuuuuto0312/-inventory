package com.attendance.model;

import java.util.List;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long userId;

  @Column(nullable = false, unique = true, length = 100)
  private String username;

  @Column(nullable = false, length = 200)
  private String email;

  @Column(nullable = false, length = 20)
  private String role; // USER, ADMIN

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<AttendanceRecord> attendanceRecords;
}
