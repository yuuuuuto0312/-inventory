package com.attendance.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {
  private Long recordId;
  private Long userId;
  private String username;
  private LocalDateTime checkInTime;
  private LocalDateTime checkOutTime;
  private LocalDateTime recordDate;
  private String attendanceType; // WORK, ANNUAL_LEAVE
  private String status; // IN_PROGRESS, COMPLETED, ANNUAL_LEAVE
}
