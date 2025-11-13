package com.attendance.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "attendance_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecord {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long recordId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column
  private LocalDateTime checkInTime;

  @Column
  private LocalDateTime checkOutTime;

  @Column(nullable = false)
  private LocalDateTime recordDate;

  @Column(nullable = false, length = 20)
  private String attendanceType; // WORK, ANNUAL_LEAVE

  @Column(length = 500)
  private String googleCalendarEventId;
}
