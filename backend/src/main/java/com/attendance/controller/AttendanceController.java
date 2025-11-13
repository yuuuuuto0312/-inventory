package com.attendance.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.attendance.dto.AttendanceRequest;
import com.attendance.dto.AttendanceResponse;
import com.attendance.service.AttendanceService;
import com.attendance.service.ExcelExportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin
public class AttendanceController {

  private final AttendanceService attendanceService;
  private final ExcelExportService excelExportService;

  /**
   * 出勤・退勤を記録
   */
  @PostMapping("/record")
  public ResponseEntity<AttendanceResponse> recordAttendance(@RequestBody AttendanceRequest request) {
    try {
      AttendanceResponse response = attendanceService.recordAttendance(request);
      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * ユーザーの勤怠記録を取得
   */
  @GetMapping("/user/{userId}")
  public ResponseEntity<List<AttendanceResponse>> getUserAttendanceRecords(@PathVariable Long userId) {
    List<AttendanceResponse> records = attendanceService.getUserAttendanceRecords(userId);
    return ResponseEntity.ok(records);
  }

  /**
   * 今日の勤怠状況を取得
   */
  @GetMapping("/today/{userId}")
  public ResponseEntity<AttendanceResponse> getTodayAttendance(@PathVariable Long userId) {
    AttendanceResponse response = attendanceService.getTodayAttendance(userId);
    if (response == null) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.ok(response);
  }

  /**
   * 期間指定で勤怠記録を取得(管理者用)
   */
  @GetMapping("/range")
  public ResponseEntity<List<AttendanceResponse>> getAttendanceByDateRange(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

    List<AttendanceResponse> records = attendanceService.getAttendanceRecordsByDateRange(startDate, endDate);
    return ResponseEntity.ok(records);
  }

  /**
   * 勤怠記録をExcelでエクスポート(管理者用)
   */
  @GetMapping("/export")
  public ResponseEntity<byte[]> exportToExcel(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

    try {
      byte[] excelData = excelExportService.exportToExcel(startDate, endDate);

      String filename = String.format("attendance_%s_to_%s.xlsx",
          startDate.format(DateTimeFormatter.ofPattern("yyyyMMdd")),
          endDate.format(DateTimeFormatter.ofPattern("yyyyMMdd")));

      org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
      headers.setContentDispositionFormData("attachment", filename);

      return ResponseEntity.ok()
          .headers(headers)
          .body(excelData);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }
}
