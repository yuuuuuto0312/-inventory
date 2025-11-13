package com.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequest {
  private Long userId;
  private String type; // CHECK_IN, CHECK_OUT, ANNUAL_LEAVE
}
